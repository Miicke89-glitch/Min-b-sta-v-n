export type Kennel = {
  id: string;
  namn: string;
  ort: string;
  om_text: string;
  logo_url: string | null;
  agare_user_id: string;
};

export type Kull = {
  id: string;
  kennel_id: string;
  ras: string;
  fodelsedatum: string;
  mor_namn: string;
  mor_halsa: string;
  far_namn: string;
  far_halsa: string;
  antal_valpar: number;
  kennel?: Kennel;
};

export type Valp = {
  id: string;
  kull_id: string;
  namn: string;
  kon: "hane" | "tik";
  farg: string;
  chipnummer: string;
  reg_nummer: string;
  bild_url: string | null;
  agare_user_id: string | null;
  invite_token: string;
  kull?: Kull;
};

export type DokumentTyp =
  | "registreringsbevis"
  | "besiktningsintyg"
  | "vaccinationsintyg"
  | "koepeavtal"
  | "ovrigt";

export type Dokument = {
  id: string;
  valp_id: string | null;
  kull_id: string | null;
  typ: DokumentTyp;
  filnamn: string;
  url: string;
  skapad_at: string;
};

export type Viktlogg = {
  id: string;
  valp_id: string;
  datum: string;
  vikt_kg: number;
};

export type Uppfodarrad = {
  id: string;
  kull_id: string;
  rubrik: string;
  text: string;
  visa_fran_alder_veckor: number;
};

export type Fraga = {
  id: string;
  kull_id: string;
  stalld_av_user_id: string;
  text: string;
  svar_text: string | null;
  svarad_at: string | null;
  skapad_at: string;
};

export type Rasprofil = {
  ras: string;
  vuxenvikt_min: number;
  vuxenvikt_max: number;
  vuxenvikt_json: { tik?: [number, number]; hane?: [number, number] };
  viktkurva_json: { vecka: number; min_kg: number; max_kg: number }[];
  motionsbehov: string;
  palsvard: string;
  vanliga_halsoproblem: string;
  foderschema_json: {
    alder: string;
    mal: string;
    riktmarke: string;
  }[];
};

export type Kullinlagg = {
  id: string;
  kull_id: string;
  user_id: string;
  text: string;
  skapad_at: string;
  profil?: { namn: string } | null;
};

export type TidslinjeKort = {
  id: string;
  vecka: number;
  rubrik: string;
  brodtext: string;
  atgard: boolean;
  kategori: string;
};

export const DOKUMENT_TYPER: { varde: DokumentTyp; etikett: string }[] = [
  { varde: "registreringsbevis", etikett: "Registreringsbevis" },
  { varde: "besiktningsintyg", etikett: "Besiktningsintyg" },
  { varde: "vaccinationsintyg", etikett: "Vaccinationsintyg" },
  { varde: "koepeavtal", etikett: "Köpeavtal" },
  { varde: "ovrigt", etikett: "Övrigt" },
];

export function dokumentEtikett(typ: DokumentTyp): string {
  return DOKUMENT_TYPER.find((t) => t.varde === typ)?.etikett ?? typ;
}
