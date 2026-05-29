import api from "@/lib/api";
import type { DashboardStatsResponse } from "@/types/stats";

export const statsService = {
  getDashboard() {
    return api.get<DashboardStatsResponse>("/stats/dashboard");
  },
};
