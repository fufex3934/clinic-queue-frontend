"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  ListOrdered,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { canAccessFeature, NAV_GROUPS, NAV_LINKS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { AppFeature } from "@/lib/permissions";

const navIcons: Record<AppFeature, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  patients: Users,
  queue: ListOrdered,
  appointments: CalendarDays,
  appointmentsBook: CalendarDays,
  administration: Building2,
  billing: CreditCard,
  paymentsAdmin: DollarSign,
  platformUsers: UserCog,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Stethoscope className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Clinic Queue</p>
          <p className="text-xs capitalize text-muted-foreground">
            {user?.role ?? "staff"} dashboard
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => {
          const links = NAV_LINKS.filter(
            ({ feature }) =>
              group.features.includes(feature) &&
              canAccessFeature(user?.role, feature),
          );
          if (links.length === 0) return null;
          return (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              {links.map(({ href, label, feature, exact }) => {
                const Icon = navIcons[feature];
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      (exact
                        ? pathname === href
                        : pathname === href ||
                          pathname.startsWith(`${href}/`))
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="truncate text-xs font-medium">{user?.name}</p>
        <p className="text-xs text-muted-foreground">Clinic · MVP</p>
      </div>
    </aside>
  );
}
