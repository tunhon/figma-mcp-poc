# Angular + Figma MCP Demo Guide (English)

## 1. Demo Goal
Show customers that the Angular login UI is validated against Figma expectations, not only basic UI tests.

## 2. One-Time Setup
1. Open terminal in `figma-mcp-poc`.
2. Install dependencies:

```bash
npm install
```

## 3. Run Full Demo Check
Run all QA tests and generate a customer-facing summary report:

```bash
npm run qa:demo:customer
```

This command does two things:
1. Runs all Playwright tests (semantic, visual baseline, Figma contract).
2. Generates a stakeholder summary page.

## 4. Open Reports
### A. Detailed Playwright HTML Report
```bash
npm run qa:report:open
```
If this command cannot open a browser on your machine, open this file directly:
- `playwright-report/index.html`

### B. Customer Summary Report (Simple)
Open this file directly:
- `demo-report/index.html`

## 5. What to Show the Customer
Use `demo-report/index.html` first, then drill down into Playwright report if needed.

### Key proof points
1. Overall PASS/FAIL status.
2. List of executed tests.
3. `Figma Expected vs Actual` table:
   - Text values (title, labels, button text, helper text)
   - Style tokens (colors, radius, card width)
4. Comparison screenshot captured during Figma test.

## 6. Explain the Test Layers
1. Semantic QA: checks required elements and text.
2. Visual baseline QA: checks screenshot consistency.
3. Figma contract QA: checks Angular rendered values against Figma-derived expected values.

## 7. Suggested Demo Script (2-3 minutes)
1. Show the Angular page running locally.
2. Run `npm run qa:demo:customer`.
3. Open `demo-report/index.html` and show PASS + expected vs actual table.
4. Open `playwright-report/index.html` and show attached JSON/screenshot evidence in the Figma test case.

## 8. Troubleshooting
1. If tests fail, read mismatch rows in the customer summary report.
2. If visual test fails after intentional UI changes, refresh baseline:

```bash
npm run qa:test:update-snapshots
```

3. Re-run full demo:

```bash
npm run qa:demo:customer
```
