import Link from "next/link";
import { redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import Ikon from "@/components/ikon";

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
        <span className="symbol mx-auto h-16 w-16">
          <Ikon namn="tass" storlek={30} />
        </span>
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
    <>
      <header className="glasmeny sticky top-0 z-10 border-b border-linje">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3">
          <p className="rubrik flex items-center gap-2.5 text-lg">
            <span className="symbol h-9 w-9">
              <Ikon namn="tass" storlek={19} />
            </span>
            Din bästa vän
          </p>
          <nav aria-label="Huvudmeny" className="flex items-center gap-4">
            <a
              href="#uppfodare"
              className="hidden text-sm font-semibold text-blck-mjuk hover:text-blck sm:block"
            >
              För uppfödare
            </a>
            <Link href="/logga-in" className="knapp-sekundar px-4 py-2 text-sm">
              Logga in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hjälte */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-tass">
              Den digitala valppärmen
            </p>
            <h1 className="mt-3 text-4xl leading-tight md:text-5xl">
              Valppärmen som följer med hem
            </h1>
            <p className="mt-4 max-w-md text-lg text-blck-mjuk">
              Uppfödaren fyller i den en gång per kull. Valpköparen får allt
              samlat — dokument, råd och en tidslinje som följer valpen från
              vecka åtta till tre år.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/logga-in" className="knapp">
                Logga in
              </Link>
              <a href="#sa-funkar-det" className="knapp-sekundar">
                Så funkar det
              </a>
            </div>
            <p className="mt-4 text-sm text-blck-mjuk">
              Har du fått en inbjudningslänk? Öppna den direkt — den loggar in
              dig.
            </p>
          </div>

          {/* Telefonmockup i ren CSS */}
          <div className="mx-auto w-full max-w-[300px]" aria-hidden="true">
            <div className="kort overflow-hidden rounded-[2rem] border-[6px] border-blck/90 shadow-xl">
              <div className="bg-papper px-4 pb-5 pt-6 text-center">
                <span className="symbol mx-auto h-14 w-14">
                  <Ikon namn="tass" storlek={26} />
                </span>
                <p className="rubrik mt-2 text-2xl">Sixten</p>
                <p className="text-xs text-blck-mjuk">
                  Labrador retriever · 10 veckor
                </p>
                <div className="kort mt-4 p-3 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blck-mjuk">
                    Träning · vecka 10
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    Socialiseringsfönstret är öppet
                  </p>
                </div>
                <div className="kort mt-2 p-3 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blck-mjuk">
                    Praktiskt · vecka 8
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    Registrera hos Jordbruksverket
                  </p>
                  <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-ang-ljus px-2.5 py-1 text-xs font-semibold text-ang">
                    <Ikon namn="check" storlek={12} /> Klart!
                  </p>
                </div>
                <div className="mt-4 flex justify-around border-t border-linje pt-3 text-tass-mork">
                  <Ikon namn="tass" storlek={17} />
                  <span className="text-blck-mjuk">
                    <Ikon namn="kalender" storlek={17} />
                  </span>
                  <span className="text-blck-mjuk">
                    <Ikon namn="kurva" storlek={17} />
                  </span>
                  <span className="text-blck-mjuk">
                    <Ikon namn="dokument" storlek={17} />
                  </span>
                  <span className="text-blck-mjuk">
                    <Ikon namn="flock" storlek={17} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Så funkar det */}
        <section
          id="sa-funkar-det"
          className="border-y border-linje bg-kort"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-14 md:py-20">
            <h2 className="text-center text-3xl">Så funkar det</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                {
                  ikon: "plus" as const,
                  rubrik: "Uppfödaren fyller i pärmen",
                  text: "Kull, föräldrarnas hälsoresultat, dokument och egna råd — en gång per kull, inte per valp.",
                },
                {
                  ikon: "gava" as const,
                  rubrik: "Valpen får en länk",
                  text: "Varje valp får en unik inbjudningslänk som lämnas över tillsammans med valpen. Som en present.",
                },
                {
                  ikon: "hjarta" as const,
                  rubrik: "Köparen följer resan",
                  text: "Tidslinje vecka för vecka, viktkurva mot rasens spann, alla papper och kontakt med uppfödaren och kullen.",
                },
              ].map((steg, i) => (
                <li key={steg.rubrik} className="text-center md:text-left">
                  <div className="flex items-center justify-center gap-3 md:justify-start">
                    <span className="symbol h-12 w-12">
                      <Ikon namn={steg.ikon} storlek={22} />
                    </span>
                    <span className="rubrik text-3xl text-linje">{i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg">{steg.rubrik}</h3>
                  <p className="mt-2 text-blck-mjuk">{steg.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Funktioner */}
        <section className="mx-auto w-full max-w-6xl px-5 py-14 md:py-20">
          <h2 className="text-center text-3xl">
            Allt om valpen, på ett ställe
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                ikon: "kalender" as const,
                rubrik: "Tidslinjen",
                text: "Veckovisa kort från vecka 8 till tre år: vaccinationer, försäkring, träning och allt som kommer härnäst.",
              },
              {
                ikon: "kurva" as const,
                rubrik: "Viktkurvan",
                text: "Logga vikten och se den mot rasens normalspann — tio raser med i starten.",
              },
              {
                ikon: "dokument" as const,
                rubrik: "Dokumenten",
                text: "Registreringsbevis, intyg och avtal — öppningsbara även utan uppkoppling.",
              },
              {
                ikon: "flock" as const,
                rubrik: "Kullen",
                text: "Syskonen och deras familjer i en gemensam tråd, med uppfödaren nära till hands.",
              },
            ].map((funktion) => (
              <article key={funktion.rubrik} className="kort p-6">
                <span className="symbol h-12 w-12">
                  <Ikon namn={funktion.ikon} storlek={22} />
                </span>
                <h3 className="mt-4 text-lg">{funktion.rubrik}</h3>
                <p className="mt-2 text-sm text-blck-mjuk">{funktion.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* För uppfödare */}
        <section id="uppfodare" className="border-y border-linje bg-kort">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-tass">
                För uppfödare
              </p>
              <h2 className="mt-3 text-3xl">
                Ge dina valpköpare något som varar
              </h2>
              <p className="mt-4 max-w-lg text-blck-mjuk">
                Du lägger omsorg på dina kullar — låt den följa med hem. Pärmen
                svarar på nybörjarfrågorna innan de ställs, håller dina råd
                levande i tre år och samlar kullens frågor på ett ställe så att
                ett svar hjälper alla.
              </p>
              <Link href="/logga-in" className="knapp mt-8">
                Skapa din kennelprofil
              </Link>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                "En pärm per kull — inte per valp",
                "Unik inbjudningslänk för varje valp",
                "Dina råd visas vid rätt ålder",
                "Frågeinkorg där svar delas med hela kullen",
              ].map((punkt) => (
                <li key={punkt} className="flex items-start gap-3">
                  <span className="symbol mt-0.5 h-7 w-7 shrink-0">
                    <Ikon namn="check" storlek={14} />
                  </span>
                  <span className="font-medium">{punkt}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sidfot */}
        <footer className="mx-auto w-full max-w-6xl px-5 py-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <p className="rubrik flex items-center gap-2.5">
              <span className="symbol h-8 w-8">
                <Ikon namn="tass" storlek={16} />
              </span>
              Din bästa vän
            </p>
            <Link href="/logga-in" className="knapp-sekundar px-4 py-2 text-sm">
              Logga in
            </Link>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-blck-mjuk">
            Innehållet i pärmen är allmänna riktlinjer, inte medicinsk
            rådgivning. Vid allt som rör din hunds hälsa — prata med din
            veterinär.
          </p>
        </footer>
      </main>
    </>
  );
}
