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
        ]);
    }

    /**
     * Handle the Customer "updated" event.
     */
    public function updated(Customer $customer): void
    {

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
