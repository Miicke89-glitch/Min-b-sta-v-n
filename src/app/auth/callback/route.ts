import { NextResponse } from "next/server";
import { skapaServerKlient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nasta = searchParams.get("nasta") ?? "/";

  if (code) {
    const supabase = await skapaServerKlient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${nasta.startsWith("/") ? nasta : "/"}`);
    }
  }

  return NextResponse.redirect(`${origin}/logga-in?fel=lank`);
}
