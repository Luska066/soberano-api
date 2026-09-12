import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Bot,
    Check,
    CheckCircle,
    Copy,
    CreditCard,
    Crosshair,
    Download,
    Eye,
    HardDrive,
    Key,
    LayoutDashboard,
    Lock,
    Package,
    RefreshCw,
    Settings,
    Shield,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

type TabType = 'overview' | 'models' | 'license' | 'downloads' | 'settings';

interface InstalledModel {
    id: string;
    name: string;
    game: string;
    ver: string;
    status: 'Ativo' | 'Pausado';
    precision: number;
    latency: string;
    color: string;
    lastUpdate: string;
}

const INITIAL_MODELS: InstalledModel[] = [
    {
        id: 'cs2',
        name: 'SOBERANO-CS2',
        game: 'Counter-Strike 2',
        ver: 'v3.1.0',
        status: 'Ativo',
        precision: 94.2,
        latency: '0.28ms',
        color: '#c9a227',
        lastUpdate: '19/08/2026',
    },
    {
        id: 'vlr',
        name: 'SOBERANO-VLR',
        game: 'VALORANT',
        ver: 'v2.9.4',
        status: 'Ativo',
        precision: 96.8,
        latency: '0.31ms',
        color: '#cc2200',
        lastUpdate: '18/08/2026',
    },
    {
        id: 'apx',
        name: 'SOBERANO-APX',
        game: 'Apex Legends',
        ver: 'v2.5.2',
        status: 'Pausado',
        precision: 91.5,
        latency: '0.35ms',
        color: '#4da6d6',
        lastUpdate: '14/07/2026',
    },
];

const AVAILABLE_MODELS = [
    {
        name: 'SOBERANO-COD',
        game: 'Call of Duty: BO6',
        ver: 'v1.8.0',
        color: '#8b5cf6',
    },
    {
        name: 'SOBERANO-FN',
        game: 'Fortnite',
        ver: 'v2.2.1',
        color: '#22c55e',
    },
    {
        name: 'SOBERANO-R6',
        game: 'Rainbow Six Siege',
        ver: 'v1.5.3',
        color: '#f97316',
    },
];

const RECENT_ACTIVITIES = [
    {
        time: 'Hoje, 14:32',
        event: 'Sessão iniciada',
        game: 'Counter-Strike 2',
        duration: '2h 14min',
        active: true,
    },
    {
        time: 'Hoje, 11:05',
        event: 'Modelo atualizado',
        game: 'VALORANT v2.9.4',
        duration: '—',
        active: false,
    },
    {
        time: 'Ontem, 21:48',
        event: 'Sessão iniciada',
        game: 'VALORANT',
        duration: '3h 07min',
        active: false,
    },
    {
        time: 'Ontem, 18:20',
        event: 'Sessão iniciada',
        game: 'Counter-Strike 2',
        duration: '1h 52min',
        active: false,
    },
    {
        time: '17/08, 22:10',
        event: 'Login efetuado',
        game: '—',
        duration: '—',
        active: false,
    },
];

interface LicenseData {
    key: string;
    plan: string;
    plan_name: string;
    status: string;
    hwid: string;
    days_remaining: number;
    expires_at: string | null;
    activated_at: string | null;
}

interface DashboardProps {
    license?: LicenseData | null;
}

