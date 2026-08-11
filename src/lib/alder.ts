const MS_PER_VECKA = 7 * 24 * 60 * 60 * 1000;

export function alderIVeckor(fodelsedatum: string): number {
  const fodd = new Date(fodelsedatum + "T00:00:00");
  return Math.max(0, Math.floor((Date.now() - fodd.getTime()) / MS_PER_VECKA));
}

export function alderText(fodelsedatum: string): string {
  const veckor = alderIVeckor(fodelsedatum);
  if (veckor < 16) return `${veckor} veckor`;
  const manader = Math.floor(veckor / 4.345);
  if (manader < 24) return `${manader} månader`;
  const ar = Math.floor(manader / 12);
  const restManader = manader % 12;
  return restManader > 0 ? `${ar} år och ${restManader} månader` : `${ar} år`;
}

export function formateraDatum(datum: string): string {
  return new Date(datum + "T00:00:00").toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formateraTidpunkt(iso: string): string {
  return new Date(iso).toLocaleString("sv-SE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
