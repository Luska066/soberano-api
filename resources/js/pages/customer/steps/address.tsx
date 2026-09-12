import { useState, useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Building,
    Check,
    CheckCircle2,
    Compass,
    CreditCard,
    Globe,
    HelpCircle,
    Home,
    Lock,
    MapPin,
    Navigation,
    Phone,
    Shield,
    Sparkles,
} from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    applyPhoneMask,
    applyPostalCodeMask,
    getPhonePlaceholder,
    getPostalCodePlaceholder,
} from '@/services/PhoneService';

export interface StripeCountryOption {
    label: string;
    value: string;
    code: string;
    ddi: string;
    dd: string;
    postal_code_regex: string | null;
    phone_regex?: string | null;
}

export interface StepItem {
    type: string;
    key: string;
    title: string;
    description: string;
    icon: string;
}

export interface CustomerData {
    uuid?: string;
    id_user?: number | string;
    country?: string;
    country_code?: string;
    phone?: string;
    line1?: string;
    line2?: string | null;
    city?: string;
    state?: string;
    postal_code?: string;
    data?: Record<string, unknown> | null;
}

interface PageProps {
    customer?: CustomerData | null;
    steps?: StepItem[];
    currentStep?: string;
    stripeCountries?: StripeCountryOption[];
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs = [
    {
        title: 'Painel',
        href: '/dashboard',
    },
    {
        title: 'Configuração de Conta',
        href: '/customer/steps/address',
    },
    {
        title: 'Endereço',
        href: '/customer/steps/address',
    },
];

export default function CustomerAddressStep({
    customer,
    steps = [],
    currentStep = 'address',
    stripeCountries = [],
}: PageProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    // Localiza o país inicial com base no cadastro existente ou Brasil como padrão
    const initialCountryCode = customer?.country || 'BR';
    const initialDdiCode = customer?.country_code || '+55';

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        country: initialCountryCode,
        country_code: initialDdiCode,
        phone: customer?.phone ? applyPhoneMask(customer.phone, initialCountryCode) : '',
        line1: customer?.line1 || '',
        line2: customer?.line2 || '',
        city: customer?.city || '',
        state: customer?.state || '',
        postal_code: customer?.postal_code ? applyPostalCodeMask(customer.postal_code, initialCountryCode) : '',
    });

    // Encontra informações do país selecionado
    const selectedCountryInfo = useMemo(() => {
        return (
            stripeCountries.find(
                (c) =>
                    c.value.toUpperCase() === data.country.toUpperCase() ||
                    c.label.toLowerCase() === data.country.toLowerCase(),
            ) || null
        );
    }, [stripeCountries, data.country]);

    // Encontra informações do DDI selecionado
    const selectedDdiInfo = useMemo(() => {
        return stripeCountries.find((c) => c.ddi === data.country_code) || null;
    }, [stripeCountries, data.country_code]);

    // Validação visual ao vivo do CEP / Postal Code
    const isPostalCodeFormatInvalid = Boolean(
        data.postal_code &&
        selectedCountryInfo?.postal_code_regex &&
        !new RegExp(selectedCountryInfo.postal_code_regex, 'i').test(data.postal_code.trim()),
    );

    // Manipuladores de alteração de país e DDI com recálculo de máscara
    const handleCountryChange = (newCountryCode: string) => {
        const country = stripeCountries.find((c) => c.value === newCountryCode);
        const remaskedPostal = applyPostalCodeMask(
            data.postal_code,
            newCountryCode,
            country?.postal_code_regex,
        );

        // Se o país tiver um DDI correspondente, atualiza o DDI e a máscara de telefone também
        const matchingDdi = country?.ddi || data.country_code;
        const remaskedPhone = applyPhoneMask(data.phone, newCountryCode);

        setData((prev) => ({
            ...prev,
            country: newCountryCode,
            country_code: matchingDdi,
            postal_code: remaskedPostal,
            phone: remaskedPhone,
        }));
    };

    const handleDdiChange = (newDdi: string) => {
        const ddiCountry = stripeCountries.find((c) => c.ddi === newDdi);
        const countryCode = ddiCountry?.value || data.country || 'BR';
        const remaskedPhone = applyPhoneMask(data.phone, countryCode);

        setData((prev) => ({
            ...prev,
            country_code: newDdi,
            phone: remaskedPhone,
        }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const targetCountry = selectedDdiInfo?.value || selectedCountryInfo?.value || 'BR';
        const masked = applyPhoneMask(rawValue, targetCountry);
        setData('phone', masked);
    };

    const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const masked = applyPostalCodeMask(
            rawValue,
            data.country,
            selectedCountryInfo?.postal_code_regex,
        );
        setData('postal_code', masked);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customer/steps/address', {
            preserveScroll: true,
        });
    };

    const currentStepIndex = steps.findIndex((s) => s.key === currentStep || s.type === currentStep);
    const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

    return (
        <>
            <Head title="Cadastro de Endereço — Soberano AI" />

            <div className="relative min-h-[calc(100vh-4rem)] bg-[#07091a] p-4 text-[#e4e6f0] md:p-8">
                {/* Fundo com grade cibernética dourada */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-60"
                    style={{
                        backgroundImage: `linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }}
                />

                <div className="relative z-10 mx-auto max-w-4xl space-y-8">
                    {/* Barra de Progresso / Steps Onboarding */}
                    {steps.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-[#c9a227]/25 bg-[#0d1228]/90 p-5 shadow-xl backdrop-blur-md">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {steps.map((step, idx) => {
                                    const isCurrent = idx === activeIndex;
                                    const isCompleted = idx < activeIndex;

                                    return (
                                        <div
                                            key={step.key || idx}
                                            className={`relative flex items-center gap-3.5 rounded-lg border p-3.5 transition-all ${isCurrent
                                                    ? 'border-[#c9a227] bg-[#c9a227]/10 shadow-[0_0_15px_rgba(201,162,39,0.2)]'
                                                    : isCompleted
                                                        ? 'border-[#22c55e]/40 bg-[#22c55e]/5'
                                                        : 'border-white/5 bg-[#07091a]/50 opacity-60'
                                                }`}
                                        >
                                            <div
                                                className={`flex size-10 shrink-0 items-center justify-center rounded-lg font-rajdhani text-sm font-bold ${isCurrent
                                                        ? 'border border-[#c9a227] bg-gradient-to-br from-[#c9a227] to-[#a87d15] text-[#07091a] shadow-[0_0_10px_rgba(201,162,39,0.4)]'
                                                        : isCompleted
                                                            ? 'border border-[#22c55e] bg-[#22c55e]/20 text-[#22c55e]'
                                                            : 'border border-white/10 bg-[#07091a] text-[#7a84a0]'
                                                    }`}
                                            >
                                                {isCompleted ? <Check className="size-5" /> : `0${idx + 1}`}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-rajdhani text-sm font-bold tracking-wide uppercase text-white truncate">
                                                        {step.title}
                                                    </span>
                                                    {isCurrent && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-[#c9a227]/50 bg-[#c9a227]/20 text-[9px] font-mono font-bold text-[#c9a227]"
                                                        >
                                                            EM ANDAMENTO
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="truncate text-xs text-[#7a84a0]">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Mensagens de Sucesso ou Alertas Gerais */}
                    {flash?.success && (
                        <div className="flex items-center gap-3 rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-4 text-xs text-[#22c55e] shadow-lg backdrop-blur-md">
                            <CheckCircle2 className="size-5 shrink-0" />
                            <span className="font-medium">{flash.success}</span>
                        </div>
                    )}

                    {errors.general && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400 shadow-lg backdrop-blur-md">
                            <AlertCircle className="size-5 shrink-0" />
                            <span className="font-medium">{errors.general}</span>
                        </div>
                    )}

                    {/* Cartão Principal do Formulário */}
                    <div className="overflow-hidden rounded-2xl border border-[#c9a227]/30 bg-[#0d1228]/95 shadow-2xl backdrop-blur-md">
                        {/* Cabeçalho do Cartão */}
                        <div className="border-b border-[#c9a227]/20 bg-gradient-to-r from-[#111d40]/80 via-[#0d1228] to-[#07091a]/90 p-6 md:p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3.5">
                                    <div className="flex size-12 items-center justify-center rounded-xl border border-[#c9a227]/50 bg-[#c9a227]/15 text-[#c9a227] shadow-[0_0_20px_rgba(201,162,39,0.25)]">
                                        <MapPin className="size-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="font-rajdhani text-2xl md:text-3xl font-bold uppercase tracking-wider text-white">
                                                Endereço & <span className="text-[#c9a227]">Contato</span>
                                            </h1>
                                            <Sparkles className="size-4 text-[#c9a227]" />
                                        </div>
                                        <p className="font-sans text-xs md:text-sm text-[#7a84a0]">
                                            Cadastre seus dados de faturamento em conformidade com as regras fiscais e Stripe
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg border border-[#4da6d6]/30 bg-[#4da6d6]/10 px-3 py-1.5 font-mono text-[11px] text-[#4da6d6]">
                                    <Shield className="size-4 text-[#4da6d6]" />
                                    <span>Proteção PCI-DSS & Stripe</span>
                                </div>
                            </div>
                        </div>

                        {/* Formulário */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                            {/* Bloco 1: País e Contato Telefônico */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-[#c9a227]/15 pb-2">
                                    <Globe className="size-4 text-[#c9a227]" />
                                    <h2 className="font-rajdhani text-base font-bold uppercase tracking-wider text-white">
                                        1. País e Telefone de Contato
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                    {/* Campo País */}
                                    <div className="md:col-span-6 space-y-2">
                                        <Label
                                            htmlFor="country"
                                            className="font-mono text-xs uppercase tracking-wider text-[#7a84a0] flex items-center justify-between"
                                        >
                                            <span>País de Faturamento *</span>
                                            {selectedCountryInfo && (
                                                <span className="font-bold text-[#c9a227]">
                                                    {selectedCountryInfo.value} ({selectedCountryInfo.ddi})
                                                </span>
                                            )}
                                        </Label>
                                        <div className="relative">
                                            <select
                                                id="country"
                                                name="country"
                                                value={data.country}
                                                onChange={(e) => handleCountryChange(e.target.value)}
                                                className="h-11 w-full rounded-md border border-[#c9a227]/30 bg-[#07091a] px-3.5 font-sans text-sm text-white focus:border-[#c9a227] focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
                                            >
                                                {stripeCountries.map((c) => (
                                                    <option
                                                        key={c.value}
                                                        value={c.value}
                                                        className="bg-[#07091a] text-white"
                                                    >
                                                        {c.label} ({c.value}) — {c.ddi}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <InputError message={errors.country} />
                                    </div>

                                    {/* DDI + Telefone */}
                                    <div className="md:col-span-6 space-y-2">
                                        <Label
                                            htmlFor="phone"
                                            className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                        >
                                            Telefone / WhatsApp *
                                        </Label>
                                        <div className="flex gap-2">
                                            {/* Select DDI */}
                                            <div className="w-28 shrink-0">
                                                <select
                                                    id="country_code"
                                                    name="country_code"
                                                    value={data.country_code}
                                                    onChange={(e) => handleDdiChange(e.target.value)}
                                                    className="h-11 w-full rounded-md border border-[#c9a227]/30 bg-[#07091a] px-2 font-mono text-xs text-white focus:border-[#c9a227] focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
                                                >
                                                    {stripeCountries.map((c) => (
                                                        <option
                                                            key={`${c.value}-${c.ddi}`}
                                                            value={c.ddi}
                                                            className="bg-[#07091a] text-white"
                                                        >
                                                            {c.value} {c.ddi}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Input Telefone com máscara */}
                                            <div className="relative flex-1">
                                                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7a84a0]" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    name="phone"
                                                    value={data.phone}
                                                    onChange={handlePhoneChange}
                                                    placeholder={getPhonePlaceholder(selectedCountryInfo?.value || 'BR')}
                                                    className="h-11 border-[#c9a227]/30 bg-[#07091a] pl-9 font-mono text-sm text-white placeholder:text-[#525b75] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <InputError message={errors.phone || errors.country_code} />
                                    </div>
                                </div>
                            </div>

                            {/* Bloco 2: CEP e Localidade */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 border-b border-[#c9a227]/15 pb-2">
                                    <Navigation className="size-4 text-[#c9a227]" />
                                    <h2 className="font-rajdhani text-base font-bold uppercase tracking-wider text-white">
                                        2. Endereço e CEP / Código Postal
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                    {/* CEP / Postal Code */}
                                    <div className="md:col-span-4 space-y-2">
                                        <Label
                                            htmlFor="postal_code"
                                            className="font-mono text-xs uppercase tracking-wider text-[#7a84a0] flex items-center justify-between"
                                        >
                                            <span>CEP / Código Postal *</span>
                                            {isPostalCodeFormatInvalid && (
                                                <span className="font-sans text-[10px] text-orange-400">
                                                    Formato inválido
                                                </span>
                                            )}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="postal_code"
                                                type="text"
                                                name="postal_code"
                                                value={data.postal_code}
                                                onChange={handlePostalCodeChange}
                                                placeholder={getPostalCodePlaceholder(selectedCountryInfo?.value || 'BR')}
                                                className={`h-11 border bg-[#07091a] font-mono text-sm text-white placeholder:text-[#525b75] focus:ring-1 ${isPostalCodeFormatInvalid
                                                        ? 'border-orange-400 focus:border-orange-400 focus:ring-orange-400'
                                                        : 'border-[#c9a227]/30 focus:border-[#c9a227] focus:ring-[#c9a227]'
                                                    }`}
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.postal_code} />
                                    </div>

                                    {/* Cidade */}
                                    <div className="md:col-span-5 space-y-2">
                                        <Label
                                            htmlFor="city"
                                            className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                        >
                                            Cidade *
                                        </Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            name="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="Ex: São Paulo"
                                            className="h-11 border-[#c9a227]/30 bg-[#07091a] font-sans text-sm text-white placeholder:text-[#525b75] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                            required
                                        />
                                        <InputError message={errors.city} />
                                    </div>

                                    {/* Estado / Província / UF */}
                                    <div className="md:col-span-3 space-y-2">
                                        <Label
                                            htmlFor="state"
                                            className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                        >
                                            Estado / UF *
                                        </Label>
                                        <Input
                                            id="state"
                                            type="text"
                                            name="state"
                                            value={data.state}
                                            onChange={(e) => setData('state', e.target.value)}
                                            placeholder="Ex: SP"
                                            className="h-11 border-[#c9a227]/30 bg-[#07091a] font-sans text-sm text-white placeholder:text-[#525b75] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                            required
                                        />
                                        <InputError message={errors.state} />
                                    </div>
                                </div>

                                {/* Linha 1 do Endereço (Logradouro / Rua / Número) */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                    <div className="md:col-span-8 space-y-2">
                                        <Label
                                            htmlFor="line1"
                                            className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]"
                                        >
                                            Endereço / Logradouro (Rua, Av, Número) *
                                        </Label>
                                        <div className="relative">
                                            <Home className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7a84a0]" />
                                            <Input
                                                id="line1"
                                                type="text"
                                                name="line1"
                                                value={data.line1}
                                                onChange={(e) => setData('line1', e.target.value)}
                                                placeholder="Ex: Av. Paulista, 1000"
                                                className="h-11 border-[#c9a227]/30 bg-[#07091a] pl-10 font-sans text-sm text-white placeholder:text-[#525b75] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.line1} />
                                    </div>

                                    {/* Linha 2 do Endereço (Complemento / Apto / Bloco) */}
                                    <div className="md:col-span-4 space-y-2">
                                        <Label
                                            htmlFor="line2"
                                            className="font-mono text-xs uppercase tracking-wider text-[#7a84a0] flex items-center justify-between"
                                        >
                                            <span>Complemento</span>
                                            <span className="text-[10px] text-[#525b75]">(Opcional)</span>
                                        </Label>
                                        <div className="relative">
                                            <Building className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7a84a0]" />
                                            <Input
                                                id="line2"
                                                type="text"
                                                name="line2"
                                                value={data.line2 || ''}
                                                onChange={(e) => setData('line2', e.target.value)}
                                                placeholder="Apto 42, Bloco B"
                                                className="h-11 border-[#c9a227]/30 bg-[#07091a] pl-10 font-sans text-sm text-white placeholder:text-[#525b75] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                            />
                                        </div>
                                        <InputError message={errors.line2} />
                                    </div>
                                </div>
                            </div>

                            {/* Resumo e Segurança */}
                            <div className="rounded-xl border border-[#c9a227]/15 bg-[#07091a]/80 p-4.5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-2.5">
                                        <Lock className="mt-0.5 size-4 text-[#c9a227]" />
                                        <div className="text-xs">
                                            <span className="font-bold text-white">
                                                Validação em tempo real integrada ao Stripe
                                            </span>
                                            <p className="mt-0.5 text-[#7a84a0]">
                                                Os endereços são criptografados e formatados conforme os padrões postais internacionais de {selectedCountryInfo?.label || 'seu país'}.
                                            </p>
                                        </div>
                                    </div>

                                    {recentlySuccessful && (
                                        <div className="flex items-center gap-1.5 font-mono text-xs text-[#22c55e] font-bold">
                                            <Check className="size-4" />
                                            <span>Salvo com sucesso!</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between border-t border-[#c9a227]/20">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0] hover:text-white"
                                >
                                    ← Voltar
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-12 border border-[#c9a227] bg-gradient-to-r from-[#c9a227] via-[#d4af37] to-[#a87d15] px-8 font-rajdhani text-sm font-bold uppercase tracking-widest text-[#07091a] shadow-[0_0_25px_rgba(201,162,39,0.35)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <Spinner className="size-4" />
                                            Salvando dados...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Salvar e Continuar
                                            <ArrowRight className="size-4" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}