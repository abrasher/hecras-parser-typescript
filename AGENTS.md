# Agent Guidelines

Schema-first is the default for new work. Please align with the migration plan and DSL reference before implementing or refactoring parsers/serializers.

- Read: `docs/tasks/schema-first-migration.md` (plan, milestones, parity goals)
- Read: `.claude/prompts/dsl-refactor/schema-first.md` (DSL reference, typing, serialization rules)

What to change (and where)

- Implement new parsing/serialization with the schema DSL under `src/schemas/**` and `src/schema/**`.
- Prefer DSL items: `schema`, `fields`, `multiField`, `tupleArrayField`, `contextual`, `section`, `repeat`, `include`.
- Use drivers from `src/schema/driver.ts`: `parseWithSchema`, `parseSectionWithSchema`, `serializeWithSchema`.
- Follow optional/blank semantics from the DSL doc: `opt(...)` for optional fields; `numberPart({ nullOnBlank: true })` to preserve blank-as-null behavior; omit single-field lines when `undefined`.
- Add/extend tests near migrated schemas and keep serializer round-trip parity where applicable.

Constraints and expectations

- Do not add new logic to legacy paths (`src/parsers/**`, `src/serializers/**`) except for critical fixes needed to unblock migration. Treat them as read-only during refactors.
- Keep top-level behavior tolerant (non-strict) until all sections are migrated; use recognizers and adapters as described in the migration tracker.
- Update docs or comments in the same PR when adding or changing schemas.

Blockers

- If you hit anything that prevents staying schema-first (format edge cases, typing gaps, serializer ordering issues), note it under "Decisions & Risks" in `docs/tasks/schema-first-migration.md` and surface it in PR notes.

Deprecated (legacy guidance)

- The prior sentinel-based approach using `src/parsers/atomic.ts`, `src/parsers/lineParsers.ts`, and specialized per-section parsers is deprecated for new work. See CLAUDE.md "Deprecated: Legacy Parsing Approach" for historical details. Only touch legacy code for targeted bug fixes until full migration is complete.
