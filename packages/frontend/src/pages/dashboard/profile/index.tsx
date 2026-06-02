import { getMyProfile, updateMyProfile } from "@codelane/api-client";
import { getInitials, type UserProfile } from "@codelane/core";
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Separator, cn } from "@codelane/ui";
import { Building2, CalendarDays, Clock, Globe, ListTodo, MapPin, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useAuthSession } from "#components/auth/auth-session-provider";
import { ActivityItem, type ActivityEvent } from "#components/profile/activity-item";
import { RoleBadge } from "#components/profile/role-badge";
import { SectionHeading } from "#components/profile/section-heading";
import { WorkspaceCard, type Workspace } from "#components/profile/workspace-card";
import { useFrontendRuntimeConfig } from "#config";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkItem {
  id: string;
  key: string;
  title: string;
  workspace: string;
  priority: "urgent" | "high" | "medium" | "low";
  status: "in_progress" | "blocked" | "needs_review";
  since: string;
  blockedBy?: string;
}

// ── Mock data (replace with real API when backend is ready) ──────────────────

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "1",
    name: "Platform Team",
    role: "Owner",
    openIssues: 8,
    inProgress: 3,
    members: 5,
    color: "#6366f1",
  },
  {
    id: "2",
    name: "Mobile App",
    role: "Member",
    openIssues: 3,
    inProgress: 1,
    members: 8,
    color: "#0ea5e9",
  },
  {
    id: "3",
    name: "API Infrastructure",
    role: "Admin",
    openIssues: 6,
    inProgress: 2,
    members: 4,
    color: "#10b981",
  },
];

const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: "1",
    type: "created",
    title: "Add OAuth2 provider support",
    workspace: "Platform Team",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "resolved",
    title: "Fix race condition in auth middleware",
    workspace: "API Infrastructure",
    time: "5 hours ago",
  },
  {
    id: "3",
    type: "commented",
    title: "Improve CI pipeline performance",
    workspace: "Platform Team",
    time: "1 day ago",
  },
  {
    id: "4",
    type: "assigned",
    title: "Design new onboarding flow",
    workspace: "Mobile App",
    time: "2 days ago",
  },
  {
    id: "5",
    type: "created",
    title: "Add dark mode to renderer",
    workspace: "Mobile App",
    time: "3 days ago",
  },
  {
    id: "6",
    type: "resolved",
    title: "Pagination broken on issues list",
    workspace: "API Infrastructure",
    time: "4 days ago",
  },
  {
    id: "7",
    type: "commented",
    title: "Update rate limiting on /auth routes",
    workspace: "API Infrastructure",
    time: "5 days ago",
  },
  {
    id: "8",
    type: "created",
    title: "Keyboard shortcut for issue creation",
    workspace: "Platform Team",
    time: "6 days ago",
  },
];

const MOCK_STATS = {
  assigned: 14,
  inProgress: 4,
  blocked: 2,
  needsReview: 3,
  resolvedThisMonth: 12,
};

const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: "1",
    key: "CL-42",
    title: "Add OAuth2 provider support",
    workspace: "Platform Team",
    priority: "high",
    status: "in_progress",
    since: "3 days",
  },
  {
    id: "2",
    key: "CL-51",
    title: "Migrate issue list pagination to cursor-based",
    workspace: "API Infrastructure",
    priority: "medium",
    status: "in_progress",
    since: "1 day",
  },
  {
    id: "3",
    key: "CL-38",
    title: "Fix race condition in auth middleware",
    workspace: "API Infrastructure",
    priority: "urgent",
    status: "blocked",
    since: "5 days",
    blockedBy: "Waiting on security audit sign-off",
  },
  {
    id: "4",
    key: "CL-61",
    title: "Keyboard shortcut for issue creation",
    workspace: "Platform Team",
    priority: "high",
    status: "blocked",
    since: "2 days",
    blockedBy: "Blocked by CL-58: Command palette not wired up yet",
  },
  {
    id: "5",
    key: "CL-29",
    title: "Improve CI pipeline performance",
    workspace: "Platform Team",
    priority: "medium",
    status: "needs_review",
    since: "2 days",
  },
  {
    id: "6",
    key: "CL-55",
    title: "Add dark mode to desktop renderer",
    workspace: "Mobile App",
    priority: "low",
    status: "needs_review",
    since: "4 days",
  },
  {
    id: "7",
    key: "CL-47",
    title: "Update rate limiting on /auth routes",
    workspace: "API Infrastructure",
    priority: "high",
    status: "needs_review",
    since: "1 day",
  },
];

