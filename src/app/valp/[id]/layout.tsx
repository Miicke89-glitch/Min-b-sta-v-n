import { notFound, redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";
import ValpMeny from "./meny";

export default async function ValpLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await skapaServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/logga-in?nasta=${encodeURIComponent(`/valp/${id}`)}`);

  const { data: valp } = await supabase
    .from("valp")
    .select("id, namn")
    .eq("id", id)
    .maybeSingle();
  if (!valp) notFound();

  return (
    <div className="min-h-dvh pb-24 md:pb-10 md:pl-60">
      {children}
      <ValpMeny valpId={id} valpNamn={valp.namn} />
    </div>
  );
}
