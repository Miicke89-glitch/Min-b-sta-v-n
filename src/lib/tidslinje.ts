import tidslinjeData from "@/data/tidslinje.json";
import type { TidslinjeKort } from "@/lib/typer";

export function hamtaAllaKort(): TidslinjeKort[] {
  return (tidslinjeData.kort as TidslinjeKort[])
    .slice()
    .sort((a, b) => a.vecka - b.vecka);
}

export type TidslinjeGrupper = {
  nu: TidslinjeKort[];
  kommer: TidslinjeKort[];
  tidigare: TidslinjeKort[];
};

/**
 * Delar upp korten utifrån valpens ålder:
 * "nu" = kort vars vecka passerats men som fortfarande är aktuella
 * (inom 4 veckor, eller oavbockade åtgärder), "kommer" = framtida,
 * "tidigare" = passerade.
 */
export function grupperaKort(
  alderVeckor: number,
  klaraKortIds: Set<string>
): TidslinjeGrupper {
  const alla = hamtaAllaKort();
  const nu: TidslinjeKort[] = [];
  const kommer: TidslinjeKort[] = [];
  const tidigare: TidslinjeKort[] = [];

  for (const kort of alla) {
    if (kort.vecka > alderVeckor) {
      kommer.push(kort);
    } else if (
      alderVeckor - kort.vecka <= 4 ||
      (kort.atgard && !klaraKortIds.has(kort.id))
    ) {
      nu.push(kort);
    } else {
      tidigare.push(kort);
    }
  }

  return { nu, kommer, tidigare };
}

export const KATEGORI_ETIKETTER: Record<string, string> = {
  halsa: "Hälsa",
  traning: "Träning",
  vardag: "Vardag",
  foder: "Foder",
  praktiskt: "Praktiskt",
};
