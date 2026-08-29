<?php

namespace App\Jobs;

use App\Models\Price;
use App\Models\Product;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\StripeClient;

class JobSyncProductAndPriceStripe implements ShouldQueue
{
    use Queueable;

    private StripeClient $stripe;
    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
        $this->stripe = new StripeClient($secret);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        DB::beginTransaction();
        try {
            $product_stripe = $this->stripe->products->all([
                'active' => true
            ]);

            foreach ($product_stripe as $ps) {
                Product::updateOrCreate([
                    'id_stripe' => $ps['id'],
                ], [
                    'name' => $ps['name'],
                    'description' => $ps['description'] ?? null,
                    'image' => null,
                    'default_price' => $ps['default_price'] ?? null,
                    'data' => $ps->toArray()
                ]);
            }

            $price_stripe = $this->stripe->prices->all([
                'active' => true
            ]);

            foreach ($price_stripe as $ps) {
                Price::updateOrCreate([
                    'id_stripe' => $ps['id']
                ], [
                    'product_id' => $ps['product'],
                    'currency' => $ps['currency'],
                    'unit_amount' => $ps['unit_amount'],
                    'interval' => $ps['recurring']['interval'],
                    'trial_period_days' => $ps['recurring']['trial_period_days'] ?? null,
                    'type' => $ps['type'],
                    'data' => $ps->toArray()
                ]);
            }
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::info('error', [
                'error' => $e->getMessage(),
                'file' => class_basename($this),
                'line' => $e->getLine(),
                'file_error' => $e->getFile(),
            ]);
        }
    }
}
