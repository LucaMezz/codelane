## Summary

<!-- Briefly explain what this PR changes and why. -->

## Type of change

<!-- Tick all that apply. -->

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Tooling / configuration
- [ ] Documentation
- [ ] Tests
- [ ] CI / release
- [ ] Breaking change

## Changes

<!-- List the main changes made in this PR. -->

-
-
-

## Motivation

<!-- Explain the problem this solves or the reason for the change. -->

## Architecture / package boundary checklist

<!-- Tick any that apply. -->

- [ ] This PR respects the current package boundaries.
- [ ] Shared UI-only code remains in `@appkit/ui`.
- [ ] Shared frontend routes/pages/flows remain in `@appkit/frontend`.
- [ ] Runtime config, ports, URLs, and env names use `@appkit/config`.
- [ ] Shared schemas/types remain in `@appkit/core`.
- [ ] API communication logic remains in `@appkit/api-client`.
- [ ] Web and desktop apps remain thin platform hosts.
- [ ] CLI code does not depend on UI/frontend packages.
- [ ] No deployable app imports implementation code from another app.

## Configuration / environment checklist

- [ ] I did not add hardcoded local URLs, ports, or API base URLs.
- [ ] I updated `.env.example` if environment variables changed.
- [ ] I updated Docker or Compose config if runtime config changed.
- [ ] I verified config defaults are centralised through `@appkit/config`.

## Testing / verification

<!-- Tick the checks that were run. If a check was skipped, explain why. -->

- [ ] `pnpm verify`
- [ ] `pnpm check`
- [ ] `pnpm deps:arch`
- [ ] `pnpm deps:lint`
- [ ] `pnpm knip`
- [ ] `pnpm test:run`
- [ ] `pnpm build`
- [ ] Other:

## Screenshots / recordings

<!-- Add screenshots, recordings, or terminal output for UI/CLI changes where useful. -->

N/A

## Breaking changes

<!-- Describe any breaking changes, migrations, renamed exports, changed env vars, or removed APIs. -->

N/A

## Notes for reviewers

<!-- Mention anything reviewers should focus on, known limitations, or follow-up work. -->

N/A
