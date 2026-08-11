import Link from "next/link";
import { skapaServerKlient } from "@/lib/supabase/server";
import { anslutValp } from "@/lib/actions";
import Ikon from "@/components/ikon";

export const metadata = { title: "Inbjudan — Din bästa vän" };

export default async function InbjudanSida({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await skapaServerKlient();

  const { data: info } = await supabase
    .rpc("inbjudan_info", { p_token: token })
    .maybeSingle<{
      valp_namn: string;
      ras: string;
      kennel_namn: string;
      redan_ansluten: boolean;
    }>();

  if (!info) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10 text-center">
        <span className="symbol mx-auto mb-4 h-16 w-16">
          <Ikon namn="tass" storlek={30} />
        </span>
        <h1 className="text-3xl">Hittar inte inbjudan</h1>
        <p className="mt-3 text-blck-mjuk">
          Länken verkar inte stämma. Dubbelkolla med din uppfödare att du fått
          hela länken.
        </p>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const anslutMedToken = anslutValp.bind(null, token);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="text-center">
        <span className="symbol mx-auto mb-5 h-20 w-20">
          <Ikon namn="gava" storlek={36} />
        </span>
        <h1 className="text-3xl">
          {info.valp_namn} väntar på dig!
        </h1>
        <p className="mt-3 text-blck-mjuk">
          <span className="font-semibold">{info.kennel_namn}</span> har gjort i
          ordning en valppärm för <strong>{info.valp_namn}</strong> — en{" "}
          <span className="capitalize">{info.ras}</span> — med dokument, råd och
          en tidslinje som följer er de första tre åren.
        </p>
      </div>

      <div className="mt-8">
        {user ? (
          <form action={anslutMedToken}>
            <button type="submit" className="knapp w-full">
              Öppna {info.valp_namn}s pärm
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              href={`/logga-in?nasta=${encodeURIComponent(`/inbjudan/${token}`)}`}
              className="knapp w-full"
            >
              Logga in och öppna pärmen
            </Link>
            <p className="text-center text-sm text-blck-mjuk">
              Du loggar in med din e-postadress — inget lösenord behövs.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
