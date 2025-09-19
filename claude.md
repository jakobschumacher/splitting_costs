# Costsplitter - JavaScript Version

## Project Overview
This is a JavaScript reimplementation of the R package `costsplitter` for fair cost division in group travel scenarios. The goal is to create a web-based application where users can upload a CSV file and get automatic cost splitting calculations.

## Original R Package Analysis
The original costsplitter R package (located at `/home/jakob/Dokumente/03_Projekte/2024_10_08_Grouptraveller/costsplitter`) provides sophisticated cost-splitting functionality:

### Key Features to Replicate:
- **Complex participation scenarios**: partial participation, age-based consumption, income adjustments
- **Flexible input format**: CSV with columns for names, groups, ages, payments, shares, and adjustments
- **Multiple activities support**: different cost categories (meals, tours, accommodation, etc.)
- **Smart algorithms**: cost validation, transformation, calculation, and payment minimization

### Core Algorithm Components:
1. **Validation** (`costsplitter_validate.R`):
   - Ensures required columns exist (`name`, at least one `pay_` column)
   - Validates data types and uniqueness

2. **Transformation** (`costsplitter_transform.R`):
   - Converts categorical values to numeric (`full`→1, `reduced`→0.7, etc.)
   - Handles age categories (`adult`→1, `kid`→0.5)
   - Processes adjustment factors (`more`→1.2, `less`→0.8)

3. **Calculation** (`costsplitter_calculate.R`):
   - Computes cost per unit for each activity
   - Calculates individual/group obligations
   - Accounts for existing payments

4. **Minimization**:
   - Finds minimal set of transactions to settle all debts
   - Handles exact matches first, then optimizes remaining transfers

### Input CSV Format:
```csv
name,group,age,cost_day1,pay_day1,cost_day2,pay_day2,adjustment
James Smith,Smith,adult,full,,full,,
Olivia Johnson,Johnson,,0.8,,full,,less
Ethan Brown,Brown,3,full,,full,,
```

### Column Specifications:
- `name`: Unique participant identifier (required)
- `group`: Optional grouping for family/household calculations
- `age`: Age in years, or "adult"/"kid" categories
- `cost_[activity]`: Share for each activity (numeric 0-1, or "full"/"reduced"/"half")
- `pay_[activity]`: Amount already paid for each activity
- `adjustment`: Overall modifier ("more"→1.2x, "less"→0.8x, or numeric)

## JavaScript Implementation Goals:
1. **Web Interface**: Upload CSV, display results in browser
2. **Core Algorithm**: Port R validation/transformation/calculation logic
3. **Visualization**: Show payment matrix and optimal transfers
4. **Export**: Generate settlement instructions

## Technology Stack:
- **Frontend**: Vanilla JavaScript or lightweight framework
- **CSV Parsing**: Papa Parse or similar library
- **Calculation Engine**: Port R algorithms to JavaScript
- **UI**: Responsive design for mobile/desktop use

## Development Guidelines:
- **Tests first**: Write tests for every function
- **Git commit**: Commit after each relevant addition
- **Test before done**: Always verify functionality works
- **Hypermodular**: Self-contained functions only
- **Brief code**: No bloat, minimal comments

## Build/Lint Commands:
**Pre-commit validation sequence:**
```bash
npm run lint      # Check code style and potential bugs
npm run test      # Run all automated tests
npm run build     # Create production bundle
```

