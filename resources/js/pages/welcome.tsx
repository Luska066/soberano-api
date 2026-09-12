import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowRight,
    Bot,
    CheckCircle,
    Crosshair,
    Eye,
    Lock,
    Menu,
    Shield,
    Star,
    Target,
    X,
    Zap,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, register } from '@/routes';

const MODELS_DATA = [
    {
        id: 'cs2',
        name: 'SOBERANO-CS2',
        game: 'Counter-Strike 2',
        ver: 'v3.1.0',
        precision: 94.2,
        latency: '0.28ms',
        type: 'Humanizado',
        color: '#c9a227',
    },
    {
        id: 'vlr',
        name: 'SOBERANO-VLR',
        game: 'VALORANT',
        ver: 'v2.9.4',
        precision: 96.8,
        latency: '0.31ms',
        type: 'Agressivo',
        color: '#cc2200',
    },
    {
        id: 'apx',
        name: 'SOBERANO-APX',
        game: 'Apex Legends',
        ver: 'v2.5.2',
        precision: 91.5,
        latency: '0.35ms',
        type: 'Suave',
        color: '#4da6d6',
    },
    {
        id: 'cod',
        name: 'SOBERANO-COD',
        game: 'Call of Duty: BO6',
        ver: 'v1.8.0',
        precision: 93.1,
        latency: '0.29ms',
        type: 'Balanceado',
        color: '#8b5cf6',
    },
    {
        id: 'fn',
        name: 'SOBERANO-FN',
        game: 'Fortnite',
        ver: 'v2.2.1',
        precision: 88.7,
        latency: '0.41ms',
        type: 'Humanizado',
        color: '#22c55e',
    },
    {
        id: 'r6',
        name: 'SOBERANO-R6',
        game: 'Rainbow Six Siege',
        ver: 'v1.5.3',
        precision: 95.0,
        latency: '0.26ms',
        type: 'Preciso',
        color: '#f97316',
    },
];

const FEATURES_DATA = [
    {
        title: 'Rastreamento Neural',
        desc: 'Redes neurais profundas com predição de movimento em tempo real e micro-ajustes cinemáticos.',
        icon: Target,
        color: '#c9a227',
    },
    {
        title: 'Latência Sub-ms',
        desc: 'Pipeline assíncrono otimizado em C++/Rust executando em menos de 0.30ms sem overhead de frame.',
        icon: Zap,
        color: '#cc2200',
    },
    {
        title: 'Anti-Detecção Total',
        desc: 'Execução isolada em Ring 0 com virtualização de inputs e bypass seguro de heurísticas.',
        icon: Shield,
        color: '#4da6d6',
    },
    {
        title: 'Perfis Dinâmicos',
        desc: 'Configurações personalizadas por arma, mapa e estilo de mira (legit, semi-rage e humanizado).',
        icon: Activity,
        color: '#8b5cf6',
    },
    {
        title: 'Visão Computacional',
        desc: 'Detecção de inimigos e bones por IA de última geração com suporte a ultra-wide e 360Hz.',
        icon: Eye,
        color: '#22c55e',
    },
    {
        title: 'Licença por Hardware',
        desc: 'Vínculo seguro por HWID com transferências simplificadas e painel web centralizado.',
        icon: Lock,
        color: '#f97316',
    },
];

const TESTIMONIALS_DATA = [
    {
        name: 'Lucas M.',
        rank: 'Global Elite · CS2',
        time: 'Cliente há 8 meses',
        text: 'Melhor investimento que fiz nos últimos anos. O modelo do CS2 é absurdamente natural. Ninguém percebe, parece que melhorei do nada.',
    },
    {
        name: 'Igor R.',
        rank: 'Radiante · VALORANT',
        time: 'Cliente há 14 meses',
        text: 'Testei vários softwares similares. O SoberanoAIM é o único que sobrevive aos updates do Vanguard com estabilidade. Suporte é rápido e resolutivo.',
    },
    {
        name: 'Pedro V.',
        rank: 'Predator · Apex Legends',
        time: 'Cliente há 5 meses',
        text: 'Plano Sovereign vale cada centavo. Uso 3 modelos diferentes e todos estão com latência impecável. Deploy em menos de 2 minutos.',
    },
];

