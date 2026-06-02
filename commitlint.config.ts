// oxlint-disable-next-line import/no-default-export
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "api",
        "api-client",
        "cli",
        "config",
        "core",
        "desktop",
        "frontend",
        "ui",
        "web",

        "deps",
        "ci",
        "docker",
        "db",
        "docs",
        "repo",
        "tooling",
        "vscode",
      ],
    ],
  },
};
