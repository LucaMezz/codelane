export const defaultPorts = {
  api: 4000,
  web: 3000,
  desktopRenderer: 5173,
  postgres: 5432,
} as const;

export const defaultHosts = {
  local: "localhost",
  dockerPostgres: "postgres",
} as const;

export const defaultLocalOrigins = {
  api: `http://${defaultHosts.local}:${defaultPorts.api}`,
  web: `http://${defaultHosts.local}:${defaultPorts.web}`,
  desktopRenderer: `http://${defaultHosts.local}:${defaultPorts.desktopRenderer}`,
} as const;

export const defaultCorsOrigins = [
  defaultLocalOrigins.web,
  defaultLocalOrigins.desktopRenderer,
] as const;
