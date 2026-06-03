/** Theme-aligned series colors (work in SVG via CSS variables). */
export const CHART_COLORS = {
  primary: "var(--color-primary)",
  chart1: "var(--color-chart-1)",
  chart2: "var(--color-chart-2)",
  chart3: "var(--color-chart-3)",
  chart4: "var(--color-chart-4)",
  chart5: "var(--color-chart-5)",
  muted: "var(--color-muted-foreground)",
  border: "var(--color-border)",
  waiting: "var(--color-status-waiting-foreground)",
  completed: "var(--color-status-completed-foreground)",
} as const;

export const SERIES_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.chart2,
  CHART_COLORS.chart3,
  CHART_COLORS.chart4,
  CHART_COLORS.chart5,
  CHART_COLORS.muted,
] as const;

export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    fontSize: "12px",
    boxShadow: "var(--shadow-md)",
  },
  labelStyle: { color: "var(--color-foreground)", fontWeight: 600 },
  itemStyle: { color: "var(--color-muted-foreground)" },
};

export const chartAxisTick = {
  fill: "var(--color-muted-foreground)",
  fontSize: 11,
};

export const chartGridStroke = "color-mix(in oklch, var(--color-border) 80%, transparent)";

export const chartCartesianStyle = {
  stroke: chartGridStroke,
  strokeDasharray: "4 4",
};
