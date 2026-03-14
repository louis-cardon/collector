import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (!current.startsWith('--')) {
      continue;
    }

    const [rawKey, inlineValue] = current.slice(2).split('=');
    const key = rawKey.trim();

    if (!key) {
      continue;
    }

    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function toFixedNumber(value, digits = 2) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue.toFixed(digits) : '0.00';
}

async function collectJsonFiles(inputPath) {
  const resolvedPath = path.resolve(inputPath);
  const inputStat = await stat(resolvedPath);

  if (inputStat.isFile()) {
    return [resolvedPath];
  }

  const entries = await readdir(resolvedPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(resolvedPath, entry.name))
    .sort();
}

async function loadReports(inputPath) {
  const files = await collectJsonFiles(inputPath);
  const reports = [];

  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    reports.push({
      file,
      report: JSON.parse(raw),
    });
  }

  return reports;
}

function renderMarkdown(reports) {
  const lines = [
    '# Load Test Summary',
    '',
    '| Scenario | Requests | Avg latency (ms) | P95 (ms) | Avg req/s | Errors | Non-2xx | 2xx | 4xx | 5xx |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const { report } of reports) {
    const summary = report.summary ?? {};
    const statusCodes = summary.statusCodes ?? {};

    lines.push(
      `| ${report.scenario} | ${summary.requestsTotal ?? 0} | ${toFixedNumber(summary.latencyAverageMs)} | ${toFixedNumber(summary.latencyP95Ms)} | ${toFixedNumber(summary.requestsAverage)} | ${summary.errors ?? 0} | ${summary.non2xx ?? 0} | ${statusCodes['2xx'] ?? 0} | ${statusCodes['4xx'] ?? 0} | ${statusCodes['5xx'] ?? 0} |`,
    );
  }

  lines.push('');
  lines.push('Quick interpretation:');
  lines.push('- `Requests`: total number of requests completed during the run.');
  lines.push('- `Avg latency`: average response time in milliseconds.');
  lines.push('- `P95`: 95th percentile latency when available, otherwise the closest percentile exported by autocannon.');
  lines.push('- `Errors` and `Non-2xx`: should stay close to zero on a healthy deployed API.');

  return `${lines.join('\n')}\n`;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.input ?? 'load-test-results';
  const outputPath = args.output
    ? path.resolve(args.output)
    : path.resolve(inputPath, 'summary.md');
  const reports = await loadReports(inputPath);

  if (reports.length === 0) {
    throw new Error(`No JSON report found in ${path.resolve(inputPath)}.`);
  }

  const markdown = renderMarkdown(reports);

  await writeFile(outputPath, markdown, 'utf8');
  process.stdout.write(markdown);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
