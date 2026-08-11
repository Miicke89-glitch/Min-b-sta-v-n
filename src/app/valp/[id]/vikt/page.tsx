import { notFound } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { loggaVikt, raderaVikt } from "@/lib/actions";
import { formateraDatum } from "@/lib/alder";
import Viktkurva from "@/components/viktkurva";
import type { Kull, Rasprofil, Valp, Viktlogg } from "@/lib/typer";

export const metadata = { title: "Vikt — Din bästa vän" };

export default async function ViktSida({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();

  const { data: valp } = await supabase
    .from("valp")
    .select("*, kull(*)")
    .eq("id", id)
    .maybeSingle<Valp & { kull: Kull }>();
  if (!valp) notFound();

  const [{ data: loggar }, { data: rasprofil }] = await Promise.all([
    supabase
      .from("viktlogg")
      .select("*")
      .eq("valp_id", id)
      .order("datum", { ascending: false }),
    supabase
      .from("rasprofil")
      .select("*")
      .eq("ras", valp.kull.ras)
      .maybeSingle<Rasprofil>(),
  ]);

  const vuxenvikt = rasprofil?.vuxenvikt_json?.[valp.kon];

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8">
      <h1 className="text-3xl">Vikt</h1>
      <p className="mt-1 text-blck-mjuk">
        Logga {valp.namn}s vikt då och då — kurvan visar rasens normalspann som
        jämförelse.
        {vuxenvikt && (
          <>
            {" "}
            Vuxen {valp.kon === "tik" ? "tik" : "hane"} av rasen väger oftast{" "}
            {vuxenvikt[0]}–{vuxenvikt[1]} kg.
          </>
        )}
      </p>

      <div className="kort mt-6 p-4">
        <Viktkurva
          loggar={((loggar ?? []) as Viktlogg[]).slice().reverse()}
          rasprofil={rasprofil ?? null}
          fodelsedatum={valp.kull.fodelsedatum}
        />
      </div>

      <section className="kort mt-4 p-5">
        <h2 className="text-lg">Logga vikt</h2>
        <form
          action={loggaVikt}
          className="mt-3 flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="valp_id" value={id} />
          <div className="min-w-[8rem] flex-1">
            <label htmlFor="vikt_kg" className="etikett">
              Vikt (kg)
            </label>
            <input
              id="vikt_kg"
              name="vikt_kg"
              required
              inputMode="decimal"
              pattern="[0-9]+([.,][0-9]+)?"
              className="falt"
              placeholder="4,2"
            />
          </div>
          <div className="min-w-[10rem] flex-1">
            <label htmlFor="datum" className="etikett">
              Datum
            </label>
            <input
              id="datum"
              name="datum"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="falt"
            />
          </div>
          <button type="submit" className="knapp">
            Spara
          </button>
        </form>
      </section>

      {!!loggar?.length && (
        <section className="mt-4">
          <h2 className="sr-only">Viktlogg</h2>
          <ul className="flex flex-col gap-2">
            {(loggar as Viktlogg[]).map((logg) => (
              <li
                key={logg.id}
                className="kort flex items-center justify-between px-4 py-3 text-sm"
              >
                <span>
                  <strong>{Number(logg.vikt_kg).toLocaleString("sv-SE")} kg</strong>{" "}
                  <span className="text-blck-mjuk">
                    · {formateraDatum(logg.datum)}
                  </span>
                </span>
                <form action={raderaVikt}>
                  <input type="hidden" name="id" value={logg.id} />
                  <input type="hidden" name="valp_id" value={id} />
                  <button
                    type="submit"
                    className="font-medium text-tass-mork underline-offset-2 hover:underline"
                  >
                    Ta bort
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 rounded-xl bg-himmel-ljus p-4 text-sm text-blck-mjuk">
        Normalspannet är en grov riktlinje — individer varierar. Är du osäker på
        om din valp växer som den ska, prata med din veterinär.
      </p>
    </main>
  );
}
