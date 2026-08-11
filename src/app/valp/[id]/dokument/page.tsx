import { notFound } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { dokumentEtikett, type Dokument, type Valp } from "@/lib/typer";
import SwRegistrering from "@/components/sw-registrering";

export const metadata = { title: "Dokument — Din bästa vän" };

export default async function DokumentSida({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();

  const { data: valp } = await supabase
    .from("valp")
    .select("id, namn, kull_id")
    .eq("id", id)
    .maybeSingle<Pick<Valp, "id" | "namn" | "kull_id">>();
  if (!valp) notFound();

  const { data: dokument } = await supabase
    .from("dokument")
    .select("*")
    .or(`valp_id.eq.${id},kull_id.eq.${valp.kull_id}`)
    .order("skapad_at");

  // Signerade URL:er (7 dagar) — service workern cachar öppnade filer offline.
  const medLankar = await Promise.all(
    ((dokument ?? []) as Dokument[]).map(async (dok) => {
      const { data } = await supabase.storage
        .from("dokument")
        .createSignedUrl(dok.url, 60 * 60 * 24 * 7);
      return { ...dok, signeradUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-8">
      <SwRegistrering />
      <h1 className="text-3xl">Dokument</h1>
      <p className="mt-1 text-blck-mjuk">
        {valp.namn}s alla papper, samlade av din uppfödare. Dokument du öppnat
        finns kvar även utan uppkoppling.
      </p>

      {!medLankar.length ? (
        <div className="kort mt-6 p-6 text-center text-blck-mjuk">
          <p aria-hidden="true" className="mb-2 text-3xl">
            📄
          </p>
          <p>Inga dokument uppladdade ännu.</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {medLankar.map((dok) => (
            <li key={dok.id}>
              {dok.signeradUrl ? (
                <a
                  href={dok.signeradUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kort flex items-center gap-3 p-4"
                >
                  <span aria-hidden="true" className="text-2xl">
                    📄
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {dokumentEtikett(dok.typ)}
                    </span>
                    <span className="block truncate text-sm text-blck-mjuk">
                      {dok.filnamn}
                      {dok.kull_id ? " · gäller hela kullen" : ""}
                    </span>
                  </span>
                </a>
              ) : (
                <div className="kort p-4 text-blck-mjuk">
                  {dok.filnamn} (kunde inte hämtas)
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
