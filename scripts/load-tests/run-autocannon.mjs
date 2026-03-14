import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import autocannon from 'autocannon';

const SCENARIOS = {
  catalog: {
    method: 'GET',
    path: '/catalog',
    headers: {
      accept: 'application/json',
    },
  },
  login: {
    method: 'POST',
    path: '/auth/login',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    buildBody: ({ email, password }) =>
      JSON.stringify({
        email,
        password,
      }),
  },
};

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

function printUsage() {
  console.error(`Usage:
  npm run loadtest -- --target <catalog|login> --base-url <url> [--duration 15] [--connections 10] [--output load-test-results/catalog.json]

Environment variables:
  LOADTEST_BASE_URL
  LOADTEST_USER_EMAIL
  LOADTEST_USER_PASSWORD`);
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizeNumber(value, fallback) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildOutputPath(target, providedOutputPath) {
  if (providedOutputPath) {
    return path.resolve(providedOutputPath);
  }

  return path.resolve('load-test-results', `${target}.json`);
}

function selectScenario(target) {
  const scenario = SCENARIOS[target];

  if (!scenario) {
    throw new Error(
      `Unknown target "${target}". Expected one of: ${Object.keys(SCENARIOS).join(', ')}`,
    );
  }

  return scenario;
}

function buildRequestBody(target, email, password) {
  if (target !== 'login') {
    return undefined;
  }

  if (!email || !password) {
    throw new Error(
      'LOADTEST_USER_EMAIL and LOADTEST_USER_PASSWORD are required for the login scenario.',
    );
  }

  return SCENARIOS.login.buildBody({ email, password });
}

function extractSummary(result) {
  const latency = result.latency ?? {};
  const requests = result.requests ?? {};

  return {
    requestsTotal: requests.total ?? 0,
    requestsAverage: requests.average ?? 0,
    latencyAverageMs: latency.average ?? latency.mean ?? 0,
    latencyP95Ms: latency.p95 ?? latency.p97_5 ?? latency.p99 ?? 0,
    throughputAverageBytes: result.throughput?.average ?? 0,
    errors: result.errors ?? 0,
    timeouts: result.timeouts ?? 0,
    non2xx: result.non2xx ?? 0,
    statusCodes: {
      '1xx': result['1xx'] ?? 0,
      '2xx': result['2xx'] ?? 0,
      '3xx': result['3xx'] ?? 0,
      '4xx': result['4xx'] ?? 0,
      '5xx': result['5xx'] ?? 0,
    },
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const target = args.target ?? 'catalog';
  const scenario = selectScenario(target);
  const baseUrl = args['base-url'] ?? process.env.LOADTEST_BASE_URL;

  if (!baseUrl) {
    printUsage();
    throw new Error('Missing base URL. Provide --base-url or LOADTEST_BASE_URL.');
  }

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const duration = normalizeNumber(args.duration, 15);
  const connections = normalizeNumber(args.connections, 10);
  const outputPath = buildOutputPath(target, args.output);
  const requestBody = buildRequestBody(
    target,
    process.env.LOADTEST_USER_EMAIL,
    process.env.LOADTEST_USER_PASSWORD,
  );

  await mkdir(path.dirname(outputPath), { recursive: true });

  const result = await new Promise((resolve, reject) => {
    autocannon(
      {
        url: `${normalizedBaseUrl}${scenario.path}`,
        method: scenario.method,
        headers: scenario.headers,
        body: requestBody,
        connections,
        duration,
      },
      (error, finalResult) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(finalResult);
      },
    );
  });

  const report = {
    scenario: target,
    target: {
      method: scenario.method,
      url: `${normalizedBaseUrl}${scenario.path}`,
    },
    config: {
      durationSeconds: duration,
      connections,
    },
    generatedAt: new Date().toISOString(),
    summary: extractSummary(result),
    result,
  };

  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        outputPath,
        scenario: report.scenario,
        requestsTotal: report.summary.requestsTotal,
        latencyAverageMs: report.summary.latencyAverageMs,
        latencyP95Ms: report.summary.latencyP95Ms,
        errors: report.summary.errors,
        non2xx: report.summary.non2xx,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
