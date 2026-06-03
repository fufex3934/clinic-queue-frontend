"use client";

import { useAuth } from "@/contexts/auth-provider";
import { useClinicContext } from "@/contexts/clinic-context";
import { ClinicAdministration } from "@/components/admin/clinic-administration";
import { StaffManagement } from "@/components/admin/staff-management";
import { Separator } from "@/components/ui/separator";

export function AdminDashboard() {
  const { user } = useAuth();
  const { operationalClinicId, setOperationalClinicId, isPlatformView } =
    useClinicContext();
  const staffClinicId = isPlatformView
    ? operationalClinicId ?? ""
    : user?.clinicId ?? "";

  if (!user) {
    return null;
  }

  const isPlatformAdmin = user.role === "platform_admin";
  const activeClinicId = staffClinicId || user.clinicId;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
        <p className="text-sm text-muted-foreground">
          {isPlatformAdmin
            ? "Create, edit, deactivate, or delete clinic tenants and manage clinic admin accounts. Payments and All users are under separate menu items."
            : "Manage your clinic profile and receptionist staff for day-to-day operations."}
        </p>
      </header>

      <ClinicAdministration
        isPlatformAdmin={isPlatformAdmin}
        userClinicId={user.clinicId}
        onClinicChange={(id) => {
          if (isPlatformView) setOperationalClinicId(id);
        }}
      />

      {activeClinicId && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-lg font-medium">
              {isPlatformAdmin ? "Clinic accounts" : "Receptionist staff"}
            </h2>
            <StaffManagement
              clinicId={activeClinicId}
              isPlatformAdmin={isPlatformAdmin}
              currentUserId={user.id}
            />
          </section>
        </>
      )}
    </div>
  );
}
