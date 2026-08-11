import Link from "next/link";
import { redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { formateraDatum } from "@/lib/alder";
import Ikon from "@/components/ikon";
import type { Kull } from "@/lib/typer";

export const metadata = { title: "Uppfödare — Din bästa vän" };

export default async function UppfodareStart() {
  const supabase = await skapaServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in?nasta=/uppfodare");

  const { data: kennel } = await supabase
    .from("kennel")
    .select("*")
    .eq("agare_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!kennel) redirect("/uppfodare/kennel");

  const { data: kullar } = await supabase
    .from("kull")
    .select("*")
    .eq("kennel_id", kennel.id)
    .order("fodelsedatum", { ascending: false });

  const { data: obesvarade } = await supabase
    .from("fraga")
    .select("id, kull_id")
    .is("svar_text", null);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">{kennel.namn}</h1>
          <p className="mt-1 text-blck-mjuk">{kennel.ort}</p>
        </div>
        <Link href="/uppfodare/kennel" className="knapp-sekundar shrink-0">
          Redigera profil
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl">Kullar</h2>
          <Link href="/uppfodare/kullar/ny" className="knapp">
            + Ny kull
          </Link>
        </div>
        {!kullar?.length ? (
          <div className="kort p-6 text-center text-blck-mjuk">
            <span className="symbol mx-auto mb-3 h-12 w-12">
              <Ikon namn="tass" storlek={22} />
            </span>
            <p>
              Ingen kull ännu. Lägg upp din första kull så bygger vi pärmen
              tillsammans.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {(kullar as Kull[]).map((kull) => {
              const antalObesvarade =
                obesvarade?.filter((f) => f.kull_id === kull.id).length ?? 0;
              return (
                <li key={kull.id}>
                  <Link
                    href={`/uppfodare/kullar/${kull.id}`}
                    className="kort flex items-center justify-between gap-4 p-4"
                  >
                    <span>
                      <span className="block font-semibold capitalize">
                        {kull.ras}
                      </span>
                      <span className="text-sm text-blck-mjuk">
                        Födda {formateraDatum(kull.fodelsedatum)} ·{" "}
                        {kull.antal_valpar}{" "}
                        {kull.antal_valpar === 1 ? "valp" : "valpar"}
                      </span>
                    </span>
                    {antalObesvarade > 0 && (
                      <span className="rounded-full bg-tass px-3 py-1 text-sm font-semibold text-white">
                        {antalObesvarade}{" "}
                        {antalObesvarade === 1 ? "ny fråga" : "nya frågor"}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
