import { randomInt } from "node:crypto";
import { Resend } from "resend";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function invitationCode() {
  return Array.from({ length: 5 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(request.url).origin;
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resendApiKey || !resendFromEmail) {
    console.error("Invitation email is not configured: RESEND_API_KEY and RESEND_FROM_EMAIL are required.");
    return Response.json({ error: "El correo no está configurado. Define RESEND_API_KEY y RESEND_FROM_EMAIL en el servidor." }, { status: 503 });
  }
  const resend = new Resend(resendApiKey);
  const safeName = escapeHtml(name);
  const safeChildName = escapeHtml(child.full_name);
  const safeRoom = escapeHtml(room ?? "");
  const activationUrl = `${appUrl.replace(/\/$/, "")}/activate-account?code=${encodeURIComponent(code)}`;
  const { error: emailError } = await resend.emails.send({
    from: resendFromEmail,
    to: [email],
    subject: "Tu invitación a OpenDayCare",
    html: `<div style="font-family:Arial,sans-serif"><h1>OpenDayCare</h1><p>Hola ${safeName}, te invitaron a seguir a <strong>${safeChildName}</strong> · Sala ${safeRoom}.</p><p>Tu código es <strong>${code}</strong>.</p><p>Vence el ${new Date(expiresAt).toLocaleDateString("es-AR")}.</p><p><a href="${activationUrl}">Activar mi cuenta</a></p><p>Solo tendrás acceso a la información de tus hijos vinculados.</p></div>`,
  }, { idempotencyKey: invitation.id });
  if (emailError) {
    console.error("Resend invitation error:", emailError.name, emailError.statusCode, emailError.message);
    return Response.json({ error: "La invitación se creó, pero Resend no pudo enviar el correo. Revisa el remitente y el dominio verificado." }, { status: 502 });
  }
  return Response.json({ expiresAt });
}
