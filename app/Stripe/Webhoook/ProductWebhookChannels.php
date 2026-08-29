<?php

namespace App\Stripe\Webhoook;

use App\Models\Price;
use App\Models\Product;
use App\Models\ProductBenefit;
use App\Models\StripeWebhookEvent;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductWebhookChannels implements Channels
{
    const ProductCreated = "product.created";

    const ProductUpdated = "product.updated";

    const ProductDeleted = "product.deleted";

    const PriceCreated = "price.created";

    const PriceUpdated = "price.updated";

    const PriceDeleted = "price.deleted";

    const PlanCreated = "plan.created";

    const PlanUpdated = "plan.updated";

    const PlanDeleted = "plan.deleted";

    public function productUpdated(mixed $data = [])
    {
        $this->productCreated($data);
    }

    public  function productCreated(mixed $data = [])
    {
        DB::beginTransaction();
        Log::channel('product-plan-price-webhook')->info($data['type'], ['data' => $data['data']]);
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
            $product_id = $stripe_object['id'];
            $product = Product::where('id_stripe', $product_id);
            if ($product->exists()) {
                $product->update([
                    'name' => $stripe_object['name'],
                    'description' => $stripe_object['description'] ?? null,
                    'default_price' => $stripe_object['default_price'] ?? null,
                    'data' => $stripe_object,
                    'deleted_at' => $stripe_object['active'] === true ? null : now()
                ]);
            } else {
                $product = Product::create([
                    'id_stripe' => $product_id,
                    'name' => $stripe_object['name'],
                    'description' => $stripe_object['description'],
                    'default_price' => $stripe_object['default_price'] ?? null,
                    'data' => $stripe_object,
                    'deleted_at' => $stripe_object['active'] === true ? null : now()
                ]);
            }
            DB::commit();
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

    public static function productDeleted(mixed $data = [])
    {
        DB::beginTransaction();
        Log::channel('product-plan-price-webhook')->info($data['type'], ['data' => $data]);
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
            $product_id = $stripe_object['id'];
            $product = Product::where('id_stripe', $product_id);
            if ($product->exists()) {
                $product->first()->benefits()->forceDelete();
                $product->forceDelete();
            }
            DB::commit();
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
    public static function planUpdated(mixed $data = []) {}
    public function priceCreated(mixed $data = [])
    {
        DB::beginTransaction();
        Log::channel('product-plan-price-webhook')->info($data['type'], ['data' => $data]);
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
            $price_id = $stripe_object['id'];
            $price = Price::where('id_stripe', $price_id);
            if ($price->exists()) {
                $price->update([
                    'currency' => $stripe_object['currency'],
                    'product_id' => $stripe_object['product'] ?? null,
                    'interval' => $stripe_object['recurring']['interval'] ?? null,
                    'trial_period_days' => $stripe_object['recurring']['trial_period_days'] ?? null,
                    'unit_amount' => $stripe_object['unit_amount'] ?? null,
                    'data' => $stripe_object,
                    'type' => $stripe_object['type'],
                    'deleted_at' => $stripe_object['active'] === true ? null : now()
                ]);
            } else {
                $price = Price::create([
                    'id_stripe' => $price_id,
                    'currency' =>   $stripe_object['currency'],
                    'product_id' => $stripe_object['product'] ?? null,
                    'interval' => $stripe_object['recurring']['interval'] ?? null,
                    'trial_period_days' => $stripe_object['recurring']['trial_period_days'] ?? null,
                    'unit_amount' => $stripe_object['unit_amount'] ?? null,
                    'data' => $stripe_object,
                    'type' => $stripe_object['type'],
                    'deleted_at' => $stripe_object['active'] === true ? null : now()
                ]);
            }
            DB::commit();
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
    public function planDeleted(mixed $data = []) {}
    public function planCreated(mixed $data = [])
    {
        DB::beginTransaction();
        Log::channel('product-plan-price-webhook')->info($data['type'], ['data' => $data]);
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
            $price_id = $stripe_object['id'];
            $price = Price::where('id_stripe', $price_id);
            if ($price->exists()) {
                $price->update([
                    'currency' => $stripe_object['currency'],
                    'product_id' => $stripe_object['product'] ?? null,
                    'interval' => $stripe_object['interval'] ?? null,
                    'trial_period_days' => $stripe_object['trial_period_days'] ?? null,
                    'unit_amount' => $stripe_object['unit_amount'] ?? null,
                    'data' => $stripe_object,
                    'type' => 'recurring',
                    'deleted_at' => $stripe_object['active'] === true ? null : now()
                ]);
            } else {
                $price = Price::create([
                    'id_stripe' => $price_id,
                    'currency' =>   $stripe_object['currency'],
                    'product_id' => $stripe_object['product'] ?? null,
                    'interval' => $stripe_object['interval'] ?? null,
                    'trial_period_days' => $stripe_object['trial_period_days'] ?? null,
                    'unit_amount' => $stripe_object['amount'] ?? null,
                    'data' => $stripe_object,
                    'type' => 'recurring',
                    'deleted_at' => $stripe_object['active'] === true ? null : now()
                ]);
            }
            DB::commit();
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
    public function priceUpdated(mixed $data = [])
    {
        $this->priceCreated($data);
    }
    public function priceDeleted(mixed $data = [])
    {
        DB::beginTransaction();
        Log::channel('product-plan-price-webhook')->info($data['type'], ['data' => $data]);
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
            $price_id = $stripe_object['id'];
            $price = Price::where('id_stripe', $price_id);
            if ($price->exists()) {
                $price->forceDelete();
            }
            DB::commit();
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
}
