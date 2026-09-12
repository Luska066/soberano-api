import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    ExternalLink,
    FileText,
    HelpCircle,
    Info,
    PauseCircle,
    PlayCircle,
    Receipt,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';

export interface PriceItem {
    uuid: string;
    id_stripe: string;
    currency: string;
    interval: string;
    unit_amount: number;
    active?: boolean;
    trial_period_days?: number | null;
}

export interface ProductItem {
    uuid: string;
    id_stripe?: string | null;
    name: string;
    description?: string | null;
    prices?: PriceItem[];
}

export interface InvoiceLine {
    id: string;
    description: string;
    amount: number;
    currency: string;
    quantity: number;
    period_start?: string | null;
    period_end?: string | null;
    proration?: boolean;
}

export interface InvoiceItem {
    id: string;
    number: string;
    status: string;
    currency: string;
    total: string;
    raw_total: number;
    subtotal: string;
    raw_subtotal: number;
    tax?: string | null;
    amount_due: number;
    amount_paid: number;
    amount_remaining: number;
    date: string;
    raw_date: string;
    period_start?: string | null;
    period_end?: string | null;
    hosted_invoice_url?: string | null;
    invoice_pdf?: string | null;
    subscription_id?: string | null;
    is_paid: boolean;
    lines?: InvoiceLine[];
}

export interface SubscriptionItem {
    id: string;
    status: string;
    cancel_at_period_end: boolean;
    canceled_at?: string | null;
    current_period_start?: string | null;
    current_period_end?: string | null;
    trial_start?: string | null;
    trial_end?: string | null;
    created_at: string;
    quantity: number;
    plan_name: string;
    product_id?: string | null;
    price_id?: string | null;
    unit_amount: number;
    currency: string;
    interval: string;
    interval_count: number;
    latest_invoice_id?: string | null;
}

export interface CustomerData {
    uuid?: string;
    phone?: string;
    country_code?: string;
    country?: string;
    city?: string;
    state?: string;
}

export interface StripeCustomerInfo {
    id: string;
    balance: number;
    currency: string;
    delinquent: boolean;
    email?: string;
    name?: string;
    phone?: string;
    created?: string;
}

export interface UpcomingInvoiceInfo {
    id: string;
    status: string;
    currency: string;
    total: string;
    raw_total: number;
    subtotal: string;
    date: string;
    next_payment_attempt?: string | null;
    lines_count: number;
}

interface PageProps {
    customer: CustomerData;
    stripeCustomer: StripeCustomerInfo | null;
    subscriptions: SubscriptionItem[];
    invoices: InvoiceItem[];
    latestInvoice: InvoiceItem | null;
    upcomingInvoice: UpcomingInvoiceInfo | null;
    availableProducts: ProductItem[];
}

const breadcrumbs = [
    {
        title: 'Painel',
        href: '/dashboard',
    },
    {
        title: 'Minha Assinatura',
        href: '/subscription',
    },
];

