<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\Stripe\v1\StripCountrieType;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $validator = Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'country_code' => ['required', 'string', 'max:10'],
            'phone' => ['required', 'string', 'max:30'],
            'country' => ['required', 'string', 'max:100'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
        ], [
            'name.required' => 'O campo nome completo é obrigatório.',
            'email.required' => 'O campo email é obrigatório.',
            'email.email' => 'Informe um endereço de email válido.',
            'email.unique' => 'Este email já está cadastrado.',
            'password.required' => 'O campo senha é obrigatório.',
            'password.confirmed' => 'A confirmação da senha não corresponde.',
            'country_code.required' => 'O código do país (DDI) é obrigatório.',
            'phone.required' => 'O telefone / celular é obrigatório.',
            'country.required' => 'O país é obrigatório.',
            'line1.required' => 'O endereço / logradouro é obrigatório.',
            'city.required' => 'A cidade é obrigatória.',
            'state.required' => 'O estado / província é obrigatório.',
            'postal_code.required' => 'O CEP / código postal é obrigatório.',
        ]);

        $validator->after(function ($validator) use ($input) {
            $countryInput = $input['country'] ?? null;
            $ddiInput = $input['country_code'] ?? null;
            $postalCodeInput = $input['postal_code'] ?? null;
            $phoneInput = $input['phone'] ?? null;

            // 1. Validação do País do Endereço
            $countryEnum = StripCountrieType::fromValueOrLabel($countryInput);
            if (!$countryEnum) {
                $validator->errors()->add(
                    'country',
                    'O país selecionado não é válido ou não é suportado.'
                );
            } else {
                // 2. Validação da máscara e formato do Código Postal / CEP
                if (!empty($postalCodeInput) && !$countryEnum->validatePostalCode($postalCodeInput)) {
                    $validator->errors()->add(
                        'postal_code',
                        "O formato do código postal é inválido para o país selecionado ({$countryEnum->label()})."
                    );
                }
            }

            // 3. Validação do DDI de Contato
            $ddiEnum = StripCountrieType::fromDdi($ddiInput);
            if (!$ddiEnum) {
                $validator->errors()->add(
                    'country_code',
                    'O DDI / Código do país selecionado não é válido.'
                );
            } else {
                // 4. Validação da máscara e formato do Telefone / Celular
                if (!empty($phoneInput) && !$ddiEnum->validatePhone($phoneInput)) {
                    $validator->errors()->add(
                        'phone',
                        "O formato do telefone/celular é inválido para o padrão do DDI ({$ddiEnum->label()} {$ddiEnum->ddi()})."
                    );
                }
            }
        });

        $validator->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'type' => 'customer',
            ]);

            Customer::create([
                'id_user' => $user->id,
                'phone' => $input['phone'],
                'country_code' => $input['country_code'],
                'country' => $input['country'],
                'line1' => $input['line1'],
                'line2' => $input['line2'] ?? null,
                'city' => $input['city'],
                'state' => $input['state'],
                'postal_code' => $input['postal_code'],
            ]);

            return $user;
        });
    }
}
