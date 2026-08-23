import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-3 py-2">
            <SidebarMenu className="gap-1.5">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={`h-10 rounded-md px-3 font-rajdhani text-sm font-semibold tracking-wide uppercase transition-all ${
                                    active
                                        ? 'border-l-2 border-[#c9a227] bg-[#c9a227]/10 text-[#c9a227] shadow-[inset_0_0_12px_rgba(201,162,39,0.15)]'
                                        : 'text-[#7a84a0] hover:bg-white/5 hover:text-[#e4e6f0]'
                                }`}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && (
                                        <item.icon
                                            className={`size-4.5 ${active ? 'text-[#c9a227]' : 'text-[#7a84a0]'}`}
                                        />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
