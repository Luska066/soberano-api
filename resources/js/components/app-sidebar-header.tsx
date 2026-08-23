import { Bell } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#c9a227]/15 bg-[#07091a]/80 px-6 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-[#7a84a0] hover:text-[#c9a227]" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 font-mono text-xs text-green-400">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
                    </span>
                    <span>Sistema Online · v4.2.1</span>
                </div>

                <button
                    type="button"
                    className="relative flex size-9 items-center justify-center rounded-lg border border-[#c9a227]/20 bg-[#0d1228] text-[#7a84a0] transition-colors hover:border-[#c9a227]/50 hover:text-[#c9a227]"
                >
                    <Bell className="size-4" />
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#cc2200]" />
                </button>
            </div>
        </header>
    );
}
