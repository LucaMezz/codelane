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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Textarea,
  cn,
  toast,
} from "@codelane/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { useAuthSession } from "../../../components/auth/auth-session-provider";
import { useFrontendRuntimeConfig } from "../../../config";

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

export function ProfilePage(): React.JSX.Element {
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
        toast.error("Could not load your profile. Please try again.");
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
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Settings</h1>
        <Separator />

        <div className="flex gap-10 pt-8">
          {/* Left navigation */}
          <nav className="w-52 shrink-0 space-y-0.5">
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

          {/* Main content */}
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

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <Separator className="mt-4" />
    </div>
  );
}

function SettingsField({
  label,
  htmlFor,
  hint,
  children,
  error,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  error?: string;
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
      bio: profile?.bio ?? "",
      location: profile?.location ?? "",
      website: profile?.website ?? "",
      timezone: profile?.timezone ?? "",
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
      <SectionHeader
        title="Public profile"
        description="This information will be visible to other members of your workspace."
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex gap-8">
          {/* Form fields */}
          <div className="flex-1 space-y-5">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <SettingsField
                  label="Name"
                  htmlFor="profile-name"
                  hint="Your name may appear around CodeLane where you contribute."
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="profile-name"
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
              name="bio"
              render={({ field, fieldState }) => (
                <SettingsField
                  label="Bio"
                  htmlFor="profile-bio"
                  hint="Tell others a bit about yourself."
                  error={fieldState.error?.message}
                >
                  <Textarea
                    {...field}
                    id="profile-bio"
                    disabled={loading}
                    placeholder="A short bio about yourself"
                    rows={4}
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
                  htmlFor="profile-location"
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="profile-location"
                    disabled={loading}
                    placeholder="e.g. London, UK"
                    className="max-w-sm"
                  />
                </SettingsField>
              )}
            />

            <Controller
              control={form.control}
              name="website"
              render={({ field, fieldState }) => (
                <SettingsField
                  label="Website"
                  htmlFor="profile-website"
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="profile-website"
                    disabled={loading}
                    placeholder="https://yoursite.com"
                    type="url"
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
                  htmlFor="profile-timezone"
                  hint="Used for displaying dates and deadlines in your local time."
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="profile-timezone"
                    disabled={loading}
                    placeholder="e.g. Europe/London"
                    className="max-w-sm"
                  />
                </SettingsField>
              )}
            />
          </div>

          {/* Avatar */}
          <div className="w-44 shrink-0">
            <p className="mb-3 text-sm font-semibold">Profile picture</p>
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-28 w-28">
                <AvatarImage src={profile?.image ?? undefined} alt={displayName} />
                <AvatarFallback className="text-2xl">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <p className="text-center text-xs text-muted-foreground leading-relaxed">
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

function SecuritySection({ apiBaseUrl }: { apiBaseUrl: string }) {
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
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
      <SectionHeader
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
              htmlFor="security-current-password"
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="security-current-password"
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
              htmlFor="security-new-password"
              hint="At least 6 characters."
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="security-new-password"
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
              htmlFor="security-confirm-password"
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="security-confirm-password"
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
      <SectionHeader
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
                id="pref-email-notifications"
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
