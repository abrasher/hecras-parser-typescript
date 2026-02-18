# Geometry Regression Testing

This directory contains scripts to prevent regressions in the geometry comparison system.

## Overview

The regression testing system ensures that changes to the parser/serializer don't make things worse compared to the `main` branch. It tracks:

- **Files matched**: Number of geometry files that round-trip successfully
- **Lines matched**: For failing files, how many lines match before the first difference
- **Character position**: For failing lines, where the difference occurs

## How It Works

### 1. Baseline Capture

The baseline represents the "good" state from the `main` branch that we compare against.

**Capture baseline manually:**

```bash
npm run baseline:capture
```

**What it does:**

1. Stashes your current changes
2. Checks out `main` branch
3. Runs `compare-geometries.ts`
4. Saves the metrics to `scripts/.baseline-metrics.json`
5. Returns to your original branch
6. Restores your stashed changes

**When to capture:**

- When starting parser/serializer work on a feature branch
- When `main` has moved and your local baseline is stale

### 2. Regression Check

Compares your current branch against the baseline.

**Run regression check:**

```bash
npm run check:regression
```

**Exit codes:**

- `0` - ✅ No regression (same or better than baseline)
- `1` - ❌ Regression detected (worse than baseline)
- `2` - ⚠️ No baseline found (only with `--strict` flag)

**With strict mode (fail if no baseline):**

```bash
npm run check:regression -- --strict
```

### 3. CI/CD Integration

Current GitHub Actions CI (`.github/workflows/ci.yml`) runs:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`

Regression scripts are currently **not** executed automatically in CI. Run `npm run baseline:capture` and `npm run check:regression` locally (or in a dedicated workflow) when parser/serializer changes need regression protection.

## Comparison Logic

The system compares in order of priority:

### 1. Files Matched Count

- **Better**: More files matched
- **Worse**: Fewer files matched
- **Same**: Move to next comparison

### 2. All Files Matched Status

- **Better**: All files now match (from partial match)
- **Worse**: New parsing error introduced
- **Same**: Move to next comparison

### 3. Lines Matched in Failure

If both fail on the same file:

- **Better**: More lines matched before divergence
- **Worse**: Fewer lines matched before divergence
- **Same**: Move to next comparison

### 4. Character Position in Failure

If both fail on the same line:

- **Better**: Difference occurs later in the line
- **Worse**: Difference occurs earlier in the line
- **Same**: No regression (allowed)

## Examples

### Example 1: Improvement

```bash
$ npm run check:regression

Baseline: main @ 75b059c
  Result: 16/137 files matched (failed)

Running compare-geometries...

Current: 19/137 files matched (failed)

=== Regression Check Result ===
✅ NO REGRESSION
   3 more files matched
```

### Example 2: Regression

```bash
$ npm run check:regression

Baseline: main @ 75b059c
  Result: 16/137 files matched (failed)

Running compare-geometries...

Current: 14/137 files matched (failed)

=== Regression Check Result ===
❌ REGRESSION DETECTED
   2 fewer files matched

   Baseline: 16 files matched
   Current:  14 files matched
```

### Example 3: No Change (Still Passes)

```bash
$ npm run check:regression

Baseline: main @ 75b059c
  Result: 16/137 files matched (failed)

Running compare-geometries...

Current: 16/137 files matched (failed)

=== Regression Check Result ===
✅ NO REGRESSION
   Same result as baseline (no change)
```

## Scenario: Multiple Commits

This system prevents the scenario where incremental improvements hide overall regression:

```
Baseline (main): 16 files matched

Commit A: 12 files matched (-4 vs baseline)
→ npm run check:regression
→ ❌ REGRESSION DETECTED
→ Cannot merge PR

Commit B: 14 files matched (+2 vs A, -2 vs baseline)
→ npm run check:regression
→ ❌ REGRESSION DETECTED (still worse than baseline!)
→ Cannot merge PR

Commit C: 18 files matched (+4 vs B, +2 vs baseline)
→ npm run check:regression
→ ✅ NO REGRESSION (better than baseline)
→ Can merge PR
```

The key insight: **Always compares to baseline, not previous commit**.

## Files

- `capture-baseline.ts` - Captures baseline metrics from main branch
- `check-regression.ts` - Checks current branch against baseline
- `compare-geometries.ts` - Core comparison script (existing)
- `scripts/.baseline-metrics.json` - Stored geometry baseline (currently tracked in this repo)
- `scripts/.compare-geometries-history.json` - Geometry comparison history (currently tracked in this repo)
- `scripts/.compare-plans-history.json` - Plan comparison history (currently tracked in this repo)
- `scripts/.compare-plans-strict-history.json` - Strict plan comparison history (currently tracked in this repo)
- `scripts/.plan-baseline-metrics.json` - Plan baseline file written by `npm run baseline:capture:plans` (generated when needed)

These files are not gitignored in this repository. If they change, `git status` will report them.

## Development Workflow

### Starting a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/improve-parsing

# 2. Capture baseline
npm run baseline:capture

# 3. Make changes
# ... edit code ...

# 4. Check for regression
npm run check:regression

# 5. If regression, fix it
# ... fix code ...

# 6. Verify no regression
npm run check:regression
# ✅ NO REGRESSION

# 7. Create PR
git push origin feature/improve-parsing
```

## Plan Regression Testing

Plan files under `test/data/plans` use the exact same workflow with their own helper scripts. This keeps geometry and plan progress isolated while we bring the plan schema online.

- `npm run compare:plans` – round-trip all sample plan files and stop at the first difference.
- `npm run baseline:capture:plans` – capture the best-known plan metrics from `main`.
- `npm run check:regression:plans` – ensure current plan changes do not regress the captured baseline (`--strict` is also supported).

These commands read/write `scripts/.compare-plans-history.json` and `scripts/.plan-baseline-metrics.json`, mirroring the geometry tooling.

### Working Without Baseline

If you don't capture a baseline, the check will pass with a warning:

```bash
$ npm run check:regression

⚠️  No baseline found
   Run: npm run baseline:capture

   Allowing this run to pass (use --strict to fail)
```

This allows local development without strict enforcement. CI currently does not run regression scripts by default.

## Troubleshooting

### Baseline seems wrong

Re-capture the baseline:

```bash
npm run baseline:capture
```

### Want to compare against a different branch

```bash
npm run baseline:capture -- --branch develop
```

### Check fails but I didn't change parsing logic

This is expected! The regression check ensures that **any** changes don't make parsing worse. If you're refactoring or changing unrelated code, the check should still pass (showing "no change"). If it shows regression, investigate what changed.

### Want to see detailed comparison

Run the compare script directly:

```bash
npm run compare:geometries
```

This shows line-by-line differences for failing files.
