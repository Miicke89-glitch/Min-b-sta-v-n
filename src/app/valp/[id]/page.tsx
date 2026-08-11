import { notFound } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { alderText, formateraDatum } from "@/lib/alder";
import { loggaUt } from "@/lib/actions";
import type { Kennel, Kull, Rasprofil, Valp } from "@/lib/typer";

export const metadata = { title: "Min valp — Din bästa vän" };

export default async function MinValpSida({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();

  const { data: valp } = await supabase
    .from("valp")
    .select("*, kull(*, kennel(*))")
    .eq("id", id)
    .maybeSingle<Valp & { kull: Kull & { kennel: Kennel } }>();
  if (!valp) notFound();

  const kull = valp.kull;
  const kennel = kull.kennel;

  const { data: rasprofil } = await supabase
    .from("rasprofil")
    .select("*")
    .eq("ras", kull.ras)
    .maybeSingle<Rasprofil>();

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8">
      <header className="text-center">
        {valp.bild_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={valp.bild_url}
            alt={`Bild på ${valp.namn}`}
            className="mx-auto h-32 w-32 rounded-full border-4 border-kort object-cover shadow-md"
          />
        ) : (
          <p aria-hidden="true" className="text-7xl">
            🐶
          </p>
        )}
        <h1 className="mt-3 text-4xl">{valp.namn}</h1>
        <p className="mt-1 text-lg text-blck-mjuk">
          <span className="capitalize">{kull.ras}</span> ·{" "}
          {valp.kon === "tik" ? "tik" : "hane"} ·{" "}
          {alderText(kull.fodelsedatum)}
        </p>
        <p className="text-sm text-blck-mjuk">
          Född {formateraDatum(kull.fodelsedatum)}
        </p>
      </header>

      <section className="kort mt-8 p-5">
        <h2 className="text-lg">Från {kennel.namn}</h2>
        {kennel.ort && <p className="text-sm text-blck-mjuk">{kennel.ort}</p>}
        {kennel.om_text && (
          <p className="mt-2 whitespace-pre-wrap text-blck-mjuk">
            {kennel.om_text}
          </p>
        )}
      </section>

      <section className="kort mt-4 p-5">
        <h2 className="text-lg">Föräldrar</h2>
        <dl className="mt-2 flex flex-col gap-3 text-sm">
          {kull.mor_namn && (
            <div>
              <dt className="font-semibold">Mamma: {kull.mor_namn}</dt>
              {kull.mor_halsa && (
                <dd className="whitespace-pre-wrap text-blck-mjuk">
                  {kull.mor_halsa}
                </dd>
              )}
            </div>
          )}
          {kull.far_namn && (
            <div>
              <dt className="font-semibold">Pappa: {kull.far_namn}</dt>
              {kull.far_halsa && (
                <dd className="whitespace-pre-wrap text-blck-mjuk">
                  {kull.far_halsa}
                </dd>
              )}
            </div>
          )}
        </dl>
      </section>

      {(valp.chipnummer || valp.reg_nummer) && (
        <section className="kort mt-4 p-5">
          <h2 className="text-lg">Identitet</h2>
          <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {valp.chipnummer && (
              <div>
                <dt className="font-semibold text-blck-mjuk">Chipnummer</dt>
                <dd className="font-mono">{valp.chipnummer}</dd>
              </div>
            )}
            {valp.reg_nummer && (
              <div>
                <dt className="font-semibold text-blck-mjuk">Reg.nummer</dt>
                <dd className="font-mono">{valp.reg_nummer}</dd>
              </div>
            )}
            {valp.farg && (
              <div>
                <dt className="font-semibold text-blck-mjuk">Färg</dt>
                <dd>{valp.farg}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {rasprofil && (
        <section className="kort mt-4 p-5">
          <h2 className="text-lg capitalize">Om rasen {kull.ras}</h2>
          <dl className="mt-2 flex flex-col gap-3 text-sm">
            <div>
              <dt className="font-semibold">Motion</dt>
              <dd className="text-blck-mjuk">{rasprofil.motionsbehov}</dd>
            </div>
            <div>
              <dt className="font-semibold">Pälsvård</dt>
              <dd className="text-blck-mjuk">{rasprofil.palsvard}</dd>
            </div>
            <div>
              <dt className="font-semibold">Bra att känna till om hälsan</dt>
              <dd className="text-blck-mjuk">
                {rasprofil.vanliga_halsoproblem}
              </dd>
            </div>
            {rasprofil.foderschema_json?.length > 0 && (
              <div>
                <dt className="font-semibold">Foderschema (riktmärken)</dt>
                <dd className="mt-1">
                  <ul className="flex flex-col gap-1 text-blck-mjuk">
                    {rasprofil.foderschema_json.map((rad) => (
                      <li key={rad.alder}>
                        <span className="font-medium text-blck">
                          {rad.alder}:
                        </span>{" "}
                        {rad.mal}. {rad.riktmarke}.
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-3 rounded-xl bg-himmel-ljus p-3 text-xs text-blck-mjuk">
            Detta är allmänna riktlinjer för rasen. Fråga alltid din veterinär
            om det som rör just din hunds hälsa.
          </p>
        </section>
      )}

      <form action={loggaUt} className="mt-8 text-center">
        <button
          type="submit"
          className="text-sm font-medium text-blck-mjuk underline-offset-2 hover:underline"
        >
          Logga ut
        </button>
      </form>
    </main>
  );
}
