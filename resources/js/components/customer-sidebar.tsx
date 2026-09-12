import { Link } from '@inertiajs/react';
import {
    Bot,
    CreditCard,
    Download,
    Key,
    LayoutDashboard,
    LogOut,
    Receipt,
    Settings,
    UserCheck,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { logout } from '@/routes';
import type { NavItem } from '@/types';

const customerNavItems: NavItem[] = [
    {
        title: 'Visão Geral',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Minha Assinatura',
        href: '/subscription',
        icon: Receipt,
    },
    {
        title: 'Modelos IA',
        href: `${dashboard()}?tab=models`,
        icon: Bot,
    },
    {
        title: 'Licença & Chave',
        href: `${dashboard()}?tab=license`,
        icon: Key,
    },
    {
        title: 'Downloads',
        href: `${dashboard()}?tab=downloads`,
        icon: Download,
    },
    {
        title: 'Configurações',
        href: '/settings/profile',
        icon: Settings,
    },
];

export function CustomerSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-[#c9a227]/15 bg-[#0d1228]/95 backdrop-blur-md"
        >
            <SidebarHeader className="border-b border-[#c9a227]/15 px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="mt-2 flex items-center justify-between rounded-md border border-[#4da6d6]/20 bg-[#4da6d6]/5 px-2.5 py-1 text-[11px] font-rajdhani font-bold tracking-wider text-[#4da6d6] uppercase">
                    <span className="flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-[#4da6d6]" />
                        Portal do Cliente
                    </span>
                    <span className="rounded bg-[#4da6d6]/20 px-1 py-0.5 text-[9px]">MEMBRO</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="py-2">
                <NavMain items={customerNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-[#c9a227]/15 p-3">
                <NavUser />
                <div className="mt-2 pt-2 border-t border-[#c9a227]/10">
                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 font-rajdhani text-sm font-semibold tracking-wide uppercase text-[#ff6b6b] transition-colors hover:bg-[#cc2200]/10 hover:text-white"
                    >
                        <LogOut className="size-4 text-[#ff6b6b]" />
                        <span>Sair</span>
                    </Link>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
export default CustomerSidebar;
