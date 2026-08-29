<?php

namespace App\Stripe\Webhoook;

use App\Enums\Stripe\v1\StripCountrieType;
use App\Models\Customer;
use App\Models\CustomerWithoutObservable;
use App\Models\StripeWebhookEvent;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CustomerWebhookChannels
extends InvoiceWebhookChannels
implements Channels
{
    const CustomerCreated = "customer.created";

    const CustomerUpdated = "customer.updated";

    const CustomerDeleted = "customer.deleted";

    const CustomerSubscriptionUpdated = "customer.subscription.updated";

    const CustomerSubscriptionDeleted = "customer.subscription.deleted";

    const CustomerSubscriptionCreated = "customer.subscription.created";

    const CustomerSubscriptionTrialWillEnd = "customer.subscription.trial_will_end";

    const CustomerSubscriptionPaused = "customer.subscription.paused";

    const InvoiceCreated =  "invoice.created";

    const InvoiceUpdated =  "invoice.updated";

    const InvoiceSent =  "invoice.sent";

    const InvoicePaymentSucceeded =  "invoice.payment_succeeded";

    const InvoicePaymentFailed =  "invoice.payment_failed";

    public function resolve(string $channel, mixed $data)
    {
        Log::channel('stripe')->info($channel, $data);

        switch ($channel) {
            case self::CustomerCreated:
                return $this->customerCreated($data);
            case self::CustomerUpdated:
                return $this->customerUpdated($data);
            case self::CustomerDeleted:
                return $this->customerDeleted($data);
            case self::CustomerSubscriptionUpdated:
                return $this->customerSubscriptionUpdated($data);
            case self::CustomerSubscriptionDeleted:
                return $this->customerSubscriptionDeleted($data);
            case self::CustomerSubscriptionCreated:
                return $this->customerSubscriptionCreated($data);
            case self::CustomerSubscriptionTrialWillEnd:
                return $this->customerSubscriptionTrialWillEnd($data);
            case self::CustomerSubscriptionPaused:
                return $this->customerSubscriptionPaused($data);
            case self::InvoiceCreated:
                return $this->invoiceCreated($data);
            case self::InvoiceUpdated:
                return $this->invoiceUpdated($data);
            case self::InvoiceSent:
                return $this->invoiceSent($data);
            case self::InvoicePaymentSucceeded:
                return $this->invoicePaymentSucceeded($data);
            case self::InvoicePaymentFailed:
                return $this->invoicePaymentFailed($data);
            case self::ProductCreated:
                return $this->productCreated($data);
            case self::ProductUpdated:
                return $this->productUpdated($data);
            case self::ProductDeleted:
                return $this->productDeleted($data);
            case self::PriceCreated:
                return $this->priceCreated($data);
            case self::PriceUpdated:
                return $this->priceUpdated($data);
            case self::PriceDeleted:
                return $this->priceDeleted($data);
            case self::PlanCreated:
                return $this->planCreated($data);
            case self::PlanDeleted:
                return $this->planDeleted($data);
            case self::PlanUpdated:
                return $this->planUpdated($data);
            default:
        }
    }

    public function customerCreated(mixed $data = [])
    {
        DB::beginTransaction();
        Log::channel('customer-webhook')->info($data['type'], ['data' => $data['data']]);
        $stripe_object = $data['data']['object'];
        $event_id = $data['id'];
        $type = $data['type'];

        StripeWebhookEvent::firstOrCreate([
            'id_stripe_event' => $event_id,
            'type' => $type
        ], [
            'data' => $data
        ]);
        DB::commit();

        try {
            $user = User::where('stripe_id', $stripe_object['id'])->first();
            if (!$user?->exists()) {
                Log::channel('customer-webhook')->info($data['type'], [
                    'message' => 'Nao foi encontrado o usuário, buscando em Customer',
                    'evt' => $event_id
                ]);
                $customer = Customer::where('id_stripe', $stripe_object['id'])->firstOrFail();
                if (!empty($customer->user)) {
                    $customer->user->stripe_id = $stripe_object['id'];
                    $customer->user->save();
                    $user = $customer->user;
                }
            }
            if ($user?->exists()) {
                Log::channel('customer-webhook')->info($data['type'], [
                    'message' => 'Customer Existe no Sistema',
                    'evt' => $event_id,
                ]);
                $customer = CustomerWithoutObservable::where([
                    'id_user' => $user->id,
                    'id_stripe' => $stripe_object['id']
                ]);
                $customer->update([
                    'country' => $stripe_object['address']['country'],
                    'country_code' => StripCountrieType::fromValueOrLabel($stripe_object['address']['country'] ?? null)?->ddi() ?? '+1',
                    'line1' => $stripe_object['address']['line1'],
                    'line2' => $stripe_object['address']['line2'],
                    'city' => $stripe_object['address']['city'],
                    'phone' => $stripe_object['phone'] ?? $stripe_object['metadata']['phone'] ?? 'Unavainable',
                    'state' => $stripe_object['address']['state'],
                    'postal_code' => $stripe_object['address']['postal_code'],
                    'id_stripe' => $stripe_object['id'],
                    'data' => $stripe_object
                ]);
                $user->stripe_id = $stripe_object['id'];
                $user->save();
                DB::commit();
            } else {
                Log::channel('customer-webhook')->info($data['type'], [
                    'message' => 'Customer não existe no sistema, criando outro',
                    'evt' => $event_id
                ]);
                $userCreating = User::create([
                    'name' => $stripe_object['name'],
                    'email' => $stripe_object['email'],
                    'stripe_id' => $stripe_object['id'],
                    'data' => $stripe_object,
                    'password' => Hash::make(Str::random(10)),
                ]);
                CustomerWithoutObservable::create([
                    'id_user' => $userCreating->id,
                    'country' => $stripe_object['address']['country'],
                    'country_code' => StripCountrieType::fromValueOrLabel($stripe_object['address']['country'] ?? null)?->ddi() ?? '+1',
                    'line1' => $stripe_object['address']['line1'],
                    'line2' => $stripe_object['address']['line2'],
                    'city' => $stripe_object['address']['city'],
                    'state' => $stripe_object['address']['state'],
                    'postal_code' => $stripe_object['address']['postal_code'],
                    'id_stripe' => $stripe_object['id'],
                    'data' => $stripe_object,
                    'phone' => 'Unavainable',
                    'deleted_at' => $stripe_object['active'] === true ? null : now()
                ]);
                DB::commit();
            }
            StripeWebhookEvent::where([
                'id_stripe_event' => $event_id,
                'type' => $type,
            ])->update([
                'processed_at' => now(),
                'data' => $data
            ]);
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            StripeWebhookEvent::where([
                'id_stripe_event' => $event_id,
                'type' => $type,
            ])->update([
                'last_error' => json_encode([
                    "error_message" => $e->getMessage(),
                    "error_line" => $e->getCode(),
                    "error_file" => $e->getFile()
                ]),
                'data' => $data
            ]);
        }
    }
    public function customerUpdated(mixed $data = [])
    {
        $this->customerCreated($data);
    }
    public function customerDeleted(mixed $data = []) {}
    public function customerSubscriptionUpdated(mixed $data = []) {}
    public function customerSubscriptionDeleted(mixed $data = []) {}
    public function customerSubscriptionCreated(mixed $data = []) {}
    public function customerSubscriptionTrialWillEnd(mixed $data = []) {}
    public function customerSubscriptionPaused(mixed $data = []) {}
}
