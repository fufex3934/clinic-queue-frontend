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

function isNavActive(
  pathname: string,
  href: string,
  exact?: boolean,
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        "flex h-full w-[17rem] shrink-0 flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-elevation-sm">
            <Stethoscope className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight tracking-tight">
              Clinic Queue
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              Healthcare operations
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => {
          const links = NAV_LINKS.filter(
            ({ feature }) =>
              group.features.includes(feature) &&
              canAccessFeature(user?.role, feature),
          );
          if (links.length === 0) return null;
          return (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {links.map(({ href, label, feature, exact }) => {
                  const Icon = navIcons[feature];
                  const active = isNavActive(pathname, href, exact);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elevation-sm"
                            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {active && (
                          <span
                            className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary"
                            aria-hidden
                          />
                        )}
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            active ? "text-sidebar-primary" : "opacity-80",
                          )}
                        />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/50 px-3 py-3">
          <p className="truncate text-sm font-medium">{user?.name ?? "Staff"}</p>
          <p className="truncate text-xs capitalize text-sidebar-foreground/60">
            {user?.role?.replace("_", " ") ?? "—"}
          </p>
        </div>
      </div>
    </aside>
  );
}
