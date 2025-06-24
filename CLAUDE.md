### Development

- `npm run build` - Build project (TypeScript compilation + Vite build)
- `tsc` - Run TypeScript compiler for type checking

### Testing

- `npm test` - Run tests with Vitest
- `npm run test:run` - Run tests once (CI mode)

### Code Quality

- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint for code linting
- `npm run lint:fix` - Run ESLint with automatic fixes


## Architecture

This is a TypeScript library for parsing HEC-RAS geometry files (.g01, .g02, etc.) into structured data models.

### Core Components

**Main Parser**: `parseGeometry` (from `/src/parseGeometry.ts`) - The main entry point for parsing HEC-RAS geometry files. Uses a simplified, direct parsing approach with specialized parsers for different geometry components.

**Atomic Parsers**: `/src/parsers/atomic.ts` - Low-level parsing primitives for extracting data from HEC-RAS file lines:
- Line parsing utilities
- Data type extraction functions  
- Format-specific parsing helpers

**Line Parsers**: `/src/parsers/lineParsers.ts` - Higher-level line-based parsing utilities for common HEC-RAS patterns.

**Specialized Parsers**: `/src/parsers/geometry/` - Component-specific parsers:
- `culvertParser.ts` - Culvert connection parsing (modern implementation pattern)
- `storageAreaParser.ts` - Storage area definitions
- `connectionParser.ts` - General connection parsing utilities

**Data Models**: `/src/models/` - TypeScript interfaces representing HEC-RAS geometry entities:

**Core Models**:
- `/src/models/geometry/geometryHeaders.ts` - Root geometry container and headers
- `/src/models/geometry/storageArea.ts` - Storage area definitions  
- `/src/models/geometry/culvert.ts` - Comprehensive culvert connection interfaces with enums
- `/src/models/bridge.ts` - Bridge connection interfaces and components
- `/src/models/connection.ts` - General connection types

### Parsing Strategy

**Modern Parsing Pattern**: Follow the conventions established in `/src/parsers/geometry/culvertParser.ts`:
- Use atomic parsing functions from `/src/parsers/atomic.ts`
- Implement structured parsing with clear data extraction phases
- Return both parsed data and parsing metadata (lines consumed, etc.)
- Use TypeScript interfaces for strong typing
- Include comprehensive error handling

**Atomic Parsing System**: The codebase uses a two-level parsing approach:
1. **Atomic Level** (`/src/parsers/atomic.ts`) - Low-level line parsing, data type extraction
2. **Component Level** (`/src/parsers/geometry/`) - Higher-level component assembly using atomic functions

**Connection Types Supported**:
- **Culvert Connections** - Full implementation with detailed flow characteristics
- **Bridge Connections** - Comprehensive bridge geometry and hydraulic parameters  
- **Storage Area Connections** - Storage area definitions and connections

### Test Data

Test files use real HEC-RAS geometry data:

- `test/data/Muncie.g01` - Full geometry file for comprehensive testing
- `test/data/Dingman.g01` - Smaller geometry file optimized for LLM usage

Test suites:

- `test/geometry/ConnectionBridge.test.ts` - Comprehensive bridge connection parsing tests with incremental validation
- `test/geometry/ConnectionCulvert.test.ts` - Culvert connection parsing tests
- `test/atomParsers.test.ts` - Atomic parser primitive tests

## HEC-RAS Format Gotchas

**CRITICAL**: HEC-RAS files have strict but weird formatting that can break parsers if not handled carefully. Always use a combination of atomic or line parsers if possible. Do not duplicate functionality.

### Documentation References

For detailed parsing specifications, see:
- `docs/bridgeconnection.md` - Bridge connection format specification and parsing details
- `docs/culvert-data-format.md` - Comprehensive culvert data format documentation  
- `docs/parsing-conventions.md` - Parsing standards and best practices

### Key Parsing Challenges

**Fixed-Width vs Variable-Width Fields**:

- Some fields are fixed-width (usually powers of 2: 2,4,8,16,32 characters)
- Others are variable-width with limits
- Fixed-width fields MUST preserve exact spacing, even if it looks wrong
- Example: `Storage Area=2D_Grid         ,,` (note the trailing spaces)

**Inconsistent Key Formats**:

- Most keys are "Key=Value" format with sentence case
- Some mix spaces: `Storage Area 2D PointsPerimeterTime=21May2025 13:18:09`
- Some use colons for nesting: `Conn BR: BR SE=1,0`
- Snake_case occasionally appears: `Is_Ogee`

**Multiline Value Parsing**:

- Values can span multiple lines unpredictably
- First line often indicates count: `Storage Area Surface Line= 6`
- Subsequent lines have no consistent spacing rules

**Table-Like Data**:

- Some sections store data in pseudo-table format with no clear delimiters
- Values may be space-separated but with inconsistent spacing
- Headers don't always align with data columns

**Long Text Fields**:

- Surrounded by `BEGIN PROPERTYNAME:` and `END PROPERTYNAME:` blocks
- Can contain multiple lines and special characters
- No apparent length limits

### General Parsing Principles

Always assume the format is wrong until proven right. Use comprehensive validation and provide meaningful error messages for format inconsistencies.

## Important things when Developing Parsers

When writing parsing logic, populate an adjacent documentation file in the docs folder. The document will be used to reconstruct the geometry file at a later date.

It should at minimum list for each property

- Original Key Name in the HECRAS file
- Key Object Path it is mapped to
- The type of value / parsing logic required to extract it
- Any special notes such as field lengths or other quirks
- An example input and example output

After making changes to a parser make sure you update the documentation


## Core Philosophy

