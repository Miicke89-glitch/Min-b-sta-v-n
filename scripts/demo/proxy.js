// Demoläge: proxy framför appen som lägger till enklicksinloggning.
//   http://localhost:3000/demo/kopare     → in som Familjen Lindqvist (Sixten)
//   http://localhost:3000/demo/uppfodare  → in som Kennel Solgläntan
//   http://localhost:3000/demo/ut         → logga ut
const http = require("http");

const APP_PORT = process.env.DEMO_APP_PORT || 3001;
const PORT = process.env.DEMO_PORT || 3000;
const V1 = "33333333-3333-4333-8333-333333330001";

function kaka(token, userId, email) {
  const session = {
    access_token: token,
    token_type: "bearer",
    expires_in: 31536000,
    expires_at: Math.floor(Date.now() / 1000) + 31536000,
    refresh_token: "r",
    user: { id: userId, aud: "authenticated", role: "authenticated", email },
  };
  const b64 = Buffer.from(JSON.stringify(session))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `sb-localhost-auth-token=base64-${b64}; Path=/; SameSite=Lax; Max-Age=31536000`;
}

const KOPARE = kaka("tok-kopare1", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "kopare1@exempel.se");
const UPPFODARE = kaka("tok-uppfodare", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "uppfodare@exempel.se");

const server = http.createServer((req, res) => {
  if (req.url === "/demo/kopare") {
    res.writeHead(302, { "set-cookie": KOPARE, location: `/valp/${V1}` });
    return res.end();
  }
  if (req.url === "/demo/uppfodare") {
    res.writeHead(302, { "set-cookie": UPPFODARE, location: "/uppfodare" });
    return res.end();
  }
  if (req.url === "/demo/ut") {
    res.writeHead(302, {
      "set-cookie": "sb-localhost-auth-token=; Path=/; Max-Age=0",
      location: "/",
    });
    return res.end();
  }

  const vidare = http.request(
    {
      host: "localhost",
      port: APP_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${APP_PORT}` },
    },
    (svar) => {
      res.writeHead(svar.statusCode, svar.headers);
      svar.pipe(res);
    }
  );
  vidare.on("error", () => {
    res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    res.end("Appen har inte startat ännu — vänta några sekunder och ladda om.");
  });
  req.pipe(vidare);
});

server.listen(PORT, () =>
  console.log(`[demo] Proxy med demo-inloggning på http://localhost:${PORT}`)
);
