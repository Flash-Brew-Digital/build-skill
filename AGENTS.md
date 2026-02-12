# AGENTS.md

This file provides guidance to AI agents when working with code in this repository. For full project architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md). Access the [Agent Skills Specification](https://agentskills.io/specification.md) to view the latest information on the specification.

## Commands

```bash
pnpm build            # Build CLI with tsup (output: dist/)
pnpm test             # Run all tests with vitest
pnpm check            # Lint and format check (Biome via ultracite)
pnpm fix              # Auto-fix lint and format issues
pnpm type-check       # TypeScript type checking without emit
```

CLI tests run against the compiled `dist/index.js`, so **always `pnpm build` before `pnpm test`**.

Run a single test file: `pnpm test run tests/scaffold.test.ts`

Pre-commit hooks run the auto-fix command on staged files via lint-staged. Always run the command before committing or after running `pnpm check` to see if the issues flagged can be auto-fixed.

## Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through Biome.

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

- ESM throughout (`"type": "module"`), Node >=20, TypeScript strict mode, target ES2022
- Conventional commits (`feat:`, `fix:`, `chore:`), release-please automates versioning
- Arrow functions for callbacks; `const` by default, `let` when needed, never `var`
- `for...of` over `.forEach()`; template literals over concatenation
- `unknown` over `any`; type narrowing over assertions
- Use `const` assertions (`as const`) for immutable values and literal types
- Prefer optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Early returns over nested conditionals; no `console.log` in production
- `async/await` over promise chains; always `await` promises in async functions
- Throw `Error` objects with descriptive messages, not strings

## Resources

[ARCHITECTURE.md](./ARCHITECTURE.md): Detailed Project Architecture
[CONTRIBUTING.md](./CONTRIBUTING.md): Project Contribution Guidelines
[Agent Skills Specification](https://agentskills.io/specification.md): Latest Agent Skills Specification
