import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="size-8 overflow-hidden rounded-md border border-[#c9a227]/40 shadow-[0_0_10px_rgba(201,162,39,0.15)]">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-md bg-[#07091a] font-rajdhani text-sm font-bold text-[#c9a227]">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-rajdhani text-sm font-bold tracking-wide text-white">
                    {user.name}
                </span>
                <span className="truncate font-mono text-[10px] font-semibold tracking-wider text-[#c9a227] uppercase">
                    Plano Sovereign
                </span>
                {showEmail && (
                    <span className="truncate font-sans text-xs text-[#7a84a0]">
                        {user.email}
                    </span>
                )}
            </div>
        </div>
    );
}
