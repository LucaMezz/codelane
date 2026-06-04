import {
  changeMyPassword,
  getMyPreferences,
  getMyProfile,
  updateMyPreferences,
  updateMyProfile,
} from "@codelane/api-client";
import {
  changePasswordSchema,
  getInitials,
  themeSchema,
  updatePreferencesSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdatePreferencesInput,
  type UpdateProfileInput,
  type UserPreferences,
  type UserProfile,
} from "@codelane/core";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  LocationCombobox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  SettingsSectionHeader,
  Switch,
  TimezoneCombobox,
  cn,
  toast,
} from "@codelane/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { useAuthSession } from "#components/auth/auth-session-provider";
import { useFrontendRuntimeConfig } from "#config";

// ── Section nav ──────────────────────────────────────────────────────────────

const SECTIONS = ["profile", "security", "preferences"] as const;
type Section = (typeof SECTIONS)[number];

function isValidSection(value: string | null): value is Section {
  return SECTIONS.includes(value as Section);
}

const NAV_ITEMS: { id: Section; label: string }[] = [
  { id: "profile", label: "Public profile" },
  { id: "security", label: "Security & password" },
  { id: "preferences", label: "Preferences" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function SettingsPage(): React.JSX.Element {
  const config = useFrontendRuntimeConfig();
  const { user } = useAuthSession();

  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get("tab");
  const activeSection: Section = isValidSection(sectionParam) ? sectionParam : "profile";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProfile({ apiBaseUrl: config.apiBaseUrl }),
      getMyPreferences({ apiBaseUrl: config.apiBaseUrl }),
    ])
      .then(([profileData, prefsData]) => {
        setProfile(profileData);
        setPreferences(prefsData);
      })
      .catch(() => {
        toast.error("Could not load your settings. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [config.apiBaseUrl]);

  function setSection(section: Section) {
    setSearchParams({ tab: section }, { replace: true });
  }

  const displayName = profile?.name?.trim() || user?.name?.trim() || user?.email?.trim();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>
        <Separator />

        <div className="flex flex-col lg:flex-row gap-10 pt-8">
          {/* Left nav */}
          <nav className="w-full md:w-52 shrink-0 space-y-0.5">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Account
            </p>
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={cn(
                  "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                  activeSection === id
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {activeSection === "profile" && (
              <ProfileSection
                profile={profile}
                loading={loading}
                apiBaseUrl={config.apiBaseUrl}
                displayName={displayName}
                onSaved={setProfile}
              />
            )}
            {activeSection === "security" && <SecuritySection apiBaseUrl={config.apiBaseUrl} />}
            {activeSection === "preferences" && (
              <PreferencesSection
                preferences={preferences}
                loading={loading}
                apiBaseUrl={config.apiBaseUrl}
                onSaved={setPreferences}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared primitives ────────────────────────────────────────────────────────

function SettingsField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({
  profile,
  loading,
  apiBaseUrl,
  displayName,
  onSaved,
}: {
  profile: UserProfile | null;
  loading: boolean;
  apiBaseUrl: string;
  displayName: string | undefined;
  onSaved: (p: UserProfile) => void;
}) {
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: profile?.name ?? "",
      title: profile?.title ?? "",
      location: profile?.location ?? "",
      timezone: profile?.timezone ?? "",
      status: profile?.status ?? "",
    },
  });

  async function onSubmit(data: UpdateProfileInput) {
    const result = await updateMyProfile(data, { apiBaseUrl }).catch(() => null);
    if (!result) {
      toast.error("Could not reach the server. Please try again.");
      return;
    }
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    onSaved(result.profile);
    toast.success("Profile updated.");
  }

  return (
    <div>
      <SettingsSectionHeader
        title="Public profile"
        description="This information will be visible to other members of your workspace."
      />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex-1 space-y-5">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <SettingsField
                  label="Name"
                  htmlFor="s-name"
                  hint="Your name may appear around CodeLane where you contribute."
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="s-name"
                    disabled={loading}
                    placeholder="Your name"
                    autoComplete="name"
                    className="max-w-sm"
                  />
                </SettingsField>
              )}
            />

            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <SettingsField
                  label="Title"
                  htmlFor="s-title"
                  hint="Your title or role."
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="s-title"
                    disabled={loading}
                    placeholder="e.g. Software Engineer"
                    className="max-w-sm"
                  />
                </SettingsField>
              )}
            />

            <Controller
              control={form.control}
              name="location"
              render={({ field, fieldState }) => (
                <SettingsField
                  label="Location"
                  htmlFor="s-location"
                  error={fieldState.error?.message}
                >
                  <LocationCombobox
                    id="s-location"
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={() => field.onBlur()}
                    disabled={loading}
                    className="max-w-sm"
                  />
                </SettingsField>
              )}
            />

            <Controller
              control={form.control}
              name="timezone"
              render={({ field, fieldState }) => (
                <SettingsField
                  label="Timezone"
                  htmlFor="s-timezone"
                  hint="Used for displaying dates and deadlines in your local time."
                  error={fieldState.error?.message}
                >
                  <TimezoneCombobox
                    id="s-timezone"
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={() => field.onBlur()}
                    disabled={loading}
                    className="max-w-sm"
                  />
                </SettingsField>
              )}
            />

            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <SettingsField
                  label="Status"
                  htmlFor="s-status"
                  hint="A short status visible to your team members on your profile."
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="s-status"
                    disabled={loading}
                    placeholder="e.g. Working on auth refactor"
                    className="max-w-sm"
                    maxLength={100}
                  />
                </SettingsField>
              )}
            />
          </div>

          <div className="sm:w-44 sm:shrink-0">
            <p className="mb-3 text-sm font-semibold">Profile picture</p>
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-28 w-28">
                <AvatarImage src={profile?.image ?? undefined} alt={displayName} />
                <AvatarFallback className="text-2xl">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Avatar is based on your account image.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        <Button type="submit" disabled={form.formState.isSubmitting || loading}>
          {form.formState.isSubmitting ? "Saving..." : "Update profile"}
        </Button>
      </form>
    </div>
  );
}

