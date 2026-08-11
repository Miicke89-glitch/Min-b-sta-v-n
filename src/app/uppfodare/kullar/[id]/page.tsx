import { skapaServerKlient } from "@/lib/supabase/server";
import { laggTillValp } from "@/lib/actions";
import KopieraLank from "@/components/kopiera-lank";
import type { Valp } from "@/lib/typer";

export const metadata = { title: "Valplista — Din bästa vän" };

export default async function ValplistaSida({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();
  const { data: valpar } = await supabase
    .from("valp")
    .select("*")
    .eq("kull_id", id)
    .order("skapad_at");

  return (
    <div className="flex flex-col gap-6">
      {!valpar?.length ? (
        <div className="kort p-6 text-center text-blck-mjuk">
          <p aria-hidden="true" className="mb-2 text-3xl">
            🐶
          </p>
          <p>Inga valpar ännu — lägg till dem nedan.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {(valpar as Valp[]).map((valp) => (
            <li key={valp.id} className="kort p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {valp.namn}{" "}
                    <span className="font-normal text-blck-mjuk">
                      ({valp.kon === "tik" ? "tik" : "hane"}
                      {valp.farg ? `, ${valp.farg}` : ""})
                    </span>
                  </p>
                  <p className="text-sm text-blck-mjuk">
                    {valp.chipnummer && <>Chip: {valp.chipnummer} · </>}
                    {valp.reg_nummer && <>Reg: {valp.reg_nummer} · </>}
                    {valp.agare_user_id ? (
                      <span className="font-medium text-ang">
                        Köparen har anslutit ✓
                      </span>
                    ) : (
                      <span>Väntar på köparen</span>
                    )}
                  </p>
                </div>
                {!valp.agare_user_id && <KopieraLank token={valp.invite_token} />}
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="kort p-6">
        <h2 className="text-xl">Lägg till valp</h2>
        <form action={laggTillValp} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="kull_id" value={id} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="namn" className="etikett">
                Namn *
              </label>
              <input id="namn" name="namn" required className="falt" />
            </div>
            <div>
              <label htmlFor="kon" className="etikett">
                Kön
              </label>
              <select id="kon" name="kon" className="falt">
                <option value="hane">Hane</option>
                <option value="tik">Tik</option>
              </select>
            </div>
            <div>
              <label htmlFor="farg" className="etikett">
                Färg
              </label>
              <input id="farg" name="farg" className="falt" />
            </div>
            <div>
              <label htmlFor="chipnummer" className="etikett">
                Chipnummer
              </label>
              <input
                id="chipnummer"
                name="chipnummer"
                className="falt"
                inputMode="numeric"
              />
            </div>
            <div>
              <label htmlFor="reg_nummer" className="etikett">
                Registreringsnummer
              </label>
              <input id="reg_nummer" name="reg_nummer" className="falt" />
            </div>
          </div>
          <button type="submit" className="knapp self-start">
            Lägg till valp
          </button>
        </form>
        <p className="mt-3 text-sm text-blck-mjuk">
          Varje valp får en egen inbjudningslänk. Skicka den till köparen vid
          överlämningen — när de öppnar den blir valpen deras.
        </p>
      </section>
    </div>
  );
}
