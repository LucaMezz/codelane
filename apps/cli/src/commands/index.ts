import { Command } from "commander";

import { authStatus } from "./auth-status";
import { login } from "./login";
import { logout } from "./logout";
import { status } from "./status";
import { whoami } from "./whoami";

export const registerCommands = (program: Command) => {
  login(program);
  logout(program);
  status(program);
  whoami(program);
  authStatus(program);
};