interface AiModelItem {
    id: number;
    model_id: number;
    filename: string;
    title: string;
    game_name: string;
    resolution: string;
    fps: number;
    latency_ms: number;
    soberano_score: number;
    tier: string;
    has_headshot: boolean;
    downloads: number;
    rating: number;
    min_plan: string;
}

interface WelcomeProps {
    aiModels?: AiModelItem[];
}

export default function Welcome({ aiModels }: WelcomeProps) {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');

    const displayModels = (aiModels && aiModels.length > 0)
        ? aiModels.map(m => {
            const gameLower = m.game_name.toLowerCase();
            let color = '#c9a227';
            if (gameLower.includes('valorant')) color = '#cc2200';
            else if (gameLower.includes('fortnite')) color = '#22c55e';
            else if (gameLower.includes('apex')) color = '#4da6d6';
            else if (gameLower.includes('warzone') || gameLower.includes('cod')) color = '#8b5cf6';
            else if (gameLower.includes('roblox')) color = '#f97316';

            return {
                id: m.model_id.toString(),
                name: m.title,
                game: m.game_name,
                ver: `${m.resolution} · ${m.fps} FPS`,
                precision: Math.min(Math.round(m.soberano_score > 0 ? m.soberano_score : 95), 100),
                latency: `${m.latency_ms}ms`,
                type: m.has_headshot ? '🎯 Headshot' : m.tier,
                color,
            };
        })
        : MODELS_DATA;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="relative min-h-screen bg-[#07091a] text-[#e4e6f0] selection:bg-[#c9a227] selection:text-[#07091a]">
            <Head title="SoberanoAIM — Domine Cada Partida" />

            {/* Background 60px grid pattern */}
            <div
                className="pointer-events-none fixed inset-0 opacity-100"
                style={{
                    backgroundImage: `linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* NAVBAR */}
            <header
                className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'border-b border-[#c9a227]/20 bg-[#07091a]/95 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur-md'
                        : 'bg-transparent py-5'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="transition-transform hover:scale-105">
                        <AppLogo />
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden items-center gap-8 md:flex">
                        <a
                            href="#produto"
                            className="font-rajdhani text-sm font-semibold uppercase tracking-wider text-[#7a84a0] transition-colors hover:text-[#c9a227]"
                        >
                            Produto
                        </a>
                        <a
                            href="#modelos-ia"
                            className="font-rajdhani text-sm font-semibold uppercase tracking-wider text-[#7a84a0] transition-colors hover:text-[#c9a227]"
                        >
                            Modelos IA
                        </a>
                        <a
                            href="#recursos"
                            className="font-rajdhani text-sm font-semibold uppercase tracking-wider text-[#7a84a0] transition-colors hover:text-[#c9a227]"
                        >
                            Recursos
                        </a>
                        <a
                            href="#precos"
                            className="font-rajdhani text-sm font-semibold uppercase tracking-wider text-[#7a84a0] transition-colors hover:text-[#c9a227]"
                        >
                            Preços
                        </a>
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden items-center gap-3 md:flex">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="flex items-center gap-2 rounded-md border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] px-4 py-2 font-rajdhani text-sm font-bold uppercase tracking-wider text-[#07091a] shadow-[0_0_15px_rgba(201,162,39,0.3)] hover:brightness-110"
                            >
                                Acessar Painel →
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-md border border-[#c9a227]/40 px-4 py-2 font-rajdhani text-sm font-bold uppercase tracking-wider text-[#c9a227] transition-all hover:border-[#c9a227] hover:bg-[#c9a227]/10"
                                >
                                    Login
                                </Link>
                                <a
                                    href="#precos"
                                    className="rounded-md border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] px-4 py-2 font-rajdhani text-sm font-bold uppercase tracking-wider text-[#07091a] shadow-[0_0_15px_rgba(201,162,39,0.3)] transition-all hover:brightness-110"
                                >
                                    Comprar Agora
                                </a>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="flex md:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-md border border-[#c9a227]/30 p-2 text-[#c9a227]"
                        >
                            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {mobileMenuOpen && (
                    <div className="border-b border-[#c9a227]/20 bg-[#07091a] p-6 md:hidden">
                        <div className="flex flex-col gap-4 font-rajdhani text-base font-bold uppercase tracking-wider">
                            <a
                                href="#produto"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[#7a84a0] hover:text-[#c9a227]"
                            >
                                Produto
                            </a>
                            <a
                                href="#modelos-ia"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[#7a84a0] hover:text-[#c9a227]"
                            >
                                Modelos IA
                            </a>
                            <a
                                href="#recursos"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[#7a84a0] hover:text-[#c9a227]"
                            >
                                Recursos
                            </a>
                            <a
                                href="#precos"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[#7a84a0] hover:text-[#c9a227]"
                            >
                                Preços
                            </a>
                            <div className="mt-4 flex flex-col gap-3">
                                <Link
                                    href={login()}
                                    className="rounded-md border border-[#c9a227]/40 py-2.5 text-center text-[#c9a227]"
                                >
                                    Área do Cliente
                                </Link>
                                <a
                                    href="#precos"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-md bg-[#c9a227] py-2.5 text-center text-[#07091a]"
                                >
                                    Comprar Agora
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="relative z-10 pt-24">
                {/* 1. HERO SECTION */}
                <section className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                    <div className="grid w-full items-center gap-12 py-12 md:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a227]/30 bg-[#0d1228] px-3.5 py-1.5 font-mono text-xs text-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.15)]">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
                                </span>
                                <span>Sistema Online · v4.2.1</span>
                            </div>

                            <h1 className="font-rajdhani text-5xl font-bold leading-none tracking-tight uppercase sm:text-6xl lg:text-7xl">
                                DOMINE <br />
                                <span className="text-[#c9a227] drop-shadow-[0_0_25px_rgba(201,162,39,0.4)]">
                                    CADA
                                </span>{' '}
                                <br />
                                PARTIDA
                            </h1>

                            <p className="max-w-xl font-sans text-base leading-relaxed text-[#7a84a0] sm:text-lg">
                                Tecnologia de visão computacional e redes neurais avançadas executadas em tempo real.
                                Precisão cirúrgica sem interferência de memória e indetectável por sistemas anti-cheat.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <a
                                    href="#precos"
                                    className="flex items-center gap-2 rounded-md border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] px-6 py-3 font-rajdhani text-base font-bold uppercase tracking-widest text-[#07091a] shadow-[0_0_25px_rgba(201,162,39,0.35)] transition-all hover:scale-105 hover:brightness-110"
                                >
                                    Começar Agora <ArrowRight className="size-5" />
                                </a>
                                <a
                                    href="#modelos-ia"
                                    className="flex items-center gap-2 rounded-md border border-[#c9a227]/40 bg-[#0d1228]/80 px-6 py-3 font-rajdhani text-base font-bold uppercase tracking-widest text-[#c9a227] backdrop-blur-md transition-all hover:border-[#c9a227] hover:bg-[#c9a227]/10"
                                >
                                    Ver Modelos IA
                                </a>
                            </div>

                            {/* 3 Stats Row */}
                            <div className="grid grid-cols-3 gap-4 border-t border-[#c9a227]/15 pt-8">
                                <div>
                                    <div className="font-rajdhani text-3xl font-bold text-[#c9a227]">12K+</div>
                                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#7a84a0]">
                                        Usuários Ativos
                                    </div>
                                </div>
                                <div>
                                    <div className="font-rajdhani text-3xl font-bold text-white">0.3ms</div>
                                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#7a84a0]">
                                        Latência Média
                                    </div>
                                </div>
                                <div>
                                    <div className="font-rajdhani text-3xl font-bold text-green-400">99.8%</div>
                                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#7a84a0]">
                                        Uptime Garantido
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column / Mascot Shield Display */}
                        <div className="relative flex items-center justify-center">
                            {/* Radial Glow */}
                            <div className="absolute size-72 rounded-full bg-[#1a2a5e]/50 blur-[90px] sm:size-96" />

                            <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl border border-[#c9a227]/30 bg-[#0d1228]/80 p-8 shadow-[0_0_50px_rgba(201,162,39,0.15)] backdrop-blur-xl">
                                <div className="mb-6 flex size-36 items-center justify-center rounded-2xl border border-[#c9a227]/40 bg-[#07091a] p-4 shadow-[0_0_30px_rgba(201,162,39,0.3)]">
                                    <AppLogoIcon className="size-28" />
                                </div>

                                <div className="text-center">
                                    <span className="font-mono text-xs uppercase tracking-widest text-[#4da6d6]">
                                        Neural Engine Core
                                    </span>
                                    <h3 className="mt-1 font-rajdhani text-2xl font-bold tracking-wider text-white">
                                        SOBERANO ARCHITECTURE
                                    </h3>
                                    <p className="mt-2 font-sans text-xs text-[#7a84a0]">
                                        Treinado em mais de 500.000 horas de gameplay profissional em taxa de 240 FPS.
                                    </p>
                                </div>

                                <div className="mt-6 w-full space-y-2 rounded-lg border border-[#c9a227]/15 bg-[#07091a]/60 p-3 font-mono text-xs">
                                    <div className="flex justify-between text-[#7a84a0]">
                                        <span>Detecção de Alvo</span>
                                        <span className="font-bold text-green-400">0.12ms</span>
                                    </div>
                                    <div className="flex justify-between text-[#7a84a0]">
                                        <span>Interpolação de Curva</span>
                                        <span className="font-bold text-[#c9a227]">Bezier Dinâmica</span>
                                    </div>
                                    <div className="flex justify-between text-[#7a84a0]">
                                        <span>Status Anti-Cheat</span>
                                        <span className="font-bold text-green-400">Undetected (Kernel Bypass)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. PRODUCTS SECTION */}
                <section id="produto" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <span className="font-mono text-xs uppercase tracking-widest text-[#c9a227]">
                            Arquitetura de Produtos
                        </span>
                        <h2 className="mt-2 font-rajdhani text-4xl font-bold uppercase tracking-wider text-white sm:text-5xl">
                            Soluções de Alto Desempenho
                        </h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Card 1 — Highlight */}
                        <div className="relative rounded-2xl border border-[#c9a227]/50 bg-gradient-to-br from-[#0d1228] to-[#111d40] p-8 shadow-[0_0_30px_rgba(201,162,39,0.15)]">
                            <div className="flex items-center justify-between">
                                <div className="flex size-12 items-center justify-center rounded-xl border border-[#c9a227]/40 bg-[#c9a227]/15 text-[#c9a227]">
                                    <Crosshair className="size-6" />
                                </div>
                                <span className="rounded bg-[#c9a227]/20 px-2.5 py-1 font-mono text-xs font-bold text-[#c9a227] uppercase tracking-wider">
                                    Software Principal
                                </span>
                            </div>

                            <h3 className="mt-6 font-rajdhani text-2xl font-bold uppercase text-white">
                                AIM Assist Pro (Kernel Engine)
                            </h3>
                            <p className="mt-2 font-sans text-sm text-[#7a84a0]">
                                Driver avançado de baixo nível que processa frames brutos do monitor e simula comandos
                                físicos de mouse com curvas humanizadas ajustáveis.
                            </p>

                            <ul className="my-6 space-y-2.5 font-sans text-sm text-[#e4e6f0]">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#c9a227]" /> Suporte a resoluções até 4K e 360Hz
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#c9a227]" /> Isolamento completo sem tocar na memória do jogo
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#c9a227]" /> Compatível com CS2, VALORANT, Apex, COD e mais
                                </li>
                            </ul>

                            <a
                                href="#precos"
                                className="block w-full rounded-md border border-[#c9a227] bg-[#c9a227] py-3 text-center font-rajdhani text-base font-bold uppercase tracking-widest text-[#07091a] shadow-lg shadow-[#c9a227]/20 hover:brightness-110"
                            >
                                Adquirir Licença Pro →
                            </a>
                        </div>

                        {/* Card 2 — Marketplace */}
                        <div className="relative rounded-2xl border border-[#c9a227]/20 bg-[#0d1228]/70 p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex size-12 items-center justify-center rounded-xl border border-[#4da6d6]/40 bg-[#4da6d6]/15 text-[#4da6d6]">
                                    <Bot className="size-6" />
                                </div>
                                <span className="rounded bg-[#4da6d6]/20 px-2.5 py-1 font-mono text-xs font-bold text-[#4da6d6] uppercase tracking-wider">
                                    Modelos IA
                                </span>
                            </div>

                            <h3 className="mt-6 font-rajdhani text-2xl font-bold uppercase text-white">
                                Marketplace de Pesos Neurais
                            </h3>
                            <p className="mt-2 font-sans text-sm text-[#7a84a0]">
                                Modelos pré-treinados e refinados para cada título competitivo. Baixe e alterne pesos
                                em tempo real através do nosso loader oficial.
                            </p>

                            <ul className="my-6 space-y-2.5 font-sans text-sm text-[#e4e6f0]">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#4da6d6]" /> Atualizações semanais contra mudanças de hitbox
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#4da6d6]" /> Perfis dedicados para Rifles, Snipers e Pistols
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#4da6d6]" /> Calibração automática de sensibilidade
                                </li>
                            </ul>

                            <a
                                href="#modelos-ia"
                                className="block w-full rounded-md border border-[#4da6d6]/50 bg-transparent py-3 text-center font-rajdhani text-base font-bold uppercase tracking-widest text-[#4da6d6] hover:bg-[#4da6d6]/10"
                            >
                                Explorar Modelos IA →
                            </a>
                        </div>
                    </div>
                </section>

                {/* 3. MODELS SECTION */}
                <section id="modelos-ia" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <span className="font-mono text-xs uppercase tracking-widest text-[#c9a227]">
                            Catálogo Neural
                        </span>
                        <h2 className="mt-2 font-rajdhani text-4xl font-bold uppercase tracking-wider text-white sm:text-5xl">
                            Modelos Oficiais Disponíveis
                        </h2>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {displayModels.map((model) => (
                            <div
                                key={model.id}
                                className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a227]/50 hover:shadow-[0_0_25px_rgba(201,162,39,0.15)]"
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                                        style={{ backgroundColor: `${model.color}18`, color: model.color }}
                                    >
                                        {model.type}
                                    </span>
                                    <span className="font-mono text-xs text-[#7a84a0]">{model.ver}</span>
                                </div>

                                <h3 className="mt-4 font-rajdhani text-2xl font-bold text-white">{model.game}</h3>
                                <p className="font-mono text-xs" style={{ color: model.color }}>
                                    {model.name}
                                </p>

                                <div className="my-6 space-y-3">
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
                                        <span className="text-[#7a84a0]">Latência de Resposta</span>
                                        <span className="font-bold text-[#4da6d6]">{model.latency}</span>
                                    </div>
                                </div>

                                <a
                                    href="#precos"
                                    className="block w-full rounded-md border py-2.5 text-center font-rajdhani text-sm font-bold uppercase tracking-widest transition-colors hover:bg-white/5"
                                    style={{ borderColor: `${model.color}50`, color: model.color }}
                                >
                                    Adquirir Modelo
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. FEATURES SECTION */}
                <section id="recursos" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <span className="font-mono text-xs uppercase tracking-widest text-[#c9a227]">
                            Engenharia de Ponta
                        </span>
                        <h2 className="mt-2 font-rajdhani text-4xl font-bold uppercase tracking-wider text-white sm:text-5xl">
                            Por Que Escolher o SoberanoAIM?
                        </h2>
                    </div>

                    <div className="grid gap-px bg-[#c9a227]/15 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES_DATA.map((feat, idx) => {
                            const Icon = feat.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-[#07091a] p-8 transition-colors hover:bg-[#0d1228]"
                                >
                                    <div
                                        className="flex size-12 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: `${feat.color}15` }}
                                    >
                                        <Icon className="size-6" style={{ color: feat.color }} />
                                    </div>
                                    <h3 className="mt-4 font-rajdhani text-xl font-bold uppercase text-white">
                                        {feat.title}
                                    </h3>
                                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#7a84a0]">
                                        {feat.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 5. PRICING SECTION */}
                <section id="precos" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <span className="font-mono text-xs uppercase tracking-widest text-[#c9a227]">
                            Planos de Acesso
                        </span>
                        <h2 className="mt-2 font-rajdhani text-4xl font-bold uppercase tracking-wider text-white sm:text-5xl">
                            Escolha Sua Vantagem Competitiva
                        </h2>

                        {/* Billing Cycle Toggle */}
                        <div className="mt-6 inline-flex items-center rounded-full border border-[#c9a227]/30 bg-[#0d1228] p-1">
                            <button
                                type="button"
                                onClick={() => setBillingCycle('mensal')}
                                className={`rounded-full px-5 py-1.5 font-rajdhani text-sm font-bold uppercase tracking-wider transition-all ${
                                    billingCycle === 'mensal'
                                        ? 'bg-[#c9a227] text-[#07091a]'
                                        : 'text-[#7a84a0] hover:text-white'
                                }`}
                            >
                                Mensal
                            </button>
                            <button
                                type="button"
                                onClick={() => setBillingCycle('anual')}
                                className={`rounded-full px-5 py-1.5 font-rajdhani text-sm font-bold uppercase tracking-wider transition-all ${
                                    billingCycle === 'anual'
                                        ? 'bg-[#c9a227] text-[#07091a]'
                                        : 'text-[#7a84a0] hover:text-white'
                                }`}
                            >
                                Anual <span className="text-[10px] text-green-400">−33%</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {/* STARTER */}
                        <div className="relative rounded-2xl border border-[#4da6d6]/30 bg-[#0d1228]/80 p-8 backdrop-blur-md">
                            <h3 className="font-rajdhani text-2xl font-bold uppercase text-white">Starter</h3>
                            <p className="font-sans text-xs text-[#7a84a0]">Ideal para 1 jogo competitivo específico</p>

                            <div className="my-6">
                                <span className="font-rajdhani text-4xl font-bold text-white">
                                    {billingCycle === 'mensal' ? 'R$ 79' : 'R$ 59'}
                                </span>
                                <span className="font-sans text-xs text-[#7a84a0]">/mês</span>
                            </div>

                            <ul className="space-y-3 font-sans text-xs text-[#e4e6f0]">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#4da6d6]" /> 1 modelo IA incluído
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#4da6d6]" /> 1 jogo ativo por vez
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#4da6d6]" /> Atualizações mensais de modelos
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#4da6d6]" /> Suporte prioritário por e-mail
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#4da6d6]" /> Licença para 1 computador (HWID)
                                </li>
                            </ul>

                            <Link
                                href={register()}
                                className="mt-8 block w-full rounded-md border border-[#4da6d6]/50 bg-[#4da6d6]/10 py-3 text-center font-rajdhani text-sm font-bold uppercase tracking-widest text-[#4da6d6] hover:bg-[#4da6d6]/20"
                            >
                                Assinar Starter
                            </Link>
                        </div>

                        {/* SOVEREIGN (POPULAR) */}
                        <div className="relative rounded-2xl border-2 border-[#c9a227] bg-gradient-to-b from-[#0d1228] to-[#111d40] p-8 shadow-[0_0_35px_rgba(201,162,39,0.25)]">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] px-4 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#07091a]">
                                Mais Popular
                            </div>

                            <h3 className="font-rajdhani text-2xl font-bold uppercase text-[#c9a227]">Sovereign</h3>
                            <p className="font-sans text-xs text-[#7a84a0]">Acesso completo aos títulos suportados</p>

                            <div className="my-6">
                                <span className="font-rajdhani text-4xl font-bold text-[#c9a227]">
                                    {billingCycle === 'mensal' ? 'R$ 149' : 'R$ 99'}
                                </span>
                                <span className="font-sans text-xs text-[#7a84a0]">/mês</span>
                            </div>

                            <ul className="space-y-3 font-sans text-xs text-[#e4e6f0]">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#c9a227]" /> 4 modelos IA incluídos
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#c9a227]" /> Todos os jogos suportados
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#c9a227]" /> Atualizações em tempo real
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#c9a227]" /> Suporte prioritário 24/7
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#c9a227]" /> Licença para 2 hardwares
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#c9a227]" /> Configuração assistida
                                </li>
                            </ul>

                            <Link
                                href={register()}
                                className="mt-8 block w-full rounded-md border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] py-3 text-center font-rajdhani text-sm font-bold uppercase tracking-widest text-[#07091a] shadow-lg shadow-[#c9a227]/20 hover:brightness-110"
                            >
                                Assinar Sovereign
                            </Link>
                        </div>

                        {/* ELITE */}
                        <div className="relative rounded-2xl border border-[#8b5cf6]/30 bg-[#0d1228]/80 p-8 backdrop-blur-md">
                            <h3 className="font-rajdhani text-2xl font-bold uppercase text-white">Elite</h3>
                            <p className="font-sans text-xs text-[#7a84a0]">Para streamers e jogadores de alto nível</p>

                            <div className="my-6">
                                <span className="font-rajdhani text-4xl font-bold text-white">
                                    {billingCycle === 'mensal' ? 'R$ 279' : 'R$ 199'}
                                </span>
                                <span className="font-sans text-xs text-[#7a84a0]">/mês</span>
                            </div>

                            <ul className="space-y-3 font-sans text-xs text-[#e4e6f0]">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#8b5cf6]" /> Modelos ilimitados
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#8b5cf6]" /> API de integração
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#8b5cf6]" /> Perfis customizados sob medida
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#8b5cf6]" /> Gerente de conta dedicado
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#8b5cf6]" /> Licença para 5 hardwares
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="size-4 text-[#8b5cf6]" /> Suporte via WhatsApp direto
                                </li>
                            </ul>

                            <Link
                                href={register()}
                                className="mt-8 block w-full rounded-md border border-[#8b5cf6]/50 bg-[#8b5cf6]/10 py-3 text-center font-rajdhani text-sm font-bold uppercase tracking-widest text-[#8b5cf6] hover:bg-[#8b5cf6]/20"
                            >
                                Assinar Elite
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 text-center font-mono text-xs text-[#7a84a0]">
                        Pagamento via PIX, cartão de crédito ou criptomoeda · Cancelamento imediato a qualquer momento
                    </div>
                </section>

                {/* 6. TESTIMONIALS SECTION */}
                <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <span className="font-mono text-xs uppercase tracking-widest text-[#c9a227]">
                            Comunidade Soberana
                        </span>
                        <h2 className="mt-2 font-rajdhani text-4xl font-bold uppercase tracking-wider text-white sm:text-5xl">
                            O Que Nossos Clientes Dizem
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {TESTIMONIALS_DATA.map((t, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-[#c9a227]/20 bg-[#0d1228]/80 p-6 backdrop-blur-md"
                            >
                                <div className="flex gap-1 text-[#c9a227]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="size-4 fill-current" />
                                    ))}
                                </div>

                                <p className="my-4 font-sans text-sm leading-relaxed text-[#e4e6f0]">
                                    "{t.text}"
                                </p>

                                <div className="border-t border-[#c9a227]/15 pt-4">
                                    <div className="font-rajdhani text-lg font-bold text-white">{t.name}</div>
                                    <div className="font-mono text-xs text-[#c9a227]">{t.rank}</div>
                                    <div className="font-mono text-[10px] text-[#7a84a0]">{t.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 7. CTA BANNER */}
                <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl border border-[#c9a227]/40 bg-gradient-to-r from-[#0d1228] via-[#1a2a5e] to-[#0d1228] p-8 text-center shadow-[0_0_50px_rgba(201,162,39,0.2)] sm:p-14">
                        <span className="rounded-full bg-[#cc2200]/20 px-3 py-1 font-mono text-xs font-bold text-[#ff4d4d] uppercase tracking-wider">
                            Oferta Limitada
                        </span>

                        <h2 className="mt-4 font-rajdhani text-4xl font-bold uppercase tracking-wider text-white sm:text-5xl">
                            Pronto Para Ser <span className="text-[#c9a227]">Soberano?</span>
                        </h2>

                        <p className="mx-auto mt-3 max-w-xl font-sans text-sm text-[#7a84a0]">
                            Utilize o cupom{' '}
                            <span className="rounded border border-[#c9a227]/40 bg-[#c9a227]/15 px-2 py-0.5 font-mono text-xs font-bold text-[#c9a227]">
                                SOBERANO20
                            </span>{' '}
                            e receba 20% de desconto na primeira fatura.
                        </p>

                        <div className="mt-8 flex justify-center">
                            <a
                                href="#precos"
                                className="flex items-center gap-2 rounded-md border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] px-8 py-3.5 font-rajdhani text-lg font-bold uppercase tracking-widest text-[#07091a] shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all hover:scale-105 hover:brightness-110"
                            >
                                Ativar Agora <ArrowRight className="size-5" />
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* 8. FOOTER */}
            <footer className="relative z-10 border-t border-[#c9a227]/15 bg-[#07091a] pt-16 pb-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 md:grid-cols-4">
                        <div className="space-y-4">
                            <AppLogo />
                            <p className="font-sans text-xs text-[#7a84a0]">
                                Plataforma de tecnologia neural para aprimoramento de reflexos e mira em esportes eletrônicos.
                            </p>
                            <div className="flex items-center gap-2 font-mono text-xs text-green-400">
                                <span className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                                <span>Sistemas operacionais normais</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                Produto
                            </h4>
                            <ul className="mt-4 space-y-2 font-sans text-xs text-[#7a84a0]">
                                <li><a href="#produto" className="hover:text-[#c9a227]">AIM Assist Pro</a></li>
                                <li><a href="#modelos-ia" className="hover:text-[#c9a227]">Modelos IA</a></li>
                                <li><a href="#recursos" className="hover:text-[#c9a227]">Marketplace</a></li>
                                <li><a href="#precos" className="hover:text-[#c9a227]">Changelog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                Suporte
                            </h4>
                            <ul className="mt-4 space-y-2 font-sans text-xs text-[#7a84a0]">
                                <li><a href="#" className="hover:text-[#c9a227]">Central de Ajuda</a></li>
                                <li><a href="#" className="hover:text-[#c9a227]">Comunidade Discord</a></li>
                                <li><a href="#" className="hover:text-[#c9a227]">Suporte WhatsApp</a></li>
                                <li><a href="#" className="hover:text-[#c9a227]">Status do Sistema</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-white">
                                Empresa
                            </h4>
                            <ul className="mt-4 space-y-2 font-sans text-xs text-[#7a84a0]">
                                <li><a href="#" className="hover:text-[#c9a227]">Sobre Nós</a></li>
                                <li><a href="#" className="hover:text-[#c9a227]">Termos de Uso</a></li>
                                <li><a href="#" className="hover:text-[#c9a227]">Privacidade</a></li>
                                <li><a href="#" className="hover:text-[#c9a227]">Revendedores</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-between border-t border-[#c9a227]/10 pt-6 text-xs text-[#7a84a0] sm:flex-row">
                        <span>© 2026 SoberanoAIM · Sovereign AI. Todos os direitos reservados.</span>
                        <Link href={login()} className="mt-4 font-mono text-[#c9a227] hover:underline sm:mt-0">
                            Área do Cliente →
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
