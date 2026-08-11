"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ValpMeny({ valpId }: { valpId: string }) {
  const pathname = usePathname();
  const bas = `/valp/${valpId}`;
  const flikar = [
    { href: bas, ikon: "🐶", etikett: "Min valp" },
    { href: `${bas}/tidslinje`, ikon: "🗓️", etikett: "Tidslinje" },
    { href: `${bas}/vikt`, ikon: "⚖️", etikett: "Vikt" },
    { href: `${bas}/dokument`, ikon: "📄", etikett: "Dokument" },
    { href: `${bas}/kullen`, ikon: "🐾", etikett: "Kullen" },
    { href: `${bas}/fraga`, ikon: "💬", etikett: "Fråga" },
  ];

  return (
    <nav
      aria-label="Valpens sidor"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-linje bg-kort pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-xl">
        {flikar.map((flik) => {
          const aktiv = pathname === flik.href;
          return (
            <li key={flik.href} className="flex-1">
              <Link
                href={flik.href}
                aria-current={aktiv ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-semibold ${
                  aktiv ? "text-tass-mork" : "text-blck-mjuk"
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {flik.ikon}
                </span>
                {flik.etikett}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