**Package.json scripts:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "build": "webpack --mode=production",
    "dev": "webpack serve --mode=development"
  }
}
```

**Command explanations:**
- **Linting**: ESLint checks code style, finds unused variables, catches potential bugs
- **Testing**: Jest runs automated tests to verify functions work correctly
- **Building**: Webpack bundles and optimizes code for production deployment

## Code Style:
**ESLint Configuration (Airbnb rules):**
```json
{
  "extends": ["airbnb-base"],
  "env": {
    "browser": true,
    "node": true,
    "jest": true
  },
  "rules": {
    "max-len": ["error", { "code": 100 }],
    "no-console": "warn"
  }
}
```

**Airbnb style includes:**
- Semicolons required
- Single quotes for strings
- 2-space indentation
- Arrow functions preferred
- Trailing commas required
- Strict formatting rules

## Browser Compatibility:
**Target: Modern browsers only**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features we can use:**
- ES2020+ syntax (optional chaining, nullish coalescing)
- Native modules (import/export)
- Fetch API
- File API for CSV upload
- CSS Grid/Flexbox
- No polyfills needed

**Browserslist config:**
```
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
```

## Performance Constraints:
**Relaxed performance requirements**
- Occasional use (few times per year)
- Processing time: up to 5 seconds acceptable
- No heavy optimization needed
- Prioritize code clarity over performance
- Simple algorithms preferred over complex optimizations

**Focus areas:**
- Correctness over speed
- Readable code over micro-optimizations
- User feedback during processing (progress indicators)
- Graceful handling of large CSV files (1000+ rows)

## Security Considerations:
**CSV Security Checks (Step 1 of pipeline):**
- **File size limit**: Max 10MB to prevent DoS
- **CSV injection detection**: Block cells starting with `=`, `@`, `+`, `-`, `\t`, `\r`
- **Formula injection**: Detect Excel/Sheets formula patterns
- **File type validation**: Ensure actual CSV content
- **Input sanitization**: Strip dangerous characters before processing

**Security validation function:**
```javascript
const securityCheck = (csvContent) => {
  const issues = [];
  // Check for formula injection patterns
  // Validate file size
  // Scan for malicious content
  return { secure: true/false, issues: [] };
};
```

**Fail-fast approach**: Stop processing immediately if security issues detected

## AI Agent Development Optimization:
**Context Window Management Strategies:**

### 1. Hypermodular Architecture
- **Max 100 lines per file**: Fits easily in context window
- **Single responsibility**: One function per file when possible
- **Self-contained modules**: Each with own tests and docs
- **Clear interfaces**: Minimal cross-module dependencies

### 2. Directory Structure (Context-Optimized)
```
src/
├── security/          # Step 1: Security validation
├── validation/        # Step 2: Data validation
├── transform/         # Step 3: Data transformation
├── calculation/       # Step 4: Cost calculation
├── reporting/         # Step 5: Report generation
└── utils/            # Shared utilities
```

### 3. Development Pattern for AI Agents
- **One module at a time**: Complete entire module before next
- **Atomic commits**: One complete feature per commit
- **Module README**: Documentation for each directory
- **Independent testing**: Each module fully testable alone
- **Clear naming**: File names describe exact functionality

### 4. Context-Efficient Git Strategy
- **Small iterations**: Frequent commits reduce context bloat
- **Descriptive messages**: AI can understand project state from git log
- **Module-based branches**: Work on one pipeline step at a time

## 5-Step Processing Pipeline:

### 1. Security Analysis
- File size limits validation
- CSV injection detection (`=`, `@`, `+`, `-` at start of cells)
- Malicious formula detection
- File type validation
- Return: `{ secure: boolean, issues: string[] }`

### 2. Data Validation (Comprehensive Error Collection)
- Required columns check (`name`, at least one `pay_*`)
- Data type validation (numeric fields)
- Duplicate name detection
- Value range validation
- Return detailed error/warning arrays:
```javascript
{
  errors: [
    { row: 2, column: 'name', message: 'Name is required' },
    { row: 3, column: 'pay_dinner', message: 'Must be numeric' }
  ],
  warnings: [
    { row: 4, column: 'adjustment', message: 'Empty value defaults to 1' }
  ]
}
```

### 3. Data Transformation
- Convert categorical to numeric (`full`→1, `reduced`→0.7, `adult`→18, `kid`→9)
- Apply defaults for missing values
- Calculate age adjustment factors
- Log all transformation decisions
- Return: transformed data + transformation log

### 4. Cost Calculation
- Calculate cost per unit for each activity
- Compute individual/group obligations
- Account for existing payments
- Handle edge cases (zero totals, negative values)
- Return: payment obligations matrix

### 5. Report Generation
- Minimize payment transactions
- Generate payment instructions
- Create summary statistics
- Export-ready formats
- Return: complete settlement report

## Error Handling Strategy:
- **Fail fast on security issues** (step 1)
- **Collect all validation errors** (step 2) - don't stop on first error
- **Graceful degradation** (steps 3-5) - provide partial results when possible
- **User-friendly messages** with row/column references

## Testing Strategy:
- Use existing R package test cases and CSV examples
- Validate JavaScript results match R output exactly
- Cross-browser compatibility testing
- Mobile responsiveness testing

## Example Use Cases:
- Family vacation cost splitting
- Group travel expenses
- Shared household costs
- Event planning expenses
- Any scenario with partial participation and varying consumption patterns