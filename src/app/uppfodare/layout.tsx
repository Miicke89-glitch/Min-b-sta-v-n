import Link from "next/link";
import { redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { loggaUt } from "@/lib/actions";
import Ikon from "@/components/ikon";

export default async function UppfodareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await skapaServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in?nasta=/uppfodare");

  return (
    <div className="min-h-dvh">
      <header className="glasmeny sticky top-0 z-10 border-b border-linje">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-3">
          <Link
            href="/uppfodare"
            className="rubrik flex items-center gap-2.5 text-lg"
          >
            <span className="symbol h-9 w-9">
              <Ikon namn="tass" storlek={19} />
            </span>
            Din bästa vän
          </Link>
          <form action={loggaUt}>
            <button
              type="submit"
              className="text-sm font-medium text-blck-mjuk underline-offset-2 hover:underline"
            >
              Logga ut
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-5 py-8 md:py-10">{children}</main>
    </div>
  );
}
