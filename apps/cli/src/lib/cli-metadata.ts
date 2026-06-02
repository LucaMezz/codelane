import { appMetadata } from "@appkit/core/metadata";

import cliPackageJson from "../../package.json" with { type: "json" };

export const cliMetadata = {
  displayName: appMetadata.slug,
  binaryName: appMetadata.slug,
  description: cliPackageJson.description,
  version: cliPackageJson.version,
} as const;