**TEST-DRIVEN DEVELOPMENT IS NON-NEGOTIABLE.** Every single line of production code must be written in response to a failing test. No exceptions. This is not a suggestion or a preference - it is the fundamental practice that enables all other principles in this document.

I follow Test-Driven Development (TDD) with a strong emphasis on behavior-driven testing and functional programming principles. All work should be done in small, incremental changes that maintain a working state throughout development.

## Quick Reference

**Key Principles:**

- Write tests first (TDD)
- Test behavior, not implementation
- No `any` types or type assertions
- Immutable data only
- Small, pure functions
- TypeScript strict mode always
- Use real interfaces/types in tests, never redefine them

**Preferred Tools:**

- **Language**: TypeScript (strict mode)
- **Testing**: Vitest for test framework
- **State Management**: Prefer immutable patterns

## Testing Principles

### Behavior-Driven Testing

- **No "unit tests"** - this term is not helpful. Tests should verify expected behavior, treating implementation as a black box
- Test through the public API exclusively - internals should be invisible to tests
- No 1:1 mapping between test files and implementation files
- Tests that examine internal implementation details are wasteful and should be avoided
- **Coverage targets**: 100% coverage should be expected at all times, but these tests must ALWAYS be based on business behaviour, not implementation details
- Tests must document expected business behaviour

### Testing Tools

- **Vitest** for testing framework
- **MSW (Mock Service Worker)** for API mocking when needed
- All test code must follow the same TypeScript strict mode rules as production code

### Test Organization

```
src/
  parsers/
    geometry/
      culvertParser.ts
      bridgeParser.ts
      culvertParser.test.ts // The validation is an implementation detail. Validation is fully covered, but by testing the expected parsing behavior, treating the validation code itself as an implementation detail
```

### Test Data Pattern

Use factory functions with optional overrides for test data:

```typescript
const getMockCulvertGroupProperties = (
  overrides?: Partial<CulvertGroupProperties>
): CulvertGroupProperties => {
  return {
    shape: CULVERT_SHAPE.CIRCLE,
    rise: 1.5,
    span: 1.5,
    length: 13.24,
    nTop: 0.024,
    entranceLoss: 0.9,
    exitLoss: 1,
    chart: 2,
    scale: 3,
    upstreamInvert: 260.71,
    downstreamInvert: 260.64,
    numberOfBarrels: 2,
    culvertGroupName: "Group #1",
    unknownFlag: 0,
    barrelStations: getMockBarrelStations(),
    barrels: getMockCulvertBarrels(),
    ...overrides,
  };
};

const getMockBridgeConnection = (
  overrides?: Partial<BridgeConnection>
): BridgeConnection => {
  return {
    bridge: getMockBridgeConfiguration(),
    pressureWeir: getMockPressureWeirData(),
    deckParameters: getMockDeckParameters(),
    bridgeSections: [],
    bridgeCoefficients: getMockBridgeCoefficients(),
    bridgeSkew: 0,
    crossSections: [],
    ineffectiveFlowAreas: [],
    ...overrides,
  };
};
```

Key principles:

- Always return complete objects with sensible defaults
- Accept optional `Partial<T>` overrides
- Build incrementally - extract nested object factories as needed
- Compose factories for complex objects
- Consider using a test data builder pattern for very complex objects

## TypeScript Guidelines

### Strict Mode Requirements

```json
// Recommended strict configuration for improved code quality:
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "moduleResolution": "node",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "exclude": ["dist"]
}
```

- **No `any`** - ever. Use `unknown` if type is truly unknown
- **No type assertions** (`as SomeType`) unless absolutely necessary with clear justification
- **No `@ts-ignore`** or `@ts-expect-error` without explicit explanation
- These rules apply to test code as well as production code

### Type Definitions

- **Prefer `interface` over `type`** in all cases except when `interface` is not usable (disciminated unions)
- Use explicit typing where it aids clarity, but leverage inference where appropriate
- Utilize utility types effectively (`Pick`, `Omit`, `Partial`, `Required`, etc.)
- Create domain-specific types (e.g., `GeometryId`, `ElevationValue`) for type safety
- Use enums for well-defined constants and structured interfaces for complex data

```typescript
// Good
type GeometryId = string & { readonly brand: unique symbol };
type ElevationValue = number & { readonly brand: unique symbol };

// Avoid
type GeometryId = string;
type ElevationValue = number;
```

#### Interface-First Development with TypeScript

Define clear, well-structured interfaces that represent your domain entities:

```typescript
// Define enums for well-known constants
export enum CULVERT_SHAPE {
  CIRCLE = 1,
  BOX = 2,
  PIPE_ARCH = 3,
  ARCH = 4,
  SEMI_CIRCLE = 5,
  LOW_ARCH = 6,
  HIGH_ARCH = 7,
  CONSPAN_ARCH = 8,
}

// Define shared types for common patterns
export interface StationElevationPoint {
  station: number
  elevation: number
}

export interface UpstreamDownstreamPair {
  upstream: number
  downstream: number
}

// Define complex domain interfaces with clear structure
export interface CulvertGroupProperties {
  shape: CULVERT_SHAPE
  rise: number // ft or m
  span: number // ft or m
  length: number // ft or m
  nTop: number
  nBottom?: number
  nBottomDepth?: number
  entranceLoss: number
  exitLoss: number
  chart: number
  scale: number
  upstreamInvert: number // ft or m
  downstreamInvert: number // ft or m
  numberOfBarrels: number
  culvertGroupName: string
  unknownFlag: number
  barrelStations: UpstreamDownstreamPair[]
  barrels: CulvertBarrelProperties[]
  depthBlocked?: number
}

// Example of interface composition for complex domains
export interface BridgeConnection {
  bridge: BridgeConfiguration
  pressureWeir: PressureWeirData
  deckParameters: DeckParameters
  bridgeSections: BridgeSection[]
  bridgeCoefficients: BridgeCoefficients
  bridgeSkew: number
  crossSections: CrossSection[]
  ineffectiveFlowAreas: IneffectiveFlowArea[]
}

export interface BridgeConfiguration {
  // Comments document domain-specific constraints and meanings
  momentumEquationAddFriction: number // -1 means enabled, 0 means disabled
  momentumEquationAddWeight: number // -1 means enabled, 0 means disabled
  pressureFlowCriteria: number // -1 means Upstream Energy Gradeline, 0 means Upstream water surface
  classBDefaults: number // -1 means Inside Bridge at Upstream End, 0 means Inside Bridge at Downstream End
  param5: number
  contractionCoefficient: number
  expansionCoefficient: number
}

```

