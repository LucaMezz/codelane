import { Fragment } from "react";
import { useLocation, Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#shadcn/breadcrumb";

type AppBreadcrumbsProps = {
  /** How many items to show before collapsing */
  collapseAfter?: number; // default: 1
};

export function AppBreadcrumbs({ collapseAfter = 1 }: AppBreadcrumbsProps) {
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);

  const buildPath = (index: number) => "/" + segments.slice(0, index + 1).join("/");

  const formatLabel = (value: string) =>
    decodeURIComponent(value)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const shouldCollapse = segments.length > collapseAfter + 2;

  let visibleSegments: { name: string; index: number }[] = [];

  if (!shouldCollapse) {
    visibleSegments = segments.map((s, i) => ({ name: s, index: i }));
  } else {
    // always show first
    // then last 2
    const lastIndex = segments.length - 1;

    visibleSegments = [
      { name: segments[0], index: 0 },
      { name: "__ellipsis__", index: -1 },
      { name: segments[lastIndex - 1], index: lastIndex - 1 },
      { name: segments[lastIndex], index: lastIndex },
    ];
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleSegments.map((item, i) => {
          const isLast = item.index === segments.length - 1;

          if (item.name === "__ellipsis__") {
            return (
              <Fragment key="ellipsis">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <span className="text-muted-foreground">…</span>
                </BreadcrumbItem>
              </Fragment>
            );
          }

          const label = formatLabel(item.name);
          const href = buildPath(item.index);

          return (
            <Fragment key={href}>
              {i !== 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
