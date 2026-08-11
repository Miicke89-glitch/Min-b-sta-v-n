"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { skapaServerKlient } from "@/lib/supabase/server";

async function kravAnvandare() {
  const supabase = await skapaServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");
  return { supabase, user };
}

// ---------- Auth ----------

export async function loggaUt() {
  const supabase = await skapaServerKlient();
  await supabase.auth.signOut();
  redirect("/logga-in");
}

// ---------- Profil ----------

export async function sparaProfil(formData: FormData) {
  const { supabase, user } = await kravAnvandare();
  const namn = String(formData.get("namn") ?? "").trim();
  const roll = formData.get("roll") === "uppfodare" ? "uppfodare" : "kopare";

  const { error } = await supabase
    .from("profil")
    .upsert({ user_id: user.id, namn, roll });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// ---------- Uppfödare: kennel ----------

export async function sparaKennel(formData: FormData) {
  const { supabase, user } = await kravAnvandare();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const varden = {
    namn: String(formData.get("namn") ?? "").trim(),
    ort: String(formData.get("ort") ?? "").trim(),
    om_text: String(formData.get("om_text") ?? "").trim(),
    agare_user_id: user.id,
  };
  if (!varden.namn) throw new Error("Kennelnamn krävs.");

  const logga = formData.get("logga") as File | null;
  let logo_url: string | undefined;
  if (logga && logga.size > 0) {
    const sokvag = `${user.id}/logga-${Date.now()}-${logga.name}`;
    const { error: uppladdningsfel } = await supabase.storage
      .from("bilder")
      .upload(sokvag, logga);
    if (uppladdningsfel) throw new Error(uppladdningsfel.message);
    logo_url = supabase.storage.from("bilder").getPublicUrl(sokvag).data
      .publicUrl;
  }

  await supabase
    .from("profil")
    .upsert({ user_id: user.id, roll: "uppfodare" }, { ignoreDuplicates: false });

  const { error } = id
    ? await supabase
        .from("kennel")
        .update({ ...varden, ...(logo_url ? { logo_url } : {}) })
        .eq("id", id)
    : await supabase
        .from("kennel")
        .insert({ ...varden, ...(logo_url ? { logo_url } : {}) });
  if (error) throw new Error(error.message);

  revalidatePath("/uppfodare");
  redirect("/uppfodare");
}

// ---------- Uppfödare: kull ----------

export async function skapaKull(formData: FormData) {
  const { supabase } = await kravAnvandare();
  const kennel_id = String(formData.get("kennel_id"));
  const { data, error } = await supabase
    .from("kull")
    .insert({
      kennel_id,
      ras: String(formData.get("ras") ?? "").trim().toLowerCase(),
      fodelsedatum: String(formData.get("fodelsedatum")),
      mor_namn: String(formData.get("mor_namn") ?? "").trim(),
      mor_halsa: String(formData.get("mor_halsa") ?? "").trim(),
      far_namn: String(formData.get("far_namn") ?? "").trim(),
      far_halsa: String(formData.get("far_halsa") ?? "").trim(),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/uppfodare");
  redirect(`/uppfodare/kullar/${data.id}`);
}

export async function laggTillValp(formData: FormData) {
  const { supabase } = await kravAnvandare();
  const kull_id = String(formData.get("kull_id"));
  const { error } = await supabase.from("valp").insert({
    kull_id,
    namn: String(formData.get("namn") ?? "").trim(),
    kon: formData.get("kon") === "tik" ? "tik" : "hane",
    farg: String(formData.get("farg") ?? "").trim(),
    chipnummer: String(formData.get("chipnummer") ?? "").trim(),
    reg_nummer: String(formData.get("reg_nummer") ?? "").trim(),
  });
  if (error) throw new Error(error.message);

  const { count } = await supabase
    .from("valp")
    .select("id", { count: "exact", head: true })
    .eq("kull_id", kull_id);
  await supabase.from("kull").update({ antal_valpar: count ?? 0 }).eq("id", kull_id);

  revalidatePath(`/uppfodare/kullar/${kull_id}`);
}

// ---------- Dokument ----------

export async function laddaUppDokument(formData: FormData) {
  const { supabase, user } = await kravAnvandare();
  const kull_id = String(formData.get("kull_id"));
  const valp_id = String(formData.get("valp_id") ?? "");
  const typ = String(formData.get("typ"));
  const fil = formData.get("fil") as File | null;
  if (!fil || fil.size === 0) throw new Error("Välj en fil.");

  const sokvag = `${user.id}/${kull_id}/${Date.now()}-${fil.name}`;
  const { error: uppladdningsfel } = await supabase.storage
    .from("dokument")
    .upload(sokvag, fil);
  if (uppladdningsfel) throw new Error(uppladdningsfel.message);

  const { error } = await supabase.from("dokument").insert({
    kull_id: valp_id ? null : kull_id,
    valp_id: valp_id || null,
    typ,
    filnamn: fil.name,
    url: sokvag,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/uppfodare/kullar/${kull_id}`);
}

export async function raderaDokument(formData: FormData) {
  const { supabase } = await kravAnvandare();
  const id = String(formData.get("id"));
  const { data } = await supabase
    .from("dokument")
    .select("url")
    .eq("id", id)
    .single();
  const { error } = await supabase.from("dokument").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (data?.url) await supabase.storage.from("dokument").remove([data.url]);
  revalidatePath("/uppfodare", "layout");
}

// ---------- Uppfödarråd ----------

export async function sparaRad(formData: FormData) {
  const { supabase } = await kravAnvandare();
  const kull_id = String(formData.get("kull_id"));
  const { error } = await supabase.from("uppfodarrad").insert({
    kull_id,
    rubrik: String(formData.get("rubrik") ?? "").trim(),
    text: String(formData.get("text") ?? "").trim(),
    visa_fran_alder_veckor: Number(formData.get("visa_fran_alder_veckor") ?? 8),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/uppfodare/kullar/${kull_id}/rad`);
}

export async function raderaRad(formData: FormData) {
  const { supabase } = await kravAnvandare();
  const { error } = await supabase
    .from("uppfodarrad")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/uppfodare", "layout");
}

// ---------- Frågor ----------

export async function stallFraga(formData: FormData) {
  const { supabase, user } = await kravAnvandare();
  const kull_id = String(formData.get("kull_id"));
  const valp_id = String(formData.get("valp_id") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  const { error } = await supabase.from("fraga").insert({
    kull_id,
    stalld_av_user_id: user.id,
    text,
  });
  if (error) throw new Error(error.message);
  if (valp_id) revalidatePath(`/valp/${valp_id}/fraga`);
}

export async function svaraFraga(formData: FormData) {
  const { supabase } = await kravAnvandare();
  const id = String(formData.get("id"));
  const svar_text = String(formData.get("svar_text") ?? "").trim();
  if (!svar_text) return;
  const { error } = await supabase
    .from("fraga")
    .update({ svar_text, svarad_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/uppfodare", "layout");
}

// ---------- Vikt ----------

export async function loggaVikt(formData: FormData) {
  const { supabase } = await kravAnvandare();
  const valp_id = String(formData.get("valp_id"));
  const vikt_kg = Number(String(formData.get("vikt_kg")).replace(",", "."));
  if (!vikt_kg || vikt_kg <= 0) throw new Error("Ange en vikt i kg.");
  const { error } = await supabase.from("viktlogg").insert({
    valp_id,
    datum: String(formData.get("datum") || new Date().toISOString().slice(0, 10)),
    vikt_kg,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/valp/${valp_id}/vikt`);
}

export async function raderaVikt(formData: FormData) {
  const { supabase } = await kravAnvandare();
  const valp_id = String(formData.get("valp_id"));
  const { error } = await supabase
    .from("viktlogg")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath(`/valp/${valp_id}/vikt`);
}

// ---------- Tidslinje ----------

export async function vaxlaKort(formData: FormData) {
  const { supabase } = await kravAnvandare();
  const valp_id = String(formData.get("valp_id"));
  const kort_id = String(formData.get("kort_id"));
  const klar = formData.get("klar") === "true";

  const { error } = klar
    ? await supabase
        .from("tidslinje_klar")
        .delete()
        .eq("valp_id", valp_id)
        .eq("kort_id", kort_id)
    : await supabase.from("tidslinje_klar").insert({ valp_id, kort_id });
  if (error) throw new Error(error.message);
  revalidatePath(`/valp/${valp_id}/tidslinje`);
}

// ---------- Kullchatt ----------

export async function skickaInlagg(formData: FormData) {
  const { supabase, user } = await kravAnvandare();
  const kull_id = String(formData.get("kull_id"));
  const valp_id = String(formData.get("valp_id") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  const { error } = await supabase.from("kullinlagg").insert({
    kull_id,
    user_id: user.id,
    text,
  });
  if (error) throw new Error(error.message);
  if (valp_id) revalidatePath(`/valp/${valp_id}/kullen`);
  revalidatePath("/uppfodare", "layout");
}

// ---------- Inbjudan ----------

export async function anslutValp(token: string) {
  const { supabase } = await kravAnvandare();
  const { data, error } = await supabase.rpc("anslut_valp", { p_token: token });
  if (error) throw new Error(error.message);
  redirect(`/valp/${data}`);
}
