import { describe, expect, it } from "vitest";

import { getCliName } from "#lib/get-cli-name";

import { cliMetadata } from "./cli-metadata";

describe("getCliName", () => {
  it("returns the CLI name", () => {
    expect(getCliName()).toBe(cliMetadata.displayName);
  });
});
