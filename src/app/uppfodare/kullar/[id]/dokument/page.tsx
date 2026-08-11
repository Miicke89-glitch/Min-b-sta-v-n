import { skapaServerKlient } from "@/lib/supabase/server";
import { laddaUppDokument, raderaDokument } from "@/lib/actions";
import { DOKUMENT_TYPER, dokumentEtikett, type Dokument, type Valp } from "@/lib/typer";
import Ikon from "@/components/ikon";

export const metadata = { title: "Dokument — Din bästa vän" };

export default async function DokumentSida({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();

  const [{ data: valpar }, { data: kullDok }, { data: valpDok }] =
    await Promise.all([
      supabase.from("valp").select("id, namn").eq("kull_id", id).order("skapad_at"),
      supabase.from("dokument").select("*").eq("kull_id", id).order("skapad_at"),
      supabase
        .from("dokument")
        .select("*, valp:valp_id(namn)")
        .in(
          "valp_id",
          (
            await supabase.from("valp").select("id").eq("kull_id", id)
          ).data?.map((v) => v.id) ?? []
        )
        .order("skapad_at"),
    ]);

  const alla = [
    ...((kullDok ?? []) as (Dokument & { valp: null })[]),
    ...((valpDok ?? []) as (Dokument & { valp: { namn: string } | null })[]),
  ];

  return (
    <div className="flex flex-col gap-6">
      {!alla.length ? (
        <div className="kort p-6 text-center text-blck-mjuk">
          <span className="symbol mx-auto mb-3 h-12 w-12">
            <Ikon namn="dokument" storlek={22} />
          </span>
          <p>
            Inga dokument ännu. Registreringsbevis, besiktningsintyg,
            vaccinationsintyg och köpeavtal — allt samlat här är guld värt för
            köparen.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {alla.map((dok) => (
            <li
              key={dok.id}
              className="kort flex items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{dok.filnamn}</p>
                <p className="text-sm text-blck-mjuk">
                  {dokumentEtikett(dok.typ)} ·{" "}
                  {dok.valp ? `${dok.valp.namn}` : "Hela kullen"}
                </p>
              </div>
              <form action={raderaDokument}>
                <input type="hidden" name="id" value={dok.id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-tass-mork underline-offset-2 hover:underline"
                >
                  Ta bort
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <section className="kort p-6">
        <h2 className="text-xl">Ladda upp dokument</h2>
        <form
          action={laddaUppDokument}
          className="mt-4 flex flex-col gap-4"
        >
          <input type="hidden" name="kull_id" value={id} />
          <div>
            <label htmlFor="typ" className="etikett">
              Typ av dokument
            </label>
            <select id="typ" name="typ" className="falt">
              {DOKUMENT_TYPER.map((typ) => (
                <option key={typ.varde} value={typ.varde}>
                  {typ.etikett}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="valp_id" className="etikett">
              Gäller
            </label>
            <select id="valp_id" name="valp_id" className="falt">
              <option value="">Hela kullen</option>
              {(valpar as Pick<Valp, "id" | "namn">[] | null)?.map((valp) => (
                <option key={valp.id} value={valp.id}>
                  {valp.namn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fil" className="etikett">
              Fil (PDF eller bild)
            </label>
            <input
              id="fil"
              name="fil"
              type="file"
              required
              accept=".pdf,image/*"
              className="falt"
            />
          </div>
          <button type="submit" className="knapp self-start">
            Ladda upp
          </button>
        </form>
      </section>
    </div>
  );
}
