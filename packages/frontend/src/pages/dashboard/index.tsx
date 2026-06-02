import { ChartAreaInteractive } from "#components/charts/chart-area-interactive";
import { DataTable } from "#components/charts/data-table";
import { SectionCards } from "#components/charts/section-cards";

import data from "./data.json";

// oxlint-disable-next-line import/no-default-export
export function Dashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <section className="px-4 lg:px-6">
            <div className="rounded-lg border bg-card p-4 md:p-6">
              <div className="max-w-3xl space-y-2">
                <p className="text-sm font-medium text-muted-foreground">AppKit starter surface</p>
                <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                  A cross-platform template dashboard
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  This page is intentionally sample content. It shows how shared UI, frontend
                  routes, API-backed auth, and app hosts can come together without pretending to be
                  a finished product.
                </p>
              </div>
            </div>
          </section>
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
