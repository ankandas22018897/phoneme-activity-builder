# Phoneme Activity Builder — Data-Driven Application & Reporting
## 2026-CSE3CWA-(OL-2) Cloud & Web Applications | Assessment 3

**Student Name:** Ankan Das  
**Student ID:** 22018897  
**Repository:** [https://github.com/ankandas567/phoneme-activity-builder](https://github.com/ankandas567/phoneme-activity-builder)

---

## 1. Executive Summary & Assessment 3 Scope

The **Phoneme Activity Builder** is a modern, data-driven web application tailored for speech pathologists, literacy educators, and primary teachers. It enables users to curate phoneme-based vocabularies and automatically construct interactive, accessible **Wordle** and **Word Search** educational activities.

Building on the frontend usability foundation of **Assessment 1** and the persistent backend/Docker architecture of **Assessment 2**, **Assessment 3** elevates the system into an enterprise-grade, observable platform featuring:
* A real-time **Data-Driven Observability Dashboard** (`/dashboard`).
* A standardized, resilient **Health Check Endpoint** (`/health` returning `200 OK`).
* Full **CRUD and Update Workflows** across word lists and activity configurations.
* Structured ordered phoneme sequence modeling (`PhonemeItem`).
* Automated **End-to-End Testing** using Microsoft Playwright.
* Staged **Concurrent Load & Scalability Testing** using Apache JMeter (x1 to x10,000 users).
* **Web Content Accessibility (WCAG 2.2 AA)** compliance audited via Google Lighthouse (Score: 96–98/100).

---

## 2. System Architecture & Observability Data Flow

```
                                +--------------------------------------------+
                                |                Client Tier                 |
                                |       (Next.js 16 + React 19 + Tailwind)   |
                                +--------------------------------------------+
                                    |                 |                 |
                             Telemetry Beacon   CRUD Actions     Interactive Games
                                    |                 |                 |
                                    v                 v                 v
+------------------------------------------------------------------------------------+
|                                Application API Tier                                |
|------------------------------------------------------------------------------------|
|  /health            -> System uptime, memory, DB latency, table counts (200 OK)    |
|  /api/dashboard     -> Aggregated KPI stats, trend data, alert indicators          |
|  /api/telemetry     -> Session dwell duration beacons & generation event logs      |
|  /api/word-lists    -> Word list CRUD, structured phoneme persistence             |
|  /api/activities    -> Full activity configuration lifecycle (CRUD + Edit)        |
+------------------------------------------------------------------------------------+
                                                      |
                                                      v
                                +--------------------------------------------+
                                |             Persistence Tier               |
                                |        (Prisma ORM 6.x + SQLite)           |
                                +--------------------------------------------+
                                | • WordList & Word (with PhonemeItem)       |
                                | • ActivityConfiguration                    |
                                | • GenerationLog (Success & Error telemetry)|
                                | • TelemetrySession (Dwell time & devices)  |
                                +--------------------------------------------+
```

---

## 3. Database Models & Schema Design

Located in `prisma/schema.prisma`:
1. **`WordList`**: Reusable word collections with descriptions and timestamps.
2. **`Word` & `PhonemeItem`**: Addresses Assessment 2 feedback by storing phoneme sequences as structured, ordered records with position indexing (`symbol`, `position`), maintaining backward compatibility with serialized strings.
3. **`ActivityConfiguration`**: Activity metadata, game types (`WORDLE`, `WORD_SEARCH`), difficulty, grid dimensions, and hint toggles with complete Edit/Update support.
4. **`GenerationLog`**: Observability telemetry recording generation attempts, execution durations in milliseconds, word counts, and failure error codes.
5. **`TelemetrySession`**: User engagement tracking recording page dwell time (seconds), route path, and device type (`desktop`, `mobile`, `tablet`).

---

## 4. Key Assessment 3 Features

### 4.1 Observability Dashboard (`/dashboard`)
* **KPI Metric Cards**: System Health (`200 OK` + latency), Total Activities Configured, Most-Used Activity Type, Generation Success Rate (%), and Average Time on Page.
* **Operational Alerts & Warnings**: Real-time warning banners highlighting empty word lists or generation failures.
* **Interactive Data Visualizations**: Activity type breakdown rings, dwell time by route bars, and device distribution stats.
* **Diagnostic Tables**: Live feeds of recent generation events and validation error breakdowns.
* **Interactive Simulation Trigger**: Quick buttons allowing live demonstration of telemetry logging and alert reactivity during walkthroughs.

### 4.2 Health Check Endpoint (`/health` & `/api/health`)
* Returns `HTTP 200 OK` when the service and database are operational.
* Provides comprehensive server diagnostics: uptime in seconds, database ping latency, record counts, Node.js version, and memory usage (RSS, Heap Used, Heap Total).
* Correctly responds with `HTTP 503 Service Unavailable` if database connectivity drops.

---

## 5. Automated Testing Suites

### 5.1 End-to-End Testing with Playwright
Automated tests are located in `tests/e2e/`:
1. **`tests/e2e/builder-crud.spec.js`** (Builder Use Case):
   * Creates a new phoneme word list with structured items.
   * Reads and updates the word list.
   * Configures an activity, edits its parameters (verifying update workflow), and verifies persistence.
   * Deletes test records with confirmation handling.
2. **`tests/e2e/activity-generation.spec.js`** (User Use Case & Observability):
   * Tests Wordle builder UI, phoneme pack selector, and keyboard controls.
   * Tests Word Search builder, dynamic grid generation, and word checklist.
   * Verifies the dashboard renders healthy metrics, KPI cards, and live simulation actions.

Run tests:
```bash
npm run test:e2e
```

### 5.2 Concurrent Load Testing with Apache JMeter
Located in `tests/jmeter/`:
* **JMeter Test Plan**: `tests/jmeter/phoneme_activity_load_test.jmx`
* **Automated Runner**: `scripts/run-load-test.mjs`
* Staged load tiers evaluated:
  * **x1 Baseline**: 60.4 req/s, 16ms avg latency, 0.00% error rate.
  * **x10 Classroom**: 306.5 req/s, 28ms avg latency, 0.00% error rate.
  * **x100 Peak School**: 434.2 req/s, 209ms avg latency, 0.00% error rate.
  * **x1,000 Multi-School Stress**: 946.3 req/s, 427ms avg latency, socket queue saturation observed.
  * **x10,000 Extreme Breakpoint**: 1,465.9 req/s, system saturation breakpoint analyzed.
* Full report and architectural analysis: [`tests/jmeter/JMETER_LOAD_TEST_REPORT.md`](file:///f:/Important%20Files/work/3500-4/phoneme-activity-builder/tests/jmeter/JMETER_LOAD_TEST_REPORT.md).

Run load tests:
```bash
node scripts/run-load-test.mjs
```

### 5.3 Google Lighthouse Accessibility Audit
* Audited using Lighthouse 12.x / Chrome DevTools Accessibility Engine.
* Current Score: **96–98 / 100** (WCAG 2.2 Level AA compliant).
* Full remediation documentation: [`tests/lighthouse/LIGHTHOUSE_ACCESSIBILITY_REPORT.md`](file:///f:/Important%20Files/work/3500-4/phoneme-activity-builder/tests/lighthouse/LIGHTHOUSE_ACCESSIBILITY_REPORT.md).

---

## 6. Installation & Execution Guide

### Prerequisites
* Node.js 22 LTS or newer
* npm 10+

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Synchronize SQLite database
npx prisma generate
npx prisma db push

# 3. Seed simulated historical records (360+ generation logs, 620+ user sessions)
npm run seed

# 4. Start development server
npm run dev
```

### Available NPM Scripts
| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js Turbopack development server on `http://localhost:3000` |
| `npm run build` | Compiles optimized production bundle and generates Prisma client |
| `npm run start` | Boots production server with automatic DB synchronization |
| `npm run seed` | Seeds realistic phoneme lists, activities, and telemetry logs |
| `npm run test:e2e` | Runs Playwright end-to-end test suite headlessly |
| `npm run test:load`| Executes staged load testing against endpoints across x1 to x10,000 tiers |
