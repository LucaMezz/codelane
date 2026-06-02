import { cn } from "@codelane/ui";

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  iconColor?: string;
}

export function StatCard({ icon: Icon, value, label, iconColor }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Icon className={cn("mb-2 h-4 w-4", iconColor ?? "text-muted-foreground")} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
