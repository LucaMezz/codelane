import { describe, expect, it } from "vitest";

import { createPkcePair, createRandomState, verifyState } from "./pkce";

describe("pkce helpers", () => {
  it("generates verifier, challenge, and state values", () => {
    const first = createPkcePair();
    const second = createPkcePair();

    expect(first.codeVerifier).toHaveLength(86);
    expect(first.codeChallenge).toHaveLength(43);
    expect(first.codeVerifier).not.toEqual(second.codeVerifier);
    expect(createRandomState()).toHaveLength(43);
  });

  it("rejects mismatched callback state", () => {
    expect(() => verifyState("expected", "actual")).toThrow("State mismatch");
    expect(() => verifyState("expected", "expected")).not.toThrow();
  });
});
