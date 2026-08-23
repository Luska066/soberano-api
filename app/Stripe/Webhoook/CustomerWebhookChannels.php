<?php

namespace App\Stripe\Webhoook;

class CustomerWebhookChannels implements Channels
{
    const CustomerCreated = "customer.created";

    const CustomerUpdated = "customer.updated";

    const CustomerDeleted = "customer.deleted";

    const CustomerSubscriptionUpdated = "customer.subscription.updated";

    const CustomerSubscriptionDeleted = "customer.subscription.deleted";

    const CustomerSubscriptionCreated = "customer.subscription.created";

    const CustomerSubscriptionTrialWillEnd = "customer.subscription.trial_will_end";

    const CustomerSubscriptionPaused = "customer.subscription.paused";

    public function resolve(string $channel, object $data)
    {
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
            default:
                break;
        }
    }

    public function customerCreated(mixed $data = []) {}
    public function customerUpdated(mixed $data = []) {}
    public function customerDeleted(mixed $data = []) {}
    public function customerSubscriptionUpdated(mixed $data = []) {}
    public function customerSubscriptionDeleted(mixed $data = []) {}
    public function customerSubscriptionCreated(mixed $data = []) {}
    public function customerSubscriptionTrialWillEnd(mixed $data = []) {}
    public function customerSubscriptionPaused(mixed $data = []) {}
}
