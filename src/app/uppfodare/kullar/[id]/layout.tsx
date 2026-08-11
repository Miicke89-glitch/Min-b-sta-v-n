import Link from "next/link";
import { notFound } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import { formateraDatum } from "@/lib/alder";
import KullFlikar from "./flikar";

export default async function KullLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();
  const { data: kull } = await supabase
    .from("kull")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!kull) notFound();

  return (
    <div>
      <Link
        href="/uppfodare"
        className="text-sm font-medium text-blck-mjuk underline-offset-2 hover:underline"
      >
        ← Alla kullar
      </Link>
      <h1 className="mt-2 text-3xl capitalize">{kull.ras}</h1>
      <p className="mt-1 text-blck-mjuk">
        Födda {formateraDatum(kull.fodelsedatum)}
        {kull.mor_namn && <> · e. {kull.far_namn || "?"} u. {kull.mor_namn}</>}
      </p>
      <KullFlikar kullId={id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
