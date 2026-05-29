import { AuthGuard } from "@/components/auth/auth-guard";
import { RoleRouteGuard } from "@/components/auth/role-route-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ClinicProvider } from "@/contexts/clinic-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ClinicProvider>
        <RoleRouteGuard>
          <DashboardShell>{children}</DashboardShell>
        </RoleRouteGuard>
      </ClinicProvider>
    </AuthGuard>
  );
}
