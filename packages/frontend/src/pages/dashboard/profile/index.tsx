import { getMyProfile } from "@codelane/api-client";
import { getInitials, type UserProfile } from "@codelane/core";
import { Avatar, AvatarFallback, AvatarImage, Button, Separator } from "@codelane/ui";
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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuthSession } from "../../../components/auth/auth-session-provider";
import { ActivityGraph } from "../../../components/profile/activity-graph";
import { ActivityItem, type ActivityEvent } from "../../../components/profile/activity-item";
import { RoleBadge } from "../../../components/profile/role-badge";
import { SectionHeading } from "../../../components/profile/section-heading";
import { StatCard } from "../../../components/profile/stat-card";
import { WorkspaceCard, type Workspace } from "../../../components/profile/workspace-card";
import { useFrontendRuntimeConfig } from "../../../config";

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
];

const MOCK_STATS = { open: 17, inProgress: 5, resolvedThisMonth: 12, totalCreated: 34 };

// ── Page ─────────────────────────────────────────────────────────────────────

export function ProfileViewPage(): React.JSX.Element {
  const config = useFrontendRuntimeConfig();
  const { user } = useAuthSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getMyProfile({ apiBaseUrl: config.apiBaseUrl })
      .then(setProfile)
      .catch(() => {
        /* fallback to session user */
      });
  }, [config.apiBaseUrl]);

  const displayName = profile?.name?.trim() || user?.name?.trim() || user?.email?.trim();
  const email = profile?.email ?? user?.email;

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="flex items-start gap-8">
          {/* ── Sidebar ── */}
          <aside className="w-60 shrink-0 sticky top-0">
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
            {/* Stats */}
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

            {/* Activity graph */}
            <ActivityGraph />

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
              <div className="mt-3 divide-y overflow-hidden rounded-lg border">
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

// ── Sidebar-local helpers (tightly coupled to this layout) ───────────────────

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
