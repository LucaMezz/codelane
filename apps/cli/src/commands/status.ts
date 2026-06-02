import type { Command } from "commander";

import { cliMetadata } from "#lib/cli-metadata";

export const status = (program: Command) => {
  program
    .command("status")
    .description("Show CLI and API configuration status.")
    .action(() => {
      console.info(`${cliMetadata.displayName} is installed.`);
    });
};
