import { getMyProfile } from "@codelane/api-client";
import { getInitials, type UserProfile } from "@codelane/core";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Separator, cn } from "@codelane/ui";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock,
  Globe,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  Timer,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuthSession } from "../../../components/auth/auth-session-provider";
import { useFrontendRuntimeConfig } from "../../../config";

// --- Mock data (to be replaced with real API data) ---

type WorkspaceRole = "Owner" | "Admin" | "Member";

interface MockWorkspace {
  id: string;
  name: string;
  role: WorkspaceRole;
  openIssues: number;
  inProgress: number;
  members: number;
  color: string;
}

interface MockActivity {
  id: string;
  type: "created" | "resolved" | "commented" | "assigned";
  title: string;
  workspace: string;
  time: string;
}

const MOCK_WORKSPACES: MockWorkspace[] = [
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

const MOCK_ACTIVITY: MockActivity[] = [
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
];

const MOCK_STATS = {
  open: 17,
  inProgress: 5,
  resolvedThisMonth: 12,
  totalCreated: 34,
};

// --- Component ---

export function ProfileViewPage(): React.JSX.Element {
  const config = useFrontendRuntimeConfig();
  const { user } = useAuthSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getMyProfile({ apiBaseUrl: config.apiBaseUrl })
      .then(setProfile)
      .catch(() => {
        /* silently fallback to session user data */
      });
  }, [config.apiBaseUrl]);

  const displayName = profile?.name?.trim() || user?.name?.trim() || user?.email?.trim();
  const email = profile?.email ?? user?.email;

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex items-start gap-8">
          {/* ── Left sidebar ── */}
          <aside className="w-60 shrink-0 sticky top-0">
            <Avatar className="h-36 w-36 rounded-full mb-4 ring-2 ring-border">
              <AvatarImage src={profile?.image ?? undefined} alt={displayName} />
              <AvatarFallback className="text-3xl font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-2xl font-bold leading-tight">{displayName ?? "—"}</h1>
            <p className="text-sm text-muted-foreground mt-0.5 mb-2">{email}</p>

            <RoleBadge role="Owner" />

            {profile?.bio && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            )}

            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link to="/dashboard/profile">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit profile
              </Link>
            </Button>

            <Separator className="my-4" />

            {/* Activity counts */}
            <div className="space-y-1.5">
              <StatLine value={MOCK_STATS.totalCreated} label="issues opened" />
              <StatLine value={MOCK_STATS.resolvedThisMonth} label="issues resolved this month" />
              <StatLine value={MOCK_WORKSPACES.length} label="workspaces" />
            </div>

            <Separator className="my-4" />

            {/* Profile info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              {profile?.location && (
                <ProfileInfoRow icon={MapPin}>{profile.location}</ProfileInfoRow>
              )}
              {profile?.website && (
                <ProfileInfoRow icon={Globe}>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground hover:underline truncate block"
                  >
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                </ProfileInfoRow>
              )}
              {profile?.timezone && (
                <ProfileInfoRow icon={Clock}>{profile.timezone}</ProfileInfoRow>
              )}
              <ProfileInfoRow icon={CalendarDays}>Joined June 2026</ProfileInfoRow>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="min-w-0 flex-1 space-y-8">
            {/* Stats overview */}
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

            {/* Workspaces */}
            <section>
              <SectionHeading icon={Building2} title="Workspaces" count={MOCK_WORKSPACES.length} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {MOCK_WORKSPACES.map((ws) => (
                  <WorkspaceCard key={ws.id} workspace={ws} />
                ))}
              </div>
            </section>

            {/* Recent activity */}
            <section>
              <SectionHeading title="Recent activity" />
              <div className="mt-3 overflow-hidden rounded-lg border divide-y">
                {MOCK_ACTIVITY.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function RoleBadge({ role }: { role: WorkspaceRole }) {
  return (
    <Badge
      className={cn(
        "rounded-full text-xs",
        role === "Owner" &&
          "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
        role === "Admin" && "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
        role === "Member" && "bg-secondary text-secondary-foreground",
      )}
      variant="ghost"
    >
      {role}
    </Badge>
  );
}

function StatLine({ value, label }: { value: number; label: string }) {
  return (
    <p className="text-sm">
      <span className="font-semibold text-foreground">{value}</span>{" "}
      <span className="text-muted-foreground">{label}</span>
    </p>
  );
}

function ProfileInfoRow({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  iconColor,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Icon className={cn("mb-2 h-4 w-4", iconColor)} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  count,
}: {
  icon?: React.ElementType;
  title: string;
  count?: number;
}) {
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

function WorkspaceCard({ workspace }: { workspace: MockWorkspace }) {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30">
      {/* Color accent bar */}
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
        style={{ backgroundColor: workspace.color }}
      />

      <div className="pl-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-semibold leading-tight">{workspace.name}</p>
          <RoleBadge role={workspace.role} />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CircleDot className="h-3 w-3" />
            {workspace.openIssues} open
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            {workspace.inProgress} in progress
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {workspace.members}
          </span>
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_CONFIG = {
  created: {
    icon: Plus,
    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
    verb: "Opened",
  },
  resolved: {
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    verb: "Resolved",
  },
  commented: {
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    verb: "Commented on",
  },
  assigned: {
    icon: UserCheck,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    verb: "Was assigned",
  },
} as const;

function ActivityItem({ item }: { item: MockActivity }) {
  const config = ACTIVITY_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 bg-card px-4 py-3">
      <div
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          config.color,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="text-muted-foreground">{config.verb} </span>
          <span className="font-medium">{item.title}</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.workspace} · {item.time}
        </p>
      </div>
    </div>
  );
}
