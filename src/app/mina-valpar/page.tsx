import Link from "next/link";
import { redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { alderText } from "@/lib/alder";
import type { Valp, Kull } from "@/lib/typer";

export const metadata = { title: "Mina valpar — Din bästa vän" };

export default async function MinaValparSida() {
  const supabase = await skapaServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in?nasta=/mina-valpar");

  const { data: valpar } = await supabase
    .from("valp")
    .select("*, kull(*)")
    .eq("agare_user_id", user.id);

  return (
    <main className="mx-auto w-full max-w-md px-5 py-10">
      <h1 className="text-3xl">Mina valpar</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {(valpar as (Valp & { kull: Kull })[] | null)?.map((valp) => (
          <li key={valp.id}>
            <Link
              href={`/valp/${valp.id}`}
              className="kort flex items-center gap-4 p-4"
            >
              <span aria-hidden="true" className="text-3xl">
                🐶
              </span>
              <span>
                <span className="block text-lg font-semibold">{valp.namn}</span>
                <span className="text-sm text-blck-mjuk">
                  {valp.kull?.ras}, {alderText(valp.kull?.fodelsedatum ?? "")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
