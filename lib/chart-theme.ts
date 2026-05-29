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
} as const;

export const SERIES_PALETTE = [
  CHART_COLORS.primary,
  "oklch(0.62 0.14 195)",
  "oklch(0.72 0.1 160)",
  "oklch(0.68 0.12 250)",
  "oklch(0.58 0.08 40)",
  CHART_COLORS.chart3,
] as const;

export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    fontSize: "12px",
    boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
  },
  labelStyle: { color: "var(--color-foreground)", fontWeight: 600 },
  itemStyle: { color: "var(--color-muted-foreground)" },
};

export const chartAxisTick = {
  fill: "var(--color-muted-foreground)",
  fontSize: 11,
};

export const chartGridStroke = "var(--color-border)";
