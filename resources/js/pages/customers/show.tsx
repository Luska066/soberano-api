import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    DollarSign,
    Download,
    ExternalLink,
    FileText,
    Globe,
    HelpCircle,
    Info,
    Mail,
    MapPin,
    Package,
    PauseCircle,
    Phone,
    PlayCircle,
    Plus,
    Receipt,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    User,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    uuid: string;
    id_user?: string;
    name?: string;
    email?: string;
    phone?: string;
    country_code?: string;
    country: string;
    country_label?: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    id_stripe?: string | null;
    stripe_id?: string | null;
    created_at?: string;
}

export interface StripeCustomerInfo {
    id: string;
    balance: number;
    currency: string;
    delinquent: boolean;
    email?: string;
    name?: string;
    phone?: string;
    created: string;
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
    stripeCustomer?: StripeCustomerInfo | null;
    subscriptions: SubscriptionItem[];
    invoices: InvoiceItem[];
    latestInvoice?: InvoiceItem | null;
    upcomingInvoice?: UpcomingInvoiceInfo | null;
    availableProducts: ProductItem[];
}

export default function CustomerShow({
    customer,
    stripeCustomer,
    subscriptions = [],
    invoices = [],
    latestInvoice,
    upcomingInvoice,
    availableProducts = [],
}: PageProps) {
    const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'details'>('subscriptions');
    const [copiedStripeId, setCopiedStripeId] = useState(false);
    const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'open' | 'other'>('all');

    // Modais
    const [isCreateSubOpen, setIsCreateSubOpen] = useState(false);
    const [isCancelSubOpen, setIsCancelSubOpen] = useState(false);
    const [subToCancel, setSubToCancel] = useState<SubscriptionItem | null>(null);
    const [cancelImmediately, setCancelImmediately] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
    const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);

    // Form Nova Assinatura
    const createSubForm = useForm({
        price_id: '',
        type: 'default',
        trial_days: '',
    });

    const handleCopyStripeId = () => {
        const id = customer.stripe_id || customer.id_stripe;
        if (id) {
            navigator.clipboard.writeText(id);
            setCopiedStripeId(true);
            setTimeout(() => setCopiedStripeId(false), 2000);
        }
    };

    const handleSyncStripe = () => {
        router.post(`/customers/${customer.uuid}/sync`, {}, {
            preserveScroll: true,
        });
    };

    const handleCreateSubscriptionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createSubForm.post(`/customers/${customer.uuid}/subscriptions`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateSubOpen(false);
                createSubForm.reset();
            },
        });
    };

    const handleOpenCancelModal = (sub: SubscriptionItem) => {
        setSubToCancel(sub);
        setCancelImmediately(false);
        setIsCancelSubOpen(true);
    };

    const handleConfirmCancel = () => {
        if (!subToCancel) return;
        router.post(
            `/customers/${customer.uuid}/subscriptions/${subToCancel.id}/cancel`,
            { cancel_now: cancelImmediately },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCancelSubOpen(false);
                    setSubToCancel(null);
                },
            }
        );
    };

    const handleResumeSubscription = (sub: SubscriptionItem) => {
        router.post(
            `/customers/${customer.uuid}/subscriptions/${sub.id}/resume`,
            {},
            { preserveScroll: true }
        );
    };

    const handleViewInvoiceDetails = (invoice: InvoiceItem) => {
        setSelectedInvoice(invoice);
        setIsInvoiceDetailsOpen(true);
    };

    // Filtros de faturas
    const filteredInvoices = invoices.filter((inv) => {
        if (invoiceFilter === 'paid') return inv.status === 'paid';
        if (invoiceFilter === 'open') return inv.status === 'open';
        if (invoiceFilter === 'other') return inv.status !== 'paid' && inv.status !== 'open';
        return true;
    });

    const breadcrumbs = [
        { title: 'Painel', href: '/dashboard' },
        { title: 'Clientes', href: '/customers' },
        { title: customer.name || 'Cliente', href: `/customers/${customer.uuid}` },
    ];

    const formatCurrency = (val: number, curr = 'USD') => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: curr,
            }).format(val / 100);
        } catch {
            return `${curr} ${val.toFixed(2)}`;
        }
    };

    const renderSubscriptionStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
        if (cancelAtPeriodEnd) {
            return (
                <Badge className="border-[#f59e0b]/40 bg-[#f59e0b]/15 text-[#f59e0b] shadow-sm">
                    <Clock className="mr-1 size-3 text-[#f59e0b]" /> Cancela ao fim do ciclo
                </Badge>
            );
        }

        switch (status) {
            case 'active':
                return (
                    <Badge className="border-[#22c55e]/40 bg-[#22c55e]/15 text-[#22c55e] shadow-sm">
                        <CheckCircle2 className="mr-1 size-3 text-[#22c55e]" /> Ativa
                    </Badge>
                );
            case 'trialing':
                return (
                    <Badge className="border-[#38bdf8]/40 bg-[#38bdf8]/15 text-[#38bdf8] shadow-sm">
                        <Zap className="mr-1 size-3 text-[#38bdf8]" /> Em Teste (Trial)
                    </Badge>
                );
            case 'past_due':
                return (
                    <Badge className="border-[#f97316]/40 bg-[#f97316]/15 text-[#f97316] shadow-sm">
                        <ShieldAlert className="mr-1 size-3 text-[#f97316]" /> Pagamento Atrasado
                    </Badge>
                );
            case 'canceled':
                return (
                    <Badge className="border-[#ef4444]/40 bg-[#ef4444]/15 text-[#ef4444] shadow-sm">
                        <XCircle className="mr-1 size-3 text-[#ef4444]" /> Cancelada
                    </Badge>
                );
            case 'unpaid':
                return (
                    <Badge className="border-[#ef4444]/40 bg-[#ef4444]/15 text-[#ef4444] shadow-sm">
                        <XCircle className="mr-1 size-3 text-[#ef4444]" /> Não Paga
                    </Badge>
                );
            case 'incomplete':
                return (
                    <Badge className="border-[#a855f7]/40 bg-[#a855f7]/15 text-[#a855f7] shadow-sm">
                        <Clock className="mr-1 size-3 text-[#a855f7]" /> Incompleta
                    </Badge>
                );
            default:
                return (
                    <Badge className="border-white/20 bg-white/10 text-white shadow-sm">
                        {status}
                    </Badge>
                );
        }
    };

    const renderInvoiceStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge className="border-[#22c55e]/40 bg-[#22c55e]/15 text-[#22c55e]">
                        <Check className="mr-1 size-3 text-[#22c55e]" /> Paga
                    </Badge>
                );
            case 'open':
                return (
                    <Badge className="border-[#f59e0b]/40 bg-[#f59e0b]/15 text-[#f59e0b]">
                        <Clock className="mr-1 size-3 text-[#f59e0b]" /> Aberta / Pendente
                    </Badge>
                );
            case 'draft':
                return (
                    <Badge className="border-[#94a3b8]/40 bg-[#94a3b8]/15 text-[#94a3b8]">
                        Rascunho
                    </Badge>
                );
            case 'uncollectible':
                return (
                    <Badge className="border-[#ef4444]/40 bg-[#ef4444]/15 text-[#ef4444]">
                        <XCircle className="mr-1 size-3 text-[#ef4444]" /> Incobrável
                    </Badge>
                );
            case 'void':
                return (
                    <Badge className="border-[#64748b]/40 bg-[#64748b]/15 text-[#64748b]">
                        Anulada
                    </Badge>
                );
            default:
                return (
                    <Badge className="border-white/20 bg-white/10 text-white">
                        {status}
                    </Badge>
                );
        }
    };

    const activeSubscriptionsCount = subscriptions.filter(
        (s) => s.status === 'active' || s.status === 'trialing'
    ).length;

    return (
        <>
            <Head title={`Gerenciar Cliente - ${customer.name || 'Cliente'}`} />

            <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-br from-[#060814] via-[#090d20] to-[#04060e] p-4 text-[#e4e6f0] md:p-8">
                {/* Background glow effects */}
                <div className="pointer-events-none absolute -left-48 -top-48 size-96 rounded-full bg-[#c9a227]/5 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-1/3 size-96 rounded-full bg-[#4da6d6]/5 blur-3xl" />

                <div className="relative mx-auto max-w-7xl space-y-6">
                    {/* Header Principal do Cliente */}
                    <div className="rounded-2xl border border-[#c9a227]/25 bg-[#0d1228]/85 p-6 shadow-2xl backdrop-blur-xl transition-all">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            {/* Dados do Cliente */}
                            <div className="flex flex-wrap items-center gap-4">
                                <Link
                                    href="/customers"
                                    className="flex size-10 items-center justify-center rounded-xl border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227] transition-colors hover:bg-[#c9a227]/20 hover:text-white"
                                    title="Voltar para a lista de clientes"
                                >
                                    <ArrowLeft className="size-5" />
                                </Link>

                                <div className="flex size-16 items-center justify-center rounded-2xl border-2 border-[#c9a227]/40 bg-gradient-to-br from-[#c9a227]/20 to-[#07091a] font-rajdhani text-2xl font-bold text-[#c9a227] shadow-lg shadow-[#c9a227]/10">
                                    {(customer.name || 'C')
                                        .split(' ')
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join('')
                                        .toUpperCase()}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="font-rajdhani text-2xl font-bold tracking-wide text-white md:text-3xl">
                                            {customer.name || 'Cliente Sem Nome'}
                                        </h1>
                                        {activeSubscriptionsCount > 0 ? (
                                            <Badge className="border-[#22c55e]/40 bg-[#22c55e]/15 font-rajdhani text-xs font-semibold uppercase tracking-wider text-[#22c55e]">
                                                <span className="mr-1.5 inline-block size-2 animate-pulse rounded-full bg-[#22c55e]" />
                                                Assinante Ativo
                                            </Badge>
                                        ) : (
                                            <Badge className="border-[#7a84a0]/40 bg-[#7a84a0]/15 font-rajdhani text-xs font-semibold uppercase tracking-wider text-[#7a84a0]">
                                                Sem Assinatura Ativa
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#7a84a0]">
                                        <div className="flex items-center gap-1">
                                            <Mail className="size-3 text-[#c9a227]" />
                                            <span className="text-[#c5cad8]">{customer.email || '—'}</span>
                                        </div>
                                        {customer.phone && (
                                            <div className="flex items-center gap-1">
                                                <Phone className="size-3 text-[#22c55e]" />
                                                <span className="text-[#c5cad8]">
                                                    {customer.country_code ? `${customer.country_code} ` : ''}
                                                    {customer.phone}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Globe className="size-3 text-[#4da6d6]" />
                                            <span className="text-[#c5cad8]">{customer.country_label || customer.country}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ações Rápidas & Stripe ID */}
                            <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                                {(customer.stripe_id || customer.id_stripe) && (
                                    <button
                                        type="button"
                                        onClick={handleCopyStripeId}
                                        className="flex items-center gap-1.5 rounded-lg border border-[#c9a227]/30 bg-[#07091a]/80 px-3 py-1.5 font-mono text-xs text-[#c9a227] transition-colors hover:border-[#c9a227] hover:bg-[#c9a227]/10"
                                        title="Clique para copiar Stripe Customer ID"
                                    >
                                        <CreditCard className="size-3.5 text-[#c9a227]" />
                                        <span>{customer.stripe_id || customer.id_stripe}</span>
                                        {copiedStripeId ? (
                                            <Check className="size-3 text-[#22c55e]" />
                                        ) : (
                                            <Copy className="size-3 text-[#7a84a0]" />
                                        )}
                                    </button>
                                )}

                                <Button
                                    onClick={handleSyncStripe}
                                    variant="outline"
                                    size="sm"
                                    className="border-[#c9a227]/30 bg-[#07091a] text-xs font-semibold text-[#c9a227] hover:bg-[#c9a227]/10 hover:text-white"
                                >
                                    <RefreshCw className="mr-1.5 size-3.5" />
                                    Sincronizar Stripe
                                </Button>

                                <Button
                                    onClick={() => setIsCreateSubOpen(true)}
                                    size="sm"
                                    className="bg-gradient-to-r from-[#c9a227] to-[#dfba45] text-xs font-bold text-[#07091a] shadow-lg shadow-[#c9a227]/20 hover:brightness-110"
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    Nova Assinatura
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Cards de Destaque / Métricas */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Card 1: Assinaturas */}
                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Assinaturas
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                    <Package className="size-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="font-rajdhani text-3xl font-bold text-white">
                                    {activeSubscriptionsCount}{' '}
                                    <span className="font-sans text-xs font-normal text-[#7a84a0]">
                                        / {subscriptions.length} total
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#22c55e]">
                                    <CheckCircle2 className="size-3.5" />
                                    <span>
                                        {activeSubscriptionsCount > 0
                                            ? `${activeSubscriptionsCount} ativa(s)`
                                            : 'Nenhuma assinatura ativa'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Destaque da ÚLTIMA FATURA (Latest Invoice) */}
                        <div className="relative overflow-hidden rounded-xl border border-[#22c55e]/30 bg-gradient-to-br from-[#0d1228]/90 to-[#071912]/80 p-5 shadow-lg shadow-[#22c55e]/5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#22c55e]">
                                        Última Fatura
                                    </span>
                                    <span className="inline-block size-1.5 rounded-full bg-[#22c55e]" />
                                </div>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]">
                                    <Receipt className="size-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                {latestInvoice ? (
                                    <>
                                        <div className="flex items-baseline justify-between">
                                            <span className="font-rajdhani text-2xl font-bold text-white">
                                                {latestInvoice.total || formatCurrency(latestInvoice.raw_total, latestInvoice.currency)}
                                            </span>
                                            {renderInvoiceStatusBadge(latestInvoice.status)}
                                        </div>
                                        <div className="mt-1.5 flex items-center justify-between text-xs text-[#7a84a0]">
                                            <span className="font-mono">{latestInvoice.number}</span>
                                            <span>{latestInvoice.date}</span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            {latestInvoice.invoice_pdf && (
                                                <a
                                                    href={latestInvoice.invoice_pdf}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 rounded border border-[#22c55e]/30 bg-[#22c55e]/10 px-2 py-1 text-[11px] font-semibold text-[#22c55e] transition hover:bg-[#22c55e]/20"
                                                >
                                                    <Download className="size-3" /> PDF
                                                </a>
                                            )}
                                            {latestInvoice.hosted_invoice_url && (
                                                <a
                                                    href={latestInvoice.hosted_invoice_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-[#e4e6f0] transition hover:bg-white/10"
                                                >
                                                    <ExternalLink className="size-3" /> Ver Fatura
                                                </a>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-2 text-xs text-[#7a84a0]">
                                        Nenhuma fatura emitida até o momento.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card 3: Próxima Fatura (Upcoming Invoice) */}
                        <div className="relative overflow-hidden rounded-xl border border-[#4da6d6]/25 bg-[#0d1228]/80 p-5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#4da6d6]">
                                    Próxima Fatura
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#4da6d6]/30 bg-[#4da6d6]/10 text-[#4da6d6]">
                                    <Calendar className="size-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                {upcomingInvoice ? (
                                    <>
                                        <div className="font-rajdhani text-2xl font-bold text-white">
                                            {upcomingInvoice.total || formatCurrency(upcomingInvoice.raw_total, upcomingInvoice.currency)}
                                        </div>
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[#4da6d6]">
                                            <Clock className="size-3.5" />
                                            <span>
                                                {upcomingInvoice.next_payment_attempt
                                                    ? `Cobrança prevista: ${upcomingInvoice.next_payment_attempt}`
                                                    : 'Próximo ciclo previsto'}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-2 text-xs text-[#7a84a0]">
                                        Sem cobrança futura agendada.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card 4: Saldo / Moeda Stripe */}
                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Conta Stripe
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                    <DollarSign className="size-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="font-rajdhani text-2xl font-bold text-white">
                                    {stripeCustomer ? formatCurrency(stripeCustomer.balance, stripeCustomer.currency) : 'R$ 0,00'}
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 text-xs">
                                    {stripeCustomer?.delinquent ? (
                                        <span className="flex items-center gap-1 font-semibold text-[#ef4444]">
                                            <ShieldAlert className="size-3.5" /> Conta Inadimplente
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[#22c55e]">
                                            <ShieldCheck className="size-3.5" /> Conta Regularizada
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Abas de Conteúdo */}
                    <div className="space-y-4">
                        {/* Tabs Bar */}
                        <div className="flex border-b border-[#c9a227]/20 bg-[#0d1228]/60 p-1 backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => setActiveTab('subscriptions')}
                                className={`flex items-center gap-2 border-b-2 px-5 py-3 font-rajdhani text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'subscriptions'
                                    ? 'border-[#c9a227] text-[#c9a227]'
                                    : 'border-transparent text-[#7a84a0] hover:text-white'
                                    }`}
                            >
                                <Package className="size-4" />
                                Assinaturas ({subscriptions.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('invoices')}
                                className={`flex items-center gap-2 border-b-2 px-5 py-3 font-rajdhani text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'invoices'
                                    ? 'border-[#c9a227] text-[#c9a227]'
                                    : 'border-transparent text-[#7a84a0] hover:text-white'
                                    }`}
                            >
                                <Receipt className="size-4" />
                                Faturas / Invoices ({invoices.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('details')}
                                className={`flex items-center gap-2 border-b-2 px-5 py-3 font-rajdhani text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'details'
                                    ? 'border-[#c9a227] text-[#c9a227]'
                                    : 'border-transparent text-[#7a84a0] hover:text-white'
                                    }`}
                            >
                                <User className="size-4" />
                                Dados & Cobrança
                            </button>
                        </div>

                        {/* Conteúdo Aba 1: ASSINATURAS */}
                        {activeTab === 'subscriptions' && (
                            <div className="space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-rajdhani text-lg font-bold uppercase tracking-wide text-white">
                                            Assinaturas do <span className="text-[#c9a227]">Cliente</span>
                                        </h2>
                                        <p className="text-xs text-[#7a84a0]">
                                            Gerencie os planos ativos, períodos de faturamento e status de cancelamento.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setIsCreateSubOpen(true)}
                                        size="sm"
                                        className="bg-[#c9a227] font-semibold text-[#07091a] hover:bg-[#dfba45]"
                                    >
                                        <Plus className="mr-1.5 size-4" /> Nova Assinatura
                                    </Button>
                                </div>

                                {subscriptions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#c9a227]/20 bg-[#0d1228]/50 py-16 text-center">
                                        <div className="flex size-16 items-center justify-center rounded-2xl border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                            <Package className="size-8" />
                                        </div>
                                        <h3 className="mt-4 font-rajdhani text-xl font-bold text-white">
                                            Nenhuma Assinatura Cadastrada
                                        </h3>
                                        <p className="mt-1 max-w-sm text-xs text-[#7a84a0]">
                                            Este cliente ainda não possui assinaturas ativas no Stripe ou localmente.
                                        </p>
                                        <Button
                                            onClick={() => setIsCreateSubOpen(true)}
                                            size="sm"
                                            className="mt-5 bg-[#c9a227] font-bold text-[#07091a] hover:bg-[#dfba45]"
                                        >
                                            <Plus className="mr-1.5 size-4" /> Criar Primeira Assinatura
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {subscriptions.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/85 p-5 shadow-lg backdrop-blur-md transition hover:border-[#c9a227]/40"
                                            >
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                    {/* Info da Assinatura */}
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex size-12 items-center justify-center rounded-xl border border-[#c9a227]/30 bg-[#c9a227]/10 font-rajdhani text-lg font-bold text-[#c9a227]">
                                                            <Package className="size-6" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2.5">
                                                                <h3 className="font-rajdhani text-xl font-bold text-white">
                                                                    {sub.plan_name}
                                                                </h3>
                                                                {renderSubscriptionStatusBadge(sub.status, sub.cancel_at_period_end)}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#7a84a0]">
                                                                <span>ID: {sub.id}</span>
                                                                <span>•</span>
                                                                <span className="font-sans font-bold text-[#c9a227]">
                                                                    {formatCurrency(sub.unit_amount, sub.currency)} / {sub.interval === 'month' ? 'mês' : sub.interval === 'year' ? 'ano' : sub.interval}
                                                                </span>
                                                                <span>•</span>
                                                                <span>Qtd: {sub.quantity}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Datas & Ações */}
                                                    <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                                                        <div className="space-y-0.5 text-right text-xs">
                                                            {sub.current_period_end && (
                                                                <div className="text-[#7a84a0]">
                                                                    Renovação:{' '}
                                                                    <span className="font-semibold text-white">
                                                                        {sub.current_period_end}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {sub.created_at && (
                                                                <div className="text-[11px] text-[#7a84a0]">
                                                                    Início: {sub.created_at}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {sub.cancel_at_period_end ? (
                                                                <Button
                                                                    onClick={() => handleResumeSubscription(sub)}
                                                                    size="sm"
                                                                    className="border border-[#22c55e]/40 bg-[#22c55e]/15 text-xs font-semibold text-[#22c55e] hover:bg-[#22c55e]/25"
                                                                >
                                                                    <PlayCircle className="mr-1.5 size-4" />
                                                                    Retomar Assinatura
                                                                </Button>
                                                            ) : sub.status === 'active' || sub.status === 'trialing' ? (
                                                                <Button
                                                                    onClick={() => handleOpenCancelModal(sub)}
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-[#ef4444]/30 bg-[#07091a] text-xs font-semibold text-[#ef4444] hover:bg-[#ef4444]/15 hover:text-white"
                                                                >
                                                                    <PauseCircle className="mr-1.5 size-4" />
                                                                    Cancelar Assinatura
                                                                </Button>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Conteúdo Aba 2: FATURAS / INVOICES */}
                        {activeTab === 'invoices' && (
                            <div className="space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-rajdhani text-lg font-bold uppercase tracking-wide text-white">
                                            Histórico de <span className="text-[#c9a227]">Faturas (Invoices)</span>
                                        </h2>
                                        <p className="text-xs text-[#7a84a0]">
                                            Extrato completo de cobranças, recibos e notas fiscais geradas no Stripe.
                                        </p>
                                    </div>

                                    {/* Filtros de Fatura */}
                                    <div className="flex items-center gap-1.5 rounded-lg border border-[#c9a227]/20 bg-[#07091a]/80 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setInvoiceFilter('all')}
                                            className={`rounded px-3 py-1 text-xs font-semibold transition ${invoiceFilter === 'all'
                                                ? 'bg-[#c9a227] text-[#07091a]'
                                                : 'text-[#7a84a0] hover:text-white'
                                                }`}
                                        >
                                            Todas ({invoices.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInvoiceFilter('paid')}
                                            className={`rounded px-3 py-1 text-xs font-semibold transition ${invoiceFilter === 'paid'
                                                ? 'bg-[#22c55e] text-[#07091a]'
                                                : 'text-[#7a84a0] hover:text-white'
                                                }`}
                                        >
                                            Pagas ({invoices.filter((i) => i.status === 'paid').length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInvoiceFilter('open')}
                                            className={`rounded px-3 py-1 text-xs font-semibold transition ${invoiceFilter === 'open'
                                                ? 'bg-[#f59e0b] text-[#07091a]'
                                                : 'text-[#7a84a0] hover:text-white'
                                                }`}
                                        >
                                            Abertas ({invoices.filter((i) => i.status === 'open').length})
                                        </button>
                                    </div>
                                </div>

                                {filteredInvoices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#c9a227]/20 bg-[#0d1228]/50 py-16 text-center">
                                        <div className="flex size-16 items-center justify-center rounded-2xl border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                            <Receipt className="size-8" />
                                        </div>
                                        <h3 className="mt-4 font-rajdhani text-xl font-bold text-white">
                                            Nenhuma Fatura Encontrada
                                        </h3>
                                        <p className="mt-1 max-w-sm text-xs text-[#7a84a0]">
                                            Nenhum registro corresponde aos filtros selecionados.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/85 shadow-xl backdrop-blur-md">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead className="border-b border-[#c9a227]/20 bg-[#07091a]/80 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                                    <tr>
                                                        <th className="px-4 py-3.5">Fatura #</th>
                                                        <th className="px-4 py-3.5">Data de Emissão</th>
                                                        <th className="px-4 py-3.5">Período</th>
                                                        <th className="px-4 py-3.5">Valor Total</th>
                                                        <th className="px-4 py-3.5">Status</th>
                                                        <th className="px-4 py-3.5 text-right">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#c9a227]/10">
                                                    {filteredInvoices.map((inv) => (
                                                        <tr
                                                            key={inv.id}
                                                            className="transition-colors hover:bg-[#c9a227]/5"
                                                        >
                                                            <td className="px-4 py-3.5 font-mono font-semibold text-white">
                                                                {inv.number}
                                                            </td>
                                                            <td className="px-4 py-3.5 text-[#e4e6f0]">
                                                                {inv.date}
                                                            </td>
                                                            <td className="px-4 py-3.5 text-[#7a84a0]">
                                                                {inv.period_start && inv.period_end
                                                                    ? `${inv.period_start} → ${inv.period_end}`
                                                                    : '—'}
                                                            </td>
                                                            <td className="px-4 py-3.5 font-rajdhani text-sm font-bold text-white">
                                                                {inv.total || formatCurrency(inv.raw_total, inv.currency)}
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                {renderInvoiceStatusBadge(inv.status)}
                                                            </td>
                                                            <td className="px-4 py-3.5 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <Button
                                                                        onClick={() => handleViewInvoiceDetails(inv)}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="size-8 p-0 text-[#7a84a0] hover:bg-[#c9a227]/10 hover:text-[#c9a227]"
                                                                        title="Ver Itens Detalhados"
                                                                    >
                                                                        <FileText className="size-4" />
                                                                    </Button>

                                                                    {inv.invoice_pdf && (
                                                                        <a
                                                                            href={inv.invoice_pdf}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="flex size-8 items-center justify-center rounded-md text-[#7a84a0] transition hover:bg-[#22c55e]/15 hover:text-[#22c55e]"
                                                                            title="Baixar PDF do Stripe"
                                                                        >
                                                                            <Download className="size-4" />
                                                                        </a>
                                                                    )}

                                                                    {inv.hosted_invoice_url && (
                                                                        <a
                                                                            href={inv.hosted_invoice_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="flex size-8 items-center justify-center rounded-md text-[#7a84a0] transition hover:bg-[#4da6d6]/15 hover:text-[#4da6d6]"
                                                                            title="Ver Fatura Hospedada no Stripe"
                                                                        >
                                                                            <ExternalLink className="size-4" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Conteúdo Aba 3: DADOS CADASTRAIS & COBRANÇA */}
                        {activeTab === 'details' && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Informações de Contato e Endereço */}
                                <div className="space-y-4 rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/85 p-6 backdrop-blur-md">
                                    <h3 className="font-rajdhani text-lg font-bold uppercase tracking-wider text-white">
                                        Endereço de Cobrança
                                    </h3>
                                    <div className="space-y-3 text-xs">
                                        <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                            <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                                Logradouro
                                            </span>
                                            <p className="mt-1 font-semibold text-white">{customer.line1}</p>
                                            {customer.line2 && <p className="text-[#7a84a0]">{customer.line2}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                                <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                                    Cidade / Estado
                                                </span>
                                                <p className="mt-1 font-semibold text-white">
                                                    {customer.city} / {customer.state}
                                                </p>
                                            </div>

                                            <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                                <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                                    CEP / Código Postal
                                                </span>
                                                <p className="mt-1 font-mono font-semibold text-white">
                                                    {customer.postal_code}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                            <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                                País
                                            </span>
                                            <p className="mt-1 font-semibold text-white">
                                                {customer.country_label || customer.country}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Informações Stripe da Conta */}
                                <div className="space-y-4 rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/85 p-6 backdrop-blur-md">
                                    <h3 className="font-rajdhani text-lg font-bold uppercase tracking-wider text-white">
                                        Vínculo com o Stripe
                                    </h3>
                                    <div className="space-y-3 text-xs">
                                        <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                            <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                                Stripe Customer ID
                                            </span>
                                            <p className="mt-1 font-mono font-semibold text-[#c9a227]">
                                                {customer.stripe_id || customer.id_stripe || 'Não cadastrado no Stripe'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                                <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                                    Moeda Padrão
                                                </span>
                                                <p className="mt-1 font-semibold text-white">
                                                    {stripeCustomer?.currency || 'BRL'}
                                                </p>
                                            </div>

                                            <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                                <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                                    Criado no Stripe em
                                                </span>
                                                <p className="mt-1 font-semibold text-white">
                                                    {stripeCustomer?.created || '—'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                            <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                                UUID Interno do Sistema
                                            </span>
                                            <p className="mt-1 font-mono text-[11px] text-[#7a84a0]">
                                                {customer.uuid}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL: Criar Nova Assinatura */}
                <Dialog open={isCreateSubOpen} onOpenChange={setIsCreateSubOpen}>
                    <DialogContent className="max-w-md border border-[#c9a227]/30 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl">
                        <DialogHeader className="border-b border-[#c9a227]/20 pb-3 text-left">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]">
                                    <Plus className="size-4" />
                                </div>
                                <div>
                                    <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                        Criar <span className="text-[#c9a227]">Assinatura</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-[#7a84a0]">
                                        Selecione um plano cadastrado para vincular a este cliente.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubscriptionSubmit} className="space-y-4 pt-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="price_id" className="text-xs font-semibold text-white">
                                    Plano / Preço <span className="text-[#ff6b6b]">*</span>
                                </Label>
                                <select
                                    id="price_id"
                                    value={createSubForm.data.price_id}
                                    onChange={(e) => createSubForm.setData('price_id', e.target.value)}
                                    required
                                    className="w-full rounded-md border border-white/10 bg-[#07091a] px-3 py-2 text-xs text-white focus:border-[#c9a227] focus:outline-none"
                                >
                                    <option value="">Selecione um plano...</option>
                                    {availableProducts.map((prod) => (
                                        <optgroup key={prod.uuid} label={prod.name}>
                                            {(prod.prices || []).map((p) => (
                                                <option key={p.uuid} value={p.id_stripe}>
                                                    {prod.name} — {formatCurrency(p.unit_amount, p.currency)} / {p.interval}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="sub_type" className="text-xs font-semibold text-white">
                                    Identificador do Tipo (Opcional)
                                </Label>
                                <Input
                                    id="sub_type"
                                    placeholder="Ex: default, premium"
                                    value={createSubForm.data.type}
                                    onChange={(e) => createSubForm.setData('type', e.target.value)}
                                    className="border-white/10 bg-[#07091a] text-xs text-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="trial_days" className="text-xs font-semibold text-white">
                                    Dias de Período de Teste (Trial Opcional)
                                </Label>
                                <Input
                                    id="trial_days"
                                    type="number"
                                    min="0"
                                    placeholder="Ex: 7, 14, 30"
                                    value={createSubForm.data.trial_days}
                                    onChange={(e) => createSubForm.setData('trial_days', e.target.value)}
                                    className="border-white/10 bg-[#07091a] text-xs text-white"
                                />
                            </div>

                            <DialogFooter className="border-t border-[#c9a227]/20 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsCreateSubOpen(false)}
                                    className="text-xs text-[#7a84a0] hover:text-white"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={createSubForm.processing || !createSubForm.data.price_id}
                                    className="bg-[#c9a227] font-bold text-[#07091a] hover:bg-[#dfba45]"
                                >
                                    {createSubForm.processing ? 'Criando...' : 'Confirmar Assinatura'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL: Cancelar Assinatura */}
                <Dialog open={isCancelSubOpen} onOpenChange={setIsCancelSubOpen}>
                    <DialogContent className="max-w-md border border-[#ef4444]/30 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl">
                        <DialogHeader className="border-b border-[#ef4444]/20 pb-3 text-left">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]">
                                    <PauseCircle className="size-4" />
                                </div>
                                <div>
                                    <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                        Cancelar <span className="text-[#ef4444]">Assinatura</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-[#7a84a0]">
                                        Confirme como deseja cancelar a assinatura do cliente.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {subToCancel && (
                            <div className="space-y-4 pt-2 text-xs">
                                <div className="rounded-lg border border-white/5 bg-[#07091a]/60 p-3">
                                    <p className="font-bold text-white">{subToCancel.plan_name}</p>
                                    <p className="font-mono text-[#7a84a0]">ID: {subToCancel.id}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                        <input
                                            type="radio"
                                            name="cancelType"
                                            checked={!cancelImmediately}
                                            onChange={() => setCancelImmediately(false)}
                                            className="text-[#c9a227]"
                                        />
                                        <div>
                                            <span className="font-semibold text-white">
                                                Cancelar ao final do período atual (Recomendado)
                                            </span>
                                            <p className="text-[11px] text-[#7a84a0]">
                                                O cliente mantém o acesso até a data de renovação.
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                        <input
                                            type="radio"
                                            name="cancelType"
                                            checked={cancelImmediately}
                                            onChange={() => setCancelImmediately(true)}
                                            className="text-[#ef4444]"
                                        />
                                        <div>
                                            <span className="font-semibold text-[#ef4444]">
                                                Cancelar Imediatamente
                                            </span>
                                            <p className="text-[11px] text-[#7a84a0]">
                                                O acesso é interrompido imediatamente no Stripe.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="border-t border-[#ef4444]/20 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCancelSubOpen(false)}
                                className="text-xs text-[#7a84a0] hover:text-white"
                            >
                                Voltar
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleConfirmCancel}
                                className="bg-[#ef4444] font-bold text-white hover:bg-[#dc2626]"
                            >
                                Confirmar Cancelamento
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* MODAL: Detalhes da Fatura (Line Items / Recibo) */}
                <Dialog open={isInvoiceDetailsOpen} onOpenChange={setIsInvoiceDetailsOpen}>
                    <DialogContent className="max-w-xl border border-[#c9a227]/30 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl">
                        <DialogHeader className="border-b border-[#c9a227]/20 pb-3 text-left">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]">
                                    <Receipt className="size-4" />
                                </div>
                                <div>
                                    <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                        Recibo da Fatura <span className="text-[#c9a227]">{selectedInvoice?.number}</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-[#7a84a0]">
                                        Data: {selectedInvoice?.date} • ID: {selectedInvoice?.id}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {selectedInvoice && (
                            <div className="space-y-4 pt-2 text-xs">
                                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#07091a]/60 p-3">
                                    <div>
                                        <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                            Status do Pagamento
                                        </span>
                                        <div className="mt-1">
                                            {renderInvoiceStatusBadge(selectedInvoice.status)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">
                                            Total Pago / Cobrado
                                        </span>
                                        <p className="mt-1 font-rajdhani text-xl font-bold text-white">
                                            {selectedInvoice.total || formatCurrency(selectedInvoice.raw_total, selectedInvoice.currency)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                        Itens da Fatura
                                    </h4>
                                    <div className="max-h-48 overflow-y-auto rounded-lg border border-white/5 bg-[#07091a]/40 p-2">
                                        {(selectedInvoice.lines || []).length > 0 ? (
                                            <div className="divide-y divide-white/5">
                                                {selectedInvoice.lines?.map((line) => (
                                                    <div
                                                        key={line.id}
                                                        className="flex items-center justify-between py-2 text-xs"
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-white">
                                                                {line.description}
                                                            </p>
                                                            {line.period_start && line.period_end && (
                                                                <p className="text-[11px] text-[#7a84a0]">
                                                                    Período: {line.period_start} → {line.period_end}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-mono font-semibold text-white">
                                                                {formatCurrency(line.amount, line.currency)}
                                                            </p>
                                                            <p className="text-[11px] text-[#7a84a0]">
                                                                Qtd: {line.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="py-2 text-center text-[#7a84a0]">
                                                Nenhum item detalhado encontrado para esta fatura.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="border-t border-[#c9a227]/20 pt-4">
                            {selectedInvoice?.invoice_pdf && (
                                <a
                                    href={selectedInvoice.invoice_pdf}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 rounded-md border border-[#22c55e]/40 bg-[#22c55e]/15 px-3 py-1.5 text-xs font-semibold text-[#22c55e] transition hover:bg-[#22c55e]/25"
                                >
                                    <Download className="size-3.5" /> Baixar PDF
                                </a>
                            )}
                            {selectedInvoice?.hosted_invoice_url && (
                                <a
                                    href={selectedInvoice.hosted_invoice_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                                >
                                    <ExternalLink className="size-3.5" /> Abrir no Stripe
                                </a>
                            )}
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setIsInvoiceDetailsOpen(false)}
                                className="bg-[#c9a227] font-semibold text-[#07091a] hover:bg-[#dfba45]"
                            >
                                Fechar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
