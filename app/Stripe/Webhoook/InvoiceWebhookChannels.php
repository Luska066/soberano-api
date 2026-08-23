<?php

namespace App\Stripe\Webhoook;

class InvoiceWebhookChannels implements Channels
{

    const InvoiceCreated =  "invoice.created";
    const InvoiceUpdated =  "invoice.updated";
    const InvoiceSent =  "invoice.sent";
    const InvoicePaymentSucceeded =  "invoice.payment_succeeded";
    const InvoicePaymentFailed =  "invoice.payment_failed";

    public function resolve($channel = null, mixed $data = [])
    {
        switch ($channel) {
            case self::InvoiceCreated:
                $this->invoiceCreated($data);
                break;
            case self::InvoiceUpdated:
                $this->invoiceUpdated($data);
                break;
            case self::InvoiceSent:
                $this->invoiceSent($data);
                break;
            case self::InvoicePaymentSucceeded:
                $this->invoicePaymentSucceeded($data);
                break;
            case self::InvoicePaymentFailed:
                $this->invoicePaymentFailed($data);
                break;
            default:
                break;
        }
    }

    public function invoiceCreated(mixed $data = []) {}

    public function invoiceUpdated(mixed $data = []) {}

    public function invoiceSent(mixed $data = []) {}

    public function invoicePaymentSucceeded(mixed $data = []) {}

    public function invoicePaymentFailed(mixed $data = []) {}
}
