import { cn } from "@codelane/ui";
import { useMemo } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface DayData {
  date: Date;
  created: number;
  resolved: number;
  commented: number;
  total: number;
}

// ── Level colours (statically declared so Tailwind JIT includes them) ────────

const LEVEL_CLASSES = [
  "bg-muted",
  "bg-violet-200 dark:bg-violet-900",
  "bg-violet-300 dark:bg-violet-700",
  "bg-violet-500 dark:bg-violet-500",
  "bg-violet-700 dark:bg-violet-300",
] as const;

function getLevel(total: number): 0 | 1 | 2 | 3 | 4 {
  if (total === 0) return 0;
  if (total <= 2) return 1;
  if (total <= 4) return 2;
  if (total <= 7) return 3;
  return 4;
}

// ── Deterministic mock data ──────────────────────────────────────────────────
// Uses date components as a seed so the graph is stable across renders.

function deterministicRandom(d: Date, salt: number): number {
  const n = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + salt * 997;
  const x = Math.sin(n) * 43758.5453123;
  return x - Math.floor(x);
}

function generateActivityData(): DayData[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const data: DayData[] = [];

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const activityChance = isWeekend ? 0.28 : 0.68;

    if (deterministicRandom(date, 0) >= activityChance) {
      data.push({ date, created: 0, resolved: 0, commented: 0, total: 0 });
      continue;
    }

    const total = Math.floor(deterministicRandom(date, 1) * 9) + 1;
    const created = Math.round(deterministicRandom(date, 2) * total * 0.35);
    const resolved = Math.round(deterministicRandom(date, 3) * (total - created) * 0.55);
    const commented = Math.max(0, total - created - resolved);

    data.push({ date, created, resolved, commented, total });
  }

  return data;
}

// ── Grid helpers ─────────────────────────────────────────────────────────────

function groupIntoWeeks(days: DayData[]): (DayData | null)[][] {
  const first = days[0];
  if (!first) return [];

  const weeks: (DayData | null)[][] = [];
  let current: (DayData | null)[] = Array(first.date.getDay()).fill(null); // pad to Sunday

  for (const day of days) {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }

  return weeks;
}

function getMonthLabels(weeks: (DayData | null)[][]): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, col) => {
    const firstDay = week.find(Boolean);
    if (firstDay && firstDay.date.getMonth() !== lastMonth) {
      labels.push({
        label: firstDay.date.toLocaleDateString("en", { month: "short" }),
        col,
      });
      lastMonth = firstDay.date.getMonth();
    }
  });

  return labels;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

// ── Component ────────────────────────────────────────────────────────────────

// Cell: 10px, gap: 2px → step per column = 12px
const CELL = 10;
const GAP = 2;
const STEP = CELL + GAP;

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ActivityGraph() {
  const activityData = useMemo(generateActivityData, []);
  const weeks = useMemo(() => groupIntoWeeks(activityData), [activityData]);
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);

  const totalContributions = activityData.reduce((s, d) => s + d.total, 0);
  const totalCreated = activityData.reduce((s, d) => s + d.created, 0);
  const totalResolved = activityData.reduce((s, d) => s + d.resolved, 0);
  const totalCommented = activityData.reduce((s, d) => s + d.commented, 0);

  return (
    <div className="rounded-lg border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">
            {totalContributions} contributions in the last year
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="text-violet-500">{totalCreated} opened</span>
            {" · "}
            <span className="text-emerald-500">{totalResolved} resolved</span>
            {" · "}
            <span className="text-blue-500">{totalCommented} comments</span>
          </p>
        </div>
      </div>

      {/* Graph */}
      <div className="overflow-x-auto">
        <div className="flex items-start" style={{ minWidth: "max-content" }}>
          {/* Day-of-week labels */}
          <div
            className="mr-1.5 shrink-0"
            style={{ marginTop: STEP + GAP, display: "flex", flexDirection: "column", gap: GAP }}
          >
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="flex items-center justify-end text-right text-[10px] leading-none text-muted-foreground"
                style={{ width: 24, height: CELL }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          <div className="relative">
            {/* Month labels */}
            <div className="relative" style={{ height: STEP + GAP }}>
              {monthLabels.map(({ label, col }) => (
                <span
                  key={label + col}
                  className="absolute text-[10px] leading-none text-muted-foreground"
                  style={{ left: col * STEP, top: 0 }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Cell grid */}
            <div style={{ display: "flex", gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                  {week.map((day, di) =>
                    day === null ? (
                      <div key={di} style={{ width: CELL, height: CELL }} />
                    ) : (
                      <div
                        key={di}
                        className={cn(
                          "rounded-[2px] transition-opacity hover:opacity-80",
                          LEVEL_CLASSES[getLevel(day.total)],
                        )}
                        style={{ width: CELL, height: CELL }}
                        title={`${formatDate(day.date)} — ${day.total} contribution${day.total !== 1 ? "s" : ""}`}
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className={cn("rounded-[2px]", LEVEL_CLASSES[level])}
            style={{ width: CELL, height: CELL }}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}
