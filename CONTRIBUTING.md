# Contributing

## Development Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Regression Testing

For parser/serializer changes, run the regression tooling against real HEC-RAS example files before opening a PR. See [`scripts/README-regression-testing.md`](scripts/README-regression-testing.md) for full documentation.

```bash
# Geometry
npm run baseline:capture
npm run check:regression
npm run compare:geometries

# Plans
npm run baseline:capture:plans
npm run check:regression:plans
npm run compare:plans
```

Exit codes: `0` = no regression, `1` = regression detected, `2` = no baseline found (only with `--strict`).

## Documentation

- API docs: [`docs/api/index.md`](docs/api/index.md)
- Format notes and risks: [`docs/hecras-parsing-format-specification.md`](docs/hecras-parsing-format-specification.md)
- Schema DSL internals: [`docs/internal/schema-dsl.md`](docs/internal/schema-dsl.md)
- Extension notes: [`docs/internal/extending.md`](docs/internal/extending.md)
