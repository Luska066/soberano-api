<?php
$model_simplified = [
    
    'name' => $user->name,

    'individual_name' => $user->name,

    'business_name' => $user->company_name,

    'email' => $user->email,

    'phone' => $user->phone,

    'metadata' => [
        'system_id' => $user->id,
        'user_id' => (string) $user->id,

        'customer_type' => $user->cnpj
            ? 'company'
            : 'individual',

        'document' => $user->cnpj
            ?? $user->cpf,

        'source' => 'soberano-ai',

        'environment' => app()->environment(),
    ],
    'address' => [
        'line1' => $user->address,

        'line2' => $user->address_complement,

        'city' => $user->city,

        'state' => $user->state,

        'postal_code' => $user->postal_code,

        'country' => 'BR',
    ],
]
$options = [
    // ==========================================
    // IDENTIFICAÇÃO DO CLIENTE
    // ==========================================

    'name' => $user->name,

    'individual_name' => $user->name,

    'business_name' => $user->company_name,

    'email' => $user->email,

    'phone' => $user->phone,

    'description' => 'Cliente do Soberano AI',


    // ==========================================
    // ENDEREÇO DE COBRANÇA
    // Necessário para cálculo de impostos
    // ==========================================

    'address' => [
        'line1' => $user->address,

        'line2' => $user->address_complement,

        'city' => $user->city,

        'state' => $user->state,

        'postal_code' => $user->postal_code,

        'country' => 'BR',
    ],


    // ==========================================
    // INFORMAÇÕES DE ENTREGA
    // ==========================================

    // 'shipping' => [
    //     'name' => $user->name,

    //     'phone' => $user->phone,

    //     'address' => [
    //         'line1' => $user->address,

    //         'line2' => $user->address_complement,

    //         'city' => $user->city,

    //         'state' => $user->state,

    //         'postal_code' => $user->postal_code,

    //         'country' => 'BR',
    //     ],
    // ],


    // ==========================================
    // IMPOSTOS
    // ==========================================

    'tax_exempt' => 'exempt',

    /*
     * Opções:
     *
     * none
     * exempt
     * reverse
     *
     * Normalmente:
     *
     * none = cliente sujeito a imposto
     * exempt = cliente isento
     * reverse = reverse charge
     */


    // ==========================================
    // TAX IDs
    // ==========================================

    // 'tax_id_data' => [
    //     [
    //         'type' => 'br_cnpj',
    //         'value' => $user->cnpj,
    //     ],
    // ],


    // ==========================================
    // DADOS DE TAX / STRIPE TAX
    // ==========================================

    'tax' => [
        // Configurações de tax do cliente
        //
        // Consulte os tipos de tax configuration
        // disponíveis para sua conta/região.
    ],


    // ==========================================
    // METADATA
    // ==========================================

    'metadata' => [
        'user_id' => (string) $user->id,

        'customer_type' => $user->cnpj
            ? 'company'
            : 'individual',

        'document' => $user->cnpj
            ?? $user->cpf,

        'source' => 'soberano-ai',

        'environment' => app()->environment(),
    ],


    // ==========================================
    // PAGAMENTO
    // ==========================================

    'payment_method' => null,

    'source' => null,


    // ==========================================
    // SALDO DO CUSTOMER
    // ==========================================

    'balance' => 0,


    // ==========================================
    // CASH BALANCE
    // ==========================================

    // 'cash_balance' => [
    //     'settings' => [
    //         'reconciliation_mode' => 'manual',
    //     ],
    // ],

    // ==========================================
    // FATURAMENTO
    // ==========================================

    'invoice_prefix' => 'SOB',

    'next_invoice_sequence' => 1,

    'invoice_settings' => [
        'default_payment_method' => null,

        'custom_fields' => [
            [
                'name' => 'Sistema',
                'value' => 'Soberano AI',
            ],
        ],

        'footer' => 'Obrigado por utilizar o Soberano AI.',

        'rendering_options' => [
            // configurações de renderização
        ],
    ],


    // ==========================================
    // IDIOMA
    // ==========================================

    // 'preferred_locales' => [
    //     'pt-BR',
    // ],


    // ==========================================
    // TEST CLOCK
    // Apenas para testes do Stripe
    // ==========================================

    // 'test_clock' => null,
];

$stripeCustomer = $user->createAsStripeCustomer($options);