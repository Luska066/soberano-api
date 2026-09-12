import { usePage } from '@inertiajs/react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { CustomerSidebar } from '@/components/customer-sidebar';
import type { Auth } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const userType = auth?.user?.type;

    if (userType === 'admin') {
        return <AdminSidebar />;
    }

    return <CustomerSidebar />;
}
export default AppSidebar;
