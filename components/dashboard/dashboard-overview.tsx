"use client";

import Link from "next/link";
import { Building2, CalendarDays, ListOrdered, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { useLocale } from "@/contexts/locale-provider";
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
import type { MessageKey } from "@/lib/i18n/catalog/en";
import { canAccessFeature } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { AppFeature } from "@/lib/permissions";
import type { UserRole } from "@/types/auth";

const overviewCards: {
  feature: AppFeature;
  href: string;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
  ctaKey: MessageKey;
  icon: typeof Users;
  accent?: boolean;
}[] = [
  {
    feature: "patients",
    href: "/dashboard/patients",
    titleKey: "cardPatientsTitle",
    descriptionKey: "cardPatientsDesc",
    ctaKey: "cardPatientsCta",
    icon: Users,
  },
  {
    feature: "queue",
    href: "/dashboard/today",
    titleKey: "cardTodayTitle",
    descriptionKey: "cardTodayDesc",
    ctaKey: "cardTodayCta",
    icon: CalendarDays,
    accent: true,
  },
  {
    feature: "queue",
    href: "/dashboard/queue",
    titleKey: "cardQueueTitle",
    descriptionKey: "cardQueueDesc",
    ctaKey: "cardQueueCta",
    icon: ListOrdered,
  },
  {
    feature: "appointments",
    href: "/dashboard/appointments",
    titleKey: "cardAppointmentsTitle",
    descriptionKey: "cardAppointmentsDesc",
    ctaKey: "cardAppointmentsCta",
    icon: CalendarDays,
  },
  {
    feature: "administration",
    href: "/dashboard/admin",
    titleKey: "cardAdminTitle",
    descriptionKey: "cardAdminDesc",
    ctaKey: "cardAdminCta",
    icon: Building2,
  },
];

const welcomeKeys: Record<UserRole, MessageKey> = {
  receptionist: "welcomeReceptionist",
  admin: "welcomeAdmin",
  platform_admin: "welcomePlatform",
};

export function DashboardOverview() {
  const { user } = useAuth();
  const { translate } = useLocale();
  const role = user?.role;

  const visibleCards = overviewCards.filter((card) =>
    canAccessFeature(role, card.feature),
  );

  const welcomeTitle = user?.name
    ? translate("welcomeUser", { name: user.name.split(" ")[0] ?? user.name })
    : translate("welcome");

  return (
    <div className="space-y-10">
      <PageHeader
        title={welcomeTitle}
        description={
          role
            ? translate(welcomeKeys[role])
            : translate("welcomeLoading")
        }
      />

      {role !== "platform_admin" && <PlatformClinicSelector />}

      {canAccessFeature(role, "overview") && <DashboardStatsPanel />}

      {visibleCards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {translate("noSectionsAvailable")}
        </p>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {translate("quickActions")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCards.map(
              ({
                href,
                titleKey,
                descriptionKey,
                ctaKey,
                icon: Icon,
                accent,
              }) => (
                <Card
                  key={href}
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
                      {translate(titleKey)}
                    </CardTitle>
                    <CardDescription>
                      {translate(descriptionKey)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button render={<Link href={href} />}>
                      {translate(ctaKey)}
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
