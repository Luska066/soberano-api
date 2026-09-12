import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Bot,
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    Crosshair,
    Crown,
    ExternalLink,
    HelpCircle,
    Lock,
    LogOut,
    RefreshCw,
    Shield,
    ShieldCheck,
    Sparkles,
    Star,
    Zap,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';

export interface PriceItem {
    uuid: string;
    id_stripe: string;
    currency: string;
    interval: string;
    unit_amount: number;
    active?: boolean;
    trial_period_days?: number | null;
}

export interface BenefitItem {
    id?: number;
    product_id: string;
    name: string;
    description?: string | null;
}

export interface ProductItem {
    uuid: string;
    id_stripe?: string | null;
    name: string;
    description?: string | null;
    image?: string | null;
    prices?: PriceItem[];
    benefits?: BenefitItem[];
}

interface PageProps {
    products: ProductItem[];
    user: {
        name: string;
        email: string;
    };
}

export default function ChoosePlanPage({ products = [], user }: PageProps) {
    const { errors, flash } = usePage<{
        errors: Record<string, string>;
        flash?: { success?: string; error?: string };
    }>().props;

    const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
    const [selectedPriceId, setSelectedPriceId] = useState<string>('');
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

    const checkoutForm = useForm({
        price_id: '',
    });

    const formatMoney = (amount: number, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    const handleCheckout = (priceId: string) => {
        setLoadingPriceId(priceId);
        checkoutForm.setData('price_id', priceId);
        checkoutForm.post('/choose-plan/checkout', {
            preserveScroll: true,
            onError: () => {
                setLoadingPriceId(null);
            },
        });
    };

    // Padrão de benefícios para fallback caso o produto não tenha benefícios cadastrados
    const defaultBenefits: Record<string, string[]> = {
        default: [
            'Acesso completo a todos os modelos neurais (CS2, Valorant, Apex)',
            'Calibração de latência sub-milissegundo (< 0.30ms)',
            'Loader seguro com injeção em nível de Kernel (Bypass HWID)',
            'Atualizações diárias de segurança e novas features',
            'Suporte prioritário 24/7 via Discord VIP',
            'Chave de ativação imediata após confirmação do pagamento',
        ],
    };

    return (
        <div className="relative min-h-screen bg-[#07091a] text-[#e4e6f0] selection:bg-[#c9a227] selection:text-black">
            <Head title="Escolha seu Plano — Soberano AI" />

            {/* Background cyber grid pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                    backgroundImage: `linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Glowing background orbs */}
            <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 h-[350px] w-[600px] bg-[#c9a227]/10 blur-[130px] rounded-full" />
            <div className="pointer-events-none absolute bottom-20 left-10 h-[300px] w-[300px] bg-[#4da6d6]/10 blur-[120px] rounded-full" />

            {/* Top Navigation Bar */}
            <header className="relative z-20 border-b border-[#c9a227]/15 bg-[#07091a]/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <AppLogo />
                        <span className="hidden sm:inline-block h-4 w-px bg-white/15" />
                        <span className="hidden sm:inline-block font-rajdhani text-xs font-bold uppercase tracking-widest text-[#7a84a0]">
                            Ativação de Conta
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col text-right text-xs">
                            <span className="font-medium text-white">{user?.name}</span>
                            <span className="font-mono text-[11px] text-[#7a84a0]">{user?.email}</span>
                        </div>

                        <a
                            href={logout()}
                            onClick={(e) => {
                                e.preventDefault();
                                router.post(logout());
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0] transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                        >
                            <LogOut className="size-3.5" />
                            <span>Sair</span>
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16 space-y-12">
                {/* Header Title Section */}
                <div className="mx-auto max-w-3xl text-center space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 px-4 py-1.5 font-rajdhani text-xs font-bold uppercase tracking-widest text-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.15)]">
                        <Sparkles className="size-3.5" />
                        <span>Passo Final: Selecione seu Plano Soberano</span>
                    </div>

                    <h1 className="font-rajdhani text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
                        Desbloqueie o Poder da{' '}
                        <span className="bg-gradient-to-r from-[#c9a227] via-[#f7d070] to-[#c9a227] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(201,162,39,0.4)]">
                            Inteligência Neural
                        </span>
                    </h1>

                    <p className="font-sans text-sm sm:text-base text-[#7a84a0] leading-relaxed">
                        Tenha acesso imediato ao loader oficial, modelos autônomos treinados para jogos competitivos,
                        injeção indetectável e suporte VIP.
                    </p>

                    {/* Billing Toggle (Mensal / Anual) */}
                    <div className="pt-4 flex items-center justify-center">
                        <div className="flex items-center rounded-xl border border-[#c9a227]/25 bg-[#0d1228]/90 p-1 backdrop-blur-md shadow-lg">
                            <button
                                type="button"
                                onClick={() => setBillingCycle('month')}
                                className={`rounded-lg px-5 py-2 font-rajdhani text-xs font-bold uppercase tracking-wider transition-all ${
                                    billingCycle === 'month'
                                        ? 'border border-[#c9a227]/50 bg-[#c9a227] text-[#07091a] shadow-[0_0_12px_rgba(201,162,39,0.3)]'
                                        : 'text-[#7a84a0] hover:text-white'
                                }`}
                            >
                                Mensal
                            </button>
                            <button
                                type="button"
                                onClick={() => setBillingCycle('year')}
                                className={`relative rounded-lg px-5 py-2 font-rajdhani text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                    billingCycle === 'year'
                                        ? 'border border-[#c9a227]/50 bg-[#c9a227] text-[#07091a] shadow-[0_0_12px_rgba(201,162,39,0.3)]'
                                        : 'text-[#7a84a0] hover:text-white'
                                }`}
                            >
                                <span>Anual</span>
                                <span className="rounded bg-[#22c55e] px-1.5 py-0.5 text-[9px] font-mono font-bold text-black uppercase">
                                    -20% OFF
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feedback Alerts */}
                {errors?.general && (
                    <div className="mx-auto max-w-2xl rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-400 flex items-start gap-3">
                        <AlertCircle className="size-5 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold font-rajdhani text-sm uppercase">Falha ao iniciar pagamento</div>
                            <p className="mt-0.5">{errors.general}</p>
                        </div>
                    </div>
                )}

                {/* Products & Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {products.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-[#c9a227]/25 bg-[#0d1228]/80 p-12 text-center backdrop-blur-md">
                            <Bot className="mx-auto size-12 text-[#c9a227]" />
                            <h3 className="mt-4 font-rajdhani text-2xl font-bold uppercase tracking-wider text-white">
                                Nenhum plano disponível no momento
                            </h3>
                            <p className="mt-2 text-xs text-[#7a84a0]">
                                Os planos estão sendo sincronizados com o Stripe. Por favor, tente novamente em alguns instantes.
                            </p>
                        </div>
                    ) : (
                        products.map((product, idx) => {
                            const isFeatured = idx === 0 || products.length === 1;

                            // Filtra apenas preços ativos
                            const activePrices = product.prices?.filter((p) => p.active !== false) || [];
                            
                            // Verifica se o produto tem preço específico para o ciclo selecionado
                            const hasYearly = activePrices.some((p) => p.interval === 'year');
                            const hasMonthly = activePrices.some((p) => p.interval === 'month');

                            // Preço casado para o ciclo atual
                            const matchedPrice =
                                activePrices.find((p) => p.interval === billingCycle) ||
                                activePrices.find((p) => p.interval === 'month') ||
                                activePrices[0] ||
                                null;

                            const priceAmount = matchedPrice ? matchedPrice.unit_amount / 100 : 0;
                            const priceCurrency = matchedPrice?.currency || 'BRL';
                            const priceInterval = matchedPrice?.interval || 'month';
                            const priceId = matchedPrice?.id_stripe || '';

                            // Se o usuário selecionou Anual mas esse produto só tem Mensal
                            const isOnlyMonthly = billingCycle === 'year' && !hasYearly && hasMonthly;

                            const benefitsList =
                                product.benefits && product.benefits.length > 0
                                    ? product.benefits.map((b) => b.name)
                                    : defaultBenefits.default;

                            const isLoadingThis = loadingPriceId === priceId;

                            return (
                                <div
                                    key={product.uuid}
                                    className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
                                        isFeatured
                                            ? 'border-[#c9a227] bg-gradient-to-b from-[#111d40]/90 via-[#0d1228]/95 to-[#07091a]/95 shadow-[0_0_30px_rgba(201,162,39,0.2)] md:-translate-y-2'
                                            : 'border-[#c9a227]/20 bg-[#0d1228]/80 hover:border-[#c9a227]/40 shadow-xl'
                                    }`}
                                >
                                    {/* Featured Ribbon */}
                                    {isFeatured && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227] bg-[#c9a227] px-4 py-1 font-rajdhani text-[11px] font-extrabold uppercase tracking-widest text-[#07091a] shadow-[0_0_15px_rgba(201,162,39,0.4)]">
                                                <Crown className="size-3.5 fill-current" /> MAIS ESCOLHIDO
                                            </span>
                                        </div>
                                    )}

                                    {/* Card Header */}
                                    <div className="p-6 sm:p-8 space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-rajdhani text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
                                                    {product.name}
                                                </h3>
                                                <div className="flex size-10 items-center justify-center rounded-xl border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                                    <Zap className="size-5" />
                                                </div>
                                            </div>
                                            <p className="font-sans text-xs text-[#7a84a0] min-h-[32px]">
                                                {product.description || 'Acesso premium ilimitado a todos os modelos competitivos.'}
                                            </p>
                                        </div>

                                        {/* Price Box */}
                                        <div className="rounded-xl border border-[#c9a227]/15 bg-[#07091a]/70 p-4 space-y-2">
                                            {/* Interval Selector Tabs if product has both monthly and yearly */}
                                            {hasMonthly && hasYearly && (
                                                <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                                                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#7a84a0]">
                                                        Ciclo:
                                                    </span>
                                                    <div className="inline-flex rounded-md bg-white/5 p-0.5">
                                                        <span
                                                            className={`rounded px-2 py-0.5 font-rajdhani text-[10px] font-bold uppercase transition ${
                                                                priceInterval === 'month'
                                                                    ? 'bg-[#c9a227] text-[#07091a]'
                                                                    : 'text-[#7a84a0]'
                                                            }`}
                                                        >
                                                            Mensal
                                                        </span>
                                                        <span
                                                            className={`rounded px-2 py-0.5 font-rajdhani text-[10px] font-bold uppercase transition ${
                                                                priceInterval === 'year'
                                                                    ? 'bg-[#c9a227] text-[#07091a]'
                                                                    : 'text-[#7a84a0]'
                                                            }`}
                                                        >
                                                            Anual
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-baseline gap-1.5">
                                                <span className="font-rajdhani text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                                                    {formatMoney(priceAmount, priceCurrency)}
                                                </span>
                                                <span className="font-mono text-xs text-[#7a84a0] uppercase">
                                                    / {priceInterval === 'year' ? 'ano' : 'mês'}
                                                </span>
                                            </div>

                                            {isOnlyMonthly ? (
                                                <div className="flex items-center gap-1 text-[11px] font-medium text-yellow-400">
                                                    <AlertCircle className="size-3.5 shrink-0" />
                                                    <span>Disponível apenas em ciclo mensal</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#22c55e]">
                                                    <CheckCircle2 className="size-3.5" />
                                                    <span>Cobrança segura e cancelamento a qualquer momento</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Features List */}
                                        <div className="space-y-3 pt-2">
                                            <div className="font-rajdhani text-xs font-bold uppercase tracking-widest text-[#c9a227]">
                                                O que está incluso:
                                            </div>
                                            <ul className="space-y-2.5">
                                                {benefitsList.map((benefit, bIdx) => (
                                                    <li key={bIdx} className="flex items-start gap-2.5 text-xs text-[#e4e6f0]">
                                                        <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#c9a227]/20 text-[#c9a227]">
                                                            <Check className="size-2.5 stroke-[3]" />
                                                        </div>
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="p-6 sm:p-8 pt-0">
                                        <Button
                                            type="button"
                                            disabled={!priceId || isLoadingThis || checkoutForm.processing}
                                            onClick={() => handleCheckout(priceId)}
                                            className={`w-full py-6 font-rajdhani text-sm sm:text-base font-bold uppercase tracking-wider transition-all shadow-xl ${
                                                isFeatured
                                                    ? 'border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] text-[#07091a] hover:brightness-110 shadow-[0_0_20px_rgba(201,162,39,0.3)]'
                                                    : 'border border-[#c9a227]/40 bg-[#c9a227]/15 text-[#c9a227] hover:bg-[#c9a227] hover:text-[#07091a]'
                                            }`}
                                        >
                                            {isLoadingThis ? (
                                                <span className="flex items-center gap-2">
                                                    <RefreshCw className="size-4 animate-spin" />
                                                    Abrindo Pagamento Seguro...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Lock className="size-4" />
                                                    Assinar Agora e Liberar Acesso
                                                </span>
                                            )}
                                        </Button>

                                        <p className="mt-2 text-center text-[10px] text-[#7a84a0]">
                                            Ambiente 100% Criptografado via Stripe
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Security and Trust Badges */}
                <div className="rounded-2xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 sm:p-8 backdrop-blur-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-start gap-3.5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                    Stripe Checkout
                                </h4>
                                <p className="font-sans text-xs text-[#7a84a0]">
                                    Criptografia bancária SSL de 256 bits com o gateway líder global.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                <Zap className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                    Ativação Imediata
                                </h4>
                                <p className="font-sans text-xs text-[#7a84a0]">
                                    Seu loader e chave de licença HWID são liberados no mesmo segundo.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#4da6d6]/30 bg-[#4da6d6]/10 text-[#4da6d6]">
                                <Bot className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                    Modelos de Elite
                                </h4>
                                <p className="font-sans text-xs text-[#7a84a0]">
                                    Redes neurais calibradas para precisão cirúrgica e zero atraso.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#8b5cf6]">
                                <Shield className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                    Zero Fidelidade
                                </h4>
                                <p className="font-sans text-xs text-[#7a84a0]">
                                    Cancele ou pause quando desejar diretamente pelo portal do cliente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mx-auto max-w-3xl space-y-6 pt-4">
                    <div className="text-center space-y-2">
                        <h2 className="font-rajdhani text-2xl font-bold uppercase tracking-wider text-white">
                            Perguntas Frequentes
                        </h2>
                        <p className="font-sans text-xs text-[#7a84a0]">
                            Tudo o que você precisa saber sobre a assinatura do Soberano AI
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-xl border border-[#c9a227]/15 bg-[#0d1228]/60 p-5 space-y-2">
                            <h4 className="font-rajdhani text-sm font-bold uppercase text-white">
                                Como funciona o pagamento e quando recebo minha chave?
                            </h4>
                            <p className="text-xs text-[#7a84a0] leading-relaxed">
                                Assim que o pagamento for confirmado no Stripe (seja por Cartão de Crédito ou outro método aceito), seu usuário é ativado imediatamente e sua Chave de Licença é gerada no seu painel.
                            </p>
                        </div>

                        <div className="rounded-xl border border-[#c9a227]/15 bg-[#0d1228]/60 p-5 space-y-2">
                            <h4 className="font-rajdhani text-sm font-bold uppercase text-white">
                                Posso cancelar a qualquer momento?
                            </h4>
                            <p className="text-xs text-[#7a84a0] leading-relaxed">
                                Sim! Sem contratos de fidelidade ou taxas ocultas. Você pode cancelar pelo próprio portal a qualquer instante e seu acesso permanece ativo até o fim do período já pago.
                            </p>
                        </div>

                        <div className="rounded-xl border border-[#c9a227]/15 bg-[#0d1228]/60 p-5 space-y-2">
                            <h4 className="font-rajdhani text-sm font-bold uppercase text-white">
                                Em quantos computadores posso usar?
                            </h4>
                            <p className="text-xs text-[#7a84a0] leading-relaxed">
                                Sua chave é vinculada ao seu Hardware (HWID). Você pode utilizar nos computadores autorizados na sua conta de acordo com os limites do seu plano.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
