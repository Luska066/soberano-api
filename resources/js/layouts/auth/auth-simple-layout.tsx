import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#07091a] p-4 md:p-8">
            {/* Background Grid Pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-100"
                style={{
                    backgroundImage: `linear-gradient(rgba(201,162,39,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.05) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Radial Navy Glow in center */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-[#1a2a5e]/35 blur-[120px]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col gap-6 rounded-xl border border-[#c9a227]/30 bg-[#0d1228]/90 p-8 shadow-[0_0_50px_rgba(201,162,39,0.08)] backdrop-blur-xl md:p-10">
                    <div className="flex flex-col items-center gap-3">
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-2 transition-transform hover:scale-105"
                        >
                            <div className="flex size-14 items-center justify-center rounded-xl border border-[#c9a227]/50 bg-[#07091a] p-2 shadow-[0_0_20px_rgba(201,162,39,0.25)]">
                                <AppLogoIcon className="size-10" />
                            </div>
                        </Link>

                        <div className="space-y-1 text-center">
                            <h1 className="font-rajdhani text-2xl font-bold tracking-wider uppercase text-white md:text-3xl">
                                {title || 'ÁREA DO CLIENTE'}
                            </h1>
                            {description && (
                                <p className="text-center font-sans text-sm text-[#7a84a0]">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {children}
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#7a84a0] transition-colors hover:text-[#c9a227]"
                    >
                        ← Voltar ao site
                    </Link>
                </div>
            </div>
        </div>
    );
}
