import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Building2,
    Check,
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    Globe,
    Mail,
    MapPin,
    Phone,
    Plus,
    Receipt,
    RefreshCw,
    Search,
    Trash2,
    User,
    UserCheck,
    Users,
    X,
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
import { applyPhoneMask, applyPostalCodeMask, getPhonePlaceholder, getPostalCodePlaceholder } from '@/services/PhoneService';

export interface StripeCountryOption {
    label: string;
    value: string;
    code: string;
    ddi: string;
    dd: string;
    postal_code_regex: string | null;
    phone_regex?: string | null;
}

export interface CustomerItem {
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
    data?: Record<string, unknown> | null;
    created_at?: string;
    updated_at?: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedCustomers {
    data: CustomerItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface PageProps {
    customers: PaginatedCustomers;
    filters: {
        search?: string;
        country?: string;
    };
    metrics: {
        total: number;
        active: number;
        countries: number;
        new_this_month: number;
    };
    availableCountries?: string[];
    stripeCountries?: StripeCountryOption[];
}


const breadcrumbs = [
    {
        title: 'Painel',
        href: '/dashboard',
    },
    {
        title: 'Clientes',
        href: '/customers',
    },
];

export default function CustomersIndex({
    customers,
    filters,
    metrics,
    availableCountries = [],
    stripeCountries = [],
}: PageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCountry, setSelectedCountry] = useState(filters.country || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

    // Form for Create
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        country_code: '+55',
        country: 'BR',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
    });

