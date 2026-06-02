interface SectionHeadingProps {
  icon?: React.ElementType;
  title: string;
  count?: number;
}

export function SectionHeading({ icon: Icon, title, count }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <h2 className="text-sm font-semibold">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}
