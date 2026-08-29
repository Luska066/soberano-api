<?php

namespace App\Observers;

use App\Models\Customer;
use Exception;

class CustomerObserver
{
    /**
     * Handle the Customer "created" event.
     */
    public function created(Customer $customer): void
    {
        $customer->user->createAsStripeCustomer([
            'phone' => $customer->phone,
            'metadata' => [
                'customer_id' => $customer->uuid,
                'name' => $customer->user->name,
                'email' => $customer->user->email,
            ],
            'address' => [
                'line1' => $customer->line1,
                'line2' => $customer->line2,
                'city' => $customer->city,
                'state' => $customer->state,
                'postal_code' => $customer->postal_code,
                'country' => $customer->country,
            ]
        ]);
    }

    /**
     * Handle the Customer "updated" event.
     */
    public function updated(Customer $customer): void
    {
        if ($customer->user->stripe_id == null) {
            $customer->user->stripe_id = $customer->id_stripe;
            $customer->user->save();
        }

        $customer->user->updateStripeCustomer([
            'phone' => $customer->phone,
            'name' => $customer->user->name,
            'email' => $customer->user->email,
            'metadata' => [
                'customer_id' => $customer->uuid,
                'name' => $customer->user->name,
                'email' => $customer->user->email,
                'phone' => $customer->phone
            ],
            'address' => [
                'line1' => $customer->line1,
                'line2' => $customer->line2,
                'city' => $customer->city,
                'state' => $customer->state,
                'postal_code' => $customer->postal_code,
                'country' => $customer->country,
            ]
        ]);
    }

    /**
     * Handle the Customer "deleted" event.
     */
    public function deleted(Customer $customer): void
    {
        //
    }

    /**
     * Handle the Customer "restored" event.
     */
    public function restored(Customer $customer): void
    {
        //
    }

    /**
     * Handle the Customer "force deleted" event.
     */
    public function forceDeleted(Customer $customer): void
    {
        //
    }
}