export default function CustomerSubscriptionPage({
    customer,
    stripeCustomer,
    subscriptions = [],
    invoices = [],
    latestInvoice,
    upcomingInvoice,
    availableProducts = [],
}: PageProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
    const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'open'>('all');

    // Assinatura ativa primária
    const activeSub = subscriptions.find(
        (s) => s.status === 'active' || s.status === 'trialing' || s.status === 'past_due',
    ) || subscriptions[0] || null;

    // Form para trocar plano
    const swapForm = useForm({
        subscription_id: activeSub?.id || '',
        price_id: '',
    });

    // Form para cancelar assinatura
    const cancelForm = useForm({
        subscription_id: activeSub?.id || '',
    });

    // Form para retomar assinatura
    const resumeForm = useForm({
        subscription_id: activeSub?.id || '',
    });

    const formatMoney = (amount: number, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    const handleOpenSwap = (sub: SubscriptionItem) => {
        swapForm.setData({
            subscription_id: sub.id,
            price_id: sub.price_id || '',
        });
        setIsSwapModalOpen(true);
    };

    const handleOpenCancel = (sub: SubscriptionItem) => {
        cancelForm.setData({
            subscription_id: sub.id,
        });
        setIsCancelModalOpen(true);
    };

    const handleSwapSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        swapForm.post('/subscription/swap', {
            preserveScroll: true,
            onSuccess: () => {
                setIsSwapModalOpen(false);
            },
        });
    };

    const handleCancelSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        cancelForm.post('/subscription/cancel', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCancelModalOpen(false);
            },
        });
    };

    const handleResume = (subId: string) => {
        resumeForm.setData('subscription_id', subId);
        resumeForm.post('/subscription/resume', {
            preserveScroll: true,
        });
    };

    const filteredInvoices = invoices.filter((inv) => {
        if (invoiceFilter === 'paid') return inv.is_paid || inv.status === 'paid';
        if (invoiceFilter === 'open') return !inv.is_paid && inv.status !== 'paid';
        return true;
    });

    return (
        <>
            <Head title="Minha Assinatura & Faturas — Soberano AI" />

            <div className="relative min-h-screen bg-[#07091a] p-4 md:p-8 text-[#e4e6f0]">
                {/* Background Grid Pattern */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                        backgroundImage: `linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                    {/* Header Banner */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-[#c9a227]/25 bg-gradient-to-r from-[#0d1228] via-[#111d40] to-[#07091a] p-6 shadow-xl backdrop-blur-md">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="flex size-9 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]">
                                    <Receipt className="size-5" />
                                </div>
                                <h1 className="font-rajdhani text-2xl md:text-3xl font-bold uppercase tracking-wider text-white">
                                    Minha <span className="text-[#c9a227]">Assinatura</span> & Faturas
                                </h1>
                            </div>
                            <p className="font-sans text-xs md:text-sm text-[#7a84a0]">
                                Controle sua licença, status de cobrança, histórico de pagamentos e faturas fiscais.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {activeSub ? (
                                <Badge
                                    className={`px-3 py-1 font-mono text-xs uppercase tracking-wider ${activeSub.cancel_at_period_end
                                            ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                                            : activeSub.status === 'active'
                                                ? 'border-green-500/40 bg-green-500/10 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
                                                : 'border-orange-500/40 bg-orange-500/10 text-orange-400'
                                        }`}
                                >
                                    <span className="mr-1.5 size-2 rounded-full bg-current animate-pulse inline-block" />
                                    {activeSub.cancel_at_period_end
                                        ? 'Cancelamento Agendado'
                                        : activeSub.status === 'active'
                                            ? 'Assinatura Ativa'
                                            : activeSub.status}
                                </Badge>
                            ) : (
                                <Badge className="border-red-500/40 bg-red-500/10 text-red-400 px-3 py-1 font-mono text-xs uppercase">
                                    Sem Assinatura Ativa
                                </Badge>
                            )}

                            <Button
                                variant="outline"
                                onClick={() => router.reload({ only: ['subscriptions', 'invoices', 'upcomingInvoice'] })}
                                className="border-[#c9a227]/30 bg-white/5 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227] hover:bg-[#c9a227]/15"
                            >
                                <RefreshCw className="mr-1.5 size-3.5" /> Sincronizar
                            </Button>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {flash?.success && (
                        <div className="flex items-center gap-3 rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-xs font-medium text-green-400">
                            <CheckCircle2 className="size-4 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-xs font-medium text-red-400">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                    )}

                    {/* Top Stat Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Plano Atual */}
                        <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/90 p-5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                    Plano Atual
                                </span>
                                <Sparkles className="size-4 text-[#c9a227]" />
                            </div>
                            <div className="mt-3 font-rajdhani text-2xl font-bold text-white truncate">
                                {activeSub ? activeSub.plan_name : 'Nenhum'}
                            </div>
                            <div className="mt-1 font-sans text-xs text-[#7a84a0]">
                                {activeSub ? `${formatMoney(activeSub.unit_amount, activeSub.currency)} / ${activeSub.interval === 'year' ? 'ano' : 'mês'}` : 'Adquira um plano'}
                            </div>
                        </div>

                        {/* Status de Renovação */}
                        <div className="rounded-xl border border-[#4da6d6]/20 bg-[#0d1228]/90 p-5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                    {activeSub?.cancel_at_period_end ? 'Expira em' : 'Próxima Renovação'}
                                </span>
                                <Calendar className="size-4 text-[#4da6d6]" />
                            </div>
                            <div className="mt-3 font-rajdhani text-2xl font-bold text-[#4da6d6]">
                                {activeSub?.current_period_end || '—'}
                            </div>
                            <div className="mt-1 font-sans text-xs text-[#7a84a0]">
                                {activeSub?.cancel_at_period_end ? 'Acesso até o término do ciclo' : 'Cobrança automática'}
                            </div>
                        </div>

                        {/* Próxima Fatura Prevista */}
                        <div className="rounded-xl border border-green-500/20 bg-[#0d1228]/90 p-5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                    Próxima Cobrança
                                </span>
                                <DollarSign className="size-4 text-green-400" />
                            </div>
                            <div className="mt-3 font-rajdhani text-2xl font-bold text-green-400">
                                {upcomingInvoice ? upcomingInvoice.total : (activeSub ? formatMoney(activeSub.unit_amount, activeSub.currency) : 'R$ 0,00')}
                            </div>
                            <div className="mt-1 font-sans text-xs text-[#7a84a0]">
                                {upcomingInvoice?.next_payment_attempt ? `Tentativa: ${upcomingInvoice.next_payment_attempt}` : 'Estimativa de valor'}
                            </div>
                        </div>

                        {/* Total de Faturas */}
                        <div className="rounded-xl border border-[#8b5cf6]/20 bg-[#0d1228]/90 p-5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                    Faturas Emitidas
                                </span>
                                <FileText className="size-4 text-[#8b5cf6]" />
                            </div>
                            <div className="mt-3 font-rajdhani text-2xl font-bold text-[#8b5cf6]">
                                {invoices.length}
                            </div>
                            <div className="mt-1 font-sans text-xs text-[#7a84a0]">
                                {invoices.filter((i) => i.is_paid).length} faturas pagas
                            </div>
                        </div>
                    </div>

                    {/* Active Subscription Management Card */}
                    {activeSub ? (
                        <div className="rounded-xl border border-[#c9a227]/30 bg-[#0d1228]/95 p-6 shadow-xl backdrop-blur-md space-y-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[#c9a227]/15 pb-6">
                                <div>
                                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#c9a227]">
                                        Detalhes da Assinatura
                                    </span>
                                    <h2 className="font-rajdhani text-3xl font-bold tracking-wide text-white mt-1">
                                        {activeSub.plan_name}
                                    </h2>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#7a84a0]">
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-3.5 text-[#c9a227]" />
                                            Criada em {activeSub.created_at}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 font-mono">
                                            ID: {activeSub.id}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {activeSub.cancel_at_period_end ? (
                                        <Button
                                            onClick={() => handleResume(activeSub.id)}
                                            disabled={resumeForm.processing}
                                            className="border border-green-500 bg-green-500 font-rajdhani font-bold uppercase tracking-wider text-black hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                        >
                                            <PlayCircle className="mr-2 size-4" />
                                            {resumeForm.processing ? 'Retomando...' : 'Retomar Assinatura'}
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={() => handleOpenSwap(activeSub)}
                                                className="border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] font-rajdhani font-bold uppercase tracking-wider text-[#07091a] hover:brightness-110 shadow-[0_0_15px_rgba(201,162,39,0.2)]"
                                            >
                                                <Sparkles className="mr-1.5 size-4" /> Trocar de Plano
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleOpenCancel(activeSub)}
                                                className="border-red-500/40 bg-red-500/5 font-rajdhani text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/15"
                                            >
                                                <PauseCircle className="mr-1.5 size-4" /> Cancelar
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Warning Banner if cancel_at_period_end */}
                            {activeSub.cancel_at_period_end && (
                                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-xs text-yellow-400 flex items-start gap-3">
                                    <AlertCircle className="size-5 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold font-rajdhani text-sm uppercase tracking-wide">
                                            Cancelamento agendado para o final do período
                                        </div>
                                        <p className="mt-0.5 text-yellow-300/80">
                                            Sua assinatura permanecerá disponível até{' '}
                                            <strong className="text-white">{activeSub.current_period_end}</strong>. Após
                                            essa data, seus modelos e acessos serão suspensos automaticamente. Você pode
                                            retomá-la a qualquer momento antes do término.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-4">
                                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                        Valor Recorrente
                                    </span>
                                    <div className="mt-1 font-rajdhani text-2xl font-bold text-[#c9a227]">
                                        {formatMoney(activeSub.unit_amount, activeSub.currency)}
                                    </div>
                                    <span className="font-sans text-xs text-[#7a84a0]">
                                        Cobrança a cada {activeSub.interval_count > 1 ? `${activeSub.interval_count} ` : ''}
                                        {activeSub.interval === 'year' ? 'ano(s)' : 'mês(es)'}
                                    </span>
                                </div>

                                <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-4">
                                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                        Ciclo de Faturamento
                                    </span>
                                    <div className="mt-1 font-sans text-sm text-white font-medium">
                                        {activeSub.current_period_start || '—'} até {activeSub.current_period_end || '—'}
                                    </div>
                                    <span className="font-sans text-xs text-[#7a84a0]">
                                        Período atual contratado
                                    </span>
                                </div>

                                <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-4">
                                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                        Status Operacional
                                    </span>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-green-400 shadow-[0_0_6px_#22c55e]" />
                                        <span className="font-rajdhani font-bold text-white uppercase text-base">
                                            {activeSub.status === 'active' ? 'Ativo & Licenciado' : activeSub.status}
                                        </span>
                                    </div>
                                    <span className="font-sans text-xs text-[#7a84a0]">
                                        Acesso total aos modelos Soberano AI
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-[#c9a227]/30 bg-[#0d1228]/95 p-8 text-center backdrop-blur-md">
                            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                <Sparkles className="size-7" />
                            </div>
                            <h3 className="mt-4 font-rajdhani text-2xl font-bold uppercase tracking-wider text-white">
                                Você ainda não possui uma assinatura ativa
                            </h3>
                            <p className="mt-2 mx-auto max-w-md text-xs text-[#7a84a0]">
                                Escolha um dos nossos planos neurais avançados para liberar o loader, calibradores e modelos para todos os jogos suportados.
                            </p>
                            <Button
                                onClick={() => setIsSwapModalOpen(true)}
                                className="mt-6 border border-[#c9a227] bg-[#c9a227] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] hover:bg-[#a87d15]"
                            >
                                <Sparkles className="mr-1.5 size-4" /> Contratar um Plano
                            </Button>
                        </div>
                    )}

                    {/* Invoices Section */}
                    <div className="rounded-xl border border-[#c9a227]/25 bg-[#0d1228]/95 p-6 shadow-xl backdrop-blur-md space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#c9a227]/15 pb-4">
                            <div>
                                <h3 className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Histórico de <span className="text-[#c9a227]">Faturas & Cobranças</span>
                                </h3>
                                <p className="font-sans text-xs text-[#7a84a0]">
                                    Acesse suas faturas, comprovantes de pagamento e recibos fiscais.
                                </p>
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex items-center gap-1.5 rounded-lg border border-[#c9a227]/20 bg-[#07091a] p-1 font-rajdhani text-xs font-bold uppercase">
                                <button
                                    onClick={() => setInvoiceFilter('all')}
                                    className={`rounded px-3 py-1 transition ${invoiceFilter === 'all'
                                            ? 'bg-[#c9a227] text-[#07091a]'
                                            : 'text-[#7a84a0] hover:text-white'
                                        }`}
                                >
                                    Todas ({invoices.length})
                                </button>
                                <button
                                    onClick={() => setInvoiceFilter('paid')}
                                    className={`rounded px-3 py-1 transition ${invoiceFilter === 'paid'
                                            ? 'bg-[#c9a227] text-[#07091a]'
                                            : 'text-[#7a84a0] hover:text-white'
                                        }`}
                                >
                                    Pagas ({invoices.filter((i) => i.is_paid).length})
                                </button>
                                <button
                                    onClick={() => setInvoiceFilter('open')}
                                    className={`rounded px-3 py-1 transition ${invoiceFilter === 'open'
                                            ? 'bg-[#c9a227] text-[#07091a]'
                                            : 'text-[#7a84a0] hover:text-white'
                                        }`}
                                >
                                    Abertas ({invoices.filter((i) => !i.is_paid && i.status !== 'paid').length})
                                </button>
                            </div>
                        </div>

                        {/* Invoices Table */}
                        <div className="overflow-x-auto rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-[#c9a227]/20 bg-[#07091a] font-rajdhani text-xs uppercase tracking-wider text-[#7a84a0]">
                                    <tr>
                                        <th className="px-5 py-3.5">Fatura</th>
                                        <th className="px-5 py-3.5">Data de Emissão</th>
                                        <th className="px-5 py-3.5">Valor Total</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#c9a227]/10">
                                    {filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-xs text-[#7a84a0]">
                                                Nenhuma fatura encontrada com o filtro selecionado.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInvoices.map((inv) => (
                                            <tr
                                                key={inv.id}
                                                className="transition-colors hover:bg-white/[0.02]"
                                            >
                                                {/* Fatura ID / Number */}
                                                <td className="px-5 py-4 font-mono text-xs">
                                                    <div className="font-bold text-white flex items-center gap-1.5">
                                                        <FileText className="size-3.5 text-[#c9a227]" />
                                                        <span>{inv.number}</span>
                                                    </div>
                                                    <span className="text-[10px] text-[#7a84a0]">{inv.id}</span>
                                                </td>

                                                {/* Data */}
                                                <td className="px-5 py-4 text-xs text-[#e4e6f0]">
                                                    <div>{inv.date}</div>
                                                    {inv.period_start && inv.period_end && (
                                                        <div className="text-[10px] text-[#7a84a0]">
                                                            Ref: {inv.period_start} - {inv.period_end}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Valor */}
                                                <td className="px-5 py-4 font-mono text-xs font-bold text-[#c9a227]">
                                                    {inv.total}
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    {inv.is_paid || inv.status === 'paid' ? (
                                                        <Badge className="border-green-500/30 bg-green-500/10 text-green-400 font-mono text-[10px]">
                                                            <Check className="mr-1 size-3" /> PAGA
                                                        </Badge>
                                                    ) : inv.status === 'open' ? (
                                                        <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-mono text-[10px]">
                                                            ABERTA
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="border-red-500/30 bg-red-500/10 text-red-400 font-mono text-[10px] uppercase">
                                                            {inv.status}
                                                        </Badge>
                                                    )}
                                                </td>

                                                {/* Ações */}
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setSelectedInvoice(inv)}
                                                            className="font-rajdhani text-xs uppercase tracking-wider text-[#7a84a0] hover:text-white"
                                                        >
                                                            Detalhes
                                                        </Button>

                                                        {inv.invoice_pdf || inv.hosted_invoice_url ? (
                                                            <a
                                                                href={inv.invoice_pdf || inv.hosted_invoice_url || '#'}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center justify-center rounded-md border border-[#c9a227]/30 bg-[#c9a227]/10 px-2.5 py-1 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227] transition hover:bg-[#c9a227]/25"
                                                                title="Baixar Comprovante / PDF"
                                                            >
                                                                <Download className="mr-1 size-3" /> PDF
                                                            </a>
                                                        ) : (
                                                            <a
                                                                href={`/subscription/invoices/${inv.id}/download`}
                                                                className="inline-flex items-center justify-center rounded-md border border-[#c9a227]/30 bg-[#c9a227]/10 px-2.5 py-1 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227] transition hover:bg-[#c9a227]/25"
                                                            >
                                                                <Download className="mr-1 size-3" /> Baixar
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FAQ / Billing Help */}
                    <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-4">
                            <HelpCircle className="size-5 text-[#c9a227]" />
                            <h3 className="font-rajdhani text-lg font-bold uppercase tracking-wider text-white">
                                Dúvidas Frequentes sobre Assinatura
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="rounded-lg border border-[#c9a227]/10 bg-[#07091a]/60 p-4 space-y-1">
                                <h4 className="font-rajdhani font-bold text-sm text-white uppercase">
                                    Como funciona a troca de plano?
                                </h4>
                                <p className="text-[#7a84a0]">
                                    Ao alterar de plano, a diferença de valor é recalculada proporcionalmente (proration) pelo Stripe e aplicada imediatamente.
                                </p>
                            </div>

                            <div className="rounded-lg border border-[#c9a227]/10 bg-[#07091a]/60 p-4 space-y-1">
                                <h4 className="font-rajdhani font-bold text-sm text-white uppercase">
                                    O que acontece ao cancelar?
                                </h4>
                                <p className="text-[#7a84a0]">
                                    Seu acesso aos modelos e atualizações continuará ativo até o final do período já pago. Nenhuma nova cobrança será realizada.
                                </p>
                            </div>

                            <div className="rounded-lg border border-[#c9a227]/10 bg-[#07091a]/60 p-4 space-y-1">
                                <h4 className="font-rajdhani font-bold text-sm text-white uppercase">
                                    Como baixar meus comprovantes?
                                </h4>
                                <p className="text-[#7a84a0]">
                                    Você pode clicar no botão "PDF" em qualquer fatura para baixar o recibo oficial autenticado diretamente do gateway seguro.
                                </p>
                            </div>

                            <div className="rounded-lg border border-[#c9a227]/10 bg-[#07091a]/60 p-4 space-y-1">
                                <h4 className="font-rajdhani font-bold text-sm text-white uppercase">
                                    Precisa de suporte financeiro?
                                </h4>
                                <p className="text-[#7a84a0]">
                                    Abra um chamado com nosso time de atendimento para suporte a reembolsos, alterações de CNPJ/CPF ou dúvidas fiscais.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SWAP PLAN MODAL */}
            <Dialog open={isSwapModalOpen} onOpenChange={setIsSwapModalOpen}>
                <DialogContent className="max-w-2xl border border-[#c9a227]/30 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl sm:max-w-2xl">
                    <DialogHeader className="border-b border-[#c9a227]/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]">
                                <Sparkles className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Trocar de <span className="text-[#c9a227]">Plano de Assinatura</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#7a84a0]">
                                    Escolha o novo plano desejado para sua conta
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSwapSubmit} className="space-y-4 pt-2">
                        {swapForm.errors.general && (
                            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
                                {swapForm.errors.general}
                            </div>
                        )}

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                            {availableProducts.length === 0 ? (
                                <p className="text-xs text-[#7a84a0] text-center py-6">
                                    Nenhum outro plano disponível no momento.
                                </p>
                            ) : (
                                availableProducts.map((prod) => (
                                    <div key={prod.uuid} className="space-y-2">
                                        <div className="font-rajdhani text-sm font-bold uppercase tracking-wider text-[#c9a227]">
                                            {prod.name}
                                        </div>
                                        {prod.description && (
                                            <p className="text-[11px] text-[#7a84a0]">{prod.description}</p>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {prod.prices && prod.prices.length > 0 ? (
                                                prod.prices.map((price) => {
                                                    const isCurrent = activeSub?.price_id === price.id_stripe;
                                                    const isSelected = swapForm.data.price_id === price.id_stripe;

                                                    return (
                                                        <label
                                                            key={price.uuid}
                                                            className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition ${isSelected
                                                                    ? 'border-[#c9a227] bg-[#c9a227]/15 text-white shadow-[0_0_12px_rgba(201,162,39,0.2)]'
                                                                    : 'border-[#c9a227]/20 bg-[#07091a]/80 text-[#7a84a0] hover:border-[#c9a227]/40'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <input
                                                                    type="radio"
                                                                    name="swap_price"
                                                                    value={price.id_stripe}
                                                                    checked={isSelected}
                                                                    onChange={() => swapForm.setData('price_id', price.id_stripe)}
                                                                    className="text-[#c9a227] focus:ring-[#c9a227]"
                                                                />
                                                                <div>
                                                                    <div className="font-rajdhani font-bold text-white text-base">
                                                                        {formatMoney(price.unit_amount / 100, price.currency)}
                                                                    </div>
                                                                    <div className="font-mono text-[10px] text-[#7a84a0] uppercase">
                                                                        / {price.interval === 'year' ? 'Ano' : 'Mês'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {isCurrent && (
                                                                <Badge className="border-[#c9a227]/40 bg-[#c9a227]/10 text-[10px] text-[#c9a227]">
                                                                    Plano Atual
                                                                </Badge>
                                                            )}
                                                        </label>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-[11px] text-[#7a84a0]">Sem preços cadastrados.</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsSwapModalOpen(false)}
                                className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                            >
                                Fechar
                            </Button>
                            <Button
                                type="submit"
                                disabled={swapForm.processing || !swapForm.data.price_id || swapForm.data.price_id === activeSub?.price_id}
                                className="border border-[#c9a227] bg-[#c9a227] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] hover:bg-[#a87d15]"
                            >
                                {swapForm.processing ? 'Atualizando...' : 'Confirmar Alteração'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* CANCEL SUBSCRIPTION MODAL */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent className="max-w-md border border-red-500/40 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl">
                    <DialogHeader className="border-b border-red-500/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-400">
                                <AlertCircle className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Cancelar <span className="text-red-400">Assinatura</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#7a84a0]">
                                    Tem certeza que deseja cancelar sua assinatura?
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleCancelSubmit} className="space-y-4 pt-2">
                        {cancelForm.errors.general && (
                            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
                                {cancelForm.errors.general}
                            </div>
                        )}

                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-xs text-[#e4e6f0] space-y-2">
                            <p>
                                Ao cancelar, você manterá acesso total aos modelos até o final do período vigente (
                                <strong className="text-white">{activeSub?.current_period_end}</strong>).
                            </p>
                            <p className="text-[#7a84a0]">
                                Após essa data, seu loader e licença serão desativados e nenhuma nova fatura será gerada.
                            </p>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCancelModalOpen(false)}
                                className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                            >
                                Manter Assinatura
                            </Button>
                            <Button
                                type="submit"
                                disabled={cancelForm.processing}
                                className="border border-red-500 bg-red-500 font-rajdhani text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600"
                            >
                                {cancelForm.processing ? 'Cancelando...' : 'Confirmar Cancelamento'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* INVOICE DETAILS MODAL */}
            {selectedInvoice && (
                <Dialog open={Boolean(selectedInvoice)} onOpenChange={() => setSelectedInvoice(null)}>
                    <DialogContent className="max-w-xl border border-[#c9a227]/30 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl">
                        <DialogHeader className="border-b border-[#c9a227]/20 pb-3 text-left">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]">
                                        <FileText className="size-4" />
                                    </div>
                                    <div>
                                        <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                            Fatura <span className="text-[#c9a227]">{selectedInvoice.number}</span>
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-[#7a84a0]">
                                            Emitida em {selectedInvoice.date}
                                        </DialogDescription>
                                    </div>
                                </div>

                                {selectedInvoice.is_paid || selectedInvoice.status === 'paid' ? (
                                    <Badge className="border-green-500/30 bg-green-500/10 text-green-400 font-mono text-[10px]">
                                        PAGA
                                    </Badge>
                                ) : (
                                    <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-mono text-[10px] uppercase">
                                        {selectedInvoice.status}
                                    </Badge>
                                )}
                            </div>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            {/* Line items */}
                            <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-3 space-y-2">
                                <div className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                    Itens Cobrados
                                </div>
                                <div className="divide-y divide-[#c9a227]/10">
                                    {selectedInvoice.lines && selectedInvoice.lines.length > 0 ? (
                                        selectedInvoice.lines.map((line) => (
                                            <div key={line.id} className="py-2 flex items-center justify-between text-xs">
                                                <div>
                                                    <div className="text-white font-medium">{line.description}</div>
                                                    <div className="text-[10px] text-[#7a84a0]">Qtd: {line.quantity}</div>
                                                </div>
                                                <div className="font-mono text-white font-bold">
                                                    {formatMoney(line.amount, line.currency)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-2 text-xs text-[#7a84a0]">Item de assinatura padrão</div>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-3 space-y-1.5 font-mono text-xs">
                                <div className="flex justify-between text-[#7a84a0]">
                                    <span>Subtotal</span>
                                    <span className="text-white">{selectedInvoice.subtotal}</span>
                                </div>
                                {selectedInvoice.tax && (
                                    <div className="flex justify-between text-[#7a84a0]">
                                        <span>Impostos</span>
                                        <span className="text-white">{selectedInvoice.tax}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-sm text-[#c9a227] border-t border-[#c9a227]/20 pt-1.5">
                                    <span>Total</span>
                                    <span>{selectedInvoice.total}</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedInvoice(null)}
                                className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                            >
                                Fechar
                            </Button>
                            {selectedInvoice.invoice_pdf && (
                                <a
                                    href={selectedInvoice.invoice_pdf}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-md border border-[#c9a227] bg-[#c9a227] px-4 py-2 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] transition hover:bg-[#a87d15]"
                                >
                                    <Download className="mr-1.5 size-3.5" /> Baixar PDF
                                </a>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
