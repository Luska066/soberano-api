import { Link } from '@inertiajs/react';
import {
    Bot,
    CreditCard,
    Download,
    LayoutDashboard,
    LogOut,
    Package,
    Settings,
    User,
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
import profile from '@/routes/profile';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Visão Geral',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Clientes',
        href: '/customers',
        icon: User,
    },
    {
        title: 'Produtos',
        href: '/products',
        icon: Package,
    },
];

export function AppSidebar() {
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
            </SidebarHeader>

            <SidebarContent className="py-2">
                <NavMain items={mainNavItems} />
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