#### Interface Usage in Tests

**CRITICAL**: Tests must use real interfaces and types from the main project, not redefine their own.

```typescript
// ❌ WRONG - Defining interfaces in test files
interface TestCulvertProperties {
  shape: number
  rise: number
  span: number
  length: number
  // ... other properties
}

// ✅ CORRECT - Import interfaces from the shared models
import { CulvertGroupProperties, CULVERT_SHAPE } from "../../src/models/geometry/culvert";
import { BridgeConnection } from "../../src/models/bridge";
```

**Why this matters:**

- **Type Safety**: Ensures tests use the same types as production code
- **Consistency**: Changes to interfaces automatically propagate to tests
- **Maintainability**: Single source of truth for data structures
- **Prevents Drift**: Tests can't accidentally diverge from real interfaces

**Implementation:**

- All domain interfaces should be exported from shared model modules
- Test files should import interfaces from the shared location
- If an interface isn't exported yet, add it to the exports rather than duplicating it
- Mock data factories should use the real types from the models

```typescript
// ✅ CORRECT - Test factories using real interfaces
import { CulvertGroupProperties, CULVERT_SHAPE } from "../../src/models/geometry/culvert";
import { BridgeConnection } from "../../src/models/bridge";

const getMockCulvertGroup = (
  overrides?: Partial<CulvertGroupProperties>
): CulvertGroupProperties => {
  const baseCulvert: CulvertGroupProperties = {
    shape: CULVERT_SHAPE.CIRCLE,
    rise: 3.0,
    span: 3.0,
    length: 50.0,
    nTop: 0.013,
    entranceLoss: 0.5,
    exitLoss: 1.0,
    chart: 1,
    scale: 1,
    upstreamInvert: 100.0,
    downstreamInvert: 99.5,
    numberOfBarrels: 1,
    culvertGroupName: "Test Culvert",
    unknownFlag: 0,
    barrelStations: [],
    barrels: [],
  };

  return { ...baseCulvert, ...overrides };
};

const getMockBridgeConnection = (
  overrides?: Partial<BridgeConnection>
): BridgeConnection => {
  const baseBridge: BridgeConnection = {
    bridge: {
      momentumEquationAddFriction: -1,
      momentumEquationAddWeight: -1,
      pressureFlowCriteria: -1,
      classBDefaults: -1,
      param5: 0,
      contractionCoefficient: 0.1,
      expansionCoefficient: 0.3,
    },
    pressureWeir: {
      value1: 0,
      value2: null,
      value3: 0,
      value4: null,
      value5: 0,
    },
    deckParameters: {
      deckDistance: 0,
      width: 30,
      weirCoefficient: 2.6,
      skew: 0,
      numUp: 0,
      numDown: 0,
      minLowCoordinate: null,
      maxHighCoordinate: null,
      maxSubmerge: 1,
      isOgee: 0,
      coordinates: [],
      elevations: [],
      bottomElevations: [],
    },
    bridgeSections: [],
    bridgeCoefficients: {
      coef1: 0,
      coef2: 0,
      coef3: 0,
      coef4: null,
      coef5: null,
      coef6: null,
      coef7: 0,
      coef8: 0,
      coef9: null,
      coef10: 0,
      coef11: null,
    },
    bridgeSkew: 0,
    crossSections: [],
    ineffectiveFlowAreas: [],
  };

  return { ...baseBridge, ...overrides };
};
```

## Code Style

### Functional Programming

I follow a "functional light" approach:

- **No data mutation** - work with immutable data structures
- **Pure functions** wherever possible
- **Composition** as the primary mechanism for code reuse
- Avoid heavy FP abstractions (no need for complex monads or pipe/compose patterns) unless there is a clear advantage to using them
- Use array methods (`map`, `filter`, `reduce`) over imperative loops

#### Examples of Functional Patterns

```typescript
// Good - Pure function with immutable updates
const adjustCulvertElevations = (culvert: CulvertGroupProperties, offset: number): CulvertGroupProperties => {
  return {
    ...culvert,
    barrels: culvert.barrels.map((barrel) => ({
      ...barrel,
      coordinates: barrel.coordinates.map((coord) => ({
        ...coord,
        y: coord.y + offset,
      })),
    })),
    upstreamInvert: culvert.upstreamInvert + offset,
    downstreamInvert: culvert.downstreamInvert + offset,
  };
};

// Good - Composition over complex logic
const processGeometryData = (rawData: string[]): ParsedGeometry => {
  return pipe(
    rawData,
    validateGeometryFormat,
    parseGeometryHeaders,
    parseConnections,
    validateParsedData
  );
};

// When heavy FP abstractions ARE appropriate:
// - Complex async flows that benefit from Task/IO types
// - Error handling chains that benefit from Result/Either types
// Example with Result type for complex error handling:
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

const chainParsingOperations = (
  geometryLines: string[]
): Result<ParsedGeometry, ParseError> => {
  return pipe(
    validateGeometryFormat(geometryLines),
    chain(parseGeometryHeaders),
    chain(parseConnections),
    map(buildGeometryModel)
  );
};
```

