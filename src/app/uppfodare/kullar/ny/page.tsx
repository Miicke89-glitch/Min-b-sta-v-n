import { redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { skapaKull } from "@/lib/actions";
import rasprofiler from "@/data/rasprofiler.json";

export const metadata = { title: "Ny kull — Din bästa vän" };

export default async function NyKullSida() {
  const supabase = await skapaServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in?nasta=/uppfodare/kullar/ny");

  const { data: kennel } = await supabase
    .from("kennel")
    .select("id")
    .eq("agare_user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!kennel) redirect("/uppfodare/kennel");

  const raser = rasprofiler.raser.map((r) => r.ras);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl">Ny kull</h1>
      <p className="mt-2 text-blck-mjuk">
        Föräldrarnas hälsoresultat visas för valpköparna — HD/ED, ögonlysning
        och DNA-tester skapar trygghet.
      </p>

      <form action={skapaKull} className="kort mt-6 flex flex-col gap-4 p-6">
        <input type="hidden" name="kennel_id" value={kennel.id} />
        <div>
          <label htmlFor="ras" className="etikett">
            Ras *
          </label>
          <input
            id="ras"
            name="ras"
            required
            className="falt"
            list="rasforslag"
            placeholder="labrador retriever"
          />
          <datalist id="rasforslag">
            {raser.map((ras) => (
              <option key={ras} value={ras} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-blck-mjuk">
            Välj en ras från listan så får köparna viktkurva, foderschema och
            rasråd automatiskt.
          </p>
        </div>
        <div>
          <label htmlFor="fodelsedatum" className="etikett">
            Födelsedatum *
          </label>
          <input
            id="fodelsedatum"
            name="fodelsedatum"
            type="date"
            required
            className="falt"
          />
        </div>

        <fieldset className="rounded-xl border border-linje p-4">
          <legend className="etikett px-1">Mamma (tik)</legend>
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="mor_namn" className="etikett">
                Namn
              </label>
              <input
                id="mor_namn"
                name="mor_namn"
                className="falt"
                placeholder="SE UCH Solgläntans Wilma"
              />
            </div>
            <div>
              <label htmlFor="mor_halsa" className="etikett">
                Hälsoresultat
              </label>
              <textarea
                id="mor_halsa"
                name="mor_halsa"
                rows={3}
                className="falt"
                placeholder={"HD: A, ED: 0 (ua)\nÖgonlyst: ua 2025-03-12\nDNA prcd-PRA: fri"}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-linje p-4">
          <legend className="etikett px-1">Pappa (hane)</legend>
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="far_namn" className="etikett">
                Namn
              </label>
              <input id="far_namn" name="far_namn" className="falt" />
            </div>
            <div>
              <label htmlFor="far_halsa" className="etikett">
                Hälsoresultat
              </label>
              <textarea
                id="far_halsa"
                name="far_halsa"
                rows={3}
                className="falt"
              />
            </div>
          </div>
        </fieldset>

        <button type="submit" className="knapp">
          Skapa kull
        </button>
      </form>
    </div>
  );
}
