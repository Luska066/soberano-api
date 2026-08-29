<?php

namespace App\Console\Commands;

use App\Jobs\JobSyncProductAndPriceStripe;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:test')]
#[Description('Command description')]
class TestJobs extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        JobSyncProductAndPriceStripe::dispatchSync();
    }
}
