import { defineConfig } from "cz-git";

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  extends: ["@commitlint/config-conventional"],

  prompt: {
    alias: {
      fd: "docs: fix typos",
      r: "refactor: restructure code",
      s: "style: format code",
      t: "test: add missing tests",
    },

    messages: {
      type: "Select the type of change:",
      scope: "Scope, optional:",
      customScope: "Custom scope:",
      subject: "Short description:",
      body: "Longer description, optional. Use | for line breaks:",
      breaking: "Breaking changes, optional:",
      footerPrefixsSelect: "Footer type, optional:",
      customFooterPrefixs: "Custom footer prefix:",
      footer: "Footer, optional:",
      generatingByAI: "Generating commit subject through AI...",
      generatedSelectByAI: "Select AI-generated subject:",
      confirmCommit: "Commit with this message?",
    },

    types: [
      { value: "feat", name: "feat:     A new feature", emoji: "✨" },
      { value: "fix", name: "fix:      A bug fix", emoji: "🐛" },
      {
        value: "docs",
        name: "docs:     Documentation only changes",
        emoji: "📝",
      },
      {
        value: "style",
        name: "style:    Formatting, missing semicolons, etc.",
        emoji: "💄",
      },
      {
        value: "refactor",
        name: "refactor: Code change that neither fixes a bug nor adds a feature",
        emoji: "♻️",
      },
      {
        value: "perf",
        name: "perf:     Performance improvement",
        emoji: "⚡️",
      },
      {
        value: "test",
        name: "test:     Adding or updating tests",
        emoji: "✅",
      },
      {
        value: "build",
        name: "build:    Build system or external dependencies",
        emoji: "📦",
      },
      {
        value: "ci",
        name: "ci:       CI configuration changes",
        emoji: "🎡",
      },
      {
        value: "chore",
        name: "chore:    Other changes that do not modify src or test files",
        emoji: "🔧",
      },
      {
        value: "revert",
        name: "revert:   Revert a previous commit",
        emoji: "⏪",
      },
    ],

    useEmoji: false,

    scopes: [
      "api",
      "api-client",
      "cli",
      "config",
      "core",
      "db",
      "deps",
      "desktop",
      "docker",
      "docs",
      "frontend",
      "repo",
      "tooling",
      "ui",
      "vscode",
      "web",
      "ci",
    ],

    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: "bottom",
    emptyScopesAlias: "none",
    customScopesAlias: "custom",
  },
});
