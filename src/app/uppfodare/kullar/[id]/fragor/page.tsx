import { skapaServerKlient } from "@/lib/supabase/server";
import { svaraFraga } from "@/lib/actions";
import { formateraTidpunkt } from "@/lib/alder";
import Ikon from "@/components/ikon";
import type { Fraga } from "@/lib/typer";

export const metadata = { title: "Frågor — Din bästa vän" };

export default async function FragorSida({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();
  const { data: fragor } = await supabase
    .from("fraga")
    .select("*")
    .eq("kull_id", id)
    .order("skapad_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-blck-mjuk">
        Frågor från dina valpköpare. Ditt svar syns för hela kullen — svara en
        gång, hjälp alla.
      </p>

      {!fragor?.length ? (
        <div className="kort p-6 text-center text-blck-mjuk">
          <span className="symbol mx-auto mb-3 h-12 w-12">
            <Ikon namn="prat" storlek={22} />
          </span>
          <p>Inga frågor ännu.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {(fragor as Fraga[]).map((fraga) => (
            <li key={fraga.id} className="kort p-4">
              <p className="text-xs text-blck-mjuk">
                {formateraTidpunkt(fraga.skapad_at)}
              </p>
              <p className="mt-1 font-semibold">{fraga.text}</p>
              {fraga.svar_text ? (
                <div className="mt-3 rounded-xl bg-ang-ljus p-3">
                  <p className="text-xs font-semibold text-ang">Ditt svar</p>
                  <p className="mt-1 whitespace-pre-wrap">{fraga.svar_text}</p>
                </div>
              ) : (
                <form action={svaraFraga} className="mt-3 flex flex-col gap-3">
                  <input type="hidden" name="id" value={fraga.id} />
                  <label htmlFor={`svar-${fraga.id}`} className="sr-only">
                    Svar
                  </label>
                  <textarea
                    id={`svar-${fraga.id}`}
                    name="svar_text"
                    required
                    rows={3}
                    className="falt"
                    placeholder="Skriv ditt svar…"
                  />
                  <button type="submit" className="knapp self-start">
                    Svara
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
