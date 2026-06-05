import { getMyProfile, getUserProfile, updateMyProfile } from "@codelane/api-client";
import { getInitials, type PublicUserProfile, type UserProfile } from "@codelane/core";
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Separator, cn } from "@codelane/ui";
import {
  ActivityItem,
  SectionHeading,
  WorkspaceCard,
  type ActivityEvent,
  type Workspace,
} from "@codelane/ui";
import { getTimeZones } from "@vvo/tzdb";
import {
  Building2,
  CalendarDays,
  Clock,
  ListTodo,
  MapPin,
  Maximize2,
  PanelLeft,
  PanelTop,
  Pencil,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuthSession } from "#components/auth/auth-session-provider";
import { WorkItemsView, type WorkItem } from "#components/work-items/work-items-view";
import { useFrontendRuntimeConfig } from "#config";

// ── Types ─────────────────────────────────────────────────────────────────────

type SidebarMode = "full" | "compact" | "hidden";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimezoneOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = String(Math.floor(abs / 60)).padStart(2, "0");
  const m = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${h}:${m}`;
}

function getTimezoneDisplay(tzName: string | null | undefined): string {
  if (!tzName) return "";
  const tz = getTimeZones({ includeUtc: true }).find((t) => t.name === tzName);
  if (!tz) return tzName;
  const offset = formatTimezoneOffset(tz.currentTimeOffsetInMinutes);
  const hasRealAbbr = /^[A-Z]{2,6}$/.test(tz.abbreviation) && tz.abbreviation !== "UTC";
  return hasRealAbbr ? `${offset} ${tz.abbreviation}` : offset;
}

function getCurrentLocalTime(tzName: string | null | undefined): string {
  if (!tzName) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tzName,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "";
  }
}

function useLocalTime(tzName: string | null | undefined): string {
  const [time, setTime] = useState(() => getCurrentLocalTime(tzName));

  useEffect(() => {
    setTime(getCurrentLocalTime(tzName));
    if (!tzName) return;
    const id = setInterval(() => setTime(getCurrentLocalTime(tzName)), 10_000);
    return () => clearInterval(id);
  }, [tzName]);

  return time;
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

const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: "1",
    key: "CL-42",
    title: "Add OAuth2 provider support",
    workspace: "Platform Team",
    priority: "high",
    status: "in_progress",
    since: "3 days",
    tags: ["auth", "backend"],
  },
  {
    id: "2",
    key: "CL-51",
    title: "Migrate issue list pagination to cursor-based",
    workspace: "API Infrastructure",
    priority: "medium",
    status: "in_progress",
    since: "1 day",
    tags: ["api", "performance"],
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
    tags: ["auth", "bug"],
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
    tags: ["ux", "keyboard"],
  },
  {
    id: "5",
    key: "CL-29",
    title: "Improve CI pipeline performance",
    workspace: "Platform Team",
    priority: "medium",
    status: "needs_review",
    since: "2 days",
    tags: ["devops"],
  },
  {
    id: "6",
    key: "CL-55",
    title: "Add dark mode to desktop renderer",
    workspace: "Mobile App",
    priority: "low",
    status: "needs_review",
    since: "4 days",
    tags: ["ui", "desktop"],
  },
  {
    id: "7",
    key: "CL-47",
    title: "Update rate limiting on /auth routes",
    workspace: "API Infrastructure",
    priority: "high",
    status: "needs_review",
    since: "1 day",
    tags: ["auth", "api"],
  },
];

const ACTIVITY_PAGE_SIZE = 4;

// ── Sidebar toggle control ────────────────────────────────────────────────────

function SidebarToggle({
  mode,
  onChange,
}: {
  mode: SidebarMode;
  onChange: (mode: SidebarMode) => void;
}) {
  const options: { value: SidebarMode; Icon: React.ElementType; label: string }[] = [
    { value: "full", Icon: PanelLeft, label: "Full sidebar" },
    { value: "compact", Icon: PanelTop, label: "Compact header" },
    { value: "hidden", Icon: Maximize2, label: "Hide sidebar" },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-md border bg-muted/40 p-0.5">
      {options.map(({ value, Icon, label }) => (
        <button
          key={value}
          type="button"
          title={label}
          onClick={() => onChange(value)}
          className={cn(
            "flex items-center justify-center rounded p-1.5 transition-colors",
            mode === value
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

// ── Compact identity banner ───────────────────────────────────────────────────

function CompactProfileBanner({
  displayName,
  profile,
  localTime,
  isOwnProfile,
}: {
  displayName: string | undefined;
  profile: UserProfile | PublicUserProfile | null;
  localTime: string;
  isOwnProfile: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <Avatar className="h-9 w-9 shrink-0 rounded-full ring-1 ring-border">
        <AvatarImage src={profile?.image ?? undefined} alt={displayName} />
        <AvatarFallback className="text-xs font-semibold">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-semibold leading-tight">{displayName ?? "—"}</span>
          {profile?.title && (
            <span className="shrink-0 text-xs text-muted-foreground">{profile.title}</span>
          )}
          {profile?.status && (
            <span className="shrink-0 text-xs text-muted-foreground">· 💬 {profile.status}</span>
          )}
        </div>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground/70">
          {profile?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {profile.location}
            </span>
          )}
          {profile?.timezone && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getTimezoneDisplay(profile.timezone)}
              {localTime && <span>· {localTime}</span>}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            Joined June 2026
          </span>
        </div>
      </div>
      {isOwnProfile && (
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link to="/settings">
            <Pencil className="mr-1.5 h-3 w-3" />
            Edit
          </Link>
        </Button>
      )}
    </div>
  );
}

// ── Full sidebar ──────────────────────────────────────────────────────────────

function FullSidebar({
  displayName,
  email,
  profile,
  localTime,
  isOwnProfile,
  apiBaseUrl,
  onStatusSave,
}: {
  displayName: string | undefined;
  email: string | null | undefined;
  profile: UserProfile | PublicUserProfile | null;
  localTime: string;
  isOwnProfile: boolean;
  apiBaseUrl: string;
  onStatusSave: (status: string | null) => void;
}) {
  return (
    <aside className="w-full lg:max-w-60 lg:sticky lg:top-20 shrink-0">
      <Avatar className="mb-4 h-36 w-36 rounded-full ring-2 ring-border">
        <AvatarImage src={profile?.image ?? undefined} alt={displayName} />
        <AvatarFallback className="text-3xl font-semibold">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <h1 className="text-2xl font-bold leading-tight">{displayName ?? "—"}</h1>
      {email && <p className="mt-0.5 mb-2 text-sm text-muted-foreground">{email}</p>}
      {profile?.title && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{profile.title}</p>
      )}
      {isOwnProfile ? (
        <StatusEditor
          status={profile?.status ?? null}
          apiBaseUrl={apiBaseUrl}
          onSave={onStatusSave}
        />
      ) : (
        profile?.status && <p className="mt-2 text-sm text-muted-foreground">💬 {profile.status}</p>
      )}
      {isOwnProfile && (
        <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
          <Link to="/settings">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit profile
          </Link>
        </Button>
      )}
      <Separator className="my-4" />
      <div className="space-y-2 text-sm text-muted-foreground">
        {profile?.location && <InfoRow icon={MapPin}>{profile.location}</InfoRow>}
        {profile?.timezone && (
          <InfoRow icon={Clock}>
            {getTimezoneDisplay(profile.timezone)}
            {localTime && <span className="text-muted-foreground/60"> · {localTime}</span>}
          </InfoRow>
        )}
        <InfoRow icon={CalendarDays}>Joined June 2026</InfoRow>
      </div>
    </aside>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function ProfileViewPage(): React.JSX.Element {
  const config = useFrontendRuntimeConfig();
  const { user } = useAuthSession();
  const { userId } = useParams<{ userId?: string }>();

  const isOwnProfile = !userId || userId === user?.id;

  const [profile, setProfile] = useState<UserProfile | PublicUserProfile | null>(null);
  const [activityVisible, setActivityVisible] = useState(ACTIVITY_PAGE_SIZE);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("full");

  useEffect(() => {
    setProfile(null);
    if (isOwnProfile) {
      getMyProfile({ apiBaseUrl: config.apiBaseUrl })
        .then(setProfile)
        .catch(() => {
          /* fallback to session user */
        });
    } else {
      getUserProfile(userId!, { apiBaseUrl: config.apiBaseUrl })
        .then(setProfile)
        .catch(() => {
          /* profile stays null */
        });
    }
  }, [config.apiBaseUrl, userId, isOwnProfile]);

  const displayName = profile?.name?.trim() || user?.name?.trim() || user?.email?.trim();
  const email = isOwnProfile ? ((profile as UserProfile | null)?.email ?? user?.email) : null;
  const localTime = useLocalTime(profile?.timezone);
  const visibleActivity = MOCK_ACTIVITY.slice(0, activityVisible);
  const hasMoreActivity = activityVisible < MOCK_ACTIVITY.length;

  function handleStatusSave(status: string | null) {
    setProfile((p) => (p ? { ...p, status } : p));
  }

  return (
    <div className="flex flex-1 flex-col pb-16 w-full">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-end">
          <SidebarToggle mode={sidebarMode} onChange={setSidebarMode} />
        </div>

        <div
          className={cn(
            "flex items-start gap-8",
            sidebarMode === "full" ? "flex-col lg:flex-row" : "flex-col",
          )}
        >
          {sidebarMode === "full" && (
            <FullSidebar
              displayName={displayName}
              email={email}
              profile={profile}
              localTime={localTime}
              isOwnProfile={isOwnProfile}
              apiBaseUrl={config.apiBaseUrl}
              onStatusSave={handleStatusSave}
            />
          )}

          <main className="space-y-8 w-full min-w-0 overflow-x-hidden">
            {sidebarMode === "compact" && (
              <CompactProfileBanner
                displayName={displayName}
                profile={profile}
                localTime={localTime}
                isOwnProfile={isOwnProfile}
              />
            )}

            {/* Current Work */}
            <section>
              <SectionHeading icon={ListTodo} title="Current Work" count={MOCK_WORK_ITEMS.length} />
              <WorkItemsView items={MOCK_WORK_ITEMS} className="mt-3" />
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

// ── Sidebar layout helper ─────────────────────────────────────────────────────

function InfoRow({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
