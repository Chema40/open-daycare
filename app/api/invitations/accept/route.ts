import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const body = await request.json().catch(() => null) as { code?: string; email?: string; password?: string; name?: string } | null;
  const code = body?.code?.trim().toUpperCase();
  const email = body?.email?.trim().toLowerCase();
  if (!code || !email || !body?.password || body.password.length < 8 || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Revisa el email y usa una contraseña de al menos 8 caracteres." }, { status: 400 });
  const { data: invitation } = await supabase.rpc("get_invitation_details", { invitation_code: code });
  const row = Array.isArray(invitation) ? invitation[0] : invitation;
  if (!row || row.email.toLowerCase() !== email) return Response.json({ error: "El código o el email no coinciden con una invitación válida." }, { status: 400 });
  let { data: authData, error } = await supabase.auth.signUp({ email, password: body.password, options: { data: { daycare_id: row.daycare_id, role: "parent", full_name: body.name?.trim() || row.full_name } } });
  if (error?.message.toLowerCase().includes("already registered")) {
    const signIn = await supabase.auth.signInWithPassword({ email, password: body.password });
    authData = signIn.data; error = signIn.error;
  }
  if (error || !authData.user || !authData.session) return Response.json({ error: error?.message ?? "No pudimos iniciar la sesión. Confirma tu email si es necesario." }, { status: 400 });
  const { error: acceptError } = await supabase.rpc("accept_parent_invitation", { invitation_code: code });
  if (acceptError) return Response.json({ error: acceptError.message }, { status: 400 });
  return Response.json({ ok: true });
}
