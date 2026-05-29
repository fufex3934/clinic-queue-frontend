"use client";

import { useAuth } from "@/contexts/auth-provider";
import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics";
import { PlatformDashboardAnalytics } from "@/components/dashboard/platform-dashboard-analytics";

export function DashboardStatsPanel() {
  const { user } = useAuth();

  if (user?.role === "platform_admin") {
    return <PlatformDashboardAnalytics />;
  }

  return <DashboardAnalytics />;
}
