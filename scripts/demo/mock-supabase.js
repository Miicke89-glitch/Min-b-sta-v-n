// Minimal Supabase-mock (auth + PostgREST + storage sign) för skärmbilder.
const http = require("http");

const UPPFODARE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const KOPARE1 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const KOPARE2 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const KENNEL = "11111111-1111-4111-8111-111111111111";
const KULL = "22222222-2222-4222-8222-222222222222";
const V1 = "33333333-3333-4333-8333-333333330001";
const V2 = "33333333-3333-4333-8333-333333330002";
const V3 = "33333333-3333-4333-8333-333333330003";
const V4 = "33333333-3333-4333-8333-333333330004";

const veckorSedan = (v) =>
  new Date(Date.now() - v * 7 * 86400e3).toISOString().slice(0, 10);
const FODD = veckorSedan(10);
const nu = new Date().toISOString();

const kennel = {
  id: KENNEL,
  namn: "Kennel Solgläntan",
  ort: "Mariestad",
  om_text:
    "Liten uppfödning av labrador retriever i hemmiljö sedan 2012. Valparna växer upp mitt i familjen med barn, katter och skogspromenader. Hälsa och vardagstrygghet går alltid först.",
  logo_url: null,
  agare_user_id: UPPFODARE,
};

const kull = {
  id: KULL,
  kennel_id: KENNEL,
  ras: "labrador retriever",
  fodelsedatum: FODD,
  mor_namn: "SE UCH Solgläntans Wilma",
  mor_halsa: "HD: A, ED: 0 (ua)\nÖgonlyst: ua 2025-11-02\nDNA prcd-PRA: fri",
  far_namn: "SE VCH Åbrinkens Charlie",
  far_halsa: "HD: B, ED: 0 (ua)\nÖgonlyst: ua 2025-09-14\nDNA prcd-PRA: fri",
  antal_valpar: 4,
  skapad_at: nu,
};

const valpar = [
  { id: V1, namn: "Sixten", kon: "hane", farg: "gul", agare_user_id: KOPARE1, invite_token: "demo-sixten" },
  { id: V2, namn: "Doris", kon: "tik", farg: "svart", agare_user_id: KOPARE2, invite_token: "demo-doris" },
  { id: V3, namn: "Melker", kon: "hane", farg: "brun", agare_user_id: null, invite_token: "demo-melker" },
  { id: V4, namn: "Juni", kon: "tik", farg: "gul", agare_user_id: null, invite_token: "demo-juni" },
].map((v, i) => ({
  kull_id: KULL,
  chipnummer: `75209880000010${i + 1}`,
  reg_nummer: `SE1234${i + 1}/2026`,
  bild_url: null,
  skapad_at: nu,
  ...v,
}));

const rasprofil = {
  ras: "labrador retriever",
  vuxenvikt_min: 25,
  vuxenvikt_max: 36,
  vuxenvikt_json: { tik: [25, 32], hane: [29, 36] },
  viktkurva_json: [
    { vecka: 8, min_kg: 6, max_kg: 8.5 },
    { vecka: 12, min_kg: 10, max_kg: 13 },
    { vecka: 16, min_kg: 14, max_kg: 18 },
    { vecka: 26, min_kg: 20, max_kg: 26 },
    { vecka: 39, min_kg: 24, max_kg: 31 },
    { vecka: 52, min_kg: 26, max_kg: 34 },
    { vecka: 78, min_kg: 27, max_kg: 35 },
    { vecka: 104, min_kg: 27, max_kg: 36 },
  ],
  motionsbehov:
    "Högt. Vuxen labrador behöver 1–2 timmar aktivitet om dagen, gärna med apportering, sim eller nosarbete. Som valp: korta pass, låt kroppen växa klart innan löpning och hopp.",
  palsvard:
    "Tät dubbelpäls som fäller mycket, särskilt vår och höst. Borsta 1–2 gånger i veckan, oftare vid fällning. Badas sällan.",
  vanliga_halsoproblem:
    "Höftleds- och armbågsdysplasi (föräldrarnas HD/ED-status finns i pärmen), övervikt, ögonsjukdomar (PRA), öroninflammationer. Håll hullet — labradorer äter gärna för mycket.",
  foderschema_json: [
    { alder: "8–12 veckor", mal: "4 mål/dag", riktmarke: "Valpfoder för stor ras, ca 250–350 g/dag fördelat på målen" },
    { alder: "3–6 månader", mal: "3 mål/dag", riktmarke: "Öka gradvis till ca 350–450 g/dag efter tillväxt och hull" },
    { alder: "6–12 månader", mal: "2 mål/dag", riktmarke: "Ca 300–400 g/dag, övergång mot unghundsfoder" },
    { alder: "Från 12–15 månader", mal: "2 mål/dag", riktmarke: "Vuxenfoder, mängd efter aktivitet — följ hullet, inte skopan" },
  ],
};

const dokument = [
  { id: "d1", valp_id: V1, kull_id: null, typ: "registreringsbevis", filnamn: "registreringsbevis-sixten.pdf" },
  { id: "d2", valp_id: V1, kull_id: null, typ: "besiktningsintyg", filnamn: "besiktningsintyg-sixten.pdf" },
  { id: "d3", valp_id: V2, kull_id: null, typ: "registreringsbevis", filnamn: "registreringsbevis-doris.pdf" },
  { id: "d4", valp_id: null, kull_id: KULL, typ: "vaccinationsintyg", filnamn: "vaccinationsintyg-kullen.pdf" },
  { id: "d5", valp_id: null, kull_id: KULL, typ: "koepeavtal", filnamn: "koepeavtal-mall.pdf" },
].map((d) => ({ url: `seed/${KULL}/${d.filnamn}`, skapad_at: nu, ...d }));

const viktlogg = [
  { id: "w1", valp_id: V1, datum: veckorSedan(2), vikt_kg: 6.8 },
  { id: "w2", valp_id: V1, datum: veckorSedan(1), vikt_kg: 7.9 },
  { id: "w3", valp_id: V1, datum: veckorSedan(0), vikt_kg: 9.1 },
  { id: "w4", valp_id: V2, datum: veckorSedan(2), vikt_kg: 6.1 },
  { id: "w5", valp_id: V2, datum: veckorSedan(1), vikt_kg: 7.2 },
  { id: "w6", valp_id: V2, datum: veckorSedan(0), vikt_kg: 8.3 },
];

const uppfodarrad = [
  {
    id: "r1", kull_id: KULL, rubrik: "Så somnar mina valpar bäst",
    text: "Alla valpar i den här kullen har sovit med en fleecefilt som luktar mamma Wilma. Lägg filten i buren de första veckorna, så känns natten mindre ensam.",
    visa_fran_alder_veckor: 8,
  },
  {
    id: "r2", kull_id: KULL, rubrik: "Fodret jag skickar med",
    text: "Valparna äter samma foder som hemma hos mig (påsen ni fick med er räcker ca 2 veckor). Om ni vill byta märke: blanda gradvis över minst en vecka.",
    visa_fran_alder_veckor: 8,
  },
  {
    id: "r3", kull_id: KULL, rubrik: "Simträning till sommaren",
    text: "Labradorer i den här linjen älskar vatten! När valpen är runt 6 månader kan ni börja med grunda badställen. Låt valpen gå i själv — kasta aldrig i den.",
    visa_fran_alder_veckor: 24,
  },
];

const fraga = [
  {
    id: "f2", kull_id: KULL, stalld_av_user_id: KOPARE2,
    text: "Hur mycket åt Doris per mål när hon bodde hos dig?",
    svar_text: null, svarad_at: null, skapad_at: nu,
  },
  {
    id: "f1", kull_id: KULL, stalld_av_user_id: KOPARE1,
    text: "Sixten gnäller lite när vi lämnar rummet — är det normalt så här första veckan?",
    svar_text:
      "Helt normalt! Han har precis lämnat syskonen. Fortsätt med korta stunder och kom tillbaka innan han varvar upp. Om det inte blivit bättre om två veckor, hör av dig igen så tar vi det tillsammans.",
    svarad_at: nu, skapad_at: veckorSedan(1) + "T10:00:00Z",
  },
];

const kullinlagg = [
  { id: "m1", kull_id: KULL, user_id: UPPFODARE, text: "Välkomna hem allihop! Här delar vi bilder och vardag. Jag finns här om ni undrar något. 🐾", skapad_at: veckorSedan(2) + "T09:00:00Z" },
  { id: "m2", kull_id: KULL, user_id: KOPARE1, text: "Sixten har landat! Sov hela vägen hem i bilen. Filten med Wilmas doft är guld.", skapad_at: veckorSedan(2) + "T15:30:00Z" },
  { id: "m3", kull_id: KULL, user_id: KOPARE2, text: "Doris utforskar trädgården för fullt. Hur går det för er andra?", skapad_at: veckorSedan(1) + "T18:12:00Z" },
];

const profil = [
  { user_id: UPPFODARE, namn: "Anna Bergström", roll: "uppfodare" },
  { user_id: KOPARE1, namn: "Familjen Lindqvist", roll: "kopare" },
  { user_id: KOPARE2, namn: "Jonas Ek", roll: "kopare" },
];

const tidslinje_klar = [
  { valp_id: V1, kort_id: "v8-forsakring", klar_at: nu },
  { valp_id: V1, kort_id: "v8-chipregistrering", klar_at: nu },
];

const tabeller = {
  kennel: [kennel],
  kull: [kull],
  valp: valpar,
  dokument,
  viktlogg,
  uppfodarrad,
  fraga,
  kullinlagg,
  profil,
  rasprofil: [rasprofil],
  tidslinje_klar,
};

const anvandare = {
  "tok-uppfodare": { id: UPPFODARE, email: "uppfodare@exempel.se" },
  "tok-kopare1": { id: KOPARE1, email: "kopare1@exempel.se" },
  "tok-kopare2": { id: KOPARE2, email: "kopare2@exempel.se" },
};

function filtrera(rader, params) {
  let resultat = rader;
  for (const [nyckel, varde] of params.entries()) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(nyckel)) continue;
    if (nyckel === "or") {
      // or=(valp_id.eq.X,kull_id.eq.Y)
      const villkor = varde.replace(/^\(|\)$/g, "").split(",");
      resultat = resultat.filter((rad) =>
        villkor.some((v) => {
          const [falt, , ...rest] = v.split(".");
          return String(rad[falt]) === rest.join(".");
        })
      );
      continue;
    }
    if (varde.startsWith("eq.")) {
      resultat = resultat.filter((rad) => String(rad[nyckel]) === varde.slice(3));
    } else if (varde.startsWith("is.null")) {
      resultat = resultat.filter((rad) => rad[nyckel] == null);
    } else if (varde.startsWith("in.")) {
      const lista = varde.slice(4, -1).split(",").map((s) => s.replace(/^"|"$/g, ""));
      resultat = resultat.filter((rad) => lista.includes(String(rad[nyckel])));
    }
  }
  return resultat;
}

function badda(tabell, rader, select) {
  if (!select) return rader;
  return rader.map((rad) => {
    const kopia = { ...rad };
    if (tabell === "valp" && select.includes("kull(")) {
      kopia.kull = select.includes("kennel(") ? { ...kull, kennel } : { ...kull };
    }
    if (tabell === "dokument" && select.includes("valp:valp_id")) {
      const v = valpar.find((x) => x.id === rad.valp_id);
      kopia.valp = v ? { namn: v.namn } : null;
    }
    return kopia;
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const skickaJson = (status, data) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(data));
  };

  let body = "";
  req.on("data", (bit) => (body += bit));
  req.on("end", () => {
    // Auth
    if (url.pathname === "/auth/v1/user") {
      const token = (req.headers.authorization || "").replace("Bearer ", "");
      const user = anvandare[token];
      if (!user) return skickaJson(401, { message: "invalid token" });
      return skickaJson(200, {
        id: user.id, aud: "authenticated", role: "authenticated",
        email: user.email, email_confirmed_at: nu, phone: "",
        app_metadata: { provider: "email" }, user_metadata: {},
        created_at: nu, updated_at: nu,
      });
    }
    if (url.pathname.startsWith("/auth/v1/token")) {
      return skickaJson(401, { message: "refresh disabled in mock" });
    }
    // Storage: signerade URL:er
    if (url.pathname.startsWith("/storage/v1/object/sign/")) {
      const sokvag = url.pathname.replace("/storage/v1/object/sign/", "");
      return skickaJson(200, { signedURL: `/object/sign/${sokvag}?token=demo` });
    }
    // RPC
    if (url.pathname.startsWith("/rest/v1/rpc/")) {
      const fn = url.pathname.split("/").pop();
      const args = body ? JSON.parse(body) : {};
      if (fn === "inbjudan_info") {
        const v = valpar.find((x) => x.invite_token === args.p_token);
        if (!v) return skickaJson(406, { code: "PGRST116", message: "0 rows", details: null, hint: null });
        return skickaJson(200, {
          valp_namn: v.namn, ras: kull.ras, kennel_namn: kennel.namn,
          redan_ansluten: v.agare_user_id != null,
        });
      }
      return skickaJson(200, null);
    }
    // PostgREST
    if (url.pathname.startsWith("/rest/v1/")) {
      const tabell = url.pathname.split("/")[3];
      const rader = tabeller[tabell];
      if (!rader) return skickaJson(404, { message: `okänd tabell ${tabell}` });
      if (req.method === "HEAD") {
        res.writeHead(200, { "content-range": `0-${rader.length - 1}/${rader.length}` });
        return res.end();
      }
      if (req.method !== "GET") return skickaJson(201, []);
      const resultat = badda(tabell, filtrera(rader, url.searchParams), url.searchParams.get("select") || "");
      const villObjekt = (req.headers.accept || "").includes("vnd.pgrst.object");
      if (villObjekt) {
        if (resultat.length === 0)
          return skickaJson(406, { code: "PGRST116", message: "0 rows", details: null, hint: null });
        return skickaJson(200, resultat[0]);
      }
      return skickaJson(200, resultat);
    }
    skickaJson(404, { message: "not found" });
  });
});

server.listen(54321, () => console.log("Mock-Supabase på :54321"));
