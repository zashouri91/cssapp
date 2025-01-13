import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserRoleManager from '@/components/admin/UserRoleManager';

export default function RolesPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error || !data) {
        router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [user?.id, router]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <UserRoleManager />
      </div>
    </DashboardLayout>
  );
}
