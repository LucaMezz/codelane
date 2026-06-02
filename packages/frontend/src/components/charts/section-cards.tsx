import { Badge, Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@appkit/ui";
import { BoxesIcon, CheckCircle2Icon, Layers3Icon, ShieldCheckIcon } from "lucide-react";

const cards = [
  {
    label: "Deployable apps",
    value: "4",
    detail: "Web, desktop, API, and CLI live as separate workspace apps.",
    badge: "Cross-platform",
    icon: BoxesIcon,
  },
  {
    label: "Shared packages",
    value: "5",
    detail: "UI, frontend flows, API client, config, and core logic stay reusable.",
    badge: "Bounded",
    icon: Layers3Icon,
  },
  {
    label: "Auth foundation",
    value: "Ready",
    detail: "Credentials sessions and CLI browser authorization are scaffolded.",
    badge: "Backend-backed",
    icon: ShieldCheckIcon,
  },
  {
    label: "Quality gates",
    value: "7",
    detail: "Checks cover formatting, linting, tests, builds, deps, and boundaries.",
    badge: "CI-friendly",
    icon: CheckCircle2Icon,
  },
];

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="@container/card">
          <CardHeader className="gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tracking-normal tabular-nums @[250px]/card:text-3xl">
                  {card.value}
                </CardTitle>
              </div>
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted/50">
                <card.icon className="size-4 text-muted-foreground" />
              </div>
            </div>
            <Badge variant="outline" className="w-fit">
              {card.badge}
            </Badge>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">{card.detail}</CardFooter>
        </Card>
      ))}
    </div>
  );
}
