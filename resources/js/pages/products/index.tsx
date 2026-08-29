import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Coins,
    Copy,
    CreditCard,
    DollarSign,
    Edit,
    ExternalLink,
    Eye,
    Globe,
    HelpCircle,
    ImageIcon,
    Layers,
    Loader2,
    Package,
    PackageCheck,
    Plus,
    Power,
    RefreshCw,
    Repeat,
    Search,
    Sparkles,
    Tag,
    Trash2,
    X,
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

export interface ProductBenefitItem {
    id?: number;
    name: string;
    description?: string | null;
}

export interface PriceItem {
    uuid: string;
    id_stripe?: string | null;
    currency: string;
    product_id: string;
    interval?: string | null;
    trial_period_days?: string | number | null;
    unit_amount: string | number;
    type?: string | null;
    active?: boolean;
    data?: Record<string, unknown> | null;
    created_at?: string;
    updated_at?: string;
}

export interface ProductItem {
    uuid: string;
    id_stripe?: string | null;
    name: string;
    description?: string | null;
    image?: string | null;
    default_price?: string | null;
    data?: Record<string, unknown> | null;
    benefits?: ProductBenefitItem[];
    prices?: PriceItem[];
    created_at?: string;
    updated_at?: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedProducts {
    data: ProductItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface PageProps {
    products: PaginatedProducts;
    filters: {
        search?: string;
    };
    metrics: {
        total: number;
        with_benefits: number;
        synced_stripe: number;
        total_prices?: number;
        new_this_month: number;
    };
}

const breadcrumbs = [
    {
        title: 'Painel',
        href: '/dashboard',
    },
    {
        title: 'Produtos',
        href: '/products',
    },
];

export default function ProductsIndex({ products, filters, metrics }: PageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
    const [copiedStripeId, setCopiedStripeId] = useState<string | null>(null);

    // Price management inside Edit modal
    const [isAddingPrice, setIsAddingPrice] = useState(false);
    const [togglingPriceId, setTogglingPriceId] = useState<string | null>(null);
    const [deletingPriceId, setDeletingPriceId] = useState<string | null>(null);

    // Form for Adding Price
    const priceForm = useForm({
        unit_amount: '',
        currency: 'brl',
        type: 'recurring',
        interval: 'month',
        trial_period_days: '',
    });

    // Create Form
    const createForm = useForm<{
        name: string;
        description: string;
        image: string;
        default_price: string;
        benefits: { name: string; description: string }[];
    }>({
        name: '',
        description: '',
        image: '',
        default_price: '',
        benefits: [],
    });

    // Edit Form
    const editForm = useForm<{
        name: string;
        description: string;
        image: string;
        default_price: string;
        benefits: { name: string; description: string }[];
    }>({
        name: '',
        description: '',
        image: '',
        default_price: '',
        benefits: [],
    });

    // Keep selectedProduct fresh from props whenever props update
    const currentProduct = selectedProduct
        ? products.data.find((p) => p.uuid === selectedProduct.uuid) || selectedProduct
        : null;

    const handleCopyStripeId = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(id);
        setCopiedStripeId(id);
        setTimeout(() => setCopiedStripeId(null), 2000);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/products',
            {
                search: searchTerm || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        router.get('/products', {}, { preserveState: true, preserveScroll: true });
    };

    const handleOpenEdit = (product: ProductItem) => {
        setSelectedProduct(product);
        setIsAddingPrice(false);
        priceForm.reset();
        editForm.setData({
            name: product.name || '',
            description: product.description || '',
            image: product.image || '',
            default_price: product.default_price || '',
            benefits:
                product.benefits && product.benefits.length > 0
                    ? product.benefits.map((b) => ({
                          name: b.name,
                          description: b.description || '',
                      }))
                    : [],
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    const handleOpenView = (product: ProductItem) => {
        setSelectedProduct(product);
        setIsViewOpen(true);
    };

    const handleOpenDelete = (product: ProductItem) => {
        setSelectedProduct(product);
        setIsDeleteOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/products', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        editForm.put(`/products/${selectedProduct.uuid}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedProduct(null);
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!selectedProduct) return;

        router.delete(`/products/${selectedProduct.uuid}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedProduct(null);
            },
        });
    };

    // Helper functions for benefit items in create form
    const addCreateBenefit = () => {
        createForm.setData('benefits', [...createForm.data.benefits, { name: '', description: '' }]);
    };

    const updateCreateBenefit = (index: number, field: 'name' | 'description', value: string) => {
        const updated = [...createForm.data.benefits];
        updated[index][field] = value;
        createForm.setData('benefits', updated);
    };

    const removeCreateBenefit = (index: number) => {
        createForm.setData(
            'benefits',
            createForm.data.benefits.filter((_, i) => i !== index)
        );
    };

    // Helper functions for benefit items in edit form
    const addEditBenefit = () => {
        editForm.setData('benefits', [...editForm.data.benefits, { name: '', description: '' }]);
    };

    const updateEditBenefit = (index: number, field: 'name' | 'description', value: string) => {
        const updated = [...editForm.data.benefits];
        updated[index][field] = value;
        editForm.setData('benefits', updated);
    };

    const removeEditBenefit = (index: number) => {
        editForm.setData(
            'benefits',
            editForm.data.benefits.filter((_, i) => i !== index)
        );
    };

    // Price management handlers
    const handleCreatePrice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProduct) return;

        priceForm.post(`/products/${currentProduct.uuid}/prices`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddingPrice(false);
                priceForm.reset();
            },
        });
    };

    const handleTogglePriceActive = (price: PriceItem) => {
        setTogglingPriceId(price.uuid);
        router.patch(
            `/prices/${price.uuid}/toggle-active`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingPriceId(null),
            }
        );
    };

    const handleDeletePrice = (price: PriceItem) => {
        if (!confirm(`Deseja realmente desativar e excluir o plano de preço ${formatPriceValue(price.unit_amount, price.currency)}?`)) {
            return;
        }
        setDeletingPriceId(price.uuid);
        router.delete(`/prices/${price.uuid}`, {
            preserveScroll: true,
            onFinish: () => setDeletingPriceId(null),
        });
    };

    const formatPriceValue = (amount: string | number, currency = 'BRL') => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(num)) return amount;
        // In Stripe unit_amount is stored in cents
        const normalized = num >= 100 && num % 1 === 0 ? num / 100 : num;
        try {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: currency ? currency.toUpperCase() : 'BRL',
            }).format(normalized);
        } catch {
            return `${(currency || 'BRL').toUpperCase()} ${normalized.toFixed(2)}`;
        }
    };

    const translateInterval = (interval?: string | null) => {
        if (!interval) return 'único';
        const map: Record<string, string> = {
            month: 'mês',
            year: 'ano',
            week: 'semana',
            day: 'dia',
        };
        return map[interval.toLowerCase()] || interval;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <>
            <Head title="Gerenciamento de Produtos — SoberanoAI" />

            <div className="relative min-h-screen bg-[#07091a] p-4 text-[#e4e6f0] md:p-8">
                {/* Background grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                        backgroundImage: `linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }}
                />

                <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#c9a227]/20 pb-6">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-10 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.2)]">
                                    <Package className="size-5" />
                                </div>
                                <div>
                                    <h1 className="font-rajdhani text-2xl md:text-3xl font-bold tracking-wide text-white uppercase">
                                        Gerenciamento de <span className="text-[#c9a227]">Produtos</span>
                                    </h1>
                                    <p className="font-sans text-xs md:text-sm text-[#7a84a0]">
                                        Catálogo de planos, preços Stripe, sincronização e benefícios
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => router.reload()}
                                variant="outline"
                                className="border-[#c9a227]/30 bg-[#0d1228] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0] hover:border-[#c9a227]/60 hover:bg-[#c9a227]/10 hover:text-white"
                            >
                                <RefreshCw className="mr-1.5 size-3.5" /> Atualizar
                            </Button>
                            <Button
                                onClick={() => {
                                    createForm.reset();
                                    createForm.clearErrors();
                                    setIsCreateOpen(true);
                                }}
                                className="border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] font-rajdhani text-xs md:text-sm font-bold uppercase tracking-wider text-[#07091a] shadow-[0_0_20px_rgba(201,162,39,0.35)] transition-all hover:brightness-110 hover:shadow-[0_0_25px_rgba(201,162,39,0.5)]"
                            >
                                <Plus className="mr-1.5 size-4" /> Novo Produto
                            </Button>
                        </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 shadow-lg backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Total de Produtos
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                    <Package className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-rajdhani text-3xl font-bold text-white">
                                    {metrics.total}
                                </span>
                                <span className="font-sans text-xs text-[#c9a227]">cadastrados</span>
                            </div>
                            <div className="mt-2 text-xs text-[#7a84a0]">Catálogo completo ativo</div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 shadow-lg backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Planos de Preço
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]">
                                    <Coins className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-rajdhani text-3xl font-bold text-[#22c55e]">
                                    {metrics.total_prices ?? 0}
                                </span>
                                <span className="font-sans text-xs text-[#7a84a0]">preços Stripe</span>
                            </div>
                            <div className="mt-2 text-xs text-[#7a84a0]">Tabelas de preço configuradas</div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 shadow-lg backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Sincronizados Stripe
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#635bff]/30 bg-[#635bff]/10 text-[#635bff]">
                                    <CreditCard className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-rajdhani text-3xl font-bold text-[#635bff]">
                                    {metrics.synced_stripe}
                                </span>
                                <span className="font-sans text-xs text-[#7a84a0]">ID ativo</span>
                            </div>
                            <div className="mt-2 text-xs text-[#7a84a0]">Prontos para checkout e webhook</div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 shadow-lg backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Com Benefícios
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#eab308]/30 bg-[#eab308]/10 text-[#eab308]">
                                    <Sparkles className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-rajdhani text-3xl font-bold text-[#eab308]">
                                    {metrics.with_benefits}
                                </span>
                                <span className="font-sans text-xs text-[#7a84a0]">vantagens</span>
                            </div>
                            <div className="mt-2 text-xs text-[#7a84a0]">Produtos com vantagens vinculadas</div>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-4 backdrop-blur-md">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7a84a0]" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nome, descrição, Stripe ID, preço ou benefício..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-[#c9a227]/20 bg-[#07091a]/90 pl-10 text-sm text-white placeholder-[#7a84a0] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a84a0] hover:text-white"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="submit"
                                    className="border border-[#c9a227]/40 bg-[#c9a227]/10 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227] hover:bg-[#c9a227]/20 hover:text-white"
                                >
                                    <Search className="mr-1.5 size-3.5" /> Filtrar
                                </Button>
                                {filters.search && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClearFilters}
                                        className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0] hover:bg-white/10 hover:text-white"
                                    >
                                        <X className="mr-1.5 size-3.5" /> Limpar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Products Table Card */}
                    <div className="overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/90 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between border-b border-[#c9a227]/15 bg-[#0a0f1d]/80 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Layers className="size-4 text-[#c9a227]" />
                                <h2 className="font-rajdhani text-base font-bold uppercase tracking-wider text-white">
                                    Catálogo de Produtos & Preços
                                </h2>
                                <Badge className="border-[#c9a227]/30 bg-[#c9a227]/10 font-mono text-[10px] text-[#c9a227]">
                                    {products.total} {products.total === 1 ? 'produto' : 'produtos'}
                                </Badge>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#c9a227]/15 bg-[#07091a]/60 text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                        <th className="px-6 py-3.5">Produto</th>
                                        <th className="px-6 py-3.5">Preços & Planos (Stripe)</th>
                                        <th className="px-6 py-3.5">Benefícios</th>
                                        <th className="px-6 py-3.5">Stripe Product ID</th>
                                        <th className="px-6 py-3.5">Criado em</th>
                                        <th className="px-6 py-3.5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#c9a227]/10">
                                    {products.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-[#7a84a0]">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="flex size-12 items-center justify-center rounded-full border border-[#c9a227]/20 bg-[#c9a227]/5 text-[#c9a227]">
                                                        <Package className="size-6" />
                                                    </div>
                                                    <p className="font-rajdhani text-base font-semibold text-white">
                                                        Nenhum produto cadastrado ou encontrado
                                                    </p>
                                                    <p className="max-w-xs text-xs text-[#7a84a0]">
                                                        Comece cadastrando um novo produto com seus benefícios e integração Stripe.
                                                    </p>
                                                    <Button
                                                        onClick={() => {
                                                            createForm.reset();
                                                            createForm.clearErrors();
                                                            setIsCreateOpen(true);
                                                        }}
                                                        className="mt-2 border border-[#c9a227] bg-[#c9a227]/20 font-rajdhani text-xs font-bold uppercase text-[#c9a227] hover:bg-[#c9a227] hover:text-[#07091a]"
                                                    >
                                                        <Plus className="mr-1.5 size-3.5" /> Cadastrar Primeiro Produto
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.data.map((product) => (
                                            <tr
                                                key={product.uuid}
                                                className="group transition-colors hover:bg-[#c9a227]/5"
                                            >
                                                {/* Product Info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#c9a227]/30 bg-[#07091a]">
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="size-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.currentTarget as HTMLElement).style.display =
                                                                            'none';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#c9a227]/20 to-[#0d1228] text-[#c9a227]">
                                                                <Package className="size-5" />
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-rajdhani text-base font-bold text-white group-hover:text-[#c9a227] transition-colors">
                                                                    {product.name}
                                                                </span>
                                                            </div>
                                                            {product.description ? (
                                                                <p className="line-clamp-1 max-w-xs text-xs text-[#7a84a0]">
                                                                    {product.description}
                                                                </p>
                                                            ) : (
                                                                <span className="text-xs text-[#7a84a0]/60 italic">
                                                                    Sem descrição
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Prices & Plans List */}
                                                <td className="px-6 py-4">
                                                    {product.prices && product.prices.length > 0 ? (
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                {product.prices.map((p) => {
                                                                    const isActive = p.active !== false;
                                                                    return (
                                                                        <Badge
                                                                            key={p.uuid}
                                                                            className={`font-mono text-xs ${
                                                                                isActive
                                                                                    ? 'border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]'
                                                                                    : 'border-white/10 bg-white/5 text-[#7a84a0] line-through opacity-70'
                                                                            }`}
                                                                        >
                                                                            <DollarSign className="mr-0.5 size-3" />
                                                                            {formatPriceValue(p.unit_amount, p.currency)}
                                                                            {p.interval && (
                                                                                <span className="ml-1 text-[10px] opacity-80">
                                                                                    /{translateInterval(p.interval)}
                                                                                </span>
                                                                            )}
                                                                            {!isActive && (
                                                                                <span className="ml-1 text-[9px] text-[#ff6b6b] uppercase no-underline">
                                                                                    (inativo)
                                                                                </span>
                                                                            )}
                                                                        </Badge>
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-[#7a84a0]">
                                                                <Coins className="size-3 text-[#22c55e]" />
                                                                <span>
                                                                    {product.prices.length}{' '}
                                                                    {product.prices.length === 1
                                                                        ? 'plano configurado'
                                                                        : 'planos configurados'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : product.default_price ? (
                                                        <Badge className="border-[#c9a227]/40 bg-[#c9a227]/10 font-mono text-xs text-[#c9a227]">
                                                            <Tag className="mr-1 size-3" />
                                                            {product.default_price}
                                                        </Badge>
                                                    ) : (
                                                        <span className="font-mono text-xs text-[#7a84a0]/50 italic">
                                                            Sem preços vinculados
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Benefits */}
                                                <td className="px-6 py-4">
                                                    {product.benefits && product.benefits.length > 0 ? (
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <Badge className="border-[#22c55e]/30 bg-[#22c55e]/10 font-rajdhani text-xs font-semibold text-[#22c55e]">
                                                                <Sparkles className="mr-1 size-3" />
                                                                {product.benefits.length}{' '}
                                                                {product.benefits.length === 1 ? 'benefício' : 'benefícios'}
                                                            </Badge>
                                                            <span className="line-clamp-1 max-w-[160px] text-xs text-[#7a84a0]">
                                                                {product.benefits.map((b) => b.name).join(', ')}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-[#7a84a0]/50 italic">
                                                            Nenhum benefício
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Stripe ID */}
                                                <td className="px-6 py-4">
                                                    {product.id_stripe ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-[#635bff]/40 bg-[#635bff]/10 font-mono text-[11px] text-[#857cf7]"
                                                            >
                                                                {product.id_stripe}
                                                            </Badge>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleCopyStripeId(product.id_stripe!, e)}
                                                                className="text-[#7a84a0] hover:text-white transition-colors"
                                                                title="Copiar Stripe ID"
                                                            >
                                                                {copiedStripeId === product.id_stripe ? (
                                                                    <Check className="size-3.5 text-[#22c55e]" />
                                                                ) : (
                                                                    <Copy className="size-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-[#7a84a0]">—</span>
                                                    )}
                                                </td>

                                                {/* Created Date */}
                                                <td className="px-6 py-4 font-mono text-xs text-[#7a84a0]">
                                                    {formatDate(product.created_at)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleOpenView(product)}
                                                            className="size-8 text-[#7a84a0] hover:bg-[#c9a227]/10 hover:text-[#c9a227]"
                                                            title="Ver detalhes"
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleOpenEdit(product)}
                                                            className="size-8 text-[#7a84a0] hover:bg-[#c9a227]/10 hover:text-white"
                                                            title="Editar produto & Preços"
                                                        >
                                                            <Edit className="size-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleOpenDelete(product)}
                                                            className="size-8 text-[#7a84a0] hover:bg-[#cc2200]/10 hover:text-[#ff6b6b]"
                                                            title="Excluir produto"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.total > products.per_page && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-[#c9a227]/15 bg-[#0a0f1d]/60 px-6 py-4 sm:flex-row">
                                <div className="text-xs text-[#7a84a0]">
                                    Mostrando{' '}
                                    <span className="font-semibold text-white">{products.from || 0}</span> a{' '}
                                    <span className="font-semibold text-white">{products.to || 0}</span> de{' '}
                                    <span className="font-semibold text-white">{products.total}</span> resultados
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {products.links.map((link, idx) => {
                                        if (link.label.includes('Previous') || link.label.includes('Anterior')) {
                                            return (
                                                <Button
                                                    key={idx}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                                    className="border-[#c9a227]/20 bg-[#0d1228] font-rajdhani text-xs font-bold text-[#7a84a0] hover:text-white disabled:opacity-30"
                                                >
                                                    <ChevronLeft className="size-3.5" />
                                                </Button>
                                            );
                                        }
                                        if (link.label.includes('Next') || link.label.includes('Próximo')) {
                                            return (
                                                <Button
                                                    key={idx}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                                    className="border-[#c9a227]/20 bg-[#0d1228] font-rajdhani text-xs font-bold text-[#7a84a0] hover:text-white disabled:opacity-30"
                                                >
                                                    <ChevronRight className="size-3.5" />
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button
                                                key={idx}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                                className={`min-w-[32px] font-mono text-xs ${
                                                    link.active
                                                        ? 'border-[#c9a227] bg-[#c9a227] font-bold text-[#07091a]'
                                                        : 'border-[#c9a227]/20 bg-[#0d1228] text-[#7a84a0] hover:text-white'
                                                }`}
                                            >
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CREATE PRODUCT MODAL */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] w-full max-w-[95vw] sm:max-w-4xl lg:max-w-5xl overflow-y-auto border border-[#c9a227]/30 bg-[#0d1228] p-6 md:p-8 text-white shadow-2xl backdrop-blur-xl">
                    <DialogHeader className="border-b border-[#c9a227]/20 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]">
                                <Package className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Cadastrar Novo Produto
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#7a84a0]">
                                    Defina o título, valor, imagem e os benefícios do produto
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-5 pt-2">
                        {createForm.errors.general && (
                            <div className="flex items-center gap-2 rounded-lg border border-[#cc2200]/40 bg-[#cc2200]/10 p-3 text-xs text-[#ff6b6b]">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{createForm.errors.general}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                    Nome do Produto *
                                </Label>
                                <Input
                                    required
                                    placeholder="Ex: Soberano AI - Acesso Vitalício PRO"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="border-[#c9a227]/30 bg-[#07091a] text-sm text-white focus:border-[#c9a227]"
                                />
                                {createForm.errors.name && (
                                    <span className="text-[11px] text-[#ff6b6b]">{createForm.errors.name}</span>
                                )}
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Descrição
                                </Label>
                                <textarea
                                    rows={3}
                                    placeholder="Descreva as principais características do produto ou plano..."
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className="w-full rounded-md border border-[#c9a227]/30 bg-[#07091a] p-2.5 text-sm text-white placeholder-[#7a84a0] focus:border-[#c9a227] focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
                                />
                                {createForm.errors.description && (
                                    <span className="text-[11px] text-[#ff6b6b]">{createForm.errors.description}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Preço Padrão / Exibição
                                </Label>
                                <Input
                                    placeholder="Ex: R$ 97,00 / mês"
                                    value={createForm.data.default_price}
                                    onChange={(e) => createForm.setData('default_price', e.target.value)}
                                    className="border-[#c9a227]/30 bg-[#07091a] text-sm text-white focus:border-[#c9a227]"
                                />
                                {createForm.errors.default_price && (
                                    <span className="text-[11px] text-[#ff6b6b]">{createForm.errors.default_price}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    URL da Imagem
                                </Label>
                                <Input
                                    placeholder="https://exemplo.com/imagem.png"
                                    value={createForm.data.image}
                                    onChange={(e) => createForm.setData('image', e.target.value)}
                                    className="border-[#c9a227]/30 bg-[#07091a] text-sm text-white focus:border-[#c9a227]"
                                />
                                {createForm.errors.image && (
                                    <span className="text-[11px] text-[#ff6b6b]">{createForm.errors.image}</span>
                                )}
                            </div>
                        </div>

                        {/* Image Preview if provided */}
                        {createForm.data.image && (
                            <div className="flex items-center gap-3 rounded-lg border border-[#c9a227]/20 bg-[#07091a] p-2.5">
                                <img
                                    src={createForm.data.image}
                                    alt="Preview"
                                    className="size-12 rounded object-cover border border-[#c9a227]/30"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                    }}
                                />
                                <div className="text-xs text-[#7a84a0]">
                                    <span className="font-semibold text-white">Prévia da imagem</span>
                                    <p className="line-clamp-1 text-[11px] text-[#7a84a0]">{createForm.data.image}</p>
                                </div>
                            </div>
                        )}

                        {/* Product Benefits Section */}
                        <div className="space-y-3 rounded-xl border border-[#c9a227]/20 bg-[#07091a]/70 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-[#c9a227]" />
                                    <h3 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                        Benefícios do Produto ({createForm.data.benefits.length})
                                    </h3>
                                </div>
                                <Button
                                    type="button"
                                    onClick={addCreateBenefit}
                                    size="sm"
                                    variant="outline"
                                    className="border-[#c9a227]/30 bg-[#c9a227]/10 font-rajdhani text-xs font-bold text-[#c9a227] hover:bg-[#c9a227]/20 hover:text-white"
                                >
                                    <Plus className="mr-1 size-3.5" /> Adicionar Benefício
                                </Button>
                            </div>

                            {createForm.data.benefits.length === 0 ? (
                                <p className="py-2 text-center text-xs text-[#7a84a0] italic">
                                    Nenhum benefício adicionado ainda. Clique em "Adicionar Benefício" para listar as vantagens do produto.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {createForm.data.benefits.map((benefit, idx) => (
                                        <div
                                            key={idx}
                                            className="relative flex flex-col gap-2 rounded-lg border border-[#c9a227]/20 bg-[#0d1228] p-3 transition-colors hover:border-[#c9a227]/40"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-[11px] font-bold text-[#c9a227]">
                                                    #{idx + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCreateBenefit(idx)}
                                                    className="text-[#7a84a0] hover:text-[#ff6b6b] transition-colors"
                                                    title="Remover benefício"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <div>
                                                    <Input
                                                        required
                                                        placeholder="Título do benefício (ex: Acesso Vitalício)"
                                                        value={benefit.name}
                                                        onChange={(e) =>
                                                            updateCreateBenefit(idx, 'name', e.target.value)
                                                        }
                                                        className="border-[#c9a227]/20 bg-[#07091a] text-xs text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        placeholder="Detalhes ou descrição adicional (opcional)"
                                                        value={benefit.description}
                                                        onChange={(e) =>
                                                            updateCreateBenefit(idx, 'description', e.target.value)
                                                        }
                                                        className="border-[#c9a227]/20 bg-[#07091a] text-xs text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="border-t border-[#c9a227]/20 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] hover:brightness-110"
                            >
                                {createForm.processing ? 'Salvando...' : 'Salvar Produto'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT PRODUCT & PRICES MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[90vh] w-full max-w-[95vw] sm:max-w-4xl lg:max-w-5xl overflow-y-auto border border-[#c9a227]/30 bg-[#0d1228] p-6 md:p-8 text-white shadow-2xl backdrop-blur-xl">
                    <DialogHeader className="border-b border-[#c9a227]/20 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]">
                                <Edit className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Editar Produto & Gerenciar Preços
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#7a84a0]">
                                    Atualize dados cadastrais, benefícios e administre os planos e preços Stripe
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 pt-2">
                        {/* Section 1: Dados do Produto Form */}
                        <form onSubmit={handleEditSubmit} className="space-y-5">
                            {editForm.errors.general && (
                                <div className="flex items-center gap-2 rounded-lg border border-[#cc2200]/40 bg-[#cc2200]/10 p-3 text-xs text-[#ff6b6b]">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>{editForm.errors.general}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                        Nome do Produto *
                                    </Label>
                                    <Input
                                        required
                                        placeholder="Ex: Soberano AI - PRO"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="border-[#c9a227]/30 bg-[#07091a] text-sm text-white focus:border-[#c9a227]"
                                    />
                                    {editForm.errors.name && (
                                        <span className="text-[11px] text-[#ff6b6b]">{editForm.errors.name}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                        Descrição
                                    </Label>
                                    <textarea
                                        rows={3}
                                        placeholder="Descreva o produto..."
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        className="w-full rounded-md border border-[#c9a227]/30 bg-[#07091a] p-2.5 text-sm text-white placeholder-[#7a84a0] focus:border-[#c9a227] focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
                                    />
                                    {editForm.errors.description && (
                                        <span className="text-[11px] text-[#ff6b6b]">{editForm.errors.description}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                        Preço Padrão / Exibição
                                    </Label>
                                    <Input
                                        placeholder="Ex: R$ 97,00 / mês"
                                        value={editForm.data.default_price}
                                        onChange={(e) => editForm.setData('default_price', e.target.value)}
                                        className="border-[#c9a227]/30 bg-[#07091a] text-sm text-white focus:border-[#c9a227]"
                                    />
                                    {editForm.errors.default_price && (
                                        <span className="text-[11px] text-[#ff6b6b]">{editForm.errors.default_price}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                        URL da Imagem
                                    </Label>
                                    <Input
                                        placeholder="https://exemplo.com/imagem.png"
                                        value={editForm.data.image}
                                        onChange={(e) => editForm.setData('image', e.target.value)}
                                        className="border-[#c9a227]/30 bg-[#07091a] text-sm text-white focus:border-[#c9a227]"
                                    />
                                    {editForm.errors.image && (
                                        <span className="text-[11px] text-[#ff6b6b]">{editForm.errors.image}</span>
                                    )}
                                </div>
                            </div>

                            {/* Image Preview if provided */}
                            {editForm.data.image && (
                                <div className="flex items-center gap-3 rounded-lg border border-[#c9a227]/20 bg-[#07091a] p-2.5">
                                    <img
                                        src={editForm.data.image}
                                        alt="Preview"
                                        className="size-12 rounded object-cover border border-[#c9a227]/30"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                    <div className="text-xs text-[#7a84a0]">
                                        <span className="font-semibold text-white">Prévia da imagem</span>
                                        <p className="line-clamp-1 text-[11px] text-[#7a84a0]">{editForm.data.image}</p>
                                    </div>
                                </div>
                            )}

                            {/* Product Benefits Section */}
                            <div className="space-y-3 rounded-xl border border-[#c9a227]/20 bg-[#07091a]/70 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-4 text-[#c9a227]" />
                                        <h3 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                            Benefícios do Produto ({editForm.data.benefits.length})
                                        </h3>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addEditBenefit}
                                        size="sm"
                                        variant="outline"
                                        className="border-[#c9a227]/30 bg-[#c9a227]/10 font-rajdhani text-xs font-bold text-[#c9a227] hover:bg-[#c9a227]/20 hover:text-white"
                                    >
                                        <Plus className="mr-1 size-3.5" /> Adicionar Benefício
                                    </Button>
                                </div>

                                {editForm.data.benefits.length === 0 ? (
                                    <p className="py-2 text-center text-xs text-[#7a84a0] italic">
                                        Nenhum benefício adicionado ainda. Clique em "Adicionar Benefício" para listar as vantagens do produto.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {editForm.data.benefits.map((benefit, idx) => (
                                            <div
                                                key={idx}
                                                className="relative flex flex-col gap-2 rounded-lg border border-[#c9a227]/20 bg-[#0d1228] p-3 transition-colors hover:border-[#c9a227]/40"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-[11px] font-bold text-[#c9a227]">
                                                        #{idx + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEditBenefit(idx)}
                                                        className="text-[#7a84a0] hover:text-[#ff6b6b] transition-colors"
                                                        title="Remover benefício"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                    <div>
                                                        <Input
                                                            required
                                                            placeholder="Título do benefício"
                                                            value={benefit.name}
                                                            onChange={(e) =>
                                                                updateEditBenefit(idx, 'name', e.target.value)
                                                            }
                                                            className="border-[#c9a227]/20 bg-[#07091a] text-xs text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            placeholder="Descrição ou detalhes (opcional)"
                                                            value={benefit.description}
                                                            onChange={(e) =>
                                                                updateEditBenefit(idx, 'description', e.target.value)
                                                            }
                                                            className="border-[#c9a227]/20 bg-[#07091a] text-xs text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 border-b border-[#c9a227]/20 pb-4">
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] hover:brightness-110"
                                >
                                    {editForm.processing ? 'Salvando Alterações...' : 'Salvar Dados do Produto'}
                                </Button>
                            </div>
                        </form>

                        {/* Section 2: Gerenciamento de Preços Stripe (Prices Management) */}
                        <div className="space-y-4 rounded-xl border border-[#c9a227]/20 bg-[#07091a]/80 p-5 shadow-lg">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Coins className="size-5 text-[#c9a227]" />
                                        <h3 className="font-rajdhani text-base font-bold uppercase tracking-wider text-white">
                                            Planos & Preços Stripe ({currentProduct?.prices?.length || 0})
                                        </h3>
                                    </div>
                                    <p className="mt-0.5 text-xs text-[#7a84a0]">
                                        Crie novos preços no Stripe, ative/desative ou exclua tabelas de cobrança
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingPrice(!isAddingPrice);
                                        priceForm.reset();
                                    }}
                                    size="sm"
                                    className="border border-[#c9a227] bg-[#c9a227]/20 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227] hover:bg-[#c9a227] hover:text-[#07091a]"
                                >
                                    {isAddingPrice ? (
                                        <>
                                            <X className="mr-1.5 size-3.5" /> Cancelar Preço
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-1.5 size-3.5" /> Criar Novo Preço
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Form to Add New Price */}
                            {isAddingPrice && (
                                <form
                                    onSubmit={handleCreatePrice}
                                    className="space-y-4 rounded-lg border border-[#c9a227]/40 bg-[#0d1228] p-4 animate-in fade-in-50"
                                >
                                    <div className="flex items-center gap-2 border-b border-[#c9a227]/15 pb-2">
                                        <Plus className="size-4 text-[#c9a227]" />
                                        <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                            Novo Preço para "{currentProduct?.name}"
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        {/* Valor */}
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold uppercase text-[#7a84a0]">
                                                Valor (ex: 97.00) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="97.00"
                                                value={priceForm.data.unit_amount}
                                                onChange={(e) => priceForm.setData('unit_amount', e.target.value)}
                                                className="border-[#c9a227]/30 bg-[#07091a] font-mono text-xs text-white"
                                            />
                                            {priceForm.errors.unit_amount && (
                                                <span className="text-[10px] text-[#ff6b6b]">
                                                    {priceForm.errors.unit_amount}
                                                </span>
                                            )}
                                        </div>

                                        {/* Moeda */}
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold uppercase text-[#7a84a0]">
                                                Moeda *
                                            </Label>
                                            <select
                                                value={priceForm.data.currency}
                                                onChange={(e) => priceForm.setData('currency', e.target.value)}
                                                className="w-full rounded-md border border-[#c9a227]/30 bg-[#07091a] px-3 py-2 text-xs font-bold text-white focus:border-[#c9a227] focus:outline-none"
                                            >
                                                <option value="brl">BRL (R$)</option>
                                                <option value="usd">USD ($)</option>
                                                <option value="eur">EUR (€)</option>
                                            </select>
                                        </div>

                                        {/* Tipo */}
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold uppercase text-[#7a84a0]">
                                                Tipo de Cobrança *
                                            </Label>
                                            <select
                                                value={priceForm.data.type}
                                                onChange={(e) => priceForm.setData('type', e.target.value)}
                                                className="w-full rounded-md border border-[#c9a227]/30 bg-[#07091a] px-3 py-2 text-xs font-bold text-white focus:border-[#c9a227] focus:outline-none"
                                            >
                                                <option value="recurring">Recorrente (Assinatura)</option>
                                                <option value="one_time">Avulso (Pagamento Único)</option>
                                            </select>
                                        </div>

                                        {/* Intervalo se recorrente */}
                                        {priceForm.data.type === 'recurring' && (
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold uppercase text-[#7a84a0]">
                                                    Recorrência *
                                                </Label>
                                                <select
                                                    value={priceForm.data.interval}
                                                    onChange={(e) => priceForm.setData('interval', e.target.value)}
                                                    className="w-full rounded-md border border-[#c9a227]/30 bg-[#07091a] px-3 py-2 text-xs font-bold text-white focus:border-[#c9a227] focus:outline-none"
                                                >
                                                    <option value="month">Mensal (/mês)</option>
                                                    <option value="year">Anual (/ano)</option>
                                                    <option value="week">Semanal (/semana)</option>
                                                    <option value="day">Diário (/dia)</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Trial Period */}
                                        {priceForm.data.type === 'recurring' && (
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold uppercase text-[#7a84a0]">
                                                    Dias de Teste (Trial)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Ex: 7"
                                                    value={priceForm.data.trial_period_days}
                                                    onChange={(e) =>
                                                        priceForm.setData('trial_period_days', e.target.value)
                                                    }
                                                    className="border-[#c9a227]/30 bg-[#07091a] font-mono text-xs text-white"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsAddingPrice(false)}
                                            className="font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={priceForm.processing}
                                            className="border border-[#22c55e] bg-[#22c55e] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] hover:bg-[#16a34a]"
                                        >
                                            {priceForm.processing ? (
                                                <>
                                                    <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Criando no Stripe...
                                                </>
                                            ) : (
                                                'Salvar Preço no Stripe'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* Existing Prices List */}
                            {currentProduct?.prices && currentProduct.prices.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {currentProduct.prices.map((price) => {
                                        const isActive = price.active !== false;
                                        const isToggling = togglingPriceId === price.uuid;
                                        const isDeleting = deletingPriceId === price.uuid;

                                        return (
                                            <div
                                                key={price.uuid}
                                                className={`flex flex-col justify-between rounded-lg border p-4 transition-all ${
                                                    isActive
                                                        ? 'border-[#c9a227]/30 bg-[#0d1228] hover:border-[#c9a227]/60'
                                                        : 'border-white/10 bg-[#07091a] opacity-75'
                                                }`}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-lg font-bold text-white">
                                                            {formatPriceValue(price.unit_amount, price.currency)}
                                                        </span>

                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[10px] font-semibold uppercase ${
                                                                    isActive
                                                                        ? 'border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]'
                                                                        : 'border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]'
                                                                }`}
                                                            >
                                                                {isActive ? 'Ativo' : 'Inativo'}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#7a84a0]">
                                                        <span className="flex items-center gap-1 font-mono text-[11px]">
                                                            <Repeat className="size-3 text-[#c9a227]" />
                                                            {price.interval
                                                                ? `Recorrente / ${translateInterval(price.interval)}`
                                                                : 'Pagamento Único'}
                                                        </span>
                                                        {price.trial_period_days && (
                                                            <Badge className="border-[#635bff]/30 bg-[#635bff]/10 font-mono text-[10px] text-[#857cf7]">
                                                                {price.trial_period_days} dias grátis
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1 text-[11px] text-[#7a84a0]">
                                                        <span className="font-mono text-[10px]">
                                                            {price.id_stripe || price.uuid}
                                                        </span>
                                                        {price.id_stripe && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyStripeId(price.id_stripe!)}
                                                                className="text-[#7a84a0] hover:text-white"
                                                                title="Copiar ID"
                                                            >
                                                                {copiedStripeId === price.id_stripe ? (
                                                                    <Check className="size-3 text-[#22c55e]" />
                                                                ) : (
                                                                    <Copy className="size-3" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Price Actions Bar */}
                                                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                                                    {/* Toggle Active Switch */}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={isToggling}
                                                        onClick={() => handleTogglePriceActive(price)}
                                                        className={`font-rajdhani text-[11px] font-bold uppercase transition-all ${
                                                            isActive
                                                                ? 'border-[#ff6b6b]/30 bg-[#ff6b6b]/10 text-[#ff6b6b] hover:bg-[#ff6b6b]/20 hover:text-white'
                                                                : 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 hover:text-white'
                                                        }`}
                                                    >
                                                        {isToggling ? (
                                                            <Loader2 className="mr-1 size-3 animate-spin" />
                                                        ) : (
                                                            <Power className="mr-1 size-3" />
                                                        )}
                                                        {isActive ? 'Desativar' : 'Ativar Preço'}
                                                    </Button>

                                                    {/* Delete Price */}
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={isDeleting}
                                                        onClick={() => handleDeletePrice(price)}
                                                        className="size-8 text-[#7a84a0] hover:bg-[#cc2200]/15 hover:text-[#ff6b6b]"
                                                        title="Excluir preço"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="size-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-[#c9a227]/20 p-6 text-center text-xs text-[#7a84a0]">
                                    <Coins className="mx-auto mb-2 size-6 text-[#c9a227]/40" />
                                    Nenhum plano de preço vinculado a este produto. Clique em{' '}
                                    <strong className="text-white">"Criar Novo Preço"</strong> para adicionar tabelas de cobrança.
                                </div>
                            )}
                        </div>

                        <DialogFooter className="border-t border-[#c9a227]/20 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                                className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                            >
                                Fechar
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* VIEW PRODUCT MODAL */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-h-[90vh] w-full max-w-[95vw] sm:max-w-4xl lg:max-w-5xl overflow-y-auto border border-[#c9a227]/30 bg-[#0d1228] p-6 md:p-8 text-white shadow-2xl backdrop-blur-xl">
                    {selectedProduct && (
                        <>
                            <DialogHeader className="border-b border-[#c9a227]/20 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-[#c9a227]/30 bg-[#07091a]">
                                        {selectedProduct.image ? (
                                            <img
                                                src={selectedProduct.image}
                                                alt={selectedProduct.name}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#c9a227]/20 to-[#0d1228] text-[#c9a227]">
                                                <Package className="size-7" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <DialogTitle className="font-rajdhani text-2xl font-bold uppercase tracking-wider text-white">
                                            {selectedProduct.name}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-[#7a84a0]">
                                            UUID: <span className="font-mono text-[#c9a227]">{selectedProduct.uuid}</span>
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6 pt-2">
                                {/* Basic Details Grid */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-[#c9a227]/20 bg-[#07091a] p-3.5">
                                        <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                            Preço Padrão
                                        </span>
                                        <div className="mt-1">
                                            {selectedProduct.default_price ? (
                                                <Badge className="border-[#c9a227]/40 bg-[#c9a227]/10 font-mono text-sm font-bold text-[#c9a227]">
                                                    {selectedProduct.default_price}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-[#7a84a0]">—</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[#c9a227]/20 bg-[#07091a] p-3.5">
                                        <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                            Identificador Stripe
                                        </span>
                                        <div className="mt-1 flex items-center gap-2">
                                            {selectedProduct.id_stripe ? (
                                                <>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-[#635bff]/40 bg-[#635bff]/10 font-mono text-xs text-[#857cf7]"
                                                    >
                                                        {selectedProduct.id_stripe}
                                                    </Badge>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyStripeId(selectedProduct.id_stripe!)}
                                                        className="text-[#7a84a0] hover:text-white"
                                                    >
                                                        {copiedStripeId === selectedProduct.id_stripe ? (
                                                            <Check className="size-3.5 text-[#22c55e]" />
                                                        ) : (
                                                            <Copy className="size-3.5" />
                                                        )}
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-[#7a84a0]">—</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedProduct.description && (
                                    <div className="rounded-lg border border-[#c9a227]/20 bg-[#07091a] p-4">
                                        <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                            Descrição do Produto
                                        </span>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                            {selectedProduct.description}
                                        </p>
                                    </div>
                                )}

                                {/* Planos & Preços (Stripe Prices List) */}
                                <div className="space-y-3 rounded-lg border border-[#c9a227]/20 bg-[#07091a] p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Coins className="size-4 text-[#c9a227]" />
                                            <h4 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                                Planos & Preços Vinculados ({selectedProduct.prices?.length || 0})
                                            </h4>
                                        </div>
                                        <Badge className="border-[#c9a227]/30 bg-[#c9a227]/10 font-mono text-[10px] text-[#c9a227]">
                                            Stripe Prices
                                        </Badge>
                                    </div>

                                    {selectedProduct.prices && selectedProduct.prices.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {selectedProduct.prices.map((price) => {
                                                const isActive = price.active !== false;
                                                return (
                                                    <div
                                                        key={price.uuid}
                                                        className={`flex flex-col justify-between rounded-lg border p-3.5 transition-colors ${
                                                            isActive
                                                                ? 'border-[#c9a227]/20 bg-[#0d1228] hover:border-[#c9a227]/40'
                                                                : 'border-white/10 bg-[#07091a] opacity-75'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-mono text-base font-bold text-[#c9a227]">
                                                                    {formatPriceValue(price.unit_amount, price.currency)}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-[10px] font-semibold ${
                                                                        isActive
                                                                            ? 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]'
                                                                            : 'border-[#ff6b6b]/30 bg-[#ff6b6b]/10 text-[#ff6b6b]'
                                                                    }`}
                                                                >
                                                                    {isActive
                                                                        ? price.interval
                                                                            ? `Recorrente / ${translateInterval(price.interval)}`
                                                                            : 'Avulso'
                                                                        : 'Inativo'}
                                                                </Badge>
                                                            </div>

                                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#7a84a0]">
                                                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                                                    <Repeat className="size-3 text-[#c9a227]" />
                                                                    {price.interval ? `A cada 1 ${translateInterval(price.interval)}` : 'Cobrança única'}
                                                                </span>
                                                                {price.trial_period_days && (
                                                                    <Badge className="border-[#635bff]/30 bg-[#635bff]/10 font-mono text-[10px] text-[#857cf7]">
                                                                        {price.trial_period_days} dias grátis
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 flex items-center justify-between border-t border-[#c9a227]/10 pt-2 text-[11px] text-[#7a84a0]">
                                                            <span className="font-mono text-[10px] text-[#7a84a0]">
                                                                {price.id_stripe || price.uuid}
                                                            </span>
                                                            {price.id_stripe && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopyStripeId(price.id_stripe!)}
                                                                    className="flex items-center gap-1 text-[#7a84a0] hover:text-white transition-colors"
                                                                    title="Copiar Price ID"
                                                                >
                                                                    {copiedStripeId === price.id_stripe ? (
                                                                        <Check className="size-3 text-[#22c55e]" />
                                                                    ) : (
                                                                        <Copy className="size-3" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[#7a84a0] italic">
                                            Nenhum preço ou plano sincronizado para este produto no momento.
                                        </p>
                                    )}
                                </div>

                                {/* Benefits List */}
                                <div className="space-y-3 rounded-lg border border-[#c9a227]/20 bg-[#07091a] p-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-4 text-[#22c55e]" />
                                        <h4 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                            Lista de Benefícios & Vantagens ({selectedProduct.benefits?.length || 0})
                                        </h4>
                                    </div>

                                    {selectedProduct.benefits && selectedProduct.benefits.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedProduct.benefits.map((benefit, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-[#0d1228] p-3"
                                                >
                                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#22c55e]" />
                                                    <div>
                                                        <span className="font-rajdhani text-sm font-bold text-white">
                                                            {benefit.name}
                                                        </span>
                                                        {benefit.description && (
                                                            <p className="mt-0.5 text-xs text-[#7a84a0]">
                                                                {benefit.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[#7a84a0] italic">
                                            Nenhum benefício vinculado a este produto.
                                        </p>
                                    )}
                                </div>

                                {/* Stripe Raw Data (if available) */}
                                {selectedProduct.data && Object.keys(selectedProduct.data).length > 0 && (
                                    <div className="rounded-lg border border-[#c9a227]/20 bg-[#07091a] p-4">
                                        <div className="flex items-center justify-between pb-2">
                                            <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                                Payload Sincronizado (Stripe / Local)
                                            </span>
                                            <Badge className="border-white/10 bg-white/5 font-mono text-[10px] text-[#7a84a0]">
                                                JSON
                                            </Badge>
                                        </div>
                                        <pre className="max-h-40 overflow-auto rounded bg-[#050711] p-3 font-mono text-[11px] text-[#22c55e]">
                                            {JSON.stringify(selectedProduct.data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="border-t border-[#c9a227]/20 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsViewOpen(false)}
                                    className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                                >
                                    Fechar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setIsViewOpen(false);
                                        handleOpenEdit(selectedProduct);
                                    }}
                                    className="border border-[#c9a227] bg-[#c9a227] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] hover:bg-[#d4af37]"
                                >
                                    <Edit className="mr-1.5 size-3.5" /> Editar
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* DELETE PRODUCT CONFIRMATION MODAL */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="w-full max-w-[95vw] sm:max-w-md border border-[#cc2200]/40 bg-[#0d1228] p-6 text-white shadow-2xl backdrop-blur-xl">
                    <DialogHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg border border-[#cc2200]/40 bg-[#cc2200]/10 text-[#ff6b6b]">
                                <Trash2 className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Excluir Produto
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#7a84a0]">
                                    Esta ação moverá o produto para a lixeira (Soft Delete)
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedProduct && (
                        <div className="space-y-3 py-2 text-sm text-[#7a84a0]">
                            <p>
                                Tem certeza de que deseja excluir o produto{' '}
                                <strong className="text-white">"{selectedProduct.name}"</strong>?
                            </p>
                            <div className="rounded-lg border border-[#cc2200]/30 bg-[#cc2200]/10 p-3 text-xs text-[#ff6b6b]">
                                <AlertCircle className="mb-1 size-4" />
                                Todos os benefícios vinculados a este produto também serão removidos.
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDeleteSubmit}
                            className="border border-[#cc2200] bg-[#cc2200] font-rajdhani text-xs font-bold uppercase tracking-wider text-white hover:bg-[#aa1100]"
                        >
                            Excluir Definitivamente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ProductsIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
