import { createContext, useContext } from "react";

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
