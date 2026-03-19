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
  categories: {
    method: 'GET',
    path: '/categories',
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
    credentialRole: 'seller',
    buildBody: ({ credentials }) =>
      JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
  },
  'auth-me': {
    method: 'GET',
    path: '/auth/me',
    headers: {
      accept: 'application/json',
    },
    authRole: 'seller',
  },
  'admin-pending': {
    method: 'GET',
    path: '/admin/articles/pending',
    headers: {
      accept: 'application/json',
    },
    authRole: 'admin',
  },
  'article-create': {
    method: 'POST',
    path: '/articles',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    authRole: 'seller',
    requiresCategoryId: true,
    buildBody: ({ categoryId }) =>
      JSON.stringify({
        title: `Load test article ${Date.now()}`,
        description:
          'Annonce generee pour les tests de charge du parcours seller.',
        price: 19.9,
        shippingCost: 4.5,
        categoryId,
      }),
  },
};

const TARGET_GROUPS = {
  public: ['catalog', 'categories'],
  auth: ['login', 'auth-me'],
  all: ['catalog', 'categories', 'login', 'auth-me'],
  'seller-flow': ['login', 'auth-me', 'article-create'],
  admin: ['admin-pending'],
  full: [
    'catalog',
    'categories',
    'login',
    'auth-me',
    'article-create',
    'admin-pending',
  ],
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
  npm run loadtest -- --target <catalog|categories|login|auth-me|admin-pending|article-create|public|auth|all|seller-flow|admin|full> --base-url <url> [--duration 15] [--connections 10] [--output load-test-results]

Environment variables:
  LOADTEST_BASE_URL
  LOADTEST_USER_EMAIL
  LOADTEST_USER_PASSWORD
  LOADTEST_SELLER_EMAIL
  LOADTEST_SELLER_PASSWORD
  LOADTEST_ADMIN_EMAIL
  LOADTEST_ADMIN_PASSWORD
  LOADTEST_CATEGORY_ID`);
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizeNumber(value, fallback) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toFixedNumber(value, digits = 2) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue.toFixed(digits) : '0.00';
}

function buildSingleOutputPath(target, providedOutputPath) {
  if (providedOutputPath) {
    const resolvedPath = path.resolve(providedOutputPath);

    if (path.extname(resolvedPath).toLowerCase() === '.json') {
      return resolvedPath;
    }

    return path.join(resolvedPath, `${target}.json`);
  }

  return path.resolve('load-test-results', `${target}.json`);
}

function buildOutputDirectory(providedOutputPath) {
  if (providedOutputPath) {
    return path.resolve(providedOutputPath);
  }

  return path.resolve('load-test-results');
}

function resolveTargets(targetArgument) {
  if (!targetArgument) {
    return ['catalog'];
  }

  const rawTargets = String(targetArgument)
    .split(',')
    .map((target) => target.trim())
    .filter(Boolean);

  if (rawTargets.length === 0) {
    return ['catalog'];
  }

  const resolvedTargets = [];

  for (const rawTarget of rawTargets) {
    const groupedTargets = TARGET_GROUPS[rawTarget];

    if (groupedTargets) {
      for (const groupedTarget of groupedTargets) {
        if (!resolvedTargets.includes(groupedTarget)) {
          resolvedTargets.push(groupedTarget);
        }
      }
      continue;
    }

    if (!SCENARIOS[rawTarget]) {
      throw new Error(
        `Unknown target "${rawTarget}". Expected one of: ${[
          ...Object.keys(SCENARIOS),
          ...Object.keys(TARGET_GROUPS),
        ].join(', ')}`,
      );
    }

    if (!resolvedTargets.includes(rawTarget)) {
      resolvedTargets.push(rawTarget);
    }
  }

  return resolvedTargets;
}

function resolveCredentials(role, env) {
  if (role === 'admin') {
    const email = env.LOADTEST_ADMIN_EMAIL;
    const password = env.LOADTEST_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'LOADTEST_ADMIN_EMAIL and LOADTEST_ADMIN_PASSWORD are required for admin scenarios.',
      );
    }

    return { email, password };
  }

  const email = env.LOADTEST_SELLER_EMAIL ?? env.LOADTEST_USER_EMAIL;
  const password =
    env.LOADTEST_SELLER_PASSWORD ?? env.LOADTEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'LOADTEST_SELLER_EMAIL / LOADTEST_SELLER_PASSWORD or LOADTEST_USER_EMAIL / LOADTEST_USER_PASSWORD are required for seller scenarios.',
    );
  }

  return { email, password };
}

async function requestJson(url, init = {}) {
  const response = await fetch(url, init);
  const bodyText = await response.text();
  let body = null;

  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = bodyText;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}

async function fetchJwtToken(baseUrl, role, env) {
  const credentials = resolveCredentials(role, env);
  const loginResponse = await requestJson(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!loginResponse.ok) {
    throw new Error(
      `Unable to authenticate ${role} before load test. /auth/login returned HTTP ${loginResponse.status}.`,
    );
  }

  const accessToken = loginResponse.body?.accessToken;

  if (!accessToken) {
    throw new Error(`No accessToken returned by /auth/login for role ${role}.`);
  }

  return {
    token: accessToken,
    credentials,
  };
}

async function resolveCategoryId(baseUrl, env) {
  if (env.LOADTEST_CATEGORY_ID) {
    return env.LOADTEST_CATEGORY_ID;
  }

  const categoriesResponse = await requestJson(`${baseUrl}/categories`, {
    headers: {
      accept: 'application/json',
    },
  });

  if (!categoriesResponse.ok) {
    throw new Error(
      `Unable to fetch categories before article-create. /categories returned HTTP ${categoriesResponse.status}.`,
    );
  }

  const firstCategoryId = categoriesResponse.body?.[0]?.id;

  if (!firstCategoryId) {
    throw new Error(
      'No category available for article-create. Seed the database or set LOADTEST_CATEGORY_ID.',
    );
  }

  return firstCategoryId;
}

async function buildScenarioContext(target, baseUrl, env) {
  const scenario = SCENARIOS[target];
  const context = {
    baseUrl,
    credentials: null,
    token: null,
    categoryId: null,
  };

  if (scenario.credentialRole) {
    context.credentials = resolveCredentials(scenario.credentialRole, env);
  }

  if (scenario.authRole) {
    const authContext = await fetchJwtToken(baseUrl, scenario.authRole, env);
    context.token = authContext.token;

    if (!context.credentials) {
      context.credentials = authContext.credentials;
    }
  }

  if (scenario.requiresCategoryId) {
    context.categoryId = await resolveCategoryId(baseUrl, env);
  }

  return context;
}

function buildScenarioRequest(target, context) {
  const scenario = SCENARIOS[target];
  const headers = {
    ...scenario.headers,
  };

  if (context.token) {
    headers.authorization = `Bearer ${context.token}`;
  }

  const body = scenario.buildBody ? scenario.buildBody(context) : undefined;

  return {
    method: scenario.method,
    url: `${context.baseUrl}${scenario.path}`,
    headers,
    body,
  };
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

function renderMarkdownSummary(reports) {
  const lines = [
    '# Load Test Summary',
    '',
    '| Scenario | Requests | Avg latency (ms) | P95 (ms) | Avg req/s | Errors | Non-2xx | 2xx | 4xx | 5xx |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const report of reports) {
    const summary = report.summary ?? {};
    const statusCodes = summary.statusCodes ?? {};

    lines.push(
      `| ${report.scenario} | ${summary.requestsTotal ?? 0} | ${toFixedNumber(summary.latencyAverageMs)} | ${toFixedNumber(summary.latencyP95Ms)} | ${toFixedNumber(summary.requestsAverage)} | ${summary.errors ?? 0} | ${summary.non2xx ?? 0} | ${statusCodes['2xx'] ?? 0} | ${statusCodes['4xx'] ?? 0} | ${statusCodes['5xx'] ?? 0} |`,
    );
  }

  lines.push('');
  lines.push('Quick interpretation:');
  lines.push('- `Errors` should stay close to `0`.');
  lines.push('- `Non-2xx` should stay close to `0` on healthy scenarios.');
  lines.push('- `P95` is the main latency indicator to compare scenarios.');

  return `${lines.join('\n')}\n`;
}

async function executeAutocannon(request, connections, duration) {
  return new Promise((resolve, reject) => {
    autocannon(
      {
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: request.body,
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
}

async function runSingleScenario(target, baseUrl, duration, connections, env) {
  const context = await buildScenarioContext(target, baseUrl, env);
  const request = buildScenarioRequest(target, context);
  const result = await executeAutocannon(request, connections, duration);

  return {
    scenario: target,
    target: {
      method: request.method,
      url: request.url,
    },
    config: {
      durationSeconds: duration,
      connections,
    },
    generatedAt: new Date().toISOString(),
    summary: extractSummary(result),
    result,
  };
}

async function writeScenarioReport(report, outputPath) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const targets = resolveTargets(args.target ?? 'catalog');
  const baseUrl = args['base-url'] ?? process.env.LOADTEST_BASE_URL;

  if (!baseUrl) {
    printUsage();
    throw new Error('Missing base URL. Provide --base-url or LOADTEST_BASE_URL.');
  }

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const duration = normalizeNumber(args.duration, 15);
  const connections = normalizeNumber(args.connections, 10);
  const reports = [];

  if (targets.length === 1) {
    const report = await runSingleScenario(
      targets[0],
      normalizedBaseUrl,
      duration,
      connections,
      process.env,
    );
    const outputPath = buildSingleOutputPath(targets[0], args.output);

    await writeScenarioReport(report, outputPath);
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
    return;
  }

  const outputDirectory = buildOutputDirectory(args.output);

  for (const target of targets) {
    const report = await runSingleScenario(
      target,
      normalizedBaseUrl,
      duration,
      connections,
      process.env,
    );
    const outputPath = path.join(outputDirectory, `${target}.json`);

    await writeScenarioReport(report, outputPath);
    reports.push(report);
  }

  const summaryOutputPath = args['summary-output']
    ? path.resolve(args['summary-output'])
    : path.join(outputDirectory, 'summary.md');
  const markdownSummary = renderMarkdownSummary(reports);

  await mkdir(path.dirname(summaryOutputPath), { recursive: true });
  await writeFile(summaryOutputPath, markdownSummary, 'utf8');

  console.log(
    JSON.stringify(
      {
        outputDirectory,
        summaryOutputPath,
        scenarios: reports.map((report) => ({
          scenario: report.scenario,
          requestsTotal: report.summary.requestsTotal,
          latencyAverageMs: report.summary.latencyAverageMs,
          latencyP95Ms: report.summary.latencyP95Ms,
          errors: report.summary.errors,
          non2xx: report.summary.non2xx,
        })),
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