### Code Structure

- **No nested if/else statements** - use early returns, guard clauses, or composition
- **Avoid deep nesting** in general (max 2 levels)
- Keep functions small and focused on a single responsibility
- Prefer flat, readable code over clever abstractions

### Naming Conventions

- **Functions**: `camelCase`, verb-based (e.g., `parseCulvertData`, `validateGeometry`)
- **Types**: `PascalCase` (e.g., `CulvertGroupProperties`, `BridgeConnection`)
- **Constants**: `UPPER_SNAKE_CASE` for true constants, `camelCase` for configuration
- **Files**: `kebab-case.ts` for all TypeScript files
- **Test files**: `*.test.ts` or `*.spec.ts`

### No Comments in Code

Code should be self-documenting through clear naming and structure. Comments indicate that the code itself is not clear enough.
EXCEPTION: For anomolies or deviation from the norm, clearly document why it is not the normal

```typescript
// Avoid: Comments explaining what the code does
const calculateDiscount = (price: number, customer: Customer): number => {
  // Check if customer is premium
  if (customer.tier === "premium") {
    // Apply 20% discount for premium customers
    return price * 0.8;
  }
  // Regular customers get 10% discount
  return price * 0.9;
};

// Good: Self-documenting code with clear names
const PREMIUM_DISCOUNT_MULTIPLIER = 0.8;
const STANDARD_DISCOUNT_MULTIPLIER = 0.9;

const isPremiumCustomer = (customer: Customer): boolean => {
  return customer.tier === "premium";
};

const calculateDiscount = (price: number, customer: Customer): number => {
  const discountMultiplier = isPremiumCustomer(customer)
    ? PREMIUM_DISCOUNT_MULTIPLIER
    : STANDARD_DISCOUNT_MULTIPLIER;

  return price * discountMultiplier;
};

// Avoid: Complex logic with comments
const processPayment = (payment: Payment): ProcessedPayment => {
  // First validate the payment
  if (!validatePayment(payment)) {
    throw new Error("Invalid payment");
  }

  // Check if we need to apply 3D secure
  if (payment.amount > 100 && payment.card.type === "credit") {
    // Apply 3D secure for credit cards over £100
    const securePayment = apply3DSecure(payment);
    // Process the secure payment
    return executePayment(securePayment);
  }

  // Process the payment
  return executePayment(payment);
};

// Good: Extract to well-named functions
const requires3DSecure = (payment: Payment): boolean => {
  const SECURE_PAYMENT_THRESHOLD = 100;
  return (
    payment.amount > SECURE_PAYMENT_THRESHOLD && payment.card.type === "credit"
  );
};

const processPayment = (payment: Payment): ProcessedPayment => {
  if (!validatePayment(payment)) {
    throw new PaymentValidationError("Invalid payment");
  }

  const securedPayment = requires3DSecure(payment)
    ? apply3DSecure(payment)
    : payment;

  return executePayment(securedPayment);
};
```

**Exception**: JSDoc comments for public APIs are acceptable when generating documentation, but the code should still be self-explanatory without them.

### Prefer Options Objects

Use options objects for function parameters as the default pattern. Only use positional parameters when there's a clear, compelling reason (e.g., single-parameter pure functions, well-established conventions like `map(item => item.value)`).

```typescript
// Avoid: Multiple positional parameters
const createPayment = (
  amount: number,
  currency: string,
  cardId: string,
  customerId: string,
  description?: string,
  metadata?: Record<string, unknown>,
  idempotencyKey?: string
): Payment => {
  // implementation
};

// Calling it is unclear
const payment = createPayment(
  100,
  "GBP",
  "card_123",
  "cust_456",
  undefined,
  { orderId: "order_789" },
  "key_123"
);

// Good: Options object with clear property names
type CreatePaymentOptions = {
  amount: number;
  currency: string;
  cardId: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
};

const createPayment = (options: CreatePaymentOptions): Payment => {
  const {
    amount,
    currency,
    cardId,
    customerId,
    description,
    metadata,
    idempotencyKey,
  } = options;

  // implementation
};

// Clear and readable at call site
const payment = createPayment({
  amount: 100,
  currency: "GBP",
  cardId: "card_123",
  customerId: "cust_456",
  metadata: { orderId: "order_789" },
  idempotencyKey: "key_123",
});

// Avoid: Boolean flags as parameters
const fetchCustomers = (
  includeInactive: boolean,
  includePending: boolean,
  includeDeleted: boolean,
  sortByDate: boolean
): Customer[] => {
  // implementation
};

// Confusing at call site
const customers = fetchCustomers(true, false, false, true);

// Good: Options object with clear intent
type FetchCustomersOptions = {
  includeInactive?: boolean;
  includePending?: boolean;
  includeDeleted?: boolean;
  sortBy?: "date" | "name" | "value";
};

const fetchCustomers = (options: FetchCustomersOptions = {}): Customer[] => {
  const {
    includeInactive = false,
    includePending = false,
    includeDeleted = false,
    sortBy = "name",
  } = options;

  // implementation
};

// Self-documenting at call site
const customers = fetchCustomers({
  includeInactive: true,
  sortBy: "date",
});

// Good: Configuration objects for complex operations
type ProcessOrderOptions = {
  order: Order;
  shipping: {
    method: "standard" | "express" | "overnight";
    address: Address;
  };
  payment: {
    method: PaymentMethod;
    saveForFuture?: boolean;
  };
  promotions?: {
    codes?: string[];
    autoApply?: boolean;
  };
};

const processOrder = (options: ProcessOrderOptions): ProcessedOrder => {
  const { order, shipping, payment, promotions = {} } = options;

  // Clear access to nested options
  const orderWithPromotions = promotions.autoApply
    ? applyAvailablePromotions(order)
    : order;

  return executeOrder({
    ...orderWithPromotions,
    shippingMethod: shipping.method,
    paymentMethod: payment.method,
  });
};

// Acceptable: Single parameter for simple transforms
const double = (n: number): number => n * 2;
const getName = (user: User): string => user.name;

// Acceptable: Well-established patterns
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2);
const users = fetchUsers();
const names = users.map((user) => user.name);
```

