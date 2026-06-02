import { Command } from "commander";

import { cliMetadata } from "#lib/cli-metadata";

import { registerCommands } from "./commands";

const program = new Command();

program
  .name(cliMetadata.displayName)
  .description(cliMetadata.description)
  .version(cliMetadata.version, "-v, --version");

registerCommands(program);

program.action(() => {
  program.outputHelp();
});

program.parse(process.argv);
