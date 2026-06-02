import Conf from "conf";

export type CliConfig = {
  apiUrl?: string;
  webUrl?: string;
  userId?: string;
  userEmail?: string | null;
  userName?: string | null;
};

const config = new Conf<CliConfig>({
  projectName: "appkit",
  configName: "cli",
});

export const configStore = {
  get(): CliConfig {
    return config.store;
  },

  set(values: CliConfig): void {
    config.store = {
      ...config.store,
      ...values,
    };
  },

  clearUser(): void {
    config.delete("userId");
    config.delete("userEmail");
    config.delete("userName");
  },
};
