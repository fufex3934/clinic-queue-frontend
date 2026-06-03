"use client";

import Link from "next/link";
import { Building2, CalendarDays, ListOrdered, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlatformClinicSelector } from "@/components/admin/platform-clinic-selector";
import { DashboardStatsPanel } from "@/components/dashboard/dashboard-stats-panel";
import { PageHeader } from "@/components/shared/page-header";
import { canAccessFeature } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { AppFeature } from "@/lib/permissions";
import type { UserRole } from "@/types/auth";

const overviewCards: {
  feature: AppFeature;
  href: string;
  title: string;
  description: string;
  icon: typeof Users;
  cta: string;
  accent?: boolean;
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
    title: "Queue",
    description:
      "Large-format serving display, waiting cards, and serve next.",
    icon: ListOrdered,
    cta: "Open queue",
    accent: true,
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
    "Your workspace for patients, queue, and appointments — optimized for the front desk.",
  admin:
    "Manage daily operations or open administration for clinic and staff settings.",
  platform_admin:
    "Manage clinic tenants under Administration. Operational tools are for clinic staff.",
};

export function DashboardOverview() {
  const { user } = useAuth();
  const role = user?.role;

  const visibleCards = overviewCards.filter((card) =>
    canAccessFeature(role, card.feature),
  );

  return (
    <div className="space-y-10">
      <PageHeader
        title={user?.name ? `Welcome, ${user.name.split(" ")[0]}` : "Welcome"}
        description={role ? welcomeCopy[role] : "Loading your workspace…"}
      />

      {role !== "platform_admin" && <PlatformClinicSelector />}

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
              ({ feature, href, title, description, icon: Icon, cta, accent }) => (
                <Card
                  key={feature}
                  className={cn(
                    "shadow-elevation-sm transition-all duration-200 hover:shadow-elevation-md",
                    accent && "border-primary/25 bg-primary/5",
                  )}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-lg",
                          accent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button render={<Link href={href} />}>
                      {cta}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
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
