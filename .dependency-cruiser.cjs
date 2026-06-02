/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    // -------------------------------------------------------------------------
    // General dependency hygiene
    // -------------------------------------------------------------------------
    {
      name: "no-unresolvable",
      severity: "error",
      comment:
        "All imports must resolve. This catches broken paths, missing package exports, and missing workspace links.",
      from: {},
      to: {
        couldNotResolve: true,
      },
    },

    {
      name: "no-undeclared-dependencies",
      severity: "error",
      comment:
        "Source code must not import packages that are missing from the relevant package.json dependency graph.",
      from: {
        path: "^(apps|packages)/",
      },
      to: {
        dependencyTypes: ["unknown", "undetermined", "npm-no-pkg", "npm-unknown"],
      },
    },

    {
      name: "production-code-should-not-import-dev-dependencies",
      severity: "warn",
      comment:
        "Production source should generally not import devDependencies. Keep this as a warning because peer+dev dependencies such as React can be legitimate in workspace packages.",
      from: {
        path: "^(apps|packages)/",
        pathNot:
          "[.](?:spec|test|stories|config)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$|(^|/)(vite|vitest|storybook|knip|tsup|eslint|postcss|tailwind)[.]config[.]",
      },
      to: {
        dependencyTypes: ["npm-dev"],
      },
    },

    {
      name: "no-optional-dependencies-in-source",
      severity: "error",
      comment:
        "Avoid optional dependencies in production source unless explicitly justified and isolated.",
      from: {
        path: "^(apps|packages)/",
        pathNot: "[.](?:spec|test|stories|config)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$",
      },
      to: {
        dependencyTypes: ["npm-optional"],
      },
    },

    {
      name: "no-deprecated-dependencies",
      severity: "warn",
      comment: "Deprecated dependencies should be replaced or deliberately justified.",
      from: {
        path: "^(apps|packages)/",
      },
      to: {
        dependencyTypes: ["deprecated"],
      },
    },

    {
      name: "no-circular",
      severity: "error",
      comment:
        "Circular dependencies make code harder to refactor and can cause runtime initialization bugs.",
      from: {},
      to: {
        circular: true,
      },
    },

    {
      name: "no-orphan-source-files",
      severity: "warn",
      comment:
        "Orphan source files are often leftovers from refactors. Delete them or wire them into a public entry point.",
      from: {
        orphan: true,
        path: "^(apps|packages)/",
        pathNot:
          "(^|/)(index|main|app|vite[.]config|forge[.]config|postcss[.]config|tailwind[.]config|tsup[.]config)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$|[.](?:spec|test|stories)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$|[.]d[.]ts$|package[.]json$|knip[.]json$",
      },
      to: {},
    },

    // -------------------------------------------------------------------------
    // App boundaries
    // -------------------------------------------------------------------------
    {
      name: "packages-must-not-import-apps",
      severity: "error",
      comment:
        "Shared packages must not depend on deployable apps. Move shared code into packages/* instead.",
      from: {
        path: "^packages/",
      },
      to: {
        path: "^apps/",
      },
    },

    {
      name: "api-must-not-import-other-apps",
      severity: "error",
      comment: "The API app should not depend on web, desktop, or CLI app code.",
      from: {
        path: "^apps/api/",
      },
      to: {
        path: "^(apps/web|apps/desktop|apps/cli)/",
      },
    },

    {
      name: "web-must-not-import-other-apps",
      severity: "error",
      comment: "The web app should not depend on API, desktop, or CLI app code.",
      from: {
        path: "^apps/web/",
      },
      to: {
        path: "^(apps/api|apps/desktop|apps/cli)/",
      },
    },

    {
      name: "desktop-must-not-import-other-apps",
      severity: "error",
      comment: "The desktop app should not depend on API, web, or CLI app code.",
      from: {
        path: "^apps/desktop/",
      },
      to: {
        path: "^(apps/api|apps/web|apps/cli)/",
      },
    },

    {
      name: "cli-must-not-import-other-apps",
      severity: "error",
      comment:
        "The CLI app should communicate through shared packages and APIs, not import other app implementations.",
      from: {
        path: "^apps/cli/",
      },
      to: {
        path: "^(apps/api|apps/web|apps/desktop)/",
      },
    },

    // -------------------------------------------------------------------------
    // Thin host app rules
    // -------------------------------------------------------------------------
    {
      name: "web-must-not-import-api-client-directly",
      severity: "error",
      comment:
        "The web app should stay a thin host. API-backed frontend flows belong in @appkit/frontend.",
      from: {
        path: "^apps/web/",
      },
      to: {
        path: "^packages/api-client/",
      },
    },

    {
      name: "desktop-must-not-import-api-client-directly",
      severity: "error",
      comment:
        "The desktop app should stay a thin host. API-backed frontend flows belong in @appkit/frontend.",
      from: {
        path: "^apps/desktop/",
      },
      to: {
        path: "^packages/api-client/",
      },
    },

    {
      name: "web-must-not-import-core-directly",
      severity: "error",
      comment:
        "The web app should stay a thin host. Schema/domain wiring should live in @appkit/frontend.",
      from: {
        path: "^apps/web/",
      },
      to: {
        path: "^packages/core/",
      },
    },

    {
      name: "desktop-renderer-must-not-import-core-directly",
      severity: "error",
      comment:
        "The desktop renderer should stay a thin host. Schema/domain wiring should live in @appkit/frontend. Desktop config files may import core metadata for packaging.",
      from: {
        path: "^apps/desktop/renderer/",
      },
      to: {
        path: "^packages/core/",
      },
    },

    {
      name: "apps-must-not-deep-import-frontend",
      severity: "error",
      comment:
        "Apps should consume @appkit/frontend through its public entry point, not internal source files.",
      from: {
        path: "^(apps/web|apps/desktop)/",
      },
      to: {
        path: "^packages/frontend/src/",
        pathNot: "^packages/frontend/src/index[.]ts$",
      },
    },

    {
      name: "apps-must-not-deep-import-ui",
      severity: "error",
      comment:
        "Apps should consume @appkit/ui through its public entry point or CSS export, not internal source files.",
      from: {
        path: "^(apps/web|apps/desktop)/",
      },
      to: {
        path: "^packages/ui/src/",
        pathNot: "^packages/ui/src/(index[.]ts|styles/globals[.]css)$",
      },
    },

    // -------------------------------------------------------------------------
    // Package layering
    // -------------------------------------------------------------------------
    {
      name: "core-must-stay-independent",
      severity: "error",
      comment:
        "@appkit/core should stay framework-agnostic and must not depend on config, UI, frontend, API client, or app code.",
      from: {
        path: "^packages/core/",
      },
      to: {
        path: "^(packages/config|packages/ui|packages/frontend|packages/api-client|apps)/",
      },
    },

    {
      name: "core-must-not-import-node-builtins",
      severity: "error",
      comment:
        "@appkit/core should stay runtime-neutral and must not depend on Node built-in modules.",
      from: {
        path: "^packages/core/",
      },
      to: {
        dependencyTypes: ["core"],
      },
    },

    {
      name: "config-must-stay-independent",
      severity: "error",
      comment:
        "@appkit/config should provide shared configuration defaults/helpers and must not depend on apps, UI, frontend, or API client code.",
      from: {
        path: "^packages/config/",
      },
      to: {
        path: "^(apps|packages/ui|packages/frontend|packages/api-client)/",
      },
    },

    {
      name: "config-must-not-import-react",
      severity: "error",
      comment:
        "@appkit/config must stay runtime/helper focused and must not depend on React or frontend libraries.",
      from: {
        path: "^packages/config/",
      },
      to: {
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"],
        path: "^(react|react-dom|react-router-dom|react-hook-form|@hookform/resolvers|@vitejs/.*|vite|lucide-react|radix-ui)$",
      },
    },

    {
      name: "browser-code-must-not-import-server-config",
      severity: "error",
      comment:
        "Browser, renderer, shared frontend, UI, and API client code must not import Node/server-only config helpers.",
      from: {
        path: "^(apps/web|apps/desktop/renderer|packages/frontend|packages/ui|packages/api-client)/",
      },
      to: {
        path: "^packages/config/src/server[.]ts$",
      },
    },

    {
      name: "api-client-must-not-import-apps",
      severity: "error",
      comment: "@appkit/api-client should stay reusable and must not depend on apps.",
      from: {
        path: "^packages/api-client/",
      },
      to: {
        path: "^apps/",
      },
    },

    {
      name: "api-client-must-not-import-ui-or-frontend",
      severity: "error",
      comment:
        "@appkit/api-client should stay transport-focused and must not depend on React UI or frontend application code.",
      from: {
        path: "^packages/api-client/",
      },
      to: {
        path: "^(packages/ui|packages/frontend)/",
      },
    },

    {
      name: "api-client-must-not-deep-import-core",
      severity: "error",
      comment:
        "@appkit/api-client should consume @appkit/core through public exports, not internal source files.",
      from: {
        path: "^packages/api-client/",
      },
      to: {
        path: "^packages/core/src/",
        pathNot: "^packages/core/src/(index[.]ts|metadata/index[.]ts)$",
      },
    },

    {
      name: "api-client-must-not-import-frontend-libraries",
      severity: "error",
      comment:
        "@appkit/api-client should stay framework-agnostic and must not depend on React, routing, forms, Vite, or UI libraries.",
      from: {
        path: "^packages/api-client/",
      },
      to: {
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"],
        path: "^(react|react-dom|react-router-dom|react-hook-form|@hookform/resolvers|@vitejs/.*|vite|lucide-react|radix-ui)$",
      },
    },

    {
      name: "frontend-must-not-import-apps",
      severity: "error",
      comment:
        "@appkit/frontend should be shared across web and desktop and must not depend on app-specific implementation code.",
      from: {
        path: "^packages/frontend/",
      },
      to: {
        path: "^apps/",
      },
    },

    {
      name: "frontend-must-not-deep-import-ui",
      severity: "error",
      comment:
        "@appkit/frontend should consume @appkit/ui through its public entry point so UI internals remain refactorable.",
      from: {
        path: "^packages/frontend/",
      },
      to: {
        path: "^packages/ui/src/",
        pathNot: "^packages/ui/src/(index[.]ts|styles/globals[.]css)$",
      },
    },

    {
      name: "frontend-must-not-use-electron",
      severity: "error",
      comment: "@appkit/frontend must stay platform-neutral. Electron APIs belong in apps/desktop.",
      from: {
        path: "^packages/frontend/",
      },
      to: {
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"],
        path: "^(electron|@electron/.*)$",
      },
    },

    {
      name: "ui-must-not-import-apps",
      severity: "error",
      comment: "@appkit/ui should stay reusable and must not depend on deployable apps.",
      from: {
        path: "^packages/ui/",
      },
      to: {
        path: "^apps/",
      },
    },

    {
      name: "ui-must-not-import-frontend",
      severity: "error",
      comment:
        "@appkit/ui is the reusable design-system layer and must not depend on @appkit/frontend.",
      from: {
        path: "^packages/ui/",
      },
      to: {
        path: "^packages/frontend/",
      },
    },

    {
      name: "ui-must-not-import-api-client",
      severity: "error",
      comment:
        "@appkit/ui must stay presentational and must not call API client functions directly. Put API-backed flows in @appkit/frontend.",
      from: {
        path: "^packages/ui/",
      },
      to: {
        path: "^packages/api-client/",
      },
    },

    {
      name: "ui-must-not-import-core",
      severity: "error",
      comment:
        "@appkit/ui should avoid app/domain coupling. Put schema-aware or domain-aware logic in @appkit/frontend or @appkit/core consumers.",
      from: {
        path: "^packages/ui/",
      },
      to: {
        path: "^packages/core/",
      },
    },

    {
      name: "ui-must-not-import-react-router",
      severity: "error",
      comment:
        "@appkit/ui should not own routing. Route-aware components and navigation flows belong in @appkit/frontend.",
      from: {
        path: "^packages/ui/",
      },
      to: {
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"],
        path: "^react-router-dom$",
      },
    },

    {
      name: "ui-must-not-import-form-resolvers",
      severity: "error",
      comment:
        "@appkit/ui may render forms, but schema resolver wiring belongs in @appkit/frontend.",
      from: {
        path: "^packages/ui/",
      },
      to: {
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"],
        path: "^@hookform/resolvers",
      },
    },

    {
      name: "ui-must-not-use-electron",
      severity: "error",
      comment: "@appkit/ui must stay platform-neutral and must not depend on Electron APIs.",
      from: {
        path: "^packages/ui/",
      },
      to: {
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"],
        path: "^(electron|@electron/.*)$",
      },
    },

    {
      name: "ui-must-not-contain-pages-routes-or-screens",
      severity: "error",
      comment:
        "@appkit/ui should not contain pages, routes, or screens. Move app-level frontend code to @appkit/frontend.",
      from: {
        path: "^packages/ui/src/(pages|routes|screens)/",
      },
      to: {},
    },

    // -------------------------------------------------------------------------
    // API and CLI environment boundaries
    // -------------------------------------------------------------------------
    {
      name: "api-must-not-import-ui-or-frontend",
      severity: "error",
      comment: "The API app should not depend on React, UI, or frontend application code.",
      from: {
        path: "^apps/api/",
      },
      to: {
        path: "^(packages/ui|packages/frontend)/",
      },
    },

    {
      name: "api-must-not-import-browser-ui-libraries",
      severity: "error",
      comment: "The API app should remain server-side and must not import browser/UI libraries.",
      from: {
        path: "^apps/api/",
      },
      to: {
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"],
        path: "^(react|react-dom|react-router-dom|react-hook-form|@hookform/resolvers|@vitejs/.*|vite|lucide-react|radix-ui)$",
      },
    },

    {
      name: "cli-must-not-import-ui-or-frontend",
      severity: "error",
      comment:
        "The CLI app should stay terminal-focused and must not depend on React UI or shared frontend route/page code.",
      from: {
        path: "^apps/cli/",
      },
      to: {
        path: "^(packages/ui|packages/frontend)/",
      },
    },

    // -------------------------------------------------------------------------
    // Refactor safety
    // -------------------------------------------------------------------------
    {
      name: "web-must-not-import-ui-pages-directly",
      severity: "error",
      comment:
        "The web app should consume shared pages/routes from @appkit/frontend, not page-level code from @appkit/ui.",
      from: {
        path: "^apps/web/",
      },
      to: {
        path: "^packages/ui/src/(pages|screens|routes)/",
      },
    },

    {
      name: "desktop-must-not-import-ui-pages-directly",
      severity: "error",
      comment:
        "The desktop app should consume shared pages/routes from @appkit/frontend, not page-level code from @appkit/ui.",
      from: {
        path: "^apps/desktop/",
      },
      to: {
        path: "^packages/ui/src/(pages|screens|routes)/",
      },
    },

    {
      name: "no-import-from-build-output",
      severity: "error",
      comment: "Source code should not import generated build output.",
      from: {
        path: "^(apps|packages)/",
      },
      to: {
        path: "/(dist|build|out|[.]next|[.]vite|coverage)/",
      },
    },

    {
      name: "no-test-imports-from-source",
      severity: "error",
      comment: "Production source files should not import test/spec files.",
      from: {
        path: "^(apps|packages)/",
        pathNot: "[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$",
      },
      to: {
        path: "[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$",
      },
    },

    // -------------------------------------------------------------------------
    // Optional feature isolation rules. These only apply if the folders exist.
    // -------------------------------------------------------------------------
    {
      name: "ui-features-must-not-import-other-ui-features",
      severity: "error",
      comment:
        "UI feature folders should stay independent. Shared code should move to common UI components, hooks, or utils.",
      from: {
        path: "^packages/ui/src/components/features/([^/]+)/",
      },
      to: {
        path: "^packages/ui/src/components/features/([^/]+)/",
        pathNot: "^packages/ui/src/components/features/$1/",
      },
    },

    {
      name: "frontend-features-must-not-import-other-frontend-features",
      severity: "error",
      comment:
        "Frontend feature folders should stay independent. Shared app-flow code should move to shared frontend components, hooks, or utils.",
      from: {
        path: "^packages/frontend/src/features/([^/]+)/",
      },
      to: {
        path: "^packages/frontend/src/features/([^/]+)/",
        pathNot: "^packages/frontend/src/features/$1/",
      },
    },
  ],

  options: {
    doNotFollow: {
      path: ["node_modules"],
    },

    exclude: {
      path: [
        "(^|/)node_modules/",
        "(^|/)dist/",
        "(^|/)build/",
        "(^|/)out/",
        "(^|/)[.]next/",
        "(^|/)[.]vite/",
        "(^|/)coverage/",
        "(^|/)[.]turbo/",
        "(^|/)[.]git/",
        "(^|/)[.]cache/",
        "(^|/)[.]output/",
      ],
    },

    combinedDependencies: true,

    detectProcessBuiltinModuleCalls: true,

    tsPreCompilationDeps: true,

    tsConfig: {
      fileName: "tsconfig.json",
    },

    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".cjs", ".d.ts", ".css"],
      mainFields: ["module", "main", "types", "typings"],
    },

    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/(?:@[^/]+/[^/]+|[^/]+)",
      },

      archi: {
        collapsePattern: "^(?:apps|packages)/[^/]+|node_modules/(?:@[^/]+/[^/]+|[^/]+)",
      },

      text: {
        highlightFocused: true,
      },
    },
  },
};
