<?php

namespace App\Stripe\Webhoook;


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

    public function resolve($channel = null, mixed $data = [])
    {
        switch ($channel) {
            case self::ProductCreated:
                $this->productCreated($data);
                break;
            case self::ProductUpdated:
                $this->productUpdated($data);
                break;
            case self::ProductDeleted:
                $this->productDeleted($data);
                break;
            case self::PriceCreated:
                $this->priceCreated($data);
                break;
            case self::PriceUpdated:
                $this->priceUpdated($data);
                break;
            case self::PriceDeleted:
                $this->priceDeleted($data);
                break;
            case self::PlanCreated:
                $this->planCreated($data);
                break;
            case self::PlanDeleted:
                $this->planDeleted($data);
                break;
            case self::PlanUpdated:
                $this->planUpdated($data);
                break;
            default:
                break;
        }
    }
    public static function productUpdated(mixed $data = []) {}

    public static function productCreated(mixed $data = []) {}

    public static function productDeleted(mixed $data = []) {}

    public static function planCreated(mixed $data = []) {}
    public static function planDeleted(mixed $data = []) {}

    public static function planUpdated(mixed $data = []) {}

    public static function priceCreated(mixed $data = []) {}

    public static function priceUpdated(mixed $data = []) {}

    public static function priceDeleted(mixed $data = []) {}
}
