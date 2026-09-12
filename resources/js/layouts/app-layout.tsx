import { usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import CustomerLayout from '@/layouts/customer-layout';
import type { AppLayoutProps, Auth } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: AppLayoutProps) {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const userType = auth?.user?.type;
    console.log(auth.user)

    if (userType === 'admin') {
        return <AdminLayout breadcrumbs={breadcrumbs}>{children}</AdminLayout>;
    }

    return <CustomerLayout breadcrumbs={breadcrumbs}>{children}</CustomerLayout>;
}
