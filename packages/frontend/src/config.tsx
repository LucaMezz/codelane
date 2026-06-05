import { createContext, useContext } from "react";

// similarity-ignore — same shape as ClientRuntimeConfig by design; this is
// the React context type, ClientRuntimeConfig is the raw config definition.
export type FrontendRuntimeConfig = {
  apiBaseUrl: string;
};

const FrontendRuntimeConfigContext = createContext<FrontendRuntimeConfig | null>(null);

export function FrontendRuntimeConfigProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: FrontendRuntimeConfig;
}): React.JSX.Element {
  return (
    <FrontendRuntimeConfigContext.Provider value={config}>
      {children}
    </FrontendRuntimeConfigContext.Provider>
  );
}

export function useFrontendRuntimeConfig(): FrontendRuntimeConfig {
  const config = useContext(FrontendRuntimeConfigContext);

  if (!config) {
    throw new Error("Frontend runtime config provider is missing.");
  }

  return config;
}
