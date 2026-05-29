"use client";

import { useAuth } from "@/contexts/auth-provider";
import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics";
import { PlatformDashboardAnalytics } from "@/components/dashboard/platform-dashboard-analytics";
import { ReceptionistDashboard } from "@/components/dashboard/receptionist-dashboard";

export function DashboardStatsPanel() {
  const { user } = useAuth();

  if (user?.role === "platform_admin") {
    return <PlatformDashboardAnalytics />;
  }

  if (user?.role === "receptionist") {
    return <ReceptionistDashboard />;
  }

  return <DashboardAnalytics />;
}
