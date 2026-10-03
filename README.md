# Phoneme Activity Builder

A Next.js application for **Speech Pathology teachers** to build phoneme-based Wordle and Word Search classroom activities.

## Assessment 2 backend features

Assessment 2 extends the original frontend builder with a persistent backend and database workflow.

- **SQLite + Prisma ORM** database
- Word-list CRUD: create, read, update and delete
- Individual phoneme-word CRUD
- Activity configuration CRUD for Wordle and Word Search
- Validation for English words, phoneme lists, grid sizes, difficulty and guess limits
- Clear API errors and a database health endpoint at `/api/health`
- **Saved Data** page at `/activities` showing frontend-to-backend integration
- Generate downloadable HTML activities from **stored database data**
- Docker support for reproducible execution

## Database schema

The schema is in `prisma/schema.prisma` and contains:

- `WordList` — named reusable word collections
- `Word` — English word plus a JSON-encoded phoneme array, so multi-character phonemes such as `tʃ`, `dʒ`, `iː` and `əʉ` remain one logical unit
- `ActivityConfiguration` — activity type, word list, difficulty, hints, Wordle guess count, Word Search dimensions and output metadata

The relations use cascading deletes so removing a word list also removes its words and linked activity configurations.

## Run locally

Install Node.js 22 LTS or newer, then:

```bash
npm install
```

Create `.env` in the project root:

```env
DATABASE_URL="file:./dev.db"
```

Initialise the database:

```bash
npx prisma generate
npx prisma db push
```

Start development:

```bash
npm run dev
```

Open `http://localhost:3000` and select **Saved Data** to demonstrate database CRUD and stored-data HTML generation.

Useful commands:

| Command | Meaning |
|---|---|
| `npm run dev` | Start development server and initialise Prisma database |
| `npm run build` | Generate Prisma client and build Next.js |
| `npm run start` | Start production server and initialise database |
| `npm run db:push` | Apply Prisma schema to SQLite |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Check source code |
| `npm run test:wordle` | Run Wordle tests |
| `npm run test:html` | Test standalone HTML generation |

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Database health check; returns HTTP 200 when healthy |
| GET/POST | `/api/word-lists` | List or create word lists |
| GET/PUT/DELETE | `/api/word-lists/:id` | Retrieve, update or delete a list |
| POST | `/api/word-lists/:id/words` | Add a word to a list |
| POST | `/api/words` | Create an individual word |
| GET/PUT/DELETE | `/api/words/:id` | Retrieve, update or delete a word |
| GET/POST | `/api/activities` | List or create activity configurations |
| GET/PUT/DELETE | `/api/activities/:id` | Retrieve, update or delete an activity |

## Docker

Build and run the application:

```bash
docker build -t phoneme-activity-builder .
docker run --rm -p 3000:3000 -v phoneme-data:/app/data phoneme-activity-builder
```

The SQLite database is stored in `/app/data` inside the container. The named volume keeps saved teacher data when the container is recreated.

For a quick health demonstration after the container starts, open:

`http://localhost:3000/api/health`

Expected response:

```json
{"status":"ok","database":"ok"}
```

## Application pages

| Page | Purpose |
|---|---|
| Home | Introduction and activity links |
| Wordle | Original Wordle builder and preview |
| Word Search | Original Word Search builder and preview |
| Saved Data | **Assessment 2 backend CRUD and database integration demo** |
| About | Project and student information |
| Settings | Light/dark mode and layout density |

## Standalone HTML

Generated Wordle and Word Search files contain their own game logic and do not require Next.js, React, npm or an internet connection. The Assessment 2 Saved Data page demonstrates that the source configuration can first be retrieved from the database and then used to generate the downloadable activity.

## Project structure

```text
phoneme-activity-builder/
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── start.mjs
├── src/
│   ├── app/
│   │   ├── api/              ← backend API routes
│   │   ├── activities/       ← database integration UI
│   │   ├── wordle/
│   │   └── word-search/
│   ├── components/           ← reusable UI and games
│   ├── data/                 ← phoneme corpus
│   └── lib/
│       ├── prisma.js         ← Prisma client
│       ├── validation.js     ← server-side validation
│       └── ...               ← game and HTML generation logic
├── Dockerfile
└── package.json
```

## AI acknowledgement

If this project is submitted for an assessment that requires an AI acknowledgement, complete the acknowledgement using the university's required format and accurately describe any generative AI assistance used during development.