**Guidelines for options objects:**

- Default to options objects unless there's a specific reason not to
- Always use for functions with optional parameters
- Destructure options at the start of the function for clarity
- Provide sensible defaults using destructuring
- Keep related options grouped (e.g., all shipping options together)
- Consider breaking very large options objects into nested groups

**When positional parameters are acceptable:**

- Single-parameter pure functions
- Well-established functional patterns (map, filter, reduce callbacks)
- Mathematical operations where order is conventional

## Development Workflow

### TDD Process - THE FUNDAMENTAL PRACTICE

**CRITICAL**: TDD is not optional. Every feature, every bug fix, every change MUST follow this process:

Follow Red-Green-Refactor strictly:

1. **Red**: Write a failing test for the desired behavior. NO PRODUCTION CODE until you have a failing test.
2. **Green**: Write the MINIMUM code to make the test pass. Resist the urge to write more than needed.
3. **Refactor**: Assess the code for improvement opportunities. If refactoring would add value, clean up the code while keeping tests green. If the code is already clean and expressive, move on.

**Common TDD Violations to Avoid:**

- Writing production code without a failing test first
- Writing multiple tests before making the first one pass
- Writing more production code than needed to pass the current test
- Skipping the refactor assessment step when code could be improved
- Adding functionality "while you're there" without a test driving it

**Remember**: If you're typing production code and there isn't a failing test demanding that code, you're not doing TDD.

#### TDD Example Workflow

```typescript
// Step 1: Red - Start with the simplest behavior
describe("Culvert parsing", () => {
  it("should parse basic culvert properties", () => {
    const geometryLine = "Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64,2,Group #1,0,";

    const parsed = parseCulvertData(geometryLine, [geometryLine], 0);

    expect(parsed.data[0].shape).toBe(CULVERT_SHAPE.CIRCLE);
    expect(parsed.data[0].rise).toBe(1.5);
    expect(parsed.data[0].span).toBe(1.5);
    expect(parsed.data[0].culvertGroupName).toBe("Group #1");
  });
});

// Step 2: Green - Minimal implementation
const parseCulvertData = (line: string, lines: string[], index: number): { data: CulvertGroupProperties[]; nextIndex: number } => {
  const { value } = parseKeyValue(line);
  const parts = parseCommaSeparated(value);

  return {
    data: [{
      shape: parseInt(parts[0]),
      rise: parseFloat(parts[1]),
      span: parseFloat(parts[2]),
      length: parseFloat(parts[3]),
      nTop: parseFloat(parts[4]),
      entranceLoss: parseFloat(parts[5]),
      exitLoss: parseFloat(parts[6]),
      chart: parseInt(parts[7]),
      scale: parseInt(parts[8]),
      upstreamInvert: parseFloat(parts[9]),
      downstreamInvert: parseFloat(parts[10]),
      numberOfBarrels: parseInt(parts[11]),
      culvertGroupName: parts[12].trim(),
      unknownFlag: parseInt(parts[13]),
      barrelStations: [],
      barrels: [],
    }],
    nextIndex: index + 1,
  };
};

// Step 3: Red - Add test for parsing barrel coordinates
describe("Culvert parsing", () => {
  it("should parse basic culvert properties", () => {
    // ... existing test
  });

  it("should parse culvert barrel coordinates", () => {
    const lines = [
      "Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64,2,Group #1,0,",
      "    3.56    4.96    6.56    9.96",
      "Conn Culvert Barrel=1,Barrel #01,2",
      "    484557.98934   4751436.44773     484544.9229   4351438.60715"
    ];

    const parsed = parseCulvertData(lines[0], lines, 0);

    expect(parsed.data[0].barrels).toHaveLength(1);
    expect(parsed.data[0].barrels[0].name).toBe("Barrel #01");
    expect(parsed.data[0].barrels[0].coordinates).toHaveLength(2);
  });
});

// Step 4: Green - NOW we can add barrel parsing because both paths are tested
const parseCulvertData = (line: string, lines: string[], index: number): { data: CulvertGroupProperties[]; nextIndex: number } => {
  const { value } = parseKeyValue(line);
  const parts = parseCommaSeparated(value);
  
  let currentIndex = index + 1;
  
  // Parse barrel stations if present
  const barrelStations = [];
  if (lines[currentIndex] && lines[currentIndex].trim().match(/^\d+/)) {
    const stationParts = lines[currentIndex].trim().split(/\s+/);
    for (let i = 0; i < stationParts.length; i += 2) {
      barrelStations.push({
        upstream: parseFloat(stationParts[i]),
        downstream: parseFloat(stationParts[i + 1])
      });
    }
    currentIndex++;
  }
  
  // Parse barrels
  const barrels = [];
  while (lines[currentIndex]?.startsWith("Conn Culvert Barrel=")) {
    const barrelResult = parseBarrelData(lines[currentIndex], lines, currentIndex);
    barrels.push(barrelResult.data);
    currentIndex = barrelResult.nextIndex;
  }

  return {
    data: [{
      shape: parseInt(parts[0]),
      rise: parseFloat(parts[1]),
      span: parseFloat(parts[2]),
      length: parseFloat(parts[3]),
      nTop: parseFloat(parts[4]),
      entranceLoss: parseFloat(parts[5]),
      exitLoss: parseFloat(parts[6]),
      chart: parseInt(parts[7]),
      scale: parseInt(parts[8]),
      upstreamInvert: parseFloat(parts[9]),
      downstreamInvert: parseFloat(parts[10]),
      numberOfBarrels: parseInt(parts[11]),
      culvertGroupName: parts[12].trim(),
      unknownFlag: parseInt(parts[13]),
      barrelStations,
      barrels,
    }],
    nextIndex: currentIndex,
  };
};

// Step 5: Add edge case tests to ensure 100% behavior coverage
describe("Culvert parsing", () => {
  // ... existing tests

  it("should handle culverts with no barrels", () => {
    const lines = [
      "Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64,0,Group #1,0,",
    ];

    const parsed = parseCulvertData(lines[0], lines, 0);

    expect(parsed.data[0].numberOfBarrels).toBe(0);
    expect(parsed.data[0].barrels).toHaveLength(0);
  });
});

// Step 6: Refactor - Extract constants and improve readability
const CULVERT_LINE_PREFIX = "Connection Culv=";
const BARREL_LINE_PREFIX = "Conn Culvert Barrel=";

const parseBasicCulvertProperties = (parts: string[]): Partial<CulvertGroupProperties> => {
  return {
    shape: parseInt(parts[0]),
    rise: parseFloat(parts[1]),
    span: parseFloat(parts[2]),
    length: parseFloat(parts[3]),
    nTop: parseFloat(parts[4]),
    entranceLoss: parseFloat(parts[5]),
    exitLoss: parseFloat(parts[6]),
    chart: parseInt(parts[7]),
    scale: parseInt(parts[8]),
    upstreamInvert: parseFloat(parts[9]),
    downstreamInvert: parseFloat(parts[10]),
    numberOfBarrels: parseInt(parts[11]),
    culvertGroupName: parts[12].trim(),
    unknownFlag: parseInt(parts[13]),
  };
};

const parseCulvertData = (line: string, lines: string[], index: number): { data: CulvertGroupProperties[]; nextIndex: number } => {
  const { value } = parseKeyValue(line);
  const parts = parseCommaSeparated(value);
  
  const basicProperties = parseBasicCulvertProperties(parts);
  let currentIndex = index + 1;
  
  const barrelStations = parseBarrelStations(lines, currentIndex);
  if (barrelStations.length > 0) currentIndex++;
  
  const barrels = parseBarrels(lines, currentIndex);
  
  return {
    data: [{
      ...basicProperties,
      barrelStations,
      barrels: barrels.data,
    }],
    nextIndex: barrels.nextIndex,
  };
};
```

