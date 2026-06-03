import { AuthGuard } from "@/components/auth/auth-guard";
import { RoleRouteGuard } from "@/components/auth/role-route-guard";
import { DashboardProviders } from "@/components/providers/dashboard-providers";
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
        <DashboardProviders>
          <RoleRouteGuard>
            <DashboardShell>{children}</DashboardShell>
          </RoleRouteGuard>
        </DashboardProviders>
      </ClinicProvider>
    </AuthGuard>
  );
}
