/**
 * Demoläge — kör appen på localhost utan Supabase-konto.
 *
 *   npm run demo   →  http://localhost:3000
 *
 * Startar tre processer:
 *   1. Låtsas-Supabase med seedad testdata (port 54321)
 *   2. Next.js i dev-läge (port 3001)
 *   3. Proxy med enklicksinloggning (port 3000)
 *
 * Demoanvändare:
 *   /demo/kopare     — Familjen Lindqvist, äger valpen Sixten
 *   /demo/uppfodare  — Anna Bergström, Kennel Solgläntan
 *
 * Obs: databasen är en låtsasserver i minnet — formulär sparar inte.
 * För riktig data: följ Supabase-uppsättningen i README.
 */
const { spawn } = require("child_process");
const path = require("path");

const rot = path.join(__dirname, "..", "..");
const barn = [];

function starta(namn, kommando, args, env = {}) {
  const p = spawn(kommando, args, {
    cwd: rot,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  p.stdout.on("data", (d) => process.stdout.write(`[${namn}] ${d}`));
  p.stderr.on("data", (d) => process.stderr.write(`[${namn}] ${d}`));
  p.on("exit", (kod) => {
    if (kod !== null && kod !== 0) {
      console.error(`[demo] ${namn} avslutades (kod ${kod}) — stänger ner.`);
      avsluta();
    }
  });
  barn.push(p);
  return p;
}

function avsluta() {
  for (const p of barn) p.kill("SIGTERM");
  process.exit(0);
}
process.on("SIGINT", avsluta);
process.on("SIGTERM", avsluta);

starta("mock", process.execPath, [path.join(__dirname, "mock-supabase.js")]);

starta(
  "app",
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "dev", "-p", "3001"],
  {
    NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "demo-anon",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  }
);

starta("proxy", process.execPath, [path.join(__dirname, "proxy.js")]);

setTimeout(() => {
  console.log(`
──────────────────────────────────────────────────
  🐾  Din bästa vän — demoläge

  Hemsidan:            http://localhost:3000
  Som valpköpare:      http://localhost:3000/demo/kopare
  Som uppfödare:       http://localhost:3000/demo/uppfodare
  Logga ut:            http://localhost:3000/demo/ut

  Låtsasdatabas i minnet — formulär sparar inte.
  Avsluta med Ctrl+C.
──────────────────────────────────────────────────
`);
}, 2500);
