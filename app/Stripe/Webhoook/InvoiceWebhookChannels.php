<?php

namespace App\Stripe\Webhoook;

class InvoiceWebhookChannels extends ProductWebhookChannels implements Channels
{


    public function invoiceCreated(mixed $data = []) {}

    public function invoiceUpdated(mixed $data = []) {}

    public function invoiceSent(mixed $data = []) {}

    public function invoicePaymentSucceeded(mixed $data = []) {}

    public function invoicePaymentFailed(mixed $data = []) {}
}
