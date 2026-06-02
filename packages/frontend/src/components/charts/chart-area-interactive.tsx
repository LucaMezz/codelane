"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@appkit/ui";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@appkit/ui";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
  { milestone: "Scaffold", web: 18, desktop: 16, api: 12 },
  { milestone: "Auth", web: 28, desktop: 26, api: 24 },
  { milestone: "Shared UI", web: 42, desktop: 40, api: 28 },
  { milestone: "CLI", web: 48, desktop: 46, api: 38 },
  { milestone: "Docs", web: 58, desktop: 56, api: 44 },
  { milestone: "Checks", web: 72, desktop: 70, api: 62 },
  { milestone: "Template", web: 86, desktop: 84, api: 78 },
];

const chartConfig = {
  web: {
    label: "Web app",
    color: "var(--chart-1)",
  },
  desktop: {
    label: "Desktop app",
    color: "var(--chart-2)",
  },
  api: {
    label: "API",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template readiness</CardTitle>
        <CardDescription>
          Placeholder progress across the shared web, desktop, and backend foundation.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillWeb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-web)" stopOpacity={0.55} />
                <stop offset="95%" stopColor="var(--color-web)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="fillApi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-api)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-api)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="milestone"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="web"
              type="natural"
              fill="url(#fillWeb)"
              stroke="var(--color-web)"
              strokeWidth={2}
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              strokeWidth={2}
            />
            <Area
              dataKey="api"
              type="natural"
              fill="url(#fillApi)"
              stroke="var(--color-api)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
