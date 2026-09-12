import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    CheckCircle2,
    Clock,
    Crown,
    Download,
    ExternalLink,
    Key,
    Lock,
    Receipt,
    ShieldCheck,
    Sparkles,
    Zap,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SessionData {
    id: string;
    customer_email: string;
    customer_name: string;
    amount_total: number;
    currency: string;
    payment_status: string;
    status: string;
    subscription_id?: string | null;
}

interface PageProps {
    session: SessionData | null;
    user: {
        name: string;
        email: string;
    };
}

export default function CheckoutSuccessPage({ session, user }: PageProps) {
    const [countdown, setCountdown] = useState(6);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    router.visit('/dashboard');
                    return 0;
                }
                const next = prev - 1;
                setProgress((next / 6) * 100);
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatMoney = (amount: number, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    return (
        <div className="relative min-h-screen bg-[#07091a] text-[#e4e6f0] selection:bg-[#c9a227] selection:text-black flex flex-col justify-between">
            <Head title="Pagamento Confirmado — Soberano AI" />

            {/* Background cyber grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                    backgroundImage: `linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Glowing background orbs */}
            <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[500px] bg-[#22c55e]/10 blur-[140px] rounded-full" />
            <div className="pointer-events-none absolute top-10 left-1/3 h-[300px] w-[300px] bg-[#c9a227]/15 blur-[120px] rounded-full" />

            {/* Header */}
            <header className="relative z-20 border-b border-[#c9a227]/15 bg-[#07091a]/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <AppLogo />
                        <span className="hidden sm:inline-block h-4 w-px bg-white/15" />
                        <span className="hidden sm:inline-block font-rajdhani text-xs font-bold uppercase tracking-widest text-[#22c55e]">
                            Licença Ativada com Sucesso
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className="border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e] px-3 py-1 font-mono text-xs uppercase">
                            <span className="mr-1.5 size-2 rounded-full bg-[#22c55e] animate-ping inline-block" />
                            Aprovado
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 text-center space-y-8 my-auto">
                {/* Celebration Icon */}
                <div className="relative mx-auto flex size-24 sm:size-28 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#22c55e]/20 blur-xl animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-[#22c55e]/40 animate-ping opacity-25" />
                    <div className="relative flex size-20 sm:size-24 items-center justify-center rounded-full border border-[#22c55e] bg-gradient-to-tr from-[#0d1228] to-[#111d40] text-[#22c55e] shadow-[0_0_35px_rgba(34,197,94,0.4)]">
                        <CheckCircle2 className="size-10 sm:size-12 stroke-[2.5]" />
                    </div>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 px-3.5 py-1 font-rajdhani text-xs font-bold uppercase tracking-widest text-[#c9a227]">
                        <Crown className="size-3.5" /> Bem-vindo à Elite Soberana
                    </div>

                    <h1 className="font-rajdhani text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
                        Pagamento <span className="text-[#22c55e]">Confirmado</span>!
                    </h1>

                    <p className="font-sans text-sm sm:text-base text-[#7a84a0] max-w-lg mx-auto">
                        Sua assinatura foi processada e sua conta foi habilitada com sucesso. Você já possui acesso completo a todos os modelos e calibradores.
                    </p>
                </div>

                {/* Transaction Summary Card */}
                <div className="rounded-2xl border border-[#c9a227]/25 bg-gradient-to-b from-[#0d1228]/95 to-[#07091a]/95 p-6 shadow-2xl backdrop-blur-xl text-left space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                            Resumo da Transação
                        </span>
                        <span className="font-mono text-[11px] text-[#7a84a0]">
                            Stripe ID: {session?.id ? `${session.id.substring(0, 18)}...` : 'Transação Aprovada'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="rounded-lg border border-white/5 bg-[#07091a]/60 p-3">
                            <span className="font-mono text-[10px] uppercase text-[#7a84a0]">Titular</span>
                            <div className="mt-1 font-medium text-white truncate">{user?.name}</div>
                            <span className="text-[10px] text-[#7a84a0] truncate block">{user?.email}</span>
                        </div>

                        <div className="rounded-lg border border-white/5 bg-[#07091a]/60 p-3">
                            <span className="font-mono text-[10px] uppercase text-[#7a84a0]">Status</span>
                            <div className="mt-1 flex items-center gap-1.5 font-rajdhani font-bold text-[#22c55e] uppercase text-sm">
                                <span className="size-2 rounded-full bg-[#22c55e]" />
                                Ativo & Licenciado
                            </div>
                            <span className="text-[10px] text-[#7a84a0]">Cobrança recorrente</span>
                        </div>

                        <div className="rounded-lg border border-white/5 bg-[#07091a]/60 p-3">
                            <span className="font-mono text-[10px] uppercase text-[#7a84a0]">Valor Confirmado</span>
                            <div className="mt-1 font-rajdhani text-lg font-bold text-[#c9a227]">
                                {session?.amount_total ? formatMoney(session.amount_total, session.currency) : 'Plano Assinado'}
                            </div>
                            <span className="text-[10px] text-[#7a84a0]">Recibo gerado</span>
                        </div>
                    </div>

                    {/* Next Steps Quick Guide */}
                    <div className="rounded-xl border border-[#c9a227]/15 bg-[#07091a]/80 p-4 space-y-3">
                        <div className="font-rajdhani text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <Sparkles className="size-3.5 text-[#c9a227]" /> Próximos Passos:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#7a84a0]">
                            <div className="flex items-start gap-2">
                                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#c9a227]/20 font-mono text-[10px] font-bold text-[#c9a227]">
                                    1
                                </div>
                                <span>Acesse a aba <strong>Downloads</strong> no painel</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#c9a227]/20 font-mono text-[10px] font-bold text-[#c9a227]">
                                    2
                                </div>
                                <span>Baixe o <strong>Loader</strong> e copie sua chave</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#c9a227]/20 font-mono text-[10px] font-bold text-[#c9a227]">
                                    3
                                </div>
                                <span>Inicie o jogo e aproveite o <strong>Soberano AI</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Redirect Countdown Bar & Action Button */}
                <div className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-[#7a84a0]">
                            <span className="flex items-center gap-1.5">
                                <Clock className="size-3.5 text-[#c9a227]" />
                                Redirecionando automaticamente...
                            </span>
                            <span className="font-mono font-bold text-white">{countdown}s</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-[#c9a227] to-[#22c55e] transition-all duration-1000 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <Link href="/dashboard" className="block w-full">
                        <Button className="w-full py-6 border border-[#c9a227] bg-gradient-to-r from-[#c9a227] to-[#a87d15] font-rajdhani text-sm font-bold uppercase tracking-wider text-[#07091a] hover:brightness-110 shadow-[0_0_20px_rgba(201,162,39,0.3)] flex items-center justify-center gap-2">
                            <span>Acessar Meu Painel Agora</span>
                            <ArrowRight className="size-4" />
                        </Button>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 border-t border-white/5 py-4 text-center text-xs text-[#7a84a0]">
                <p>Soberano AI — Todos os direitos reservados. Ambiente protegido por criptografia de ponta a ponta.</p>
            </footer>
        </div>
    );
}
