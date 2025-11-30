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
4. Saves the metrics to `.baseline-metrics.json`
5. Returns to your original branch
6. Restores your stashed changes

**When to capture:**
- When starting work on a new feature branch
- CI automatically captures it on every PR

### 2. Regression Check

Compares your current branch against the baseline.

**Run regression check:**
```bash
npm run check:regression
```

**Exit codes:**
- `0` - ✅ No regression (same or better than baseline)
- `1` - ❌ Regression detected (worse than baseline)
- `2` - ⚠️  No baseline found (only with `--strict` flag)

**With strict mode (fail if no baseline):**
```bash
npm run check:regression -- --strict
```

### 3. CI/CD Integration

On pull requests, GitHub Actions:
1. Captures baseline from `origin/main`
2. Runs regression check in strict mode
3. Blocks merge if regression detected

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
- `.baseline-metrics.json` - Stored baseline (git-ignored, branch-local)
- `.compare-geometries-history.json` - Run history (git-ignored)

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

# 7. Create PR (CI will verify)
git push origin feature/improve-parsing
```

### Working Without Baseline

If you don't capture a baseline, the check will pass with a warning:

```bash
$ npm run check:regression

⚠️  No baseline found
   Run: npm run baseline:capture

   Allowing this run to pass (use --strict to fail)
```

This allows local development without strict enforcement, but CI uses `--strict` mode.

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
