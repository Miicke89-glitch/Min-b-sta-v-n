import { notFound } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { skickaInlagg } from "@/lib/actions";
import { formateraTidpunkt } from "@/lib/alder";
import type { Kull, Kullinlagg, Valp } from "@/lib/typer";

export const metadata = { title: "Kullen — Din bästa vän" };

export default async function KullenSida({
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

  const [{ data: kullkamrater }, { data: inlagg }, { data: profiler }] =
    await Promise.all([
      supabase
        .from("valp")
        .select("id, namn, kon, farg, agare_user_id")
        .eq("kull_id", valp.kull_id)
        .order("skapad_at"),
      supabase
        .from("kullinlagg")
        .select("*")
        .eq("kull_id", valp.kull_id)
        .order("skapad_at"),
      supabase.from("profil").select("user_id, namn"),
    ]);

  const namnFor = (userId: string) => {
    const profil = profiler?.find((p) => p.user_id === userId);
    if (profil?.namn) return profil.namn;
    const agdValp = kullkamrater?.find((v) => v.agare_user_id === userId);
    return agdValp ? `${agdValp.namn}s familj` : "Kullmedlem";
  };

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8">
      <h1 className="text-3xl">Kullen</h1>
      <p className="mt-1 text-blck-mjuk">
        {valp.namn}s syskon — och en gemensam tråd för hela kullen, uppfödaren
        inräknad.
      </p>

      <section aria-labelledby="rubrik-syskon" className="mt-6">
        <h2 id="rubrik-syskon" className="sr-only">
          Valparna i kullen
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {(kullkamrater as Pick<Valp, "id" | "namn" | "kon" | "farg" | "agare_user_id">[] | null)?.map(
            (kamrat) => (
              <li
                key={kamrat.id}
                className={`kort p-4 text-center ${
                  kamrat.id === id ? "border-tass" : ""
                }`}
              >
                <p aria-hidden="true" className="text-3xl">
                  {kamrat.kon === "tik" ? "🐕" : "🐶"}
                </p>
                <p className="mt-1 font-semibold">
                  {kamrat.namn}
                  {kamrat.id === id && (
                    <span className="text-blck-mjuk"> (din!)</span>
                  )}
                </p>
                <p className="text-xs text-blck-mjuk">
                  {kamrat.kon === "tik" ? "tik" : "hane"}
                  {kamrat.farg ? ` · ${kamrat.farg}` : ""}
                </p>
                <p className="mt-1 text-xs text-blck-mjuk">
                  {kamrat.agare_user_id
                    ? namnFor(kamrat.agare_user_id)
                    : "Hos uppfödaren"}
                </p>
              </li>
            )
          )}
        </ul>
      </section>

      <section aria-labelledby="rubrik-trad" className="mt-8">
        <h2 id="rubrik-trad" className="text-xl">
          Kulltråden
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {!inlagg?.length && (
            <p className="kort p-4 text-blck-mjuk">
              Inga inlägg ännu — skriv det första och håll kontakten med
              syskonen!
            </p>
          )}
          {(inlagg as Kullinlagg[] | null)?.map((rad) => {
            const eget = rad.user_id === user?.id;
            return (
              <article
                key={rad.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  eget
                    ? "self-end bg-tass-ljus"
                    : "self-start border border-linje bg-kort"
                }`}
              >
                <p className="text-xs font-semibold text-blck-mjuk">
                  {eget ? "Du" : namnFor(rad.user_id)} ·{" "}
                  {formateraTidpunkt(rad.skapad_at)}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap">{rad.text}</p>
              </article>
            );
          })}
        </div>

        <form
          action={skickaInlagg}
          className="mt-4 flex items-end gap-2"
        >
          <input type="hidden" name="kull_id" value={valp.kull_id} />
          <input type="hidden" name="valp_id" value={id} />
          <div className="flex-1">
            <label htmlFor="text" className="sr-only">
              Skriv ett inlägg
            </label>
            <textarea
              id="text"
              name="text"
              required
              rows={2}
              className="falt"
              placeholder="Skriv till kullen…"
            />
          </div>
          <button type="submit" className="knapp">
            Skicka
          </button>
        </form>
      </section>
    </main>
  );
}
