import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from "@codelane/ui";
import { Kanban, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

// ── Exported types ────────────────────────────────────────────────────────────

export type WorkItemStatus = "in_progress" | "blocked" | "needs_review";
export type WorkItemPriority = "urgent" | "high" | "medium" | "low";

export interface WorkItem {
  id: string;
  key: string;
  title: string;
  workspace: string;
  priority: WorkItemPriority;
  status: WorkItemStatus;
  since: string;
  blockedBy?: string;
  tags?: string[];
  assignee?: string;
}

export type ViewMode = "list" | "grid" | "kanban";

export interface WorkItemDisplayOptions {
  showWorkspace: boolean;
  showSince: boolean;
  showTags: boolean;
  showAssignee: boolean;
}

export interface WorkItemsViewProps {
  items: WorkItem[];
  defaultView?: ViewMode;
  /** Subset of views to expose in the switcher. Defaults to all three. */
  availableViews?: ViewMode[];
  defaultOptions?: Partial<WorkItemDisplayOptions>;
  /** Whether to render the view-switcher + options toolbar. Default: true. */
  showControls?: boolean;
  className?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS: WorkItemDisplayOptions = {
  showWorkspace: true,
  showSince: true,
  showTags: false,
  showAssignee: false,
};

const STATUS_CONFIG = {
  in_progress: {
    label: "In Progress",
    accentDot: "bg-blue-500",
    cardAccentBorder: "border-l-blue-500",
    badgeClass: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    columnHeaderClass: "text-blue-700 dark:text-blue-400",
  },
  blocked: {
    label: "Blocked",
    accentDot: "bg-red-500",
    cardAccentBorder: "border-l-red-500",
    badgeClass: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
    columnHeaderClass: "text-red-700 dark:text-red-400",
  },
  needs_review: {
    label: "Needs Review",
    accentDot: "bg-violet-500",
    cardAccentBorder: "border-l-violet-500",
    badgeClass: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400",
    columnHeaderClass: "text-violet-700 dark:text-violet-400",
  },
} as const satisfies Record<WorkItemStatus, object>;

const PRIORITY_DOT: Record<WorkItemPriority, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-400",
  low: "bg-muted-foreground/30",
};

const STATUS_ORDER: WorkItemStatus[] = ["in_progress", "blocked", "needs_review"];

const VIEW_CONFIGS = [
  { value: "list" as const, Icon: List, label: "List view" },
  { value: "grid" as const, Icon: LayoutGrid, label: "Grid view" },
  { value: "kanban" as const, Icon: Kanban, label: "Kanban view" },
];

// ── Controls toolbar ──────────────────────────────────────────────────────────

function ViewSwitcher({
  current,
  available,
  onChange,
}: {
  current: ViewMode;
  available: ViewMode[];
  onChange: (v: ViewMode) => void;
}) {
  const visible = VIEW_CONFIGS.filter((c) => available.includes(c.value));
  if (visible.length <= 1) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-md border bg-muted/40 p-0.5">
      {visible.map(({ value, Icon, label }) => (
        <button
          key={value}
          type="button"
          title={label}
          onClick={() => onChange(value)}
          className={cn(
            "flex items-center justify-center rounded p-1.5 transition-colors",
            current === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

function OptionsMenu({
  options,
  onChange,
}: {
  options: WorkItemDisplayOptions;
  onChange: (opts: WorkItemDisplayOptions) => void;
}) {
  function toggle(key: keyof WorkItemDisplayOptions) {
    onChange({ ...options, [key]: !options[key] });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-xs">Options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs">Display fields</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={options.showWorkspace}
          onCheckedChange={() => toggle("showWorkspace")}
        >
          Workspace
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={options.showSince}
          onCheckedChange={() => toggle("showSince")}
        >
          Time open
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={options.showTags}
          onCheckedChange={() => toggle("showTags")}
        >
          Tags
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={options.showAssignee}
          onCheckedChange={() => toggle("showAssignee")}
        >
          Assignee
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListGroup({
  status,
  items,
  options,
}: {
  status: WorkItemStatus;
  items: WorkItem[];
  options: WorkItemDisplayOptions;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2">
        <div className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.accentDot)} />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {cfg.label}
        </span>
        <span className="text-xs text-muted-foreground/60">{items.length}</span>
      </div>
      <div className="min-w-0 divide-y">
        {items.map((item) => (
          <ListRow key={item.id} item={item} options={options} />
        ))}
      </div>
    </div>
  );
}

function ListRow({ item, options }: { item: WorkItem; options: WorkItemDisplayOptions }) {
  return (
    <div className="min-w-0 overflow-hidden bg-card px-4 py-3 transition-colors hover:bg-accent/30">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn("h-2 w-2 shrink-0 rounded-full", PRIORITY_DOT[item.priority])}
          title={item.priority}
        />
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{item.key}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
        {options.showAssignee && item.assignee && (
          <span className="hidden shrink-0 max-w-24 truncate text-xs text-muted-foreground lg:block">
            {item.assignee}
          </span>
        )}
        {options.showWorkspace && (
          <span className="hidden shrink-0 max-w-32 truncate text-xs text-muted-foreground lg:block">
            {item.workspace}
          </span>
        )}
        {options.showSince && (
          <span className="hidden shrink-0 max-w-[5rem] truncate text-xs text-muted-foreground/60 lg:block">
            {item.since}
          </span>
        )}
      </div>
      {item.status === "blocked" && item.blockedBy && (
        <p className="mt-1 min-w-0 truncate pl-5 text-xs text-muted-foreground/70">
          {item.blockedBy}
        </p>
      )}
      {options.showTags && item.tags && item.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1 pl-5">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="h-4 px-1.5 text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function ListView({ items, options }: { items: WorkItem[]; options: WorkItemDisplayOptions }) {
  const groups = STATUS_ORDER.map((status) => ({
    status,
    items: items.filter((i) => i.status === status),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) return <EmptyState />;

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border divide-y">
      {groups.map(({ status, items: groupItems }) => (
        <ListGroup key={status} status={status} items={groupItems} options={options} />
      ))}
    </div>
  );
}

// ── Grid view ─────────────────────────────────────────────────────────────────

function GridCard({ item, options }: { item: WorkItem; options: WorkItemDisplayOptions }) {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn("h-2 w-2 shrink-0 rounded-full", PRIORITY_DOT[item.priority])}
            title={item.priority}
          />
          <span className="font-mono text-xs text-muted-foreground">{item.key}</span>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
            cfg.badgeClass,
          )}
        >
          {cfg.label}
        </span>
      </div>

      <p className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</p>

      {item.status === "blocked" && item.blockedBy && (
        <p className="line-clamp-2 text-xs text-muted-foreground/70">{item.blockedBy}</p>
      )}

      {options.showTags && item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="h-4 px-1.5 text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          {options.showWorkspace && <span className="min-w-0 truncate">{item.workspace}</span>}
          {options.showAssignee && item.assignee && (
            <span className="min-w-0 truncate">{item.assignee}</span>
          )}
        </div>
        {options.showSince && (
          <span className="shrink-0 text-muted-foreground/60">{item.since}</span>
        )}
      </div>
    </div>
  );
}

function GridView({ items, options }: { items: WorkItem[]; options: WorkItemDisplayOptions }) {
  if (items.length === 0) return <EmptyState />;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <GridCard key={item.id} item={item} options={options} />
      ))}
    </div>
  );
}

// ── Kanban view ───────────────────────────────────────────────────────────────

function KanbanCard({ item, options }: { item: WorkItem; options: WorkItemDisplayOptions }) {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-md border border-l-2 bg-card p-3 transition-colors hover:bg-accent/20",
        cfg.cardAccentBorder,
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT[item.priority])}
          title={item.priority}
        />
        <span className="font-mono text-[10px] text-muted-foreground">{item.key}</span>
        {options.showWorkspace && (
          <span className="ml-auto min-w-0 truncate text-right text-[10px] text-muted-foreground/60">
            {item.workspace}
          </span>
        )}
      </div>

      <p className="line-clamp-2 text-xs font-medium leading-snug">{item.title}</p>

      {item.status === "blocked" && item.blockedBy && (
        <p className="line-clamp-1 text-[10px] text-muted-foreground/70">{item.blockedBy}</p>
      )}

      {options.showTags && item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="h-3.5 px-1 text-[9px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-1">
        {options.showAssignee && item.assignee && (
          <span className="min-w-0 truncate text-[10px] text-muted-foreground/70">
            {item.assignee}
          </span>
        )}
        {options.showSince && (
          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/60">
            {item.since}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  items,
  options,
}: {
  status: WorkItemStatus;
  items: WorkItem[];
  options: WorkItemDisplayOptions;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <div className={cn("h-2 w-2 shrink-0 rounded-full", cfg.accentDot)} />
        <span className={cn("text-xs font-semibold", cfg.columnHeaderClass)}>{cfg.label}</span>
        <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {items.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="flex h-16 items-center justify-center rounded-md border border-dashed text-[11px] text-muted-foreground/40">
            No items
          </div>
        ) : (
          items.map((item) => <KanbanCard key={item.id} item={item} options={options} />)
        )}
      </div>
    </div>
  );
}

function KanbanView({ items, options }: { items: WorkItem[]; options: WorkItemDisplayOptions }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex gap-3" style={{ minWidth: "32rem" }}>
        {STATUS_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={items.filter((i) => i.status === status)}
            options={options}
          />
        ))}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return <p className="py-8 text-center text-sm text-muted-foreground">No active work items.</p>;
}

// ── Main component ────────────────────────────────────────────────────────────

export function WorkItemsView({
  items,
  defaultView = "list",
  availableViews = ["list", "grid", "kanban"],
  defaultOptions,
  showControls = true,
  className,
}: WorkItemsViewProps) {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [options, setOptions] = useState<WorkItemDisplayOptions>({
    ...DEFAULT_OPTIONS,
    ...defaultOptions,
  });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showControls && (
        <div className="flex items-center justify-between gap-2">
          <ViewSwitcher current={view} available={availableViews} onChange={setView} />
          <OptionsMenu options={options} onChange={setOptions} />
        </div>
      )}

      {view === "list" && <ListView items={items} options={options} />}
      {view === "grid" && <GridView items={items} options={options} />}
      {view === "kanban" && <KanbanView items={items} options={options} />}
    </div>
  );
}
