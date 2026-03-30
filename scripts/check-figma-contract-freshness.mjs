import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const contractPath = resolve(process.cwd(), 'qa', 'figma-contract.json');
const maxAgeMinutes = Number(process.env.FIGMA_MAX_AGE_MINUTES ?? 120);

if (!Number.isFinite(maxAgeMinutes) || maxAgeMinutes <= 0) {
  console.error('Invalid FIGMA_MAX_AGE_MINUTES. Use a positive number.');
  process.exit(1);
}

let contract;

try {
  const contents = await readFile(contractPath, 'utf8');
  contract = JSON.parse(contents);
} catch (error) {
  console.error(`Unable to read Figma contract at ${contractPath}.`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const syncedAtRaw = contract?.meta?.syncedAt;

if (!syncedAtRaw) {
  console.error('Figma contract is missing meta.syncedAt. Refresh the contract from latest Figma MCP data first.');
  process.exit(1);
}

const syncedAt = new Date(syncedAtRaw);

if (Number.isNaN(syncedAt.getTime())) {
  console.error(`Invalid meta.syncedAt value: ${syncedAtRaw}`);
  process.exit(1);
}

const now = new Date();
const ageMinutes = (now.getTime() - syncedAt.getTime()) / (1000 * 60);

if (ageMinutes > maxAgeMinutes) {
  console.error(
    [
      'Figma contract is stale.',
      `Last sync: ${syncedAt.toISOString()}`,
      `Age: ${ageMinutes.toFixed(1)} minutes`,
      `Allowed max age: ${maxAgeMinutes} minutes`,
      'Refresh the contract from latest Figma MCP data, then rerun qa:test:figma:latest.'
    ].join('\n')
  );

  process.exit(1);
}

console.log(
  [
    'Figma contract freshness check passed.',
    `Last sync: ${syncedAt.toISOString()}`,
    `Age: ${ageMinutes.toFixed(1)} minutes`,
    `Allowed max age: ${maxAgeMinutes} minutes`
  ].join('\n')
);
