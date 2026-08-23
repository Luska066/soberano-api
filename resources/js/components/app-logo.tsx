import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-9 items-center justify-center rounded-md border border-[#c9a227]/40 bg-[#0d1228] shadow-[0_0_12px_rgba(201,162,39,0.2)]">
                <AppLogoIcon className="size-6" />
            </div>
            <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-rajdhani text-lg font-bold tracking-wider text-white">
                        SOBERANO
                    </span>
                    <span className="font-rajdhani text-lg font-bold tracking-wider text-[#c9a227]">
                        AIM
                    </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#7a84a0]">
                    Sovereign AI
                </span>
            </div>
        </div>
    );
}
