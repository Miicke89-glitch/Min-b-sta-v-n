import { notFound } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { stallFraga } from "@/lib/actions";
import { formateraTidpunkt } from "@/lib/alder";
import type { Fraga, Kennel, Kull, Valp } from "@/lib/typer";

export const metadata = { title: "Fråga uppfödaren — Din bästa vän" };

export default async function FragaSida({
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
    .select("*, kull(*, kennel(*))")
    .eq("id", id)
    .maybeSingle<Valp & { kull: Kull & { kennel: Kennel } }>();
  if (!valp) notFound();

  const { data: fragor } = await supabase
    .from("fraga")
    .select("*")
    .eq("kull_id", valp.kull_id)
    .order("skapad_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8 md:max-w-2xl md:py-12">
      <h1 className="text-3xl">Fråga uppfödaren</h1>
      <p className="mt-1 text-blck-mjuk">
        {valp.kull.kennel.namn} känner {valp.namn} och kullen bättre än någon
        annan. Frågor och svar syns för hela kullen — så hjälper ett svar alla.
      </p>

      <form action={stallFraga} className="kort mt-6 flex flex-col gap-3 p-5">
        <input type="hidden" name="kull_id" value={valp.kull_id} />
        <input type="hidden" name="valp_id" value={id} />
        <label htmlFor="text" className="etikett">
          Din fråga
        </label>
        <textarea
          id="text"
          name="text"
          required
          rows={3}
          className="falt"
          placeholder="Hur brukar valparna i den här kullen…"
        />
        <button type="submit" className="knapp self-start">
          Skicka fråga
        </button>
      </form>

      <section aria-labelledby="rubrik-fragor" className="mt-8">
        <h2 id="rubrik-fragor" className="text-xl">
          Frågor från kullen
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {!fragor?.length && (
            <p className="kort p-4 text-blck-mjuk">Inga frågor ännu.</p>
          )}
          {(fragor as Fraga[] | null)?.map((fraga) => (
            <article key={fraga.id} className="kort p-4">
              <p className="text-xs text-blck-mjuk">
                {fraga.stalld_av_user_id === user?.id ? "Du" : "En kullkamrat"} ·{" "}
                {formateraTidpunkt(fraga.skapad_at)}
              </p>
              <p className="mt-1 font-semibold">{fraga.text}</p>
              {fraga.svar_text ? (
                <div className="mt-3 rounded-xl bg-ang-ljus p-3">
                  <p className="text-xs font-semibold text-ang">
                    Svar från {valp.kull.kennel.namn}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {fraga.svar_text}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm italic text-blck-mjuk">
                  Väntar på svar…
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
