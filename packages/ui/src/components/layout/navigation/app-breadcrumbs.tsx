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

          // 🔹 Ellipsis
          if (item.name === "__ellipsis__") {
            return (
              <div key="ellipsis" className="flex items-center">
                <BreadcrumbSeparator />
                <span className="px-2 text-muted-foreground">…</span>
              </div>
            );
          }

          const label = formatLabel(item.name);
          const href = buildPath(item.index);

          return (
            <div key={href} className="flex items-center">
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
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