const ACTIVITY_PAGE_SIZE = 4;

// ── Page ─────────────────────────────────────────────────────────────────────

export function ProfileViewPage(): React.JSX.Element {
  const config = useFrontendRuntimeConfig();
  const { user } = useAuthSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activityVisible, setActivityVisible] = useState(ACTIVITY_PAGE_SIZE);

  useEffect(() => {
    getMyProfile({ apiBaseUrl: config.apiBaseUrl })
      .then(setProfile)
      .catch(() => {
        /* fallback to session user */
      });
  }, [config.apiBaseUrl]);

  const displayName = profile?.name?.trim() || user?.name?.trim() || user?.email?.trim();
  const email = profile?.email ?? user?.email;
  const visibleActivity = MOCK_ACTIVITY.slice(0, activityVisible);
  const hasMoreActivity = activityVisible < MOCK_ACTIVITY.length;

  const inProgressItems = MOCK_WORK_ITEMS.filter((i) => i.status === "in_progress");
  const blockedItems = MOCK_WORK_ITEMS.filter((i) => i.status === "blocked");
  const reviewItems = MOCK_WORK_ITEMS.filter((i) => i.status === "needs_review");

  return (
    <div className="flex flex-1 flex-col pb-16 w-full">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* ── Sidebar ── */}
          <aside className="w-full lg:max-w-60 lg:sticky lg:top-12">
            <Avatar className="mb-4 h-36 w-36 rounded-full ring-2 ring-border">
              <AvatarImage src={profile?.image ?? undefined} alt={displayName} />
              <AvatarFallback className="text-3xl font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-2xl font-bold leading-tight">{displayName ?? "—"}</h1>
            <p className="mt-0.5 mb-2 text-sm text-muted-foreground">{email}</p>
            <RoleBadge role="Owner" />

            {profile?.bio && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
            )}

            <StatusEditor
              status={profile?.status ?? null}
              apiBaseUrl={config.apiBaseUrl}
              onSave={(status) => setProfile((p) => (p ? { ...p, status } : p))}
            />

            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link to="/dashboard/settings">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit profile
              </Link>
            </Button>

            <Separator className="my-4" />

            <div className="space-y-1.5">
              <StatLine value={MOCK_STATS.assigned} label="issues assigned" />
              <StatLine value={MOCK_STATS.resolvedThisMonth} label="resolved this month" />
              <StatLine value={MOCK_WORKSPACES.length} label="workspaces" />
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm text-muted-foreground">
              {profile?.location && <InfoRow icon={MapPin}>{profile.location}</InfoRow>}
              {profile?.website && (
                <InfoRow icon={Globe}>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate hover:text-foreground hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                </InfoRow>
              )}
              {profile?.timezone && <InfoRow icon={Clock}>{profile.timezone}</InfoRow>}
              <InfoRow icon={CalendarDays}>Joined June 2026</InfoRow>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="space-y-8 w-full min-w-0 overflow-x-hidden">
            {/* Current Work — hero section */}
            <section>
              <SectionHeading icon={ListTodo} title="Current Work" count={MOCK_WORK_ITEMS.length} />

              <div className="mt-3 min-w-0 overflow-hidden rounded-lg border divide-y">
                {inProgressItems.length > 0 && (
                  <WorkGroup
                    label="In Progress"
                    accentClass="bg-blue-500"
                    items={inProgressItems}
                  />
                )}
                {blockedItems.length > 0 && (
                  <WorkGroup
                    label="Blocked"
                    accentClass="bg-red-500"
                    items={blockedItems}
                    showBlockedBy
                  />
                )}
                {reviewItems.length > 0 && (
                  <WorkGroup label="Needs Review" accentClass="bg-violet-500" items={reviewItems} />
                )}
                {MOCK_WORK_ITEMS.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No active work items.
                  </p>
                )}
              </div>
            </section>

            {/* Workspaces */}
            <section>
              <SectionHeading icon={Building2} title="Workspaces" count={MOCK_WORKSPACES.length} />
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_WORKSPACES.map((ws) => (
                  <WorkspaceCard key={ws.id} workspace={ws} />
                ))}
              </div>
            </section>

            {/* Recent activity */}
            <section>
              <SectionHeading title="Recent activity" />
              <div className="mt-3 divide-y overflow-hidden rounded-lg border">
                {visibleActivity.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>
              {hasMoreActivity && (
                <button
                  type="button"
                  onClick={() => setActivityVisible((n) => n + ACTIVITY_PAGE_SIZE)}
                  className="mt-2 w-full rounded-md border border-dashed py-2 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  Show {Math.min(ACTIVITY_PAGE_SIZE, MOCK_ACTIVITY.length - activityVisible)} more
                </button>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Current Work sub-components ───────────────────────────────────────────────

const PRIORITY_DOT: Record<WorkItem["priority"], string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-400",
  low: "bg-muted-foreground/30",
};

function WorkGroup({
  label,
  accentClass,
  items,
  showBlockedBy = false,
}: {
  label: string;
  accentClass: string;
  items: WorkItem[];
  showBlockedBy?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2">
        <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", accentClass)} />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-xs text-muted-foreground/60">{items.length}</span>
      </div>
      <div className="min-w-0 divide-y">
        {items.map((item) => (
          <WorkItemRow key={item.id} item={item} showBlockedBy={showBlockedBy} />
        ))}
      </div>
    </div>
  );
}

function WorkItemRow({ item, showBlockedBy }: { item: WorkItem; showBlockedBy: boolean }) {
  return (
    <div className="min-w-0 overflow-hidden bg-card px-4 py-3 transition-colors hover:bg-accent/30">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn("h-2 w-2 shrink-0 rounded-full", PRIORITY_DOT[item.priority])}
          title={item.priority}
        />

        <span className="min-w-0 shrink-0 truncate font-mono text-xs text-muted-foreground">
          {item.key}
        </span>

        <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>

        <span className="hidden min-w-0 max-w-32 truncate text-xs text-muted-foreground lg:block">
          {item.workspace}
        </span>

        <span className="hidden min-w-0 max-w-[5rem] truncate text-xs text-muted-foreground/60 lg:block">
          {item.since}
        </span>
      </div>

      {showBlockedBy && item.blockedBy && (
        <p className="mt-1 min-w-0 truncate pl-5 text-xs text-muted-foreground/70">
          {item.blockedBy}
        </p>
      )}
    </div>
  );
}

// ── Status inline editor ──────────────────────────────────────────────────────

function StatusEditor({
  status,
  apiBaseUrl,
  onSave,
}: {
  status: string | null;
  apiBaseUrl: string;
  onSave: (status: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(status ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(status ?? "");
  }, [status]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function commit() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed === (status ?? "")) return;
    const result = await updateMyProfile({ status: trimmed || undefined }, { apiBaseUrl }).catch(
      () => null,
    );
    if (result?.success) {
      onSave(result.profile.status);
    } else {
      setValue(status ?? "");
    }
  }

  if (editing) {
    return (
      <div className="mt-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void commit();
            if (e.key === "Escape") {
              setValue(status ?? "");
              setEditing(false);
            }
          }}
          onBlur={() => void commit()}
          placeholder="What's your status?"
          maxLength={100}
          className="h-8 text-sm"
        />
      </div>
    );
  }

  if (status) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Click to edit"
        className="mt-2 block w-full text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        💬 {status}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="mt-2 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
    >
      + Set a status
    </button>
  );
}

// ── Sidebar-local layout helpers ──────────────────────────────────────────────

function StatLine({ value, label }: { value: number; label: string }) {
  return (
    <p className="text-sm">
      <span className="font-semibold text-foreground">{value}</span>{" "}
      <span className="text-muted-foreground">{label}</span>
    </p>
  );
}

function InfoRow({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
