<?php

namespace App\Http\Controllers;

use App\Enums\Stripe\v1\StripCountrieType;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $country = $request->string('country')->trim()->toString();

        $query = Customer::query()->latest();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('city', 'like', "%{$search}%")
                    ->orWhere('state', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%")
                    ->orWhere('postal_code', 'like', "%{$search}%")
                    ->orWhere('line1', 'like', "%{$search}%")
                    ->orWhere('data->name', 'like', "%{$search}%")
                    ->orWhere('data->email', 'like', "%{$search}%")
                    ->orWhere('data->phone', 'like', "%{$search}%");
            });
        }

        if (!empty($country)) {
            $query->where(function ($q) use ($country) {
                $countryEnum = StripCountrieType::fromValueOrLabel($country);
                if ($countryEnum) {
                    $q->where('country', $countryEnum->value)
                        ->orWhere('country', $countryEnum->label());
                } else {
                    $q->where('country', $country);
                }
            });
        }

        $customers = $query->paginate(10)->withQueryString();

        // Calculate metrics
        $totalCustomers = Customer::count();
        $totalCountries = Customer::distinct('country')->count('country');
        $newThisMonth = Customer::where('created_at', '>=', now()->startOfMonth())->count();

        $availableCountries = Customer::query()
            ->select('country')
            ->distinct()
            ->whereNotNull('country')
            ->pluck('country');

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'country' => $country,
            ],
            'metrics' => [
                'total' => $totalCustomers,
                'active' => $totalCustomers,
                'countries' => $totalCountries,
                'new_this_month' => $newThisMonth,
            ],
            'availableCountries' => $availableCountries,
            'stripeCountries' => StripCountrieType::toSelectSorted(),
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'country_code' => ['nullable', 'string', 'max:10'],
            'country' => ['required', 'string', 'max:100'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
        ]);

        $validator->after(function ($validator) use ($request) {
            $countryEnum = StripCountrieType::fromValueOrLabel($request->input('country'));
            if ($countryEnum && $request->filled('postal_code')) {
                if (!$countryEnum->validatePostalCode($request->input('postal_code'))) {
                    $validator->errors()->add(
                        'postal_code',
                        "O formato do código postal é inválido para o país selecionado ({$countryEnum->label()})."
                    );
                }
            }

            if ($countryEnum && $request->filled('phone')) {
                if (!$countryEnum->validatePhone($request->input('phone'))) {
                    $validator->errors()->add(
                        'phone',
                        "O formato do telefone/celular é inválido para o padrão de {$countryEnum->label()}."
                    );
                }
            }
        });

        $validated = $validator->validate();

        $userId = auth()->id() ?? User::first()?->id ?? (string) Str::uuid();

        $customer = new Customer();
        $customer->id_user = (string) $userId;
        $customer->country = $validated['country'];
        $customer->line1 = $validated['line1'];
        $customer->line2 = $validated['line2'] ?? null;
        $customer->city = $validated['city'];
        $customer->state = $validated['state'];
        $customer->postal_code = $validated['postal_code'];
        $customer->name = $validated['name'];
        $customer->email = $validated['email'];
        $customer->phone = $validated['phone'] ?? null;
        $customer->country_code = $validated['country_code'] ?? '+55';
        $customer->save();

        return redirect()->back()->with('success', 'Cliente cadastrado com sucesso!');
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'country_code' => ['nullable', 'string', 'max:10'],
            'country' => ['required', 'string', 'max:100'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
        ]);

        $validator->after(function ($validator) use ($request) {
            $countryEnum = StripCountrieType::fromValueOrLabel($request->input('country'));
            if ($countryEnum && $request->filled('postal_code')) {
                if (!$countryEnum->validatePostalCode($request->input('postal_code'))) {
                    $validator->errors()->add(
                        'postal_code',
                        "O formato do código postal é inválido para o país selecionado ({$countryEnum->label()})."
                    );
                }
            }

            if ($countryEnum && $request->filled('phone')) {
                if (!$countryEnum->validatePhone($request->input('phone'))) {
                    $validator->errors()->add(
                        'phone',
                        "O formato do telefone/celular é inválido para o padrão de {$countryEnum->label()}."
                    );
                }
            }
        });

        $validated = $validator->validate();

        $customer->country = $validated['country'];
        $customer->line1 = $validated['line1'];
        $customer->line2 = $validated['line2'] ?? null;
        $customer->city = $validated['city'];
        $customer->state = $validated['state'];
        $customer->postal_code = $validated['postal_code'];
        $customer->name = $validated['name'];
        $customer->email = $validated['email'];
        $customer->phone = $validated['phone'] ?? null;
        $customer->country_code = $validated['country_code'] ?? '+55';
        $customer->save();

        return redirect()->back()->with('success', 'Cliente atualizado com sucesso!');
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->back()->with('success', 'Cliente removido com sucesso!');
    }
}
