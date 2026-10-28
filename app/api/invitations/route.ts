import { randomInt } from "node:crypto";
import { Resend } from "resend";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function invitationCode() {
  return Array.from({ length: 5 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Necesitas iniciar sesión." }, { status: 401 });
  const body = await request.json().catch(() => null) as { childId?: string; name?: string; email?: string; relationship?: string } | null;
  const relationships: Record<string, "mother" | "father" | "guardian"> = { Mamá: "mother", Papá: "father", "Tutor/a": "guardian" };
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const relationship = body?.relationship ? relationships[body.relationship] : undefined;
  if (!body?.childId || !name || !email || !relationship || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "Completa nombre, email y parentesco correctamente." }, { status: 400 });
  }
  const { data: profile } = await supabase.from("users").select("role, status, daycare_id").eq("id", user.id).maybeSingle();
  const { data: child } = await supabase.from("children").select("id, full_name, rooms(name)").eq("id", body.childId).eq("status", "active").maybeSingle();
  if (!profile || !["staff", "admin"].includes(profile.role) || profile.status !== "active" || !child) {
    return Response.json({ error: "No tienes permisos para invitar a este padre." }, { status: 403 });
  }
  const code = invitationCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: invitation, error } = await supabase.from("invitations").insert({ child_id: body.childId, invited_by: user.id, full_name: name, email, relationship, code, expires_at: expiresAt }).select("id").single();
  if (error || !invitation) return Response.json({ error: "No pudimos crear la invitación." }, { status: 500 });
  const roomValue = child.rooms as unknown as { name?: string } | { name?: string }[] | null;
  const room = Array.isArray(roomValue) ? roomValue[0]?.name : roomValue?.name;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return Response.json({ error: "El correo no está configurado todavía." }, { status: 503 });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL, to: [email], subject: "Tu invitación a OpenDayCare",
    html: `<div style="font-family:Arial,sans-serif"><h1>OpenDayCare</h1><p>Hola ${name}, te invitaron a seguir a <strong>${child.full_name}</strong> · Sala ${room ?? ""}.</p><p>Tu código es <strong>${code}</strong>.</p><p>Vence el ${new Date(expiresAt).toLocaleDateString("es-AR")}.</p><p><a href="${appUrl}/activate-account?code=${code}">Activar mi cuenta</a></p><p>Solo tendrás acceso a la información de tus hijos vinculados.</p></div>`,
  });
  if (emailError) return Response.json({ error: "La invitación se creó, pero no pudimos enviar el correo." }, { status: 502 });
  return Response.json({ expiresAt });
}
