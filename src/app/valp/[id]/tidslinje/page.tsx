import { notFound } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { alderIVeckor, alderText } from "@/lib/alder";
import { grupperaKort, KATEGORI_ETIKETTER } from "@/lib/tidslinje";
import { vaxlaKort } from "@/lib/actions";
import type { Kull, Uppfodarrad, TidslinjeKort, Valp } from "@/lib/typer";

export const metadata = { title: "Tidslinje — Din bästa vän" };

function Kort({
  kort,
  valpId,
  klar,
  kanBocka,
  uppfodarNamn,
}: {
  kort: TidslinjeKort;
  valpId: string;
  klar: boolean;
  kanBocka: boolean;
  uppfodarNamn?: string;
}) {
  return (
    <article
      className={`kort p-4 ${klar ? "opacity-70" : ""} ${
        uppfodarNamn ? "border-ang bg-ang-ljus" : ""
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-blck-mjuk">
        {uppfodarNamn
          ? `Råd från ${uppfodarNamn}`
          : (KATEGORI_ETIKETTER[kort.kategori] ?? kort.kategori)}{" "}
        · vecka {kort.vecka}
      </p>
      <h3 className="mt-1 text-lg">{kort.rubrik}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-blck-mjuk">
        {kort.brodtext}
      </p>
      {kort.atgard && (
        <form action={vaxlaKort} className="mt-3">
          <input type="hidden" name="valp_id" value={valpId} />
          <input type="hidden" name="kort_id" value={kort.id} />
          <input type="hidden" name="klar" value={String(klar)} />
          <button
            type="submit"
            disabled={!kanBocka}
            aria-pressed={klar}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
              klar
                ? "border-ang bg-ang text-white"
                : "border-linje bg-white text-blck"
            } ${!kanBocka ? "opacity-50" : ""}`}
          >
            <span
              aria-hidden="true"
              className={`grid h-5 w-5 place-items-center rounded-md border ${
                klar ? "border-white bg-white text-ang" : "border-blck-mjuk"
              }`}
            >
              {klar ? "✓" : ""}
            </span>
            {klar ? "Klart!" : "Markera som klart"}
          </button>
        </form>
      )}
    </article>
  );
}

export default async function TidslinjeSida({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: valp } = await supabase
    .from("valp")
    .select("*, kull(*)")
    .eq("id", id)
    .maybeSingle<Valp & { kull: Kull }>();
  if (!valp) notFound();

  const [{ data: rad }, { data: klara }] = await Promise.all([
    supabase
      .from("uppfodarrad")
      .select("*")
      .eq("kull_id", valp.kull_id)
      .order("visa_fran_alder_veckor"),
    supabase.from("tidslinje_klar").select("kort_id").eq("valp_id", id),
  ]);

  const klaraIds = new Set((klara ?? []).map((k) => k.kort_id));
  const alder = alderIVeckor(valp.kull.fodelsedatum);
  const kanBocka = valp.agare_user_id === user?.id;

  // Uppfödarens egna råd blir kort i samma flöde
  const radSomKort: (TidslinjeKort & { uppfodarrad: true })[] = (
    (rad ?? []) as Uppfodarrad[]
  ).map((r) => ({
    id: `rad-${r.id}`,
    vecka: r.visa_fran_alder_veckor,
    rubrik: r.rubrik,
    brodtext: r.text,
    atgard: false,
    kategori: "uppfodare",
    uppfodarrad: true,
  }));

  const grupper = grupperaKort(alder, klaraIds);
  const nuRad = radSomKort.filter(
    (k) => k.vecka <= alder && alder - k.vecka <= 4
  );
  const kommerRad = radSomKort.filter((k) => k.vecka > alder);
  const tidigareRad = radSomKort.filter(
    (k) => k.vecka <= alder && alder - k.vecka > 4
  );

  const nu = [...grupper.nu, ...nuRad].sort((a, b) => b.vecka - a.vecka);
  const kommer = [...grupper.kommer, ...kommerRad].sort(
    (a, b) => a.vecka - b.vecka
  );
  const tidigare = [...grupper.tidigare, ...tidigareRad].sort(
    (a, b) => b.vecka - a.vecka
  );

  const uppfodarNamnFor = (kortId: string) =>
    kortId.startsWith("rad-") ? "din uppfödare" : undefined;

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8 md:max-w-2xl md:py-12">
      <h1 className="text-3xl">Tidslinje</h1>
      <p className="mt-1 text-blck-mjuk">
        {valp.namn} är {alderText(valp.kull.fodelsedatum)}. Här är vad som
        händer nu — och vad som kommer.
      </p>

      <section aria-labelledby="rubrik-nu" className="mt-6">
        <h2 id="rubrik-nu" className="text-xl">
          Just nu
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {nu.length === 0 && (
            <p className="kort p-4 text-blck-mjuk">
              Inget nytt just nu — njut av vardagen tillsammans!
            </p>
          )}
          {nu.map((kort) => (
            <Kort
              key={kort.id}
              kort={kort}
              valpId={id}
              klar={klaraIds.has(kort.id)}
              kanBocka={kanBocka}
              uppfodarNamn={uppfodarNamnFor(kort.id)}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="rubrik-kommer" className="mt-8">
        <h2 id="rubrik-kommer" className="text-xl">
          Kommer längre fram
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {kommer.slice(0, 3).map((kort) => (
            <Kort
              key={kort.id}
              kort={kort}
              valpId={id}
              klar={klaraIds.has(kort.id)}
              kanBocka={kanBocka}
              uppfodarNamn={uppfodarNamnFor(kort.id)}
            />
          ))}
          {kommer.length > 3 && (
            <details className="kort p-4">
              <summary className="cursor-pointer font-semibold">
                Visa allt som kommer ({kommer.length - 3} till)
              </summary>
              <div className="mt-3 flex flex-col gap-3">
                {kommer.slice(3).map((kort) => (
                  <Kort
                    key={kort.id}
                    kort={kort}
                    valpId={id}
                    klar={klaraIds.has(kort.id)}
                    kanBocka={kanBocka}
                    uppfodarNamn={uppfodarNamnFor(kort.id)}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      </section>

      {tidigare.length > 0 && (
        <section aria-labelledby="rubrik-tidigare" className="mt-8">
          <details>
            <summary className="cursor-pointer">
              <h2 id="rubrik-tidigare" className="inline text-xl">
                Tidigare ({tidigare.length})
              </h2>
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              {tidigare.map((kort) => (
                <Kort
                  key={kort.id}
                  kort={kort}
                  valpId={id}
                  klar={klaraIds.has(kort.id)}
                  kanBocka={kanBocka}
                  uppfodarNamn={uppfodarNamnFor(kort.id)}
                />
              ))}
            </div>
          </details>
        </section>
      )}

      <p className="mt-8 rounded-xl bg-himmel-ljus p-4 text-sm text-blck-mjuk">
        Tidslinjen är allmänna riktlinjer, inte medicinsk rådgivning. Vid allt
        som rör din hunds hälsa — prata med din veterinär.
      </p>
    </main>
  );
}
