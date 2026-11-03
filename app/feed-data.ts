import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatedPost, PostType } from "@/app/create-post-modal";

export type FeedChild = {
  id: string;
  full_name: string;
  room_id: string;
  rooms: { id: string; name: string } | { id: string; name: string }[] | null;
};

type FeedPostRow = {
  id: string;
  title: string;
  body: string;
  type: string;
  room_id: string | null;
  rooms: { name: string } | { name: string }[] | null;
  post_children: { children: { full_name: string } | { full_name: string }[] | null }[];
  post_photos: { url: string }[];
};

const typeLabels: Record<string, PostType> = { meal: "Comida", nap: "Siesta", activity: "Actividad", achievement: "Logro", mood: "Ánimo", photo: "Foto", announcement: "Anuncio" };

export async function loadFeedData(supabase: SupabaseClient) {
  const [{ data: children }, { data: postRows }] = await Promise.all([
    supabase.from("children").select("id, full_name, room_id, rooms(id, name)").eq("status", "active").order("full_name"),
    supabase.from("posts").select("id, title, body, type, room_id, rooms(name), post_children(children(full_name)), post_photos(url)").order("published_at", { ascending: false }),
  ]);

  const initialPosts = await Promise.all(((postRows ?? []) as unknown as FeedPostRow[]).map(async (post) => {
    const photoPath = post.post_photos?.[0]?.url;
    const signed = photoPath ? await supabase.storage.from("post-photos").createSignedUrl(photoPath, 3600) : { data: null };
    const childNames = (post.post_children ?? []).flatMap((relation) => {
      const child = relation.children;
      return Array.isArray(child) ? child.map((item) => item.full_name) : child ? [child.full_name] : [];
    });
    const room = Array.isArray(post.rooms) ? post.rooms[0]?.name : post.rooms?.name;
    return { id: post.id, title: post.title, body: post.body, type: typeLabels[post.type] ?? "Anuncio", childNames, roomName: room, photo: signed.data?.signedUrl } satisfies CreatedPost;
  }));

  return { children: (children ?? []) as FeedChild[], initialPosts };
}
