import { type NextRequest } from "next/server";
import { uppdateraSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await uppdateraSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
