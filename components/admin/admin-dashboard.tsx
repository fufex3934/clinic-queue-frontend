"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { ClinicAdministration } from "@/components/admin/clinic-administration";
import { StaffManagement } from "@/components/admin/staff-management";
import { Separator } from "@/components/ui/separator";

export function AdminDashboard() {
  const { user } = useAuth();
  const [staffClinicId, setStaffClinicId] = useState(user?.clinicId ?? "");

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
            ? "Manage clinic tenants and staff accounts across the platform."
            : "Manage your clinic profile and staff who can use the queue system."}
        </p>
      </header>

      <ClinicAdministration
        isPlatformAdmin={isPlatformAdmin}
        userClinicId={user.clinicId}
        onClinicChange={setStaffClinicId}
      />

      {activeClinicId && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-lg font-medium">Staff accounts</h2>
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