// ── Security section ─────────────────────────────────────────────────────────

function SecuritySection({ apiBaseUrl }: { apiBaseUrl: string }) {
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordInput) {
    const result = await changeMyPassword(data, { apiBaseUrl }).catch(() => null);
    if (!result) {
      toast.error("Could not reach the server. Please try again.");
      return;
    }
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    form.reset();
    toast.success("Password changed successfully.");
  }

  return (
    <div>
      <SettingsSectionHeader
        title="Change password"
        description="After a successful password change, you will remain signed in."
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-5">
        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field, fieldState }) => (
            <SettingsField
              label="Current password"
              htmlFor="s-current-pw"
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="s-current-pw"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </SettingsField>
          )}
        />

        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <SettingsField
              label="New password"
              htmlFor="s-new-pw"
              hint="At least 6 characters."
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="s-new-pw"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </SettingsField>
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <SettingsField
              label="Confirm new password"
              htmlFor="s-confirm-pw"
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="s-confirm-pw"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </SettingsField>
          )}
        />

        <Separator />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}

// ── Preferences section ──────────────────────────────────────────────────────

function PreferencesSection({
  preferences,
  loading,
  apiBaseUrl,
  onSaved,
}: {
  preferences: UserPreferences | null;
  loading: boolean;
  apiBaseUrl: string;
  onSaved: (p: UserPreferences) => void;
}) {
  const form = useForm<UpdatePreferencesInput>({
    resolver: zodResolver(updatePreferencesSchema),
    values: {
      theme: preferences?.theme ?? "system",
      emailNotifications: preferences?.emailNotifications ?? true,
    },
  });

  async function onSubmit(data: UpdatePreferencesInput) {
    const result = await updateMyPreferences(data, { apiBaseUrl }).catch(() => null);
    if (!result) {
      toast.error("Could not reach the server. Please try again.");
      return;
    }
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    onSaved(result.preferences);
    toast.success("Preferences saved.");
  }

  return (
    <div>
      <SettingsSectionHeader
        title="Preferences"
        description="Manage how CodeLane looks and behaves for you."
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-0">
        <Controller
          control={form.control}
          name="theme"
          render={({ field }) => (
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold">Theme</p>
                <p className="text-xs text-muted-foreground">Choose your preferred color scheme.</p>
              </div>
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(themeSchema.parse(v))}
                disabled={loading}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <Separator />

        <Controller
          control={form.control}
          name="emailNotifications"
          render={({ field }) => (
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold">Email notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive email updates about your issues and activity.
                </p>
              </div>
              <Switch
                id="s-email-notif"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={loading}
              />
            </div>
          )}
        />

        <Separator />

        <div className="pt-5">
          <Button type="submit" disabled={form.formState.isSubmitting || loading}>
            {form.formState.isSubmitting ? "Saving..." : "Save preferences"}
          </Button>
        </div>
      </form>
    </div>
  );
}
