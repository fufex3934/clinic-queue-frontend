import { AuthGuard } from "@/components/auth/auth-guard";
import { RoleRouteGuard } from "@/components/auth/role-route-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleRouteGuard>
        <DashboardShell>{children}</DashboardShell>
      </RoleRouteGuard>
    </AuthGuard>
  );
}
