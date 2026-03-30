import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const projectRoot = process.cwd();
const jsonReportPath = resolve(projectRoot, 'test-results', 'qa-results.json');
const outputPath = resolve(projectRoot, 'demo-report', 'index.html');

function formatDurationMs(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'N/A';
  }

  if (value < 1000) {
    return `${Math.round(value)} ms`;
  }

  return `${(value / 1000).toFixed(2)} s`;
}

function flattenSpecs(suites) {
  const list = [];

  function walkSuite(suite, groupPath = []) {
    const nextPath = suite.title ? [...groupPath, suite.title] : groupPath;

    for (const spec of suite.specs ?? []) {
      list.push({
        path: nextPath,
        spec
      });
    }

    for (const child of suite.suites ?? []) {
      walkSuite(child, nextPath);
    }
  }

  for (const suite of suites ?? []) {
    walkSuite(suite);
  }

  return list;
}

function decodeAttachmentBody(attachment) {
  if (!attachment?.body) {
    return null;
  }

  return Buffer.from(attachment.body, 'base64');
}

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildComparisonRows(expected, actual) {
  const rows = [];

  function pushRow(section, key, expectedValue, actualValue) {
    const pass = expectedValue === actualValue;

    rows.push(`
      <tr>
        <td>${escapeHtml(section)}</td>
        <td>${escapeHtml(key)}</td>
        <td>${escapeHtml(expectedValue ?? 'N/A')}</td>
        <td>${escapeHtml(actualValue ?? 'N/A')}</td>
        <td class="status ${pass ? 'pass' : 'fail'}">${pass ? 'MATCH' : 'MISMATCH'}</td>
      </tr>
    `);
  }

  for (const [key, value] of Object.entries(expected.text ?? {})) {
    pushRow('Text', key, value, actual.text?.[key]);
  }

  for (const [key, value] of Object.entries(expected.style ?? {})) {
    pushRow('Style', key, value, actual.style?.[key]);
  }

  return rows.join('');
}

const reportRaw = await readFile(jsonReportPath, 'utf8');
const report = JSON.parse(reportRaw);
const specs = flattenSpecs(report.suites ?? []);

let figmaComparison = null;
let figmaScreenshotDataUrl = null;

const testRows = specs.map(({ path, spec }) => {
  const testEntry = spec.tests?.[0];
  const result = testEntry?.results?.[0];
  const status = result?.status ?? 'unknown';
  const duration = formatDurationMs(result?.duration);
  const tags = spec.tags?.length ? spec.tags.join(', ') : '-';
  const caseName = [...path, spec.title].join(' > ');

  if (spec.tags?.includes('figma') && result?.attachments) {
    for (const attachment of result.attachments) {
      if (attachment.name === 'figma-expected-vs-actual.json') {
        const decoded = decodeAttachmentBody(attachment);

        if (decoded) {
          figmaComparison = JSON.parse(decoded.toString('utf8'));
        }
      }

      if (attachment.name === 'figma-comparison-screenshot.png') {
        const decoded = decodeAttachmentBody(attachment);

        if (decoded) {
          figmaScreenshotDataUrl = `data:image/png;base64,${decoded.toString('base64')}`;
        }
      }
    }
  }

  return `
    <tr>
      <td>${escapeHtml(caseName)}</td>
      <td>${escapeHtml(tags)}</td>
      <td class="status ${status === 'passed' ? 'pass' : 'fail'}">${escapeHtml(status.toUpperCase())}</td>
      <td>${escapeHtml(duration)}</td>
    </tr>
  `;
});

const stats = report.stats ?? {};
const expected = stats.expected ?? 0;
const unexpected = stats.unexpected ?? 0;
const flaky = stats.flaky ?? 0;
const skipped = stats.skipped ?? 0;
const total = expected + unexpected + flaky + skipped;
const overallPass = unexpected === 0;

const comparisonTable = figmaComparison
  ? `
    <h2>Figma Expected vs Actual</h2>
    <p>This section proves that the Angular app values were compared directly to Figma-derived expectations.</p>
    <table>
      <thead>
        <tr>
          <th>Group</th>
          <th>Property</th>
          <th>Expected (Figma)</th>
          <th>Actual (App)</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        ${buildComparisonRows(figmaComparison.expected ?? {}, figmaComparison.actual ?? {})}
      </tbody>
    </table>
  `
  : '<h2>Figma Expected vs Actual</h2><p>No Figma comparison attachment found in this run.</p>';

const screenshotBlock = figmaScreenshotDataUrl
  ? `<h2>Figma Comparison Screenshot</h2><img src="${figmaScreenshotDataUrl}" alt="Figma comparison screenshot" class="preview" />`
  : '<h2>Figma Comparison Screenshot</h2><p>No screenshot attachment found in this run.</p>';

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>UI QA Demo Report</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Segoe UI, Arial, sans-serif;
      }
      body {
        margin: 0;
        background: #f2f4f8;
        color: #0f172a;
      }
      .container {
        max-width: 1180px;
        margin: 0 auto;
        padding: 24px;
      }
      .hero {
        background: #ffffff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
      }
      .status {
        font-weight: 700;
      }
      .pass {
        color: #166534;
      }
      .fail {
        color: #b91c1c;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(120px, 1fr));
        gap: 12px;
        margin-top: 16px;
      }
      .metric {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px;
      }
      .metric h3 {
        margin: 0;
        font-size: 13px;
        color: #475569;
      }
      .metric p {
        margin: 6px 0 0;
        font-size: 22px;
        font-weight: 700;
      }
      section {
        margin-top: 20px;
        background: #ffffff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
      }
      h1, h2 {
        margin: 0 0 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border-bottom: 1px solid #e2e8f0;
        padding: 10px 8px;
        text-align: left;
        vertical-align: top;
        font-size: 14px;
      }
      th {
        background: #f8fafc;
      }
      .preview {
        width: min(100%, 900px);
        border: 1px solid #e2e8f0;
        border-radius: 8px;
      }
      @media (max-width: 720px) {
        .summary-grid {
          grid-template-columns: repeat(2, minmax(120px, 1fr));
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="hero">
        <h1>UI QA Demo Report</h1>
        <p>
          Overall Result:
          <span class="status ${overallPass ? 'pass' : 'fail'}">${overallPass ? 'PASS' : 'FAIL'}</span>
        </p>
        <p>Total Duration: ${escapeHtml(formatDurationMs(stats.duration))}</p>
        <div class="summary-grid">
          <div class="metric"><h3>Total Tests</h3><p>${total}</p></div>
          <div class="metric"><h3>Passed</h3><p>${expected}</p></div>
          <div class="metric"><h3>Failed</h3><p>${unexpected}</p></div>
          <div class="metric"><h3>Flaky/Skipped</h3><p>${flaky + skipped}</p></div>
        </div>
      </div>

      <section>
        <h2>Executed Test Cases</h2>
        <table>
          <thead>
            <tr>
              <th>Test Case</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${testRows.join('')}
          </tbody>
        </table>
      </section>

      <section>
        ${comparisonTable}
      </section>

      <section>
        ${screenshotBlock}
      </section>
    </div>
  </body>
</html>
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, html, 'utf8');

console.log(`Demo summary report generated at ${outputPath}`);
