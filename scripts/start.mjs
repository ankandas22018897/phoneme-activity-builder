import { execFileSync } from "node:child_process";
import { createServer } from "node:http";

try {
  execFileSync("npx", ["prisma", "db", "push", "--skip-generate"], { stdio: "inherit", env: process.env, shell: true });
} catch (error) {
  console.error("Database initialisation failed.");
  process.exit(error.status || 1);
}

const { default: next } = await import("next");
const { parse } = await import("node:url");

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();
await app.prepare();

createServer((req, res) => handle(req, res, parse(req.url, true))).listen(port, hostname, () => {
  console.log(`Phoneme Activity Builder running at http://${hostname}:${port}`);
});
