import Link from "next/link";
import { redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";

export default async function StartSida() {
  const supabase = await skapaServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Uppfödare med kennel → uppfödarvyn
    const { data: kennel } = await supabase
      .from("kennel")
      .select("id")
      .eq("agare_user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (kennel) redirect("/uppfodare");

    // Köpare med valp → valpvyn
    const { data: valpar } = await supabase
      .from("valp")
      .select("id")
      .eq("agare_user_id", user.id);
    if (valpar && valpar.length === 1) redirect(`/valp/${valpar[0].id}`);
    if (valpar && valpar.length > 1) redirect("/mina-valpar");

    // Inloggad utan koppling än
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-10 text-center">
        <p aria-hidden="true" className="text-5xl">
          🐾
        </p>
        <h1 className="text-3xl">Nästan framme!</h1>
        <p className="text-blck-mjuk">
          Du är inloggad, men ingen valp är kopplad till dig än. Har du fått en
          inbjudningslänk från din uppfödare? Öppna den så hittar valpen hem
          till dig.
        </p>
        <div className="kort p-6 text-left">
          <h2 className="text-lg">Är du uppfödare?</h2>
          <p className="mb-4 mt-1 text-sm text-blck-mjuk">
            Skapa din kennelprofil och lägg upp din första kull.
          </p>
          <Link href="/uppfodare/kennel" className="knapp w-full">
            Kom igång som uppfödare
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="text-center">
        <p aria-hidden="true" className="mb-3 text-6xl">
          🐾
        </p>
        <h1 className="text-4xl">Din bästa vän</h1>
        <p className="mt-3 text-lg text-blck-mjuk">
          Den digitala valppärmen — allt om din valp, samlat med omsorg av din
          uppfödare.
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-3">
        <Link href="/logga-in" className="knapp">
          Logga in
        </Link>
        <p className="text-center text-sm text-blck-mjuk">
          Har du fått en inbjudningslänk? Öppna den direkt — den loggar in dig.
        </p>
      </div>
      <div className="kort mt-10 p-6">
        <h2 className="text-lg">För uppfödare</h2>
        <p className="mt-1 text-sm text-blck-mjuk">
          Fyll i pärmen en gång per kull: dokument, råd och en tidslinje som
          följer valpen i tre år. Dela med dina valpköpare vid överlämningen —
          som en present, inte ett system.
        </p>
      </div>
    </main>
  );
}
