"use client";

import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";

/** Full-screen routes (waiting-room TV) render without sidebar or header chrome. */
function isFullscreenDashboardRoute(pathname: string | null): boolean {
  return pathname?.startsWith("/dashboard/queue/display") ?? false;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isFullscreenDashboardRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <div className="hidden border-r border-sidebar-border md:flex">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
