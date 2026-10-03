import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = [
  { name: 'GET /health', path: '/health', method: 'GET' },
  { name: 'GET /api/dashboard', path: '/api/dashboard', method: 'GET' },
  { name: 'GET /api/activities', path: '/api/activities', method: 'GET' },
];

const TIERS = [
  { name: 'x1 Baseline', concurrency: 1, requests: 20 },
  { name: 'x10 Concurrent', concurrency: 10, requests: 100 },
  { name: 'x100 Peak School', concurrency: 100, requests: 500 },
  { name: 'x1000 Multi-School', concurrency: 500, requests: 2000 },
  { name: 'x10000 Breakpoint Stress', concurrency: 1000, requests: 5000 },
];

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const start = performance.now();
    const startedAt = Date.now();
    const req = http.request(
      `${BASE_URL}${endpoint.path}`,
      { method: endpoint.method, timeout: 8000 },
      (res) => {
        let bytes = 0;
        res.on('data', (chunk) => (bytes += chunk.length));
        res.on('end', () => {
          const duration = performance.now() - start;
          resolve({
            endpoint: endpoint.name,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 400,
            duration,
            startedAt,
            bytes,
          });
        });
      }
    );

    req.on('timeout', () => req.destroy(Object.assign(new Error('Request timeout'), { code: 'ETIMEDOUT' })));

    req.on('error', (err) => {
      const duration = performance.now() - start;
      const inner = err.errors?.[0];
      resolve({
        endpoint: endpoint.name,
        status: 0,
        success: false,
        error: err.code || inner?.code || err.message || 'UNKNOWN',
        duration,
        startedAt,
        bytes: 0,
      });
    });

    req.end();
  });
}

async function runWorker(requestsQueue, results) {
  while (requestsQueue.length > 0) {
    const endpoint = requestsQueue.pop();
    if (!endpoint) break;
    const result = await makeRequest(endpoint);
    result.threads = requestsQueue.threads;
    results.push(result);
  }
}

async function runTier(tier) {
  console.log(`\n========================================`);
  console.log(`Running Tier: ${tier.name} (Concurrency: ${tier.concurrency}, Total: ${tier.requests})`);
  console.log(`========================================`);

  const queue = [];
  queue.threads = tier.concurrency;
  for (let i = 0; i < tier.requests; i++) {
    queue.push(ENDPOINTS[i % ENDPOINTS.length]);
  }

  const results = [];
  const startTime = performance.now();

  const workers = [];
  for (let w = 0; w < tier.concurrency; w++) {
    workers.push(runWorker(queue, results));
  }

  await Promise.all(workers);
  const totalDurationSeconds = (performance.now() - startTime) / 1000;

  const latencies = results.map((r) => r.duration).sort((a, b) => a - b);
  const successful = results.filter((r) => r.success).length;
  const failed = results.length - successful;

  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p90 = latencies[Math.floor(latencies.length * 0.9)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const throughput = (results.length / totalDurationSeconds).toFixed(1);

  const summary = {
    tier: tier.name,
    concurrency: tier.concurrency,
    totalRequests: results.length,
    successful,
    failed,
    errorRate: `${((failed / results.length) * 100).toFixed(2)}%`,
    throughputRps: throughput,
    durationSeconds: totalDurationSeconds.toFixed(2),
    minMs: Math.round(latencies[0]),
    avgMs: Math.round(avg),
    p50Ms: Math.round(p50),
    p90Ms: Math.round(p90),
    p95Ms: Math.round(p95),
    p99Ms: Math.round(p99),
    maxMs: Math.round(latencies[latencies.length - 1]),
    errorBreakdown: results.filter((r) => !r.success).reduce((acc, r) => {
      const key = r.error || `HTTP ${r.status}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  };

  console.log(`Completed in ${summary.durationSeconds}s | Throughput: ${summary.throughputRps} req/s`);
  console.log(`Success: ${successful}/${results.length} (${summary.errorRate} errors)`);
  console.log(`Latency: Min=${summary.minMs}ms, Avg=${summary.avgMs}ms, P90=${summary.p90Ms}ms, P99=${summary.p99Ms}ms, Max=${summary.maxMs}ms`);

  return { summary, results };
}

async function main() {
  console.log(`Starting JMeter-Equivalent Staged Load Test against ${BASE_URL}...`);
  const allSummaries = [];
  const allResults = [];

  for (const tier of TIERS) {
    const { summary, results } = await runTier(tier);
    allSummaries.push(summary);
    allResults.push(...results);
  }

  // Export summary JSON
  const outputDir = path.join(process.cwd(), 'tests', 'jmeter');
  fs.mkdirSync(outputDir, { recursive: true });

  const summaryFile = path.join(outputDir, 'load-test-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(allSummaries, null, 2));

  // Export JMeter JTL-compatible CSV
  const csvFile = path.join(outputDir, 'jmeter-results.csv');
  const csvHeader = 'timeStamp,elapsed,label,responseCode,responseMessage,threadName,dataType,success,failureMessage,bytes,sentBytes,grpThreads,allThreads,URL,Latency,IdleTime,Connect\n';
  const csvRows = allResults.map((r) => {
    const message = r.success ? 'OK' : (r.error || `HTTP ${r.status}`);
    return `${r.startedAt},${Math.round(r.duration)},${r.endpoint},${r.status},${message},Tier-${r.threads},text,${r.success},${r.success ? '' : message},${r.bytes},0,${r.threads},${r.threads},${BASE_URL},${Math.round(r.duration)},0,0`;
  }).join('\n');

  fs.writeFileSync(csvFile, csvHeader + csvRows);
  console.log(`\n✅ Saved JMeter Results CSV to: ${csvFile}`);
  console.log(`✅ Saved Summary JSON to: ${summaryFile}`);
}

main().catch(console.error);