### Refactoring - The Critical Third Step

Evaluating refactoring opportunities is not optional - it's the third step in the TDD cycle. After achieving a green state and committing your work, you MUST assess whether the code can be improved. However, only refactor if there's clear value - if the code is already clean and expresses intent well, move on to the next test.

#### What is Refactoring?

Refactoring means changing the internal structure of code without changing its external behavior. The public API remains unchanged, all tests continue to pass, but the code becomes cleaner, more maintainable, or more efficient. Remember: only refactor when it genuinely improves the code - not all code needs refactoring.

#### When to Refactor

- **Always assess after green**: Once tests pass, before moving to the next test, evaluate if refactoring would add value
- **When you see duplication**: But understand what duplication really means (see DRY below)
- **When names could be clearer**: Variable names, function names, or type names that don't clearly express intent
- **When structure could be simpler**: Complex conditional logic, deeply nested code, or long functions
- **When patterns emerge**: After implementing several similar features, useful abstractions may become apparent

**Remember**: Not all code needs refactoring. If the code is already clean, expressive, and well-structured, commit and move on. Refactoring should improve the code - don't change things just for the sake of change.

#### Refactoring Guidelines

##### 1. Commit Before Refactoring

Always commit your working code before starting any refactoring. This gives you a safe point to return to:

```bash
git add .
git commit -m "feat: add payment validation"
# Now safe to refactor
```

##### 2. Look for Useful Abstractions Based on Semantic Meaning

Create abstractions only when code shares the same semantic meaning and purpose. Don't abstract based on structural similarity alone - **duplicate code is far cheaper than the wrong abstraction**.

```typescript
// Similar structure, DIFFERENT semantic meaning - DO NOT ABSTRACT
const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000;
};

const validateTransferAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000;
};

// These might have the same structure today, but they represent different
// business concepts that will likely evolve independently.
// Payment limits might change based on fraud rules.
// Transfer limits might change based on account type.
// Abstracting them couples unrelated business rules.

// Similar structure, SAME semantic meaning - SAFE TO ABSTRACT
const formatUserDisplayName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

const formatCustomerDisplayName = (
  firstName: string,
  lastName: string
): string => {
  return `${firstName} ${lastName}`.trim();
};

const formatEmployeeDisplayName = (
  firstName: string,
  lastName: string
): string => {
  return `${firstName} ${lastName}`.trim();
};

// These all represent the same concept: "how we format a person's name for display"
// They share semantic meaning, not just structure
const formatPersonDisplayName = (
  firstName: string,
  lastName: string
): string => {
  return `${firstName} ${lastName}`.trim();
};

// Replace all call sites throughout the codebase:
// Before:
// const userLabel = formatUserDisplayName(user.firstName, user.lastName);
// const customerName = formatCustomerDisplayName(customer.firstName, customer.lastName);
// const employeeTag = formatEmployeeDisplayName(employee.firstName, employee.lastName);

// After:
// const userLabel = formatPersonDisplayName(user.firstName, user.lastName);
// const customerName = formatPersonDisplayName(customer.firstName, customer.lastName);
// const employeeTag = formatPersonDisplayName(employee.firstName, employee.lastName);

// Then remove the original functions as they're no longer needed
```

