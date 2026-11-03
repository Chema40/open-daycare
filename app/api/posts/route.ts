import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const typeMap: Record<string, string> = {
  Comida: "meal",
  Siesta: "nap",
  Actividad: "activity",
  Logro: "achievement",
  Ánimo: "mood",
  Foto: "photo",
  Anuncio: "announcement",
};

const maxFileSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Debés iniciar sesión." }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("id, daycare_id, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "staff" || profile.status !== "active") {
    return Response.json({ error: "Solo los miembros del staff pueden publicar." }, { status: 403 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const type = typeMap[String(formData.get("type") ?? "")];
  const childIds = String(formData.get("childIds") ?? "").split(",").filter(Boolean);
  const roomId = String(formData.get("roomId") ?? "").trim() || null;
  const fileValue = formData.get("photo");
  const files = fileValue instanceof File && fileValue.size > 0 ? [fileValue] : [];

  if (!title || !body || !type || (childIds.length === 0 && !roomId)) {
    return Response.json({ error: "Completá el destinatario, el tipo, el título y la descripción." }, { status: 400 });
  }
  if (files.some((file) => !file.type.startsWith("image/") || file.size > maxFileSize)) {
    return Response.json({ error: "La imagen debe ser válida y pesar menos de 10 MB." }, { status: 400 });
  }

  const childrenResult = childIds.length
    ? await supabase.from("children").select("id, room_id, rooms!inner(daycare_id)").in("id", childIds)
    : { data: [] as { id: string; room_id: string; rooms?: { daycare_id: string }[] }[] };
  const children = childrenResult.data as Array<{ id: string; room_id: string; rooms?: { daycare_id: string }[] }> | null;

  if (childIds.length && (!children || children.length !== childIds.length || children.some((child) => {
    const room = Array.isArray(child.rooms) ? child.rooms[0] : child.rooms;
    return room?.daycare_id !== profile.daycare_id;
  }))) {
    return Response.json({ error: "El destinatario no pertenece a tu guardería." }, { status: 403 });
  }

  if (roomId) {
    const { data: room } = await supabase.from("rooms").select("id").eq("id", roomId).eq("daycare_id", profile.daycare_id).maybeSingle();
    if (!room) return Response.json({ error: "La sala no pertenece a tu guardería." }, { status: 403 });
  }

  const postId = randomUUID();
  const uploadedPaths: string[] = [];
  for (const [position, file] of files.entries()) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${postId}/${position}.${extension}`;
    const { error } = await supabase.storage.from("post-photos").upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      if (uploadedPaths.length) await supabase.storage.from("post-photos").remove(uploadedPaths);
      return Response.json({ error: "No se pudieron subir las imágenes." }, { status: 500 });
    }
    uploadedPaths.push(path);
  }

  const { error: postError } = await supabase.from("posts").insert({
    id: postId, author_id: user.id, room_id: roomId, type, title, body,
  });
  if (postError) {
    if (uploadedPaths.length) await supabase.storage.from("post-photos").remove(uploadedPaths);
    return Response.json({ error: "No se pudo crear la publicación." }, { status: 500 });
  }

  if (childIds.length) {
    const { error } = await supabase.from("post_children").insert(childIds.map((child_id) => ({ post_id: postId, child_id })));
    if (error) return Response.json({ error: "No se pudo asignar el destinatario." }, { status: 500 });
  }
  if (uploadedPaths.length) {
    const { error } = await supabase.from("post_photos").insert(uploadedPaths.map((url, position) => ({ post_id: postId, url, position })));
    if (error) return Response.json({ error: "No se pudo guardar el registro de las imágenes." }, { status: 500 });
  }

  return Response.json({ id: postId }, { status: 201 });
}
