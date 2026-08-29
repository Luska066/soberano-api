<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

#[Signature('app:strip')]
#[Description('Command description')]
class StripTestConnection extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $secret = config('cashier.secret') ?? env('STRIPE_SECRET');

        if (!$secret) {
            $this->error('Stripe secret key is not configured in cashier.secret or STRIPE_SECRET.');
            return Command::FAILURE;
        }

        $this->info('Testing Stripe connection...');

        try {
            $stripe = new StripeClient($secret);
            $account = $stripe->accounts->retrieve();
            $user = User::first();
            $products = $stripe->products->all([
                'limit' => 10,
                'active' => true,
            ]);
            dd($products->toArray());
            // $user = User::first()->createOrGetStripeCustomer();
            // $user->newSubscription('main', 'price_1SLf4K2E3h3qD0mXkM6yU6fW')->create('pm_1SLf4l2E3h3qD0mXkL3h4Q8e');


            $this->newLine();

            $this->info('✓ Successfully connected to Stripe!');
            $this->newLine();

            $this->table(
                ['Field', 'Value'],
                [
                    ['Account ID', $account->id ?? 'N/A'],
                    ['Email', $account->email ?? 'N/A'],
                    ['Business Name', $account->business_profile->name ?? ($account->settings->dashboard->display_name ?? 'N/A')],
                    ['Country', $account->country ?? 'N/A'],
                    ['Default Currency', strtoupper($account->default_currency ?? 'N/A')],
                    ['Charges Enabled', ($account->charges_enabled ?? false) ? 'Yes' : 'No'],
                    ['Payouts Enabled', ($account->payouts_enabled ?? false) ? 'Yes' : 'No'],
                ]
            );

            Log::info('Stripe connection tested successfully', [
                'connected' => true,
                'account_id' => $account->id,
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('✗ Stripe connection failed: ' . $e->getMessage());
            Log::error('Stripe connection test failed', ['error' => $e->getMessage()]);
            return Command::FAILURE;
        }
    }
}