**Questions to ask before abstracting:**

- Do these code blocks represent the same concept or different concepts that happen to look similar?
- If the business rules for one change, should the others change too?
- Would a developer reading this abstraction understand why these things are grouped together?
- Am I abstracting based on what the code IS (structure) or what it MEANS (semantics)?

**Remember**: It's much easier to create an abstraction later when the semantic relationship becomes clear than to undo a bad abstraction that couples unrelated concepts.

##### 3. Understanding DRY - It's About Knowledge, Not Code

DRY (Don't Repeat Yourself) is about not duplicating **knowledge** in the system, not about eliminating all code that looks similar.

```typescript
// This is NOT a DRY violation - different knowledge despite similar code
const validateUserAge = (age: number): boolean => {
  return age >= 18 && age <= 100;
};

const validateProductRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5;
};

const validateYearsOfExperience = (years: number): boolean => {
  return years >= 0 && years <= 50;
};

// These functions have similar structure (checking numeric ranges), but they
// represent completely different business rules:
// - User age has legal requirements (18+) and practical limits (100)
// - Product ratings follow a 1-5 star system
// - Years of experience starts at 0 with a reasonable upper bound
// Abstracting them would couple unrelated business concepts and make future
// changes harder. What if ratings change to 1-10? What if legal age changes?

// Another example of code that looks similar but represents different knowledge:
const formatUserDisplayName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

const formatAddressLine = (address: Address): string => {
  return `${address.street} ${address.number}`.trim();
};

const formatCreditCardLabel = (card: CreditCard): string => {
  return `${card.type} ${card.lastFourDigits}`.trim();
};

// Despite the pattern "combine two strings with space and trim", these represent
// different domain concepts with different future evolution paths

// This IS a DRY violation - same knowledge in multiple places
class Order {
  calculateTotal(): number {
    const itemsTotal = this.items.reduce((sum, item) => sum + item.price, 0);
    const shippingCost = itemsTotal > 50 ? 0 : 5.99; // Knowledge duplicated!
    return itemsTotal + shippingCost;
  }
}

class OrderSummary {
  getShippingCost(itemsTotal: number): number {
    return itemsTotal > 50 ? 0 : 5.99; // Same knowledge!
  }
}

class ShippingCalculator {
  calculate(orderAmount: number): number {
    if (orderAmount > 50) return 0; // Same knowledge again!
    return 5.99;
  }
}

// Refactored - knowledge in one place
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING_COST = 5.99;

const calculateShippingCost = (itemsTotal: number): number => {
  return itemsTotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
};

// Now all classes use the single source of truth
class Order {
  calculateTotal(): number {
    const itemsTotal = this.items.reduce((sum, item) => sum + item.price, 0);
    return itemsTotal + calculateShippingCost(itemsTotal);
  }
}
```

##### 4. Do not worry about external APIs During Refactoring

Refactoring can break external apis as the project is not being used yet

```typescript
// Original implementation
export const parseGeometry = () => {
  // old code
  return ...
}

// GOOD Refactored - external API unchanged, internals improved
export const parseGeometry = () => {
  // new code
  return ...
};

----

// BAD Refactored - external API unchanged, internals improved
export const parseGeometry = () => {
  // old code
  return ...
}

// BAD Refactored - external API unchanged, internals improved
const parseGeometryV2 = () => {
  // new code
  return ...
}
```

##### 5. Verify and Commit After Refactoring

**CRITICAL**: After every refactoring:

1. Run all tests - they must pass without modification
2. Run static analysis (linting, type checking) - must pass
3. Commit the refactoring separately from feature changes

```bash
# After refactoring
npm test          # All tests must pass
npm run lint      # All linting must pass
npm run typecheck # TypeScript must be happy

# Only then commit
git add .
git commit -m "refactor: extract payment validation helpers"
```

#### Refactoring Checklist

Before considering refactoring complete, verify:

- [ ] The refactoring actually improves the code (if not, don't refactor)
- [ ] All tests still pass without modification
- [ ] All static analysis tools pass (linting, type checking)
- [ ] No new public APIs were added (only internal ones)
- [ ] Code is more readable than before
- [ ] Any duplication removed was duplication of knowledge, not just code
- [ ] No speculative abstractions were created
- [ ] The refactoring is committed separately from feature changes

#### Example Refactoring Session

```typescript
// After getting tests green with minimal implementation:
describe("Order processing", () => {
  it("calculates total with items and shipping", () => {
    const order = { items: [{ price: 30 }, { price: 20 }], shipping: 5 };
    expect(calculateOrderTotal(order)).toBe(55);
  });

  it("applies free shipping over £50", () => {
    const order = { items: [{ price: 30 }, { price: 25 }], shipping: 5 };
    expect(calculateOrderTotal(order)).toBe(55);
  });
});

// Green implementation (minimal):
const calculateOrderTotal = (order: Order): number => {
  const itemsTotal = order.items.reduce((sum, item) => sum + item.price, 0);
  const shipping = itemsTotal > 50 ? 0 : order.shipping;
  return itemsTotal + shipping;
};

// Commit the working version
// git commit -m "feat: implement order total calculation with free shipping"

// Assess refactoring opportunities:
// - The variable names could be clearer
// - The free shipping threshold is a magic number
// - The calculation logic could be extracted for clarity
// These improvements would add value, so proceed with refactoring:

const FREE_SHIPPING_THRESHOLD = 50;

const calculateItemsTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

const calculateShipping = (
  baseShipping: number,
  itemsTotal: number
): number => {
  return itemsTotal > FREE_SHIPPING_THRESHOLD ? 0 : baseShipping;
};

const calculateOrderTotal = (order: Order): number => {
  const itemsTotal = calculateItemsTotal(order.items);
  const shipping = calculateShipping(order.shipping, itemsTotal);
  return itemsTotal + shipping;
};

// Run tests - they still pass!
// Run linting - all clean!
// Run type checking - no errors!

// Now commit the refactoring
// git commit -m "refactor: extract order total calculation helpers"
```

##### Example: When NOT to Refactor

```typescript
// After getting this test green:
describe("Discount calculation", () => {
  it("should apply 10% discount", () => {
    const originalPrice = 100;
    const discountedPrice = applyDiscount(originalPrice, 0.1);
    expect(discountedPrice).toBe(90);
  });
});

// Green implementation:
const applyDiscount = (price: number, discountRate: number): number => {
  return price * (1 - discountRate);
};

// Assess refactoring opportunities:
// - Code is already simple and clear
// - Function name clearly expresses intent
// - Implementation is a straightforward calculation
// - No magic numbers or unclear logic
// Conclusion: No refactoring needed. This is fine as-is.

// Commit and move to the next test
// git commit -m "feat: add discount calculation"
```

### Commit Guidelines

- Each commit should represent a complete, working change
- Use conventional commits format:
  ```
  feat: add payment validation
  fix: correct date formatting in payment processor
  refactor: extract payment validation logic
  test: add edge cases for payment validation
  ```
- Include test changes with feature changes in the same commit

### Pull Request Standards

- Every PR must have all tests passing
- All linting and quality checks must pass
- Work in small increments that maintain a working state
- PRs should be focused on a single feature or fix
- Include description of the behavior change, not implementation details

## Working with Claude

### Expectations

When working with my code:

1. **ALWAYS FOLLOW TDD** - No production code without a failing test. This is not negotiable.
2. **Think deeply** before making any edits
3. **Understand the full context** of the code and requirements
4. **Ask clarifying questions** when requirements are ambiguous
5. **Think from first principles** - don't make assumptions
6. **Assess refactoring after every green** - Look for opportunities to improve code structure, but only refactor if it adds value
7. **Keep project docs current** - update them whenever you introduce meaningful changes

### Code Changes

When suggesting or making changes:

- **Start with a failing test** - always. No exceptions.
- After making tests pass, always assess refactoring opportunities (but only refactor if it adds value)
- After refactoring, verify all tests and static analysis pass, then commit
- Respect the existing patterns and conventions
- Maintain test coverage for all behavior changes
- Keep changes small and incremental
- Ensure all TypeScript strict mode requirements are met
- Provide rationale for significant design decisions

**If you find yourself writing production code without a failing test, STOP immediately and write the test first.**

### Communication

- Be explicit about trade-offs in different approaches
- Explain the reasoning behind significant design decisions
- Flag any deviations from these guidelines with justification
- Suggest improvements that align with these principles
- When unsure, ask for clarification rather than assuming

## Example Patterns

### Error Handling

Use Result types or early returns:

### Testing Behavior

```typescript
// Good - tests behavior through public API
describe("CulvertParser", () => {
  it("should reject invalid culvert format", () => {
    const invalidData = ["Invalid culvert line"];

    const result = parseCulvertData(invalidData[0], invalidData, 0);

    expect(() => result).toThrow("Invalid culvert format");
  });

  it("should parse valid culvert data successfully", () => {
    const culvertData = getMockCulvertData({ numberOfBarrels: 2 });
    const geometryLines = ["Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64,2,Group #1,0,"];

    const result = parseCulvertData(geometryLines[0], geometryLines, 0);

    expect(result.data[0].numberOfBarrels).toBe(2);
    expect(result.data[0].culvertGroupName).toBe("Group #1");
  });
});

// Avoid - testing implementation details
describe("CulvertParser", () => {
  it("should call parseKeyValue method", () => {
    // This tests implementation, not behavior
  });
});
```

## Common Patterns to Avoid

### Anti-patterns

```typescript
// Avoid: Mutation
const addBarrel = (barrels: CulvertBarrelProperties[], newBarrel: CulvertBarrelProperties) => {
  barrels.push(newBarrel); // Mutates array
  return barrels;
};

// Prefer: Immutable update
const addBarrel = (barrels: CulvertBarrelProperties[], newBarrel: CulvertBarrelProperties): CulvertBarrelProperties[] => {
  return [...barrels, newBarrel];
};

// Avoid: Nested conditionals
if (geometry) {
  if (geometry.connections) {
    if (geometry.connections.culverts) {
      // do something
    }
  }
}

// Prefer: Early returns
if (!geometry || !geometry.connections || !geometry.connections.culverts) {
  return;
}
// do something

// Avoid: Large functions
const parseGeometryFile = (lines: string[]) => {
  // 100+ lines of code
};

// Prefer: Composed small functions
const parseGeometryFile = (lines: string[]) => {
  const headers = parseGeometryHeaders(lines);
  const connections = parseConnections(lines);
  const storageAreas = parseStorageAreas(lines);
  return buildGeometry(headers, connections, storageAreas);
};
```

## Resources and References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Kent C. Dodds Testing JavaScript](https://testingjavascript.com/)
- [Functional Programming in TypeScript](https://gcanti.github.io/fp-ts/)



## Summary

The key is to write clean, testable, functional code that evolves through small, safe increments. Every change should be driven by a test that describes the desired behavior, and the implementation should be the simplest thing that makes that test pass. When in doubt, favor simplicity and readability over cleverness.