/**
 * Seedar Supabase med testdata: rasprofiler, en uppfödare med kennel,
 * en labradorkull med fyra valpar, dokument, viktloggar, råd, frågor
 * och kullinlägg.
 *
 * Körs med: npm run seed
 * Kräver NEXT_PUBLIC_SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY i .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import rasprofiler from "../src/data/rasprofiler.json";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Sätt NEXT_PUBLIC_SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY i .env.local först."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Minimal men giltig PDF som platshållardokument
const PLATSHALLAR_PDF = Buffer.from(
  `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 80>>stream
BT /F1 18 Tf 60 780 Td (Din basta van - exempeldokument) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f
trailer<</Size 6/Root 1 0 R>>
startxref
0
%%EOF`
);

async function skapaAnvandare(epost: string, namn: string, roll: string) {
  const { data: lista } = await supabase.auth.admin.listUsers();
  const befintlig = lista?.users.find((u) => u.email === epost);
  const user =
    befintlig ??
    (
      await supabase.auth.admin.createUser({
        email: epost,
        email_confirm: true,
      })
    ).data.user;
  if (!user) throw new Error(`Kunde inte skapa användare ${epost}`);
  await supabase.from("profil").upsert({ user_id: user.id, namn, roll });
  return user;
}

function datumForVeckorSedan(veckor: number): string {
  const d = new Date(Date.now() - veckor * 7 * 24 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log("Seedar rasprofiler…");
  for (const ras of rasprofiler.raser) {
    const alla = [...ras.vuxenvikt.tik, ...ras.vuxenvikt.hane];
    const { error } = await supabase.from("rasprofil").upsert({
      ras: ras.ras,
      vuxenvikt_min: Math.min(...alla),
      vuxenvikt_max: Math.max(...alla),
      vuxenvikt_json: ras.vuxenvikt,
      viktkurva_json: ras.viktkurva,
      motionsbehov: ras.motionsbehov,
      palsvard: ras.palsvard,
      vanliga_halsoproblem: ras.vanliga_halsoproblem,
      foderschema_json: ras.foderschema,
    });
    if (error) throw error;
  }
  console.log(`  ${rasprofiler.raser.length} raser klara.`);

  console.log("Skapar användare…");
  const uppfodare = await skapaAnvandare(
    "uppfodare@exempel.se",
    "Anna Bergström",
    "uppfodare"
  );
  const kopare1 = await skapaAnvandare(
    "kopare1@exempel.se",
    "Familjen Lindqvist",
    "kopare"
  );
  const kopare2 = await skapaAnvandare(
    "kopare2@exempel.se",
    "Jonas Ek",
    "kopare"
  );

  console.log("Skapar kennel och kull…");
  await supabase.from("kennel").delete().eq("agare_user_id", uppfodare.id);
  const { data: kennel, error: kennelFel } = await supabase
    .from("kennel")
    .insert({
      namn: "Kennel Solgläntan",
      ort: "Mariestad",
      om_text:
        "Liten uppfödning av labrador retriever i hemmiljö sedan 2012. Valparna växer upp mitt i familjen med barn, katter och skogspromenader. Hälsa och vardagstrygghet går alltid först.",
      agare_user_id: uppfodare.id,
    })
    .select()
    .single();
  if (kennelFel) throw kennelFel;

  const fodelsedatum = datumForVeckorSedan(10);
  const { data: kull, error: kullFel } = await supabase
    .from("kull")
    .insert({
      kennel_id: kennel.id,
      ras: "labrador retriever",
      fodelsedatum,
      mor_namn: "SE UCH Solgläntans Wilma",
      mor_halsa: "HD: A, ED: 0 (ua)\nÖgonlyst: ua 2025-11-02\nDNA prcd-PRA: fri",
      far_namn: "SE VCH Åbrinkens Charlie",
      far_halsa: "HD: B, ED: 0 (ua)\nÖgonlyst: ua 2025-09-14\nDNA prcd-PRA: fri",
      antal_valpar: 4,
    })
    .select()
    .single();
  if (kullFel) throw kullFel;

  console.log("Skapar fyra valpar…");
  const valpData = [
    { namn: "Sixten", kon: "hane", farg: "gul", agare: kopare1.id },
    { namn: "Doris", kon: "tik", farg: "svart", agare: kopare2.id },
    { namn: "Melker", kon: "hane", farg: "brun", agare: null },
    { namn: "Juni", kon: "tik", farg: "gul", agare: null },
  ];
  const valpar: { id: string; namn: string; invite_token: string }[] = [];
  for (const [i, v] of valpData.entries()) {
    const { data, error } = await supabase
      .from("valp")
      .insert({
        kull_id: kull.id,
        namn: v.namn,
        kon: v.kon,
        farg: v.farg,
        chipnummer: `75209880000010${i + 1}`,
        reg_nummer: `SE1234${i + 1}/2026`,
        agare_user_id: v.agare,
      })
      .select("id, namn, invite_token")
      .single();
    if (error) throw error;
    valpar.push(data);
  }

  console.log("Laddar upp exempeldokument…");
  const dokument = [
    { valp: valpar[0], typ: "registreringsbevis", filnamn: "registreringsbevis-sixten.pdf" },
    { valp: valpar[0], typ: "besiktningsintyg", filnamn: "besiktningsintyg-sixten.pdf" },
    { valp: valpar[1], typ: "registreringsbevis", filnamn: "registreringsbevis-doris.pdf" },
    { valp: null, typ: "vaccinationsintyg", filnamn: "vaccinationsintyg-kullen.pdf" },
    { valp: null, typ: "koepeavtal", filnamn: "koepeavtal-mall.pdf" },
  ] as const;
  for (const dok of dokument) {
    const sokvag = `seed/${kull.id}/${dok.filnamn}`;
    await supabase.storage
      .from("dokument")
      .upload(sokvag, PLATSHALLAR_PDF, {
        contentType: "application/pdf",
        upsert: true,
      });
    const { error } = await supabase.from("dokument").insert({
      valp_id: dok.valp?.id ?? null,
      kull_id: dok.valp ? null : kull.id,
      typ: dok.typ,
      filnamn: dok.filnamn,
      url: sokvag,
    });
    if (error) throw error;
  }

  console.log("Loggar vikter…");
  const vikter: [number, number, number][] = [
    // [veckor sedan, Sixten kg, Doris kg]
    [2, 6.8, 6.1],
    [1, 7.9, 7.2],
    [0, 9.1, 8.3],
  ];
  for (const [veckorSedan, sixtenKg, dorisKg] of vikter) {
    await supabase.from("viktlogg").insert([
      { valp_id: valpar[0].id, datum: datumForVeckorSedan(veckorSedan), vikt_kg: sixtenKg },
      { valp_id: valpar[1].id, datum: datumForVeckorSedan(veckorSedan), vikt_kg: dorisKg },
    ]);
  }

  console.log("Skriver uppfödarråd…");
  await supabase.from("uppfodarrad").insert([
    {
      kull_id: kull.id,
      rubrik: "Så somnar mina valpar bäst",
      text: "Alla valpar i den här kullen har sovit med en fleecefilt som luktar mamma Wilma. Lägg filten i buren de första veckorna, så känns natten mindre ensam. Sixten-kullens valpar brukar vakna en gång per natt de första två veckorna — det går över!",
      visa_fran_alder_veckor: 8,
    },
    {
      kull_id: kull.id,
      rubrik: "Fodret jag skickar med",
      text: "Valparna äter samma foder som hemma hos mig (påsen ni fick med er räcker ca 2 veckor). Om ni vill byta märke: blanda gradvis över minst en vecka. Ring mig gärna innan ni byter, så tipsar jag om vad som funkat för mina hundar.",
      visa_fran_alder_veckor: 8,
    },
    {
      kull_id: kull.id,
      rubrik: "Simträning till sommaren",
      text: "Labradorer i den här linjen älskar vatten! När valpen är runt 6 månader kan ni börja med grunda badställen. Låt valpen gå i själv — kasta aldrig i den. Wilma visar gärna vägen om ni vill komma förbi på ett återbesök.",
      visa_fran_alder_veckor: 24,
    },
  ]);

  console.log("Skapar frågor och kullinlägg…");
  await supabase.from("fraga").insert([
    {
      kull_id: kull.id,
      stalld_av_user_id: kopare1.id,
      text: "Sixten gnäller lite när vi lämnar rummet — är det normalt så här första veckan?",
      svar_text:
        "Helt normalt! Han har precis lämnat syskonen. Fortsätt med korta stunder och kom tillbaka innan han varvar upp. Om det inte blivit bättre om två veckor, hör av dig igen så tar vi det tillsammans.",
      svarad_at: new Date().toISOString(),
    },
    {
      kull_id: kull.id,
      stalld_av_user_id: kopare2.id,
      text: "Hur mycket åt Doris per mål när hon bodde hos dig?",
    },
  ]);

  await supabase.from("kullinlagg").insert([
    {
      kull_id: kull.id,
      user_id: uppfodare.id,
      text: "Välkomna hem allihop! Här delar vi bilder och vardag. Jag finns här om ni undrar något. 🐾",
    },
    {
      kull_id: kull.id,
      user_id: kopare1.id,
      text: "Sixten har landat! Sov hela vägen hem i bilen. Filten med Wilmas doft är guld.",
    },
    {
      kull_id: kull.id,
      user_id: kopare2.id,
      text: "Doris utforskar trädgården för fullt. Hur går det för er andra?",
    },
  ]);

  await supabase.from("tidslinje_klar").insert([
    { valp_id: valpar[0].id, kort_id: "v8-forsakring" },
    { valp_id: valpar[0].id, kort_id: "v8-chipregistrering" },
  ]);

  console.log("\nKlart! Testdata:");
  console.log("  Uppfödare:  uppfodare@exempel.se (logga in via magic link)");
  console.log("  Köpare 1:   kopare1@exempel.se (äger Sixten)");
  console.log("  Köpare 2:   kopare2@exempel.se (äger Doris)");
  console.log("\nInbjudningslänkar för de oanslutna valparna:");
  for (const valp of valpar.slice(2)) {
    console.log(`  ${valp.namn}: /inbjudan/${valp.invite_token}`);
  }
}

main().catch((fel) => {
  console.error(fel);
  process.exit(1);
});
