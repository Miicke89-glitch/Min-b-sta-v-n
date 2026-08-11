import { redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { sparaKennel } from "@/lib/actions";

export const metadata = { title: "Kennelprofil — Din bästa vän" };

export default async function KennelSida() {
  const supabase = await skapaServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in?nasta=/uppfodare/kennel");

  const { data: kennel } = await supabase
    .from("kennel")
    .select("*")
    .eq("agare_user_id", user.id)
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl">
        {kennel ? "Kennelprofil" : "Välkommen, uppfödare!"}
      </h1>
      <p className="mt-2 text-blck-mjuk">
        Det här är avsändaren i pärmen — så som dina valpköpare kommer att se
        dig.
      </p>

      <form action={sparaKennel} className="kort mt-6 flex flex-col gap-4 p-6">
        {kennel && <input type="hidden" name="id" value={kennel.id} />}
        <div>
          <label htmlFor="namn" className="etikett">
            Kennelnamn *
          </label>
          <input
            id="namn"
            name="namn"
            required
            className="falt"
            defaultValue={kennel?.namn ?? ""}
            placeholder="Kennel Solgläntan"
          />
        </div>
        <div>
          <label htmlFor="ort" className="etikett">
            Ort
          </label>
          <input
            id="ort"
            name="ort"
            className="falt"
            defaultValue={kennel?.ort ?? ""}
            placeholder="Mariestad"
          />
        </div>
        <div>
          <label htmlFor="om_text" className="etikett">
            Presentation
          </label>
          <textarea
            id="om_text"
            name="om_text"
            rows={5}
            className="falt"
            defaultValue={kennel?.om_text ?? ""}
            placeholder="Berätta om din uppfödning — det här läser valpköparna på sin startsida."
          />
        </div>
        <div>
          <label htmlFor="logga" className="etikett">
            Logotyp (bild)
          </label>
          <input
            id="logga"
            name="logga"
            type="file"
            accept="image/*"
            className="falt"
          />
        </div>
        <button type="submit" className="knapp">
          Spara kennelprofil
        </button>
      </form>
    </div>
  );
}
