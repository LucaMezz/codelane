import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedMode: Exclude<ThemeMode, "system">;
  setMode: (mode: ThemeMode) => void;
};

const storageKey = "appkit-theme";
const defaultThemeMode = "system" satisfies ThemeMode;
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemMode(): Exclude<ThemeMode, "system"> {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredMode(defaultMode: ThemeMode): ThemeMode {
  if (typeof window === "undefined") {
    return defaultMode;
  }

  const storedMode = window.localStorage.getItem(storageKey);

  return storedMode === "light" || storedMode === "dark" || storedMode === "system"
    ? storedMode
    : defaultMode;
}

function applyResolvedMode(resolvedMode: Exclude<ThemeMode, "system">) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  document.documentElement.style.colorScheme = resolvedMode;
}

function resolveMode(mode: ThemeMode): Exclude<ThemeMode, "system"> {
  return mode === "system" ? getSystemMode() : mode;
}

export function ThemeProvider({
  children,
  defaultMode = defaultThemeMode,
}: {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}) {
  const [mode, setModeState] = React.useState<ThemeMode>(() => getStoredMode(defaultMode));
  const [resolvedMode, setResolvedMode] = React.useState<Exclude<ThemeMode, "system">>(() =>
    resolveMode(getStoredMode(defaultMode)),
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function updateResolvedMode() {
      setResolvedMode(resolveMode(mode));
    }

    updateResolvedMode();
    mediaQuery.addEventListener("change", updateResolvedMode);

    return () => {
      mediaQuery.removeEventListener("change", updateResolvedMode);
    };
  }, [mode]);

  React.useEffect(() => {
    applyResolvedMode(resolvedMode);
  }, [resolvedMode]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      setMode(nextMode) {
        window.localStorage.setItem(storageKey, nextMode);
        setModeState(nextMode);
      },
    }),
    [mode, resolvedMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
