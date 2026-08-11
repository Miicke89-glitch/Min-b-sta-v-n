import Link from "next/link";
import { redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { loggaUt } from "@/lib/actions";

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
      <header className="border-b border-linje bg-kort">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-3">
          <Link href="/uppfodare" className="rubrik text-lg font-semibold">
            🐾 Din bästa vän
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
      <main className="mx-auto w-full max-w-3xl px-5 py-8">{children}</main>
    </div>
  );
}
