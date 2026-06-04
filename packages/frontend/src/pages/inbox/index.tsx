import { useAuthSession } from "#components/auth/auth-session-provider";

export function InboxPage() {
  const { user } = useAuthSession();
  const greeting = user?.name?.trim() || user?.email?.trim() || "there";

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {greeting}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your CodeLane inbox is ready.</p>
        </div>
      </div>
    </div>
  );
}
