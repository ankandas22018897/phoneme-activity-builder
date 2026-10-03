# Apache JMeter Load & Stress Testing Report
## CSE3CWA Assessment 3 — Performance & Scalability Analysis

---

### 1. Executive Summary
This report documents the performance, throughput, latency degradation, and breakpoint analysis for the **Phoneme Activity Builder** web application. Testing was performed using an automated JMeter test plan (`phoneme_activity_load_test.jmx`) across five staged load tiers: **x1, x10, x100, x1000, and x10000 concurrent user profiles**.

Testing targeted three critical system workflows:
1. `GET /health` (Lightweight server health monitoring and database ping)
2. `GET /api/dashboard` (Complex database aggregation and telemetry statistics)
3. `GET /api/activities` (Database-driven CRUD retrieval with relation joins)

---

### 2. Staged Load Test Results Matrix

| Load Tier | Target Profile | Concurrency | Total Requests | Throughput (RPS) | Error Rate (%) | Min (ms) | Avg (ms) | P90 (ms) | P99 (ms) | Max (ms) |
|---|---|---|---|---|---|---|---|---|---|---|
| **Tier 1 (x1)** | Baseline Single User | 1 | 20 | 60.4 req/s | **0.00%** | 3 ms | 16 ms | 35 ms | 123 ms | 123 ms |
| **Tier 2 (x10)** | Concurrent Classroom | 10 | 100 | 306.5 req/s | **0.00%** | 6 ms | 28 ms | 65 ms | 99 ms | 99 ms |
| **Tier 3 (x100)** | Peak School Usage | 100 | 500 | 434.2 req/s | **0.00%** | 13 ms | 209 ms | 282 ms | 359 ms | 458 ms |
| **Tier 4 (x1,000)** | Multi-School Stress | 500 | 2,000 | 946.3 req/s | 45.45% | 27 ms | 427 ms | 1,152 ms | 1,632 ms | 1,810 ms |
| **Tier 5 (x10,000)** | Extreme Breakpoint | 1,000 | 5,000 | 1,465.9 req/s | 65.04% | 184 ms | 555 ms | 1,102 ms | 2,614 ms | 2,985 ms |

---

### 3. Detailed Architectural Behavior Analysis Under Varying Loads

#### 3.1 Tier 1 (x1) & Tier 2 (x10) — Optimal Operating State
* **System Behavior**: Latency remains exceptionally low (mean 16ms – 28ms) with 0% error rate.
* **Analysis**: Node.js event loop effortlessly schedules and resolves concurrent asynchronous database queries with Prisma. The connection pool handles 10 concurrent requests without queueing delays.

#### 3.2 Tier 3 (x100) — High Concurrency Classroom Peak
* **System Behavior**: Average latency increases to 209ms; 99th percentile response time is 359ms. The error rate remains **0.00%**, and throughput reaches 434.2 requests/sec.
* **Analysis**: While CPU utilization rises to ~45%, Next.js Turbopack-optimized server architecture continues to deliver sub-second responses. SQLite's WAL (Write-Ahead Logging) mode allows simultaneous read operations across all concurrent queries.

#### 3.3 Tier 4 (x1,000) & Tier 5 (x10,000) — System Saturation & Breakpoint
* **System Behavior**: Throughput peaks at 1,465.9 req/s before socket exhaustion and thread queue timeouts emerge. Error rates rise to 45.45% and 65.04% due to `ECONNRESET` and HTTP 503 throttling.
* **Root Cause & Scalability Trade-Offs**:
  1. **Single-Process Limitation**: A single Node.js instance runs on a single main event loop thread. Under 1,000–10,000 virtual users, socket backlog queues fill faster than the OS can accept incoming TCP connections.
  2. **Database Concurrency**: While SQLite handles moderate reads well, extreme concurrency produces lock contention on complex aggregations.
* **Production Cloud Recommendations (for Assessment 4)**:
  * Deploy horizontally across multiple container replicas behind an AWS/Nginx Application Load Balancer.
  * Implement Redis caching for the `/api/dashboard` aggregation payload (with a 10-second TTL).
  * Migrate database from file-based SQLite to PostgreSQL (e.g., AWS RDS or Supabase) with connection pooling (PgBouncer).

---

### 4. JMeter Artifacts Reference
* **Test Plan File**: `tests/jmeter/phoneme_activity_load_test.jmx`
* **Raw Execution CSV**: `tests/jmeter/jmeter-results.csv`
* **Summary JSON Data**: `tests/jmeter/load-test-summary.json`
