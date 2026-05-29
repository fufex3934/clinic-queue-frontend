"use client";

import Link from "next/link";
import { Building2, CalendarDays, ListOrdered, Users } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStatsPanel } from "@/components/dashboard/dashboard-stats-panel";
import { canAccessFeature } from "@/lib/permissions";
import type { AppFeature } from "@/lib/permissions";
import type { UserRole } from "@/types/auth";

const overviewCards: {
  feature: AppFeature;
  href: string;
  title: string;
  description: string;
  icon: typeof Users;
  cta: string;
}[] = [
  {
    feature: "patients",
    href: "/dashboard/patients",
    title: "Patients",
    description: "Register patients and search by name or phone.",
    icon: Users,
    cta: "Manage patients",
  },
  {
    feature: "queue",
    href: "/dashboard/queue",
    title: "Queue Management",
    description:
      "View the current token, waiting list, and serve the next patient.",
    icon: ListOrdered,
    cta: "Open queue",
  },
  {
    feature: "appointments",
    href: "/dashboard/appointments",
    title: "Appointments",
    description: "Browse scheduled visits for any date, grouped by time slot.",
    icon: CalendarDays,
    cta: "View appointments",
  },
  {
    feature: "administration",
    href: "/dashboard/admin",
    title: "Administration",
    description: "Manage clinic settings and staff accounts.",
    icon: Building2,
    cta: "Open administration",
  },
];

const welcomeCopy: Record<UserRole, string> = {
  receptionist:
    "Welcome. Use the sections below for patients, queue, and appointments.",
  admin:
    "Welcome. Manage daily operations or open administration for clinic and staff settings.",
  platform_admin:
    "Welcome. This overview shows platform-wide metrics across all clinics. Use Administration to manage tenants and staff.",
};

export function DashboardOverview() {
  const { user } = useAuth();
  const role = user?.role;

  const visibleCards = overviewCards.filter((card) =>
    canAccessFeature(role, card.feature),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <p className="text-muted-foreground">
        {role ? welcomeCopy[role] : "Loading…"}
      </p>

      {canAccessFeature(role, "overview") && <DashboardStatsPanel />}

      {visibleCards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sections are available for your account. Contact an administrator.
        </p>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCards.map(
              ({ feature, href, title, description, icon: Icon, cta }) => (
                <Card
                  key={feature}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="size-5 text-primary" />
                      {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button render={<Link href={href} />}>{cta}</Button>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}