export default function Dashboard({ license }: DashboardProps) {
    const { auth } = usePage().props as any;
    const userName = auth?.user?.name || 'Comandante';
    const userEmail = auth?.user?.email || 'cliente@soberano.ai';

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [models, setModels] = useState<InstalledModel[]>(INITIAL_MODELS);
    const [copiedKey, setCopiedKey] = useState(false);
    const [savedProfile, setSavedProfile] = useState(false);
    const [displayName, setDisplayName] = useState(userName);

    const licenseKey = license?.key || 'NENHUMA-LICENCA-ATIVA';

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash === 'modelos') setActiveTab('models');
            else if (hash === 'licenca') setActiveTab('license');
            else if (hash === 'downloads') setActiveTab('downloads');
            else if (hash === 'configuracoes') setActiveTab('settings');
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(licenseKey);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const toggleModelStatus = (id: string) => {
        setModels((prev) =>
            prev.map((m) =>
                m.id === id
                    ? {
                          ...m,
                          status: m.status === 'Ativo' ? 'Pausado' : 'Ativo',
                      }
                    : m,
            ),
        );
    };

    return (
        <>
            <Head title="Painel de Controle — SoberanoAIM" />

            <div className="relative min-h-screen bg-[#07091a] p-4 md:p-8">
                {/* Background 60px grid pattern */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-80"
                    style={{
                        backgroundImage: `linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                    {/* Navigation Tabs Bar */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-[#c9a227]/20 pb-4">
                        {[
                            { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
                            { id: 'models', label: 'Modelos IA', icon: Bot },
                            { id: 'license', label: 'Licença & Hardware', icon: CreditCard },
                            { id: 'downloads', label: 'Downloads & Setup', icon: Download },
                            { id: 'settings', label: 'Configurações', icon: Settings },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`flex items-center gap-2 rounded-md px-4 py-2 font-rajdhani text-sm font-bold uppercase tracking-wider transition-all ${
                                        isActive
                                            ? 'border border-[#c9a227]/50 bg-[#c9a227]/15 text-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.2)]'
                                            : 'text-[#7a84a0] hover:bg-white/5 hover:text-[#e4e6f0]'
                                    }`}
                                >
                                    <Icon className={`size-4 ${isActive ? 'text-[#c9a227]' : 'text-[#7a84a0]'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* TAB 1: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Welcome Banner */}
                            <div className="rounded-xl border border-[#c9a227]/25 bg-gradient-to-r from-[#0d1228] to-[#111d40] p-6 shadow-lg backdrop-blur-md">
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h1 className="font-rajdhani text-3xl font-bold tracking-wide text-white">
                                            Olá, <span className="text-[#c9a227]">{userName}</span>
                                        </h1>
                                        <p className="font-sans text-sm text-[#7a84a0]">
                                            Painel de controle operacional — Plano{' '}
                                            <span className="font-mono text-xs font-semibold text-[#c9a227] uppercase">
                                                Sovereign
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            onClick={() => setActiveTab('downloads')}
                                            className="border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] font-rajdhani font-bold uppercase tracking-widest text-[#07091a] shadow-[0_0_15px_rgba(201,162,39,0.3)] hover:brightness-110"
                                        >
                                            <Download className="mr-2 size-4" /> Baixar Loader v4.2
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* 4 Stat Cards */}
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-5 backdrop-blur-md">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                            Modelos Ativos
                                        </span>
                                        <Bot className="size-5 text-[#c9a227]" />
                                    </div>
                                    <div className="mt-3 font-rajdhani text-3xl font-bold text-white">2</div>
                                    <div className="font-sans text-xs text-[#7a84a0]">de 4 incluídos no plano</div>
                                </div>

                                <div className="rounded-xl border border-[#4da6d6]/20 bg-[#0d1228]/80 p-5 backdrop-blur-md">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                            Sessões (Mês)
                                        </span>
                                        <Activity className="size-5 text-[#4da6d6]" />
                                    </div>
                                    <div className="mt-3 font-rajdhani text-3xl font-bold text-[#4da6d6]">47</div>
                                    <div className="font-sans text-xs text-green-400">+12% vs mês anterior</div>
                                </div>

                                <div className="rounded-xl border border-green-500/20 bg-[#0d1228]/80 p-5 backdrop-blur-md">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                            Licença
                                        </span>
                                        <Shield className="size-5 text-green-400" />
                                    </div>
                                    <div className="mt-3 font-rajdhani text-3xl font-bold text-green-400">ATIVA</div>
                                    <div className="font-sans text-xs text-[#7a84a0]">Vence em 12/09/2026</div>
                                </div>

                                <div className="rounded-xl border border-[#8b5cf6]/20 bg-[#0d1228]/80 p-5 backdrop-blur-md">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                            Latência Média
                                        </span>
                                        <Zap className="size-5 text-[#8b5cf6]" />
                                    </div>
                                    <div className="mt-3 font-rajdhani text-3xl font-bold text-[#8b5cf6]">0.30ms</div>
                                    <div className="font-sans text-xs text-[#7a84a0]">Última sessão calibrada</div>
                                </div>
                            </div>

                            {/* Section: Meus Modelos & Atividade Recente */}
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Meus Modelos */}
                                <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md lg:col-span-2">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                            Meus Modelos IA
                                        </h2>
                                        <button
                                            onClick={() => setActiveTab('models')}
                                            className="font-mono text-xs text-[#c9a227] hover:underline"
                                        >
                                            Ver todos →
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {models.map((model) => (
                                            <div
                                                key={model.id}
                                                className="flex flex-col gap-3 rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-4 transition-all hover:border-[#c9a227]/40 md:flex-row md:items-center md:justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex size-10 items-center justify-center rounded-lg border"
                                                        style={{
                                                            borderColor: `${model.color}50`,
                                                            backgroundColor: `${model.color}15`,
                                                        }}
                                                    >
                                                        <Crosshair className="size-5" style={{ color: model.color }} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-rajdhani text-base font-bold text-white">
                                                                {model.game}
                                                            </span>
                                                            <span
                                                                className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                                                                style={{
                                                                    backgroundColor: `${model.color}20`,
                                                                    color: model.color,
                                                                }}
                                                            >
                                                                {model.ver}
                                                            </span>
                                                        </div>
                                                        <span className="font-mono text-xs text-[#7a84a0]">
                                                            {model.name}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="w-28 space-y-1">
                                                        <div className="flex justify-between font-mono text-[11px]">
                                                            <span className="text-[#7a84a0]">Precisão</span>
                                                            <span className="font-bold text-white">{model.precision}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-white/10">
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{
                                                                    width: `${model.precision}%`,
                                                                    backgroundColor: model.color,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="font-mono text-xs text-[#7a84a0]">
                                                        {model.latency}
                                                    </div>

                                                    <div className="flex items-center gap-1.5 font-mono text-xs">
                                                        <span
                                                            className={`size-2 rounded-full ${
                                                                model.status === 'Ativo'
                                                                    ? 'bg-green-400 shadow-[0_0_8px_#22c55e]'
                                                                    : 'bg-orange-400'
                                                            }`}
                                                        />
                                                        <span
                                                            className={
                                                                model.status === 'Ativo'
                                                                    ? 'text-green-400'
                                                                    : 'text-orange-400'
                                                            }
                                                        >
                                                            {model.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Atividade Recente */}
                                <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md">
                                    <h2 className="mb-4 font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                        Atividade Recente
                                    </h2>

                                    <div className="space-y-3">
                                        {RECENT_ACTIVITIES.map((act, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 border-b border-[#c9a227]/10 pb-3 last:border-0 last:pb-0"
                                            >
                                                <span
                                                    className={`mt-1.5 size-2 rounded-full ${
                                                        act.active
                                                            ? 'bg-green-400 shadow-[0_0_6px_#22c55e]'
                                                            : 'bg-[#2a3050]'
                                                    }`}
                                                />
                                                <div className="flex-1 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-white">{act.event}</span>
                                                        {act.duration !== '—' && (
                                                            <span className="font-mono text-[#c9a227]">
                                                                {act.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-0.5 flex items-center justify-between text-[#7a84a0]">
                                                        <span>{act.game}</span>
                                                        <span className="font-mono text-[10px]">{act.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: MODELS */}
                    {activeTab === 'models' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-rajdhani text-2xl font-bold uppercase tracking-wider text-white">
                                    Modelos Instalados
                                </h2>
                                <p className="font-sans text-sm text-[#7a84a0]">
                                    Gerencie e calibre os modelos neurais ativos na sua máquina.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                {models.map((model) => (
                                    <div
                                        key={model.id}
                                        className="rounded-xl border border-[#c9a227]/25 bg-[#0d1228]/80 p-5 backdrop-blur-md"
                                    >
                                        <div className="flex items-center justify-between border-b border-[#c9a227]/15 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex size-10 items-center justify-center rounded-lg"
                                                    style={{
                                                        backgroundColor: `${model.color}15`,
                                                        border: `1px solid ${model.color}40`,
                                                    }}
                                                >
                                                    <Bot className="size-5" style={{ color: model.color }} />
                                                </div>
                                                <div>
                                                    <h3 className="font-rajdhani text-lg font-bold text-white">
                                                        {model.game}
                                                    </h3>
                                                    <span className="font-mono text-xs text-[#7a84a0]">
                                                        {model.ver} · {model.lastUpdate}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="my-4 space-y-3">
                                            <div>
                                                <div className="mb-1 flex justify-between font-mono text-xs">
                                                    <span className="text-[#7a84a0]">Precisão Neural</span>
                                                    <span className="font-bold text-white">{model.precision}%</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-white/10">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${model.precision}%`,
                                                            backgroundColor: model.color,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between font-mono text-xs">
                                                <span className="text-[#7a84a0]">Latência de Injeção:</span>
                                                <span className="font-bold text-[#4da6d6]">{model.latency}</span>
                                            </div>

                                            <div className="flex justify-between font-mono text-xs">
                                                <span className="text-[#7a84a0]">Status Atual:</span>
                                                <span
                                                    className={`font-bold ${
                                                        model.status === 'Ativo' ? 'text-green-400' : 'text-orange-400'
                                                    }`}
                                                >
                                                    {model.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleModelStatus(model.id)}
                                                className={`flex-1 font-rajdhani font-bold uppercase tracking-wider ${
                                                    model.status === 'Ativo'
                                                        ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10'
                                                        : 'border-green-500/40 text-green-400 hover:bg-green-500/10'
                                                }`}
                                            >
                                                {model.status === 'Ativo' ? 'Pausar' : 'Ativar'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-[#c9a227]/30 font-rajdhani text-xs uppercase tracking-wider text-[#c9a227] hover:bg-[#c9a227]/10"
                                            >
                                                <RefreshCw className="mr-1 size-3" /> Atualizar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <h3 className="mb-3 font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Disponíveis no Seu Plano
                                </h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {AVAILABLE_MODELS.map((model, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-xl border border-[#c9a227]/15 bg-[#0d1228]/60 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex size-9 items-center justify-center rounded-lg"
                                                    style={{
                                                        backgroundColor: `${model.color}15`,
                                                        border: `1px solid ${model.color}40`,
                                                    }}
                                                >
                                                    <Bot className="size-4" style={{ color: model.color }} />
                                                </div>
                                                <div>
                                                    <h4 className="font-rajdhani text-base font-bold text-white">
                                                        {model.game}
                                                    </h4>
                                                    <span className="font-mono text-xs text-[#7a84a0]">
                                                        {model.ver}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                style={{ borderColor: `${model.color}50`, color: model.color }}
                                                className="font-rajdhani font-bold uppercase tracking-wider hover:bg-white/5"
                                            >
                                                + Instalar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: LICENSE & HARDWARE */}
                    {activeTab === 'license' && (
                        <div className="space-y-6">
                            {/* Plan Card */}
                            <div className="rounded-xl border border-[#c9a227]/40 bg-gradient-to-r from-[#0d1228] via-[#111d40] to-[#0d1228] p-6 shadow-xl backdrop-blur-md">
                                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                    <div>
                                        <span className="font-mono text-xs uppercase tracking-widest text-[#7a84a0]">
                                            Plano Ativo
                                        </span>
                                        <h2 className="font-rajdhani text-4xl font-bold tracking-wider text-white">
                                            {license?.plan_name ? license.plan_name.toUpperCase() : 'SEM PLANO ATIVO'}
                                        </h2>
                                        <div className="mt-1 flex items-center gap-2 font-mono text-xs text-green-400">
                                            <span className={`size-2 rounded-full ${license?.status === 'active' ? 'bg-green-400 shadow-[0_0_8px_#22c55e]' : 'bg-orange-400'}`} />
                                            <span>
                                                {license
                                                    ? `${license.status === 'active' ? 'Ativa' : 'Inativa'} — ${license.expires_at ? `Expira em ${license.expires_at} (${license.days_remaining} dias restantes)` : 'Aguardando Primeiro Login'}`
                                                    : 'Adquira uma assinatura para gerar sua chave'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start gap-3 md:items-end">
                                        <div className="text-left md:text-right">
                                            <span className="font-rajdhani text-4xl font-bold text-[#c9a227]">
                                                R$ 149
                                            </span>
                                            <span className="font-sans text-xs text-[#7a84a0]">
                                                /mês · cobrança automática
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="border-[#c9a227]/40 font-rajdhani text-xs uppercase tracking-wider text-[#c9a227] hover:bg-[#c9a227]/10"
                                            >
                                                Alterar Plano
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-red-500/30 font-rajdhani text-xs uppercase tracking-wider text-red-400 hover:bg-red-500/10"
                                            >
                                                Gerenciar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* License Key Box */}
                            <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <Key className="size-5 text-[#c9a227]" />
                                    <h3 className="font-rajdhani text-lg font-bold uppercase tracking-wider text-white">
                                        Chave de Licença (HWID Bound)
                                    </h3>
                                </div>
                                <p className="font-sans text-xs text-[#7a84a0] mb-4">
                                    Utilize esta chave no Loader para autenticar seus modelos autorizados.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <div className="w-full flex-1 rounded-lg border border-[#c9a227]/30 bg-[#07091a] p-3 font-mono text-sm tracking-widest text-[#c9a227]">
                                        {licenseKey}
                                    </div>
                                    <Button
                                        onClick={copyToClipboard}
                                        className={`w-full sm:w-auto font-rajdhani font-bold uppercase tracking-wider ${
                                            copiedKey
                                                ? 'bg-green-500 text-black hover:bg-green-400'
                                                : 'border border-[#c9a227] bg-[#c9a227] text-[#07091a] hover:bg-[#d4af37]'
                                        }`}
                                    >
                                        {copiedKey ? (
                                            <>
                                                <Check className="mr-1.5 size-4" /> Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-1.5 size-4" /> Copiar Chave
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Authorized Hardware */}
                            <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md">
                                <h3 className="mb-4 font-rajdhani text-lg font-bold uppercase tracking-wider text-white">
                                    Hardware Autorizado (2 / 2 slots)
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex flex-col gap-2 rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <HardDrive className="size-5 text-[#c9a227]" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-rajdhani font-bold text-white">
                                                        {license?.hwid && license.hwid !== 'GLOBAL' ? 'PC Vinculado' : 'Aguardando Primeiro Login'}
                                                    </span>
                                                    <span className="rounded bg-[#c9a227]/15 px-1.5 py-0.5 font-mono text-[10px] text-[#c9a227]">
                                                        {license?.hwid || 'GLOBAL (Livre)'}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs text-[#7a84a0]">
                                                    {license?.app_version ? `Versão do App: ${license.app_version}` : 'Compatível com Windows 10/11 & Linux'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 font-mono text-xs text-green-400">
                                            <span className="size-2 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e]" />
                                            <span>Online (Agora)</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <HardDrive className="size-5 text-[#7a84a0]" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-rajdhani font-bold text-white">
                                                        PC Secundário
                                                    </span>
                                                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[#7a84a0]">
                                                        HW-002
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs text-[#7a84a0]">
                                                    Windows 10 64-bit
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 font-mono text-xs text-[#7a84a0]">
                                            <span className="size-2 rounded-full bg-[#7a84a0]" />
                                            <span>Offline (12/08/2026)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: DOWNLOADS */}
                    {activeTab === 'downloads' && (
                        <div className="space-y-6">
                            {/* Security Notice */}
                            <div className="rounded-xl border border-[#c9a227]/30 bg-[#c9a227]/10 p-5 backdrop-blur-md">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 size-5 text-[#c9a227]" />
                                    <div className="text-xs">
                                        <h4 className="font-rajdhani text-sm font-bold tracking-wide uppercase text-white">
                                            Aviso de Segurança & Execução
                                        </h4>
                                        <p className="mt-1 text-[#7a84a0]">
                                            Para evitar falsos positivos de heurística em drivers de bypass no nível de kernel, adicione a pasta de instalação às exceções do Windows Defender antes de descompactar.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Files Table */}
                            <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md">
                                <h3 className="mb-4 font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Arquivos de Instalação Oficiais
                                </h3>

                                <div className="space-y-3">
                                    {[
                                        {
                                            name: 'SoberanoAIM Loader',
                                            ver: 'v4.2.1',
                                            size: '18.4 MB',
                                            date: '19/08/2026',
                                            required: true,
                                        },
                                        {
                                            name: 'Driver de Injeção Kernel',
                                            ver: 'v2.0.8',
                                            size: '4.1 MB',
                                            date: '15/08/2026',
                                            required: true,
                                        },
                                        {
                                            name: 'Painel de Configuração GUI',
                                            ver: 'v3.5.2',
                                            size: '9.7 MB',
                                            date: '10/08/2026',
                                            required: false,
                                        },
                                        {
                                            name: 'Manual do Usuário (PDF)',
                                            ver: 'v1.0.0',
                                            size: '2.3 MB',
                                            date: '01/08/2026',
                                            required: false,
                                        },
                                    ].map((file, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col gap-3 rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10">
                                                    <Package className="size-5 text-[#c9a227]" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-rajdhani text-base font-bold text-white">
                                                            {file.name}
                                                        </span>
                                                        <span className="rounded bg-[#c9a227]/15 px-1.5 py-0.5 font-mono text-[10px] text-[#c9a227]">
                                                            {file.ver}
                                                        </span>
                                                        {file.required && (
                                                            <span className="rounded bg-green-500/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-green-400 uppercase">
                                                                Obrigatório
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="font-mono text-xs text-[#7a84a0]">
                                                        {file.size} · Atualizado em {file.date}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                className="border border-[#c9a227] bg-[#c9a227] font-rajdhani font-bold uppercase tracking-wider text-[#07091a] hover:bg-[#d4af37]"
                                            >
                                                <Download className="mr-1.5 size-3.5" /> Baixar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Installation Steps */}
                            <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md">
                                <h3 className="mb-4 font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Guia Rápido de Instalação
                                </h3>

                                <div className="grid gap-3 sm:grid-cols-5">
                                    {[
                                        'Desative o antivírus temporariamente antes de descompactar.',
                                        'Instale o Driver de Injeção como Administrador e reinicie o PC.',
                                        'Execute o Loader como Administrador e cole sua chave de licença.',
                                        'Abra o Painel de Configuração e selecione o jogo desejado.',
                                        'Inicie sua partida e desfrute da precisão neural.',
                                    ].map((step, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-lg border border-[#c9a227]/15 bg-[#07091a]/40 p-4"
                                        >
                                            <div className="mb-2 flex size-6 items-center justify-center rounded bg-[#c9a227] font-rajdhani text-sm font-bold text-[#07091a]">
                                                {idx + 1}
                                            </div>
                                            <p className="font-sans text-xs text-[#7a84a0]">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: SETTINGS */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl space-y-6">
                            {/* Profile Form */}
                            <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md">
                                <h3 className="mb-4 font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Perfil do Usuário
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                            Nome de Exibição
                                        </label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="mt-1 w-full rounded-md border border-[#c9a227]/25 bg-[#07091a] p-2.5 font-sans text-sm text-white focus:border-[#c9a227] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-mono text-xs uppercase tracking-wider text-[#7a84a0]">
                                            E-mail Cadastrado
                                        </label>
                                        <input
                                            type="email"
                                            disabled
                                            value={userEmail}
                                            className="mt-1 w-full cursor-not-allowed rounded-md border border-[#c9a227]/15 bg-[#07091a]/50 p-2.5 font-sans text-sm text-[#7a84a0]"
                                        />
                                    </div>

                                    <Button
                                        onClick={() => {
                                            setSavedProfile(true);
                                            setTimeout(() => setSavedProfile(false), 2000);
                                        }}
                                        className={`font-rajdhani font-bold uppercase tracking-wider ${
                                            savedProfile
                                                ? 'bg-green-500 text-black hover:bg-green-400'
                                                : 'border border-[#c9a227] bg-[#c9a227] text-[#07091a] hover:bg-[#d4af37]'
                                        }`}
                                    >
                                        {savedProfile ? '✓ Salvo!' : 'Salvar Alterações'}
                                    </Button>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md">
                                <h3 className="mb-4 font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
                                    Segurança & Acesso
                                </h3>

                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-lg border border-[#c9a227]/15 bg-[#07091a]/40 p-3.5 transition-colors hover:border-[#c9a227]/40"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Lock className="size-4 text-[#c9a227]" />
                                            <span className="font-rajdhani text-sm font-semibold uppercase tracking-wide text-white">
                                                Alterar Senha de Acesso
                                            </span>
                                        </div>
                                        <span className="text-xs text-[#7a84a0]">→</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-lg border border-[#c9a227]/15 bg-[#07091a]/40 p-3.5 transition-colors hover:border-[#c9a227]/40"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield className="size-4 text-[#4da6d6]" />
                                            <span className="font-rajdhani text-sm font-semibold uppercase tracking-wide text-white">
                                                Autenticação em Dois Fatores (2FA)
                                            </span>
                                        </div>
                                        <span className="font-mono text-xs text-green-400">Ativado</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Painel Sovereign',
            href: dashboard(),
        },
    ],
};

