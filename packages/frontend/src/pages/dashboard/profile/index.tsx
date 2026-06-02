import { getMyProfile, updateMyProfile } from "@codelane/api-client";
import { getInitials, type UserProfile } from "@codelane/core";
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Separator } from "@codelane/ui";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock,
  Globe,
  MapPin,
  Pencil,
  Plus,
  Timer,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useAuthSession } from "#components/auth/auth-session-provider";
import { ActivityGraph } from "#components/profile/activity-graph";
import { ActivityItem, type ActivityEvent } from "#components/profile/activity-item";
import { RoleBadge } from "#components/profile/role-badge";
import { SectionHeading } from "#components/profile/section-heading";
import { StatCard } from "#components/profile/stat-card";
import { WorkspaceCard, type Workspace } from "#components/profile/workspace-card";
import { useFrontendRuntimeConfig } from "#config";

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

const MOCK_STATS = { open: 17, inProgress: 5, resolvedThisMonth: 12, totalCreated: 34 };
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

  return (
    <div className="flex flex-1 flex-col pb-16">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex items-start gap-8">
          {/* ── Sidebar — sticky below the h-12 breadcrumb header ── */}
          <aside className="w-60 shrink-0 self-start sticky top-12">
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
              <StatLine value={MOCK_STATS.totalCreated} label="issues opened" />
              <StatLine value={MOCK_STATS.resolvedThisMonth} label="issues resolved this month" />
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
          <main className="min-w-0 flex-1 space-y-8">
            <div className="grid grid-cols-4 gap-3">
              <StatCard
                icon={CircleDot}
                value={MOCK_STATS.open}
                label="Open issues"
                iconColor="text-amber-500"
              />
              <StatCard
                icon={Timer}
                value={MOCK_STATS.inProgress}
                label="In progress"
                iconColor="text-blue-500"
              />
              <StatCard
                icon={CheckCircle2}
                value={MOCK_STATS.resolvedThisMonth}
                label="Resolved this month"
                iconColor="text-emerald-500"
              />
              <StatCard
                icon={Plus}
                value={MOCK_STATS.totalCreated}
                label="Total created"
                iconColor="text-violet-500"
              />
            </div>

            <ActivityGraph />

            <section>
              <SectionHeading icon={Building2} title="Workspaces" count={MOCK_WORKSPACES.length} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {MOCK_WORKSPACES.map((ws) => (
                  <WorkspaceCard key={ws.id} workspace={ws} />
                ))}
              </div>
            </section>

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
