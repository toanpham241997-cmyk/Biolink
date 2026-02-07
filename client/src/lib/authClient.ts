import { supabase } from "./supabaseClient";

export async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user || null;
  if (!user) return null;

  // lấy profile (balance, role...)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,name,avatar,role,status,balance")
    .eq("id", user.id)
    .single();

  return { user, profile };
}