    // Form for Edit
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        country_code: '+55',
        country: 'BR',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
    });

    const getCountryInfo = (countryVal?: string) => {
        if (!countryVal) return null;
        return (
            stripeCountries.find(
                (c) =>
                    c.value.toUpperCase() === countryVal.toUpperCase() ||
                    c.label.toLowerCase() === countryVal.toLowerCase(),
            ) || null
        );
    };

    const getCountryByDdi = (ddiVal?: string) => {
        if (!ddiVal) return null;
        return stripeCountries.find((c) => c.ddi === ddiVal) || null;
    };

    const getCountryLabel = (countryVal?: string) => {
        if (!countryVal) return '—';
        const info = getCountryInfo(countryVal);
        return info ? `${info.label} (${info.value})` : countryVal;
    };

    const handleCreateDdiChange = (newDdi: string) => {
        const ddiCountry = stripeCountries.find((c) => c.ddi === newDdi);
        const countryCode = ddiCountry?.value || 'BR';
        const remaskedPhone = applyPhoneMask(createForm.data.phone, countryCode);
        createForm.setData((prev) => ({
            ...prev,
            country_code: newDdi,
            phone: remaskedPhone,
        }));
    };

    const handleEditDdiChange = (newDdi: string) => {
        const ddiCountry = stripeCountries.find((c) => c.ddi === newDdi);
        const countryCode = ddiCountry?.value || 'BR';
        const remaskedPhone = applyPhoneMask(editForm.data.phone, countryCode);
        editForm.setData((prev) => ({
            ...prev,
            country_code: newDdi,
            phone: remaskedPhone,
        }));
    };

    const handleCreateCountryChange = (countryCode: string) => {
        const country = stripeCountries.find((c) => c.value === countryCode);
        const remaskedPostalCode = applyPostalCodeMask(
            createForm.data.postal_code,
            countryCode,
            country?.postal_code_regex,
        );
        createForm.setData((prev) => ({
            ...prev,
            country: countryCode,
            postal_code: remaskedPostalCode,
        }));
    };

    const handleEditCountryChange = (countryCode: string) => {
        const country = stripeCountries.find((c) => c.value === countryCode);
        const remaskedPostalCode = applyPostalCodeMask(
            editForm.data.postal_code,
            countryCode,
            country?.postal_code_regex,
        );
        editForm.setData((prev) => ({
            ...prev,
            country: countryCode,
            postal_code: remaskedPostalCode,
        }));
    };

    const selectedCreateCountry = getCountryInfo(createForm.data.country);
    const selectedCreateDdiCountry = getCountryByDdi(createForm.data.country_code);

    const isCreatePostalCodeInvalid = Boolean(
        createForm.data.postal_code &&
        selectedCreateCountry?.postal_code_regex &&
        !new RegExp(selectedCreateCountry.postal_code_regex, 'i').test(createForm.data.postal_code.trim())
    );

    const selectedEditCountry = getCountryInfo(editForm.data.country);
    const selectedEditDdiCountry = getCountryByDdi(editForm.data.country_code);

    const isEditPostalCodeInvalid = Boolean(
        editForm.data.postal_code &&
        selectedEditCountry?.postal_code_regex &&
        !new RegExp(selectedEditCountry.postal_code_regex, 'i').test(editForm.data.postal_code.trim())
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/customers',
            {
                search: searchTerm,
                country: selectedCountry,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCountry('');
        router.get('/customers', {}, { preserveState: true, replace: true });
    };

    const handleOpenEdit = (customer: CustomerItem) => {
        setSelectedCustomer(customer);
        const countryInfo = getCountryInfo(customer.country);
        const countryValue = countryInfo ? countryInfo.value : customer.country || 'BR';
        const ddiInfo = getCountryByDdi(customer.country_code);

        const maskedPostalCode = applyPostalCodeMask(
            customer.postal_code || '',
            countryValue,
            countryInfo?.postal_code_regex,
        );

        const maskedPhone = applyPhoneMask(
            customer.phone || '',
            ddiInfo?.value || countryValue,
        );

        editForm.setData({
            name: customer.name || '',
            email: customer.email || '',
            password: '',
            phone: maskedPhone,
            country_code: customer.country_code || '+55',
            country: countryValue,
            line1: customer.line1 || '',
            line2: customer.line2 || '',
            city: customer.city || '',
            state: customer.state || '',
            postal_code: maskedPostalCode,
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    const handleOpenView = (customer: CustomerItem) => {
        setSelectedCustomer(customer);
        setIsViewOpen(true);
    };

    const handleOpenDelete = (customer: CustomerItem) => {
        setSelectedCustomer(customer);
        setIsDeleteOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/customers', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        editForm.put(`/customers/${selectedCustomer.uuid}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedCustomer(null);
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!selectedCustomer) return;

        router.delete(`/customers/${selectedCustomer.uuid}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedCustomer(null);
            },
        });
    };

    return (
        <>
            <Head title="Gerenciamento de Clientes — SoberanoAI" />

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
                                    <Users className="size-5" />
                                </div>
                                <div>
                                    <h1 className="font-rajdhani text-2xl md:text-3xl font-bold tracking-wide text-white uppercase">
                                        Gerenciamento de <span className="text-[#c9a227]">Clientes</span>
                                    </h1>
                                    <p className="font-sans text-xs md:text-sm text-[#7a84a0]">
                                        Controle administrativo completo de cadastros, endereços e contas
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
                                <Plus className="mr-1.5 size-4" /> Novo Cliente
                            </Button>
                        </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 shadow-lg backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Total de Clientes
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                    <Users className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-rajdhani text-3xl font-bold text-white">
                                    {metrics.total}
                                </span>
                                <span className="font-sans text-xs text-[#22c55e]">cadastrados</span>
                            </div>
                            <div className="mt-2 text-xs text-[#7a84a0]">Base total registrada</div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 shadow-lg backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Clientes Ativos
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]">
                                    <UserCheck className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-rajdhani text-3xl font-bold text-[#22c55e]">
                                    {metrics.active}
                                </span>
                                <span className="font-sans text-xs text-[#7a84a0]">em dia</span>
                            </div>
                            <div className="mt-2 text-xs text-[#7a84a0]">Status operacional ativo</div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 shadow-lg backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Países Atendidos
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#4da6d6]/30 bg-[#4da6d6]/10 text-[#4da6d6]">
                                    <Globe className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-rajdhani text-3xl font-bold text-[#4da6d6]">
                                    {metrics.countries}
                                </span>
                                <span className="font-sans text-xs text-[#7a84a0]">regiões</span>
                            </div>
                            <div className="mt-2 text-xs text-[#7a84a0]">Alcance global</div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 shadow-lg backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#7a84a0]">
                                    Novos este Mês
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                    <Building2 className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-rajdhani text-3xl font-bold text-[#c9a227]">
                                    {metrics.new_this_month}
                                </span>
                                <span className="font-sans text-xs text-[#22c55e]">+ recentes</span>
                            </div>
                            <div className="mt-2 text-xs text-[#7a84a0]">Crescimento corrente</div>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/90 p-4 shadow-lg backdrop-blur-md">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7a84a0]" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nome, email, telefone, cidade, estado ou CEP..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-[#c9a227]/20 bg-[#07091a] pl-10 text-sm text-white placeholder:text-[#525b75] focus:border-[#c9a227]/60 focus:ring-[#c9a227]/20"
                                />
                            </div>

                            {(stripeCountries.length > 0 || availableCountries.length > 0) && (
                                <div className="w-full md:w-56">
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        className="h-9 w-full rounded-md border border-[#c9a227]/20 bg-[#07091a] px-3 font-sans text-sm text-white focus:border-[#c9a227]/60 focus:outline-none"
                                    >
                                        <option value="">Todos os Países</option>
                                        {stripeCountries.length > 0
                                            ? stripeCountries.map((c) => (
                                                <option key={c.value} value={c.value} className="bg-[#07091a] text-white">
                                                    {c.label} ({c.value})
                                                </option>
                                            ))
                                            : availableCountries.map((c) => (
                                                <option key={c} value={c} className="bg-[#07091a] text-white">
                                                    {c}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Button
                                    type="submit"
                                    className="border border-[#c9a227]/50 bg-[#c9a227]/15 font-rajdhani font-bold uppercase tracking-wider text-[#c9a227] hover:bg-[#c9a227]/25"
                                >
                                    <Search className="mr-1.5 size-4" /> Filtrar
                                </Button>
                                {(searchTerm || selectedCountry) && (
                                    <Button
                                        type="button"
                                        onClick={handleClearFilters}
                                        variant="outline"
                                        className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                                    >
                                        <X className="mr-1 size-3.5" /> Limpar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Customers Table */}
                    <div className="overflow-hidden rounded-xl border border-[#c9a227]/25 bg-[#0d1228]/95 shadow-xl backdrop-blur-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-[#c9a227]/20 bg-[#07091a]/80 font-rajdhani text-xs uppercase tracking-wider text-[#7a84a0]">
                                    <tr>
                                        <th className="px-5 py-3.5">Cliente</th>
                                        <th className="px-5 py-3.5">Contato</th>
                                        <th className="px-5 py-3.5">Localização</th>
                                        <th className="px-5 py-3.5">Endereço Principal</th>
                                        <th className="px-5 py-3.5">CEP / Postal</th>
                                        <th className="px-5 py-3.5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#c9a227]/10">
                                    {customers.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                                                    <div className="flex size-14 items-center justify-center rounded-2xl border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#c9a227]">
                                                        <Users className="size-7" />
                                                    </div>
                                                    <h3 className="mt-4 font-rajdhani text-lg font-bold uppercase tracking-wide text-white">
                                                        Nenhum cliente encontrado
                                                    </h3>
                                                    <p className="mt-1 text-center text-xs text-[#7a84a0]">
                                                        {searchTerm || selectedCountry
                                                            ? 'Nenhum resultado corresponde aos filtros aplicados.'
                                                            : 'Comece adicionando seu primeiro cliente ao sistema.'}
                                                    </p>
                                                    <Button
                                                        onClick={() => {
                                                            createForm.reset();
                                                            setIsCreateOpen(true);
                                                        }}
                                                        className="mt-5 border border-[#c9a227] bg-[#c9a227] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] hover:bg-[#a87d15]"
                                                    >
                                                        <Plus className="mr-1.5 size-4" /> Cadastrar Cliente
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        customers.data.map((customer) => {
                                            const initials = (customer.name || 'C')
                                                .split(' ')
                                                .map((n) => n[0])
                                                .slice(0, 2)
                                                .join('')
                                                .toUpperCase();

                                            return (
                                                <tr
                                                    key={customer.uuid}
                                                    className="transition-colors hover:bg-white/[0.02]"
                                                >
                                                    {/* Cliente */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-gradient-to-br from-[#111d40] to-[#07091a] font-rajdhani text-xs font-bold text-[#c9a227] shadow-sm">
                                                                {initials}
                                                            </div>
                                                            <div>
                                                                <div className="font-rajdhani font-bold text-white tracking-wide text-sm">
                                                                    {customer.name || 'Sem Nome'}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-[#7a84a0]">
                                                                    <Mail className="size-3 text-[#c9a227]" />
                                                                    <span>{customer.email || '—'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Contato */}
                                                    <td className="px-5 py-4">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5 font-mono text-xs text-[#e4e6f0]">
                                                                <Phone className="size-3 text-[#22c55e]" />
                                                                <span>
                                                                    {customer.country_code ? `${customer.country_code} ` : ''}
                                                                    {customer.phone || 'Não informado'}
                                                                </span>
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-[#22c55e]/30 bg-[#22c55e]/10 text-[10px] text-[#22c55e]"
                                                            >
                                                                Ativo
                                                            </Badge>
                                                        </div>
                                                    </td>

                                                    {/* Localização */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5 text-xs text-white">
                                                            <MapPin className="size-3.5 text-[#c9a227]" />
                                                            <span>
                                                                {customer.city ? `${customer.city}${customer.state ? `, ${customer.state}` : ''}` : 'Não informado'}
                                                            </span>
                                                        </div>
                                                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#7a84a0]">
                                                            <Globe className="size-3 text-[#4da6d6]" />
                                                            <span>{customer.country ? (customer.country_label || getCountryLabel(customer.country)) : 'Não informado'}</span>
                                                        </div>
                                                    </td>

                                                    {/* Endereço */}
                                                    <td className="px-5 py-4">
                                                        <div className="max-w-[200px] truncate text-xs text-[#e4e6f0]">
                                                            {customer.line1 || 'Não informado'}
                                                        </div>
                                                        {customer.line2 && (
                                                            <div className="max-w-[200px] truncate text-[11px] text-[#7a84a0]">
                                                                {customer.line2}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* CEP */}
                                                    <td className="px-5 py-4">
                                                        <span className="rounded bg-[#07091a] px-2 py-1 font-mono text-xs text-[#c9a227] border border-[#c9a227]/20">
                                                            {customer.postal_code || '—'}
                                                        </span>
                                                    </td>

                                                    {/* Ações */}
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Link
                                                                href={`/customers/${customer.uuid}`}
                                                                className="flex size-8 items-center justify-center rounded-md text-[#7a84a0] transition hover:bg-[#c9a227]/15 hover:text-[#c9a227]"
                                                                title="Gerenciar Assinaturas e Faturas"
                                                            >
                                                                <Receipt className="size-4" />
                                                            </Link>
                                                            <Button
                                                                onClick={() => handleOpenView(customer)}
                                                                size="sm"
                                                                variant="ghost"
                                                                className="size-8 p-0 text-[#7a84a0] hover:bg-[#c9a227]/10 hover:text-[#c9a227]"
                                                                title="Visualizar Detalhes"
                                                            >
                                                                <Eye className="size-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleOpenEdit(customer)}
                                                                size="sm"
                                                                variant="ghost"
                                                                className="size-8 p-0 text-[#7a84a0] hover:bg-[#4da6d6]/10 hover:text-[#4da6d6]"
                                                                title="Editar Cliente"
                                                            >
                                                                <Edit className="size-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleOpenDelete(customer)}
                                                                size="sm"
                                                                variant="ghost"
                                                                className="size-8 p-0 text-[#7a84a0] hover:bg-[#cc2200]/10 hover:text-[#ff6b6b]"
                                                                title="Excluir Cliente"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Bar */}
                        {customers.total > 0 && (
                            <div className="flex flex-col gap-3 border-t border-[#c9a227]/20 bg-[#07091a]/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="font-sans text-xs text-[#7a84a0]">
                                    Mostrando{' '}
                                    <span className="font-semibold text-white">
                                        {customers.from || 0}
                                    </span>{' '}
                                    a{' '}
                                    <span className="font-semibold text-white">
                                        {customers.to || 0}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-semibold text-[#c9a227]">
                                        {customers.total}
                                    </span>{' '}
                                    clientes
                                </div>

                                <div className="flex items-center gap-1">
                                    {customers.links.map((link, index) => {
                                        const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                                        const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                                        const cleanLabel = link.label
                                            .replace('&laquo;', '')
                                            .replace('&raquo;', '')
                                            .replace('Previous', '')
                                            .replace('Next', '')
                                            .trim();

                                        if (!link.url && (isPrev || isNext)) {
                                            return (
                                                <Button
                                                    key={index}
                                                    disabled
                                                    variant="outline"
                                                    size="sm"
                                                    className="size-8 border-white/5 bg-transparent p-0 text-[#525b75] opacity-50"
                                                >
                                                    {isPrev ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                                                </Button>
                                            );
                                        }

                                        return (
                                            <Button
                                                key={index}
                                                onClick={() => link.url && router.visit(link.url)}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                className={`size-8 p-0 font-rajdhani text-xs font-bold ${link.active
                                                        ? 'border-[#c9a227] bg-[#c9a227] text-[#07091a] hover:bg-[#a87d15]'
                                                        : 'border-white/10 bg-white/5 text-[#7a84a0] hover:text-white'
                                                    }`}
                                            >
                                                {cleanLabel}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CREATE CUSTOMER MODAL */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl border border-[#c9a227]/30 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl sm:max-w-2xl">
                    <DialogHeader className="border-b border-[#c9a227]/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]">
                                <Plus className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Cadastrar <span className="text-[#c9a227]">Novo Cliente</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#7a84a0]">
                                    Preencha os dados de contato e endereço do cliente
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        {createForm.errors.general && (
                            <div className="rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 p-3 text-xs text-[#ff6b6b]">
                                {createForm.errors.general}
                            </div>
                        )}
                        <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-3">
                            <h4 className="mb-3 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                Identificação & Contato
                            </h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Nome Completo *</Label>
                                    <Input
                                        required
                                        placeholder="Ex: João da Silva"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {createForm.errors.name && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {createForm.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Email *</Label>
                                    <Input
                                        type="email"
                                        required
                                        placeholder="cliente@email.com"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {createForm.errors.email && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {createForm.errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Senha de Acesso *</Label>
                                    <Input
                                        type="password"
                                        required
                                        minLength={8}
                                        placeholder="Mínimo 8 caracteres"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {createForm.errors.password && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {createForm.errors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">DDI / Código do País *</Label>
                                    {stripeCountries.length > 0 ? (
                                        <select
                                            required
                                            value={createForm.data.country_code}
                                            onChange={(e) => handleCreateDdiChange(e.target.value)}
                                            className="mt-1 flex h-9 w-full rounded-md border border-[#c9a227]/20 bg-[#0d1228] px-3 font-sans text-sm text-white focus:border-[#c9a227]/60 focus:outline-none"
                                        >
                                            {stripeCountries.map((c) => (
                                                <option key={`create-ddi-${c.value}`} value={c.ddi} className="bg-[#0d1228] text-white">
                                                    {c.ddi} — {c.label} ({c.value})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            required
                                            placeholder="+55"
                                            value={createForm.data.country_code}
                                            onChange={(e) => createForm.setData('country_code', e.target.value)}
                                            className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                        />
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-[#7a84a0]">Telefone / Celular *</Label>
                                        {selectedCreateDdiCountry && (
                                            <span className="font-mono text-[10px] text-[#22c55e]">
                                                {selectedCreateDdiCountry.ddi}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        required
                                        placeholder={getPhonePlaceholder(selectedCreateDdiCountry?.value || createForm.data.country)}
                                        value={createForm.data.phone}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'phone',
                                                applyPhoneMask(
                                                    e.target.value,
                                                    selectedCreateDdiCountry?.value || createForm.data.country,
                                                ),
                                            )
                                        }
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {createForm.errors.phone && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {createForm.errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-3">
                            <h4 className="mb-3 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                Endereço & Localização (Opcional)
                            </h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label className="text-xs text-[#7a84a0]">País (Opcional)</Label>
                                    {stripeCountries.length > 0 ? (
                                        <select
                                            value={createForm.data.country}
                                            onChange={(e) => handleCreateCountryChange(e.target.value)}
                                            className="mt-1 flex h-9 w-full rounded-md border border-[#c9a227]/20 bg-[#0d1228] px-3 font-sans text-sm text-white focus:border-[#c9a227]/60 focus:outline-none"
                                        >
                                            <option value="">
                                                Selecione um país (opcional)
                                            </option>
                                            {stripeCountries.map((c) => (
                                                <option key={`create-country-${c.value}`} value={c.value} className="bg-[#0d1228] text-white">
                                                    {c.label} ({c.value})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            placeholder="Ex: Brasil ou BR"
                                            value={createForm.data.country}
                                            onChange={(e) => createForm.setData('country', e.target.value)}
                                            className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                        />
                                    )}
                                    {createForm.errors.country && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {createForm.errors.country}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-[#7a84a0]">CEP / Código Postal (Opcional)</Label>
                                        {selectedCreateCountry && (
                                            <span className="font-mono text-[10px] text-[#c9a227]">
                                                {selectedCreateCountry.value}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        placeholder={getPostalCodePlaceholder(createForm.data.country)}
                                        value={createForm.data.postal_code}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'postal_code',
                                                applyPostalCodeMask(
                                                    e.target.value,
                                                    createForm.data.country,
                                                    selectedCreateCountry?.postal_code_regex,
                                                ),
                                            )
                                        }
                                        className={`mt-1 bg-[#0d1228] text-sm text-white ${isCreatePostalCodeInvalid
                                                ? 'border-[#f59e0b] focus:border-[#f59e0b]'
                                                : 'border-[#c9a227]/20'
                                            }`}
                                    />
                                    {createForm.errors.postal_code && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {createForm.errors.postal_code}
                                        </p>
                                    )}
                                    {isCreatePostalCodeInvalid && (
                                        <p className="mt-1 text-[10px] text-[#f59e0b]">
                                            Aviso: O CEP não corresponde ao padrão esperado para {selectedCreateCountry?.label}.
                                        </p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <Label className="text-xs text-[#7a84a0]">Endereço (Linha 1) (Opcional)</Label>
                                    <Input
                                        placeholder="Rua, Av, Número"
                                        value={createForm.data.line1}
                                        onChange={(e) => createForm.setData('line1', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {createForm.errors.line1 && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {createForm.errors.line1}
                                        </p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <Label className="text-xs text-[#7a84a0]">Complemento (Linha 2)</Label>
                                    <Input
                                        placeholder="Apto, Bloco, Sala (opcional)"
                                        value={createForm.data.line2}
                                        onChange={(e) => createForm.setData('line2', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Cidade (Opcional)</Label>
                                    <Input
                                        placeholder="São Paulo"
                                        value={createForm.data.city}
                                        onChange={(e) => createForm.setData('city', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {createForm.errors.city && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {createForm.errors.city}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Estado / UF (Opcional)</Label>
                                    <Input
                                        placeholder="SP"
                                        value={createForm.data.state}
                                        onChange={(e) => createForm.setData('state', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {createForm.errors.state && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {createForm.errors.state}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
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
                                className="border border-[#c9a227] bg-[#c9a227] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] hover:bg-[#a87d15]"
                            >
                                {createForm.processing ? 'Salvando...' : 'Cadastrar Cliente'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT CUSTOMER MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl border border-[#c9a227]/30 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl sm:max-w-2xl">
                    <DialogHeader className="border-b border-[#c9a227]/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg border border-[#4da6d6]/40 bg-[#4da6d6]/10 text-[#4da6d6]">
                                <Edit className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Editar <span className="text-[#c9a227]">Cliente</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#7a84a0]">
                                    Atualize os dados cadastrais do cliente
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                        {editForm.errors.general && (
                            <div className="rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 p-3 text-xs text-[#ff6b6b]">
                                {editForm.errors.general}
                            </div>
                        )}
                        <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-3">
                            <h4 className="mb-3 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                Identificação & Contato
                            </h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Nome Completo *</Label>
                                    <Input
                                        required
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {editForm.errors.name && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {editForm.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Email *</Label>
                                    <Input
                                        type="email"
                                        required
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {editForm.errors.email && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {editForm.errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Nova Senha (Opcional)</Label>
                                    <Input
                                        type="password"
                                        minLength={8}
                                        placeholder="Deixe em branco para manter a atual"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {editForm.errors.password && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {editForm.errors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">DDI / Código do País *</Label>
                                    {stripeCountries.length > 0 ? (
                                        <select
                                            required
                                            value={editForm.data.country_code}
                                            onChange={(e) => handleEditDdiChange(e.target.value)}
                                            className="mt-1 flex h-9 w-full rounded-md border border-[#c9a227]/20 bg-[#0d1228] px-3 font-sans text-sm text-white focus:border-[#c9a227]/60 focus:outline-none"
                                        >
                                            {stripeCountries.map((c) => (
                                                <option key={`edit-ddi-${c.value}`} value={c.ddi} className="bg-[#0d1228] text-white">
                                                    {c.ddi} — {c.label} ({c.value})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            required
                                            value={editForm.data.country_code}
                                            onChange={(e) => editForm.setData('country_code', e.target.value)}
                                            className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                        />
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-[#7a84a0]">Telefone / Celular *</Label>
                                        {selectedEditDdiCountry && (
                                            <span className="font-mono text-[10px] text-[#22c55e]">
                                                {selectedEditDdiCountry.ddi}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        required
                                        placeholder={getPhonePlaceholder(selectedEditDdiCountry?.value || editForm.data.country)}
                                        value={editForm.data.phone}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'phone',
                                                applyPhoneMask(
                                                    e.target.value,
                                                    selectedEditDdiCountry?.value || editForm.data.country,
                                                ),
                                            )
                                        }
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                    {editForm.errors.phone && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {editForm.errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-3">
                            <h4 className="mb-3 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                                Endereço & Localização (Opcional)
                            </h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label className="text-xs text-[#7a84a0]">País (Opcional)</Label>
                                    {stripeCountries.length > 0 ? (
                                        <select
                                            value={editForm.data.country || ''}
                                            onChange={(e) => handleEditCountryChange(e.target.value)}
                                            className="mt-1 flex h-9 w-full rounded-md border border-[#c9a227]/20 bg-[#0d1228] px-3 font-sans text-sm text-white focus:border-[#c9a227]/60 focus:outline-none"
                                        >
                                            <option value="">
                                                Selecione um país (opcional)
                                            </option>
                                            {stripeCountries.map((c) => (
                                                <option key={`edit-country-${c.value}`} value={c.value} className="bg-[#0d1228] text-white">
                                                    {c.label} ({c.value})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            value={editForm.data.country}
                                            onChange={(e) => editForm.setData('country', e.target.value)}
                                            className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                        />
                                    )}
                                    {editForm.errors.country && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {editForm.errors.country}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-[#7a84a0]">CEP / Código Postal (Opcional)</Label>
                                        {selectedEditCountry && (
                                            <span className="font-mono text-[10px] text-[#c9a227]">
                                                {selectedEditCountry.value}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        placeholder={getPostalCodePlaceholder(editForm.data.country)}
                                        value={editForm.data.postal_code}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'postal_code',
                                                applyPostalCodeMask(
                                                    e.target.value,
                                                    editForm.data.country,
                                                    selectedEditCountry?.postal_code_regex,
                                                ),
                                            )
                                        }
                                        className={`mt-1 bg-[#0d1228] text-sm text-white ${isEditPostalCodeInvalid
                                                ? 'border-[#f59e0b] focus:border-[#f59e0b]'
                                                : 'border-[#c9a227]/20'
                                            }`}
                                    />
                                    {editForm.errors.postal_code && (
                                        <p className="mt-1 text-[11px] text-[#ff6b6b]">
                                            {editForm.errors.postal_code}
                                        </p>
                                    )}
                                    {isEditPostalCodeInvalid && (
                                        <p className="mt-1 text-[10px] text-[#f59e0b]">
                                            Aviso: O CEP não corresponde ao padrão esperado para {selectedEditCountry?.label}.
                                        </p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <Label className="text-xs text-[#7a84a0]">Endereço (Linha 1) (Opcional)</Label>
                                    <Input
                                        value={editForm.data.line1}
                                        onChange={(e) => editForm.setData('line1', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label className="text-xs text-[#7a84a0]">Complemento (Linha 2)</Label>
                                    <Input
                                        value={editForm.data.line2}
                                        onChange={(e) => editForm.setData('line2', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Cidade (Opcional)</Label>
                                    <Input
                                        value={editForm.data.city}
                                        onChange={(e) => editForm.setData('city', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-[#7a84a0]">Estado / UF (Opcional)</Label>
                                    <Input
                                        value={editForm.data.state}
                                        onChange={(e) => editForm.setData('state', e.target.value)}
                                        className="mt-1 border-[#c9a227]/20 bg-[#0d1228] text-sm text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                                className="border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="border border-[#c9a227] bg-[#c9a227] font-rajdhani text-xs font-bold uppercase tracking-wider text-[#07091a] hover:bg-[#a87d15]"
                            >
                                {editForm.processing ? 'Atualizando...' : 'Salvar Alterações'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* VIEW CUSTOMER MODAL */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-lg border border-[#c9a227]/30 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl sm:max-w-lg">
                    <DialogHeader className="border-b border-[#c9a227]/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]">
                                <User className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Detalhes do <span className="text-[#c9a227]">Cliente</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#7a84a0]">
                                    UUID: {selectedCustomer?.uuid}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedCustomer && (
                        <div className="space-y-4 pt-2">
                            <div className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-xl border border-[#c9a227]/40 bg-[#c9a227]/10 font-rajdhani text-base font-bold text-[#c9a227]">
                                        {(selectedCustomer.name || 'C')
                                            .split(' ')
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-rajdhani text-lg font-bold text-white">
                                            {selectedCustomer.name || 'Sem Nome'}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-[#7a84a0]">
                                            <Mail className="size-3 text-[#c9a227]" />
                                            <span>{selectedCustomer.email || '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                    <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">Telefone</span>
                                    <div className="mt-1 flex items-center gap-1 font-mono text-xs text-white">
                                        <Phone className="size-3 text-[#22c55e]" />
                                        <span>
                                            {selectedCustomer.country_code ? `${selectedCustomer.country_code} ` : ''}
                                            {selectedCustomer.phone || 'Não informado'}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                    <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">País</span>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-white">
                                        <Globe className="size-3 text-[#4da6d6]" />
                                        <span className="font-semibold">{selectedCustomer.country_label || getCountryLabel(selectedCustomer.country)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-white/5 bg-[#07091a]/40 p-3">
                                <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">Endereço Completo</span>
                                <div className="mt-1 space-y-0.5 text-xs text-[#e4e6f0]">
                                    <p className="font-semibold text-white">{selectedCustomer.line1}</p>
                                    {selectedCustomer.line2 && <p className="text-[#7a84a0]">{selectedCustomer.line2}</p>}
                                    <p className="text-[#7a84a0]">
                                        {selectedCustomer.city}, {selectedCustomer.state} — CEP: {selectedCustomer.postal_code}
                                    </p>
                                </div>
                            </div>

                            {selectedCustomer.id_stripe && (
                                <div className="rounded-lg border border-[#c9a227]/20 bg-[#07091a]/40 p-3">
                                    <span className="text-[11px] uppercase tracking-wider text-[#7a84a0]">ID Stripe</span>
                                    <div className="mt-1 font-mono text-xs text-[#c9a227]">
                                        {selectedCustomer.id_stripe}
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="flex items-center justify-between gap-2 pt-2 sm:justify-between">
                                <Link
                                    href={`/customers/${selectedCustomer.uuid}`}
                                    className="flex items-center gap-1.5 rounded-md border border-[#c9a227]/40 bg-[#c9a227]/15 px-3 py-1.5 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227] transition hover:bg-[#c9a227]/25"
                                >
                                    <Receipt className="size-3.5" /> Gerenciar Assinaturas & Faturas
                                </Link>
                                <Button
                                    type="button"
                                    onClick={() => setIsViewOpen(false)}
                                    className="border border-white/10 bg-white/5 font-rajdhani text-xs font-bold uppercase text-[#7a84a0] hover:text-white"
                                >
                                    Fechar
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION MODAL */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md border border-[#cc2200]/30 bg-[#0d1228] text-[#e4e6f0] shadow-2xl backdrop-blur-xl sm:max-w-md">
                    <DialogHeader className="border-b border-[#cc2200]/20 pb-3 text-left">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg border border-[#cc2200]/40 bg-[#cc2200]/10 text-[#ff6b6b]">
                                <Trash2 className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Excluir <span className="text-[#ff6b6b]">Cliente</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[#7a84a0]">
                                    Esta ação não poderá ser desfeita
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3 py-2 text-sm text-[#7a84a0]">
                        <p>
                            Tem certeza que deseja remover o cliente{' '}
                            <strong className="text-white">{selectedCustomer?.name || selectedCustomer?.uuid}</strong>?
                        </p>
                        <p className="text-xs text-[#ff6b6b]/80">
                            Todos os dados associados a este cliente serão excluídos do sistema.
                        </p>
                    </div>

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

CustomersIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
