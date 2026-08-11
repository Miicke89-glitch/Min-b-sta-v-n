import { skapaServerKlient } from "@/lib/supabase/server";
import { sparaRad, raderaRad } from "@/lib/actions";
import type { Uppfodarrad } from "@/lib/typer";

export const metadata = { title: "Mina råd — Din bästa vän" };

export default async function RadSida({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();
  const { data: rad } = await supabase
    .from("uppfodarrad")
    .select("*")
    .eq("kull_id", id)
    .order("visa_fran_alder_veckor");

  return (
    <div className="flex flex-col gap-6">
      <p className="text-blck-mjuk">
        Dina egna råd dyker upp i köparens tidslinje när valpen når rätt ålder.
        Det är din röst i pärmen — skriv som du pratar.
      </p>

      {!!rad?.length && (
        <ul className="flex flex-col gap-3">
          {(rad as Uppfodarrad[]).map((r) => (
            <li key={r.id} className="kort p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ang">
                    Från vecka {r.visa_fran_alder_veckor}
                  </p>
                  <h3 className="text-lg">{r.rubrik}</h3>
                  <p className="mt-1 whitespace-pre-wrap text-blck-mjuk">
                    {r.text}
                  </p>
                </div>
                <form action={raderaRad}>
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-tass-mork underline-offset-2 hover:underline"
                  >
                    Ta bort
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="kort p-6">
        <h2 className="text-xl">Nytt råd</h2>
        <form action={sparaRad} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="kull_id" value={id} />
          <div>
            <label htmlFor="rubrik" className="etikett">
              Rubrik *
            </label>
            <input
              id="rubrik"
              name="rubrik"
              required
              className="falt"
              placeholder="Så brukar mina valpar sova första natten"
            />
          </div>
          <div>
            <label htmlFor="text" className="etikett">
              Råd *
            </label>
            <textarea id="text" name="text" required rows={5} className="falt" />
          </div>
          <div>
            <label htmlFor="visa_fran_alder_veckor" className="etikett">
              Visa från ålder (veckor)
            </label>
            <input
              id="visa_fran_alder_veckor"
              name="visa_fran_alder_veckor"
              type="number"
              min={8}
              max={156}
              defaultValue={8}
              className="falt"
            />
          </div>
          <button type="submit" className="knapp self-start">
            Spara råd
          </button>
        </form>
      </section>
    </div>
  );
}
