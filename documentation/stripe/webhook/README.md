# Documentação de Eventos Webhook do Stripe

Este diretório contém os exemplos reais de payloads de eventos recebidos via Webhook do Stripe, com base na documentação oficial da [API do Stripe (Events List)](https://docs.stripe.com/api/events/list).

---

## 📋 Resumo dos Eventos e Finalidades

| Arquivo JSON | Tipo do Evento (`type`) | Descrição e Finalidade |
|---|---|---|
| [`PaymentMethodAttached.json`](./PaymentMethodAttached.json) | `payment_method.attached` | Disparado quando uma nova forma de pagamento (ex: cartão de crédito `pm_...`) é vinculada com sucesso a um cliente (`cus_...`). |
| [`CustomerCreated.json`](./CustomerCreated.json) | `customer.created` | Disparado quando um novo objeto de cliente é criado na conta do Stripe. |
| [`CustomerUpdated.json`](./CustomerUpdated.json) | `customer.updated` | Disparado sempre que os dados ou metadados de um cliente são alterados. O payload traz o objeto atualizado e os valores anteriores em `previous_attributes`. |
| [`CustomerDeleted.json`](./CustomerDeleted.json) | `customer.deleted` | Disparado quando um cliente é excluído/removido do Stripe. Útil para desativar ou limpar registros vinculados. |
| [`ProductCreated.json`](./ProductCreated.json) | `product.created` | Disparado quando um produto/serviço (`prod_...`) é cadastrado no Stripe. |
| [`PlanCreated.json`](./PlanCreated.json) | `plan.created` | Disparado quando um plano de assinatura é criado (legado/compatibilidade do Stripe). |
| [`PriceCreated.json`](./PriceCreated.json) | `price.created` | Disparado quando um preço (`price_...`) é criado para um produto (definindo moeda, valor e recorrência mensal/anual). |
| [`PaymentIntentCreated.json`](./PaymentIntentCreated.json) | `payment_intent.created` | Disparado quando uma intenção de pagamento (`pi_...`) é iniciada no Stripe, aguardando método de pagamento. |
| [`PaymentIntentSucceeded.json`](./PaymentIntentSucceeded.json) | `payment_intent.succeeded` | Disparado quando a cobrança do `payment_intent` é confirmada e o dinheiro foi capturado com sucesso. |
| [`ChargeSucceeded.json`](./ChargeSucceeded.json) | `charge.succeeded` | Disparado quando a cobrança (`ch_...`) direta no cartão/meio de pagamento é concluída com sucesso. Traz recibo e detalhes de transação de rede. |
| [`InvoiceCreated.json`](./InvoiceCreated.json) | `invoice.created` | Disparado quando uma nova fatura (`in_...`) é gerada para o cliente (seja avulsa ou por ciclo de assinatura). |
| [`InvoiceFinalized.json`](./InvoiceFinalized.json) | `invoice.finalized` | Disparado quando a fatura é fechada e está pronta para ser paga / cobrada automaticamente. |
| [`InvoicePaid.json`](./InvoicePaid.json) | `invoice.paid` | Disparado quando a fatura é totalmente quitada e liquidada. |
| [`InvoicePaymentSucceeded.json`](./InvoicePaymentSucceeded.json) | `invoice.payment_succeeded` | Disparado quando a tentativa de pagamento de uma fatura foi bem-sucedida. |
| [`InvoicePaymentPaid.json`](./InvoicePaymentPaid.json) | `invoice_payment.paid` | Disparado quando o objeto de pagamento da fatura (`inpay_...`) tem seu status alterado para pago. |
| [`CustomerSubscriptionCreated.json`](./CustomerSubscriptionCreated.json) | `customer.subscription.created` | Disparado quando uma assinatura (`sub_...`) é criada e ativada para o cliente, contendo itens, período de vigência e plano associado. |
