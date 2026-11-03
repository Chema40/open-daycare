import { cookies } from "next/headers";
import HomeFeed from "@/app/home-feed";
import type { CreatedPost, PostType } from "@/app/create-post-modal";
import { createClient } from "@/utils/supabase/server";

type FeedChild = {
  id: string;
  full_name: string;
  room_id: string;
  rooms: { id: string; name: string } | { id: string; name: string }[] | null;
};

type FeedPostRow = { id: string; title: string; body: string; type: string; room_id: string | null; rooms: { name: string } | { name: string }[] | null; post_children: { children: { full_name: string } | { full_name: string }[] | null }[]; post_photos: { url: string }[] };
const typeLabels: Record<string, PostType> = { meal: "Comida", nap: "Siesta", activity: "Actividad", achievement: "Logro", mood: "Ánimo", photo: "Foto", announcement: "Anuncio" };

export default async function Page() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("users").select("role, status").eq("id", user.id).maybeSingle()
    : { data: null };
  const { data } = await supabase
    .from("children")
    .select("id, full_name, room_id, rooms(id, name)")
    .eq("status", "active")
    .order("full_name");
  const { data: postRows } = await supabase.from("posts").select("id, title, body, type, room_id, rooms(name), post_children(children(full_name)), post_photos(url)").order("published_at", { ascending: false });
  const initialPosts = await Promise.all(((postRows ?? []) as unknown as FeedPostRow[]).map(async (post) => {
    const photoPath = post.post_photos?.[0]?.url;
    const signed = photoPath ? await supabase.storage.from("post-photos").createSignedUrl(photoPath, 3600) : { data: null };
    const childNames = (post.post_children ?? []).flatMap((relation) => { const child = relation.children; return Array.isArray(child) ? child.map((item) => item.full_name) : child ? [child.full_name] : []; });
    const room = Array.isArray(post.rooms) ? post.rooms[0]?.name : post.rooms?.name;
    return { id: post.id, title: post.title, body: post.body, type: typeLabels[post.type], childNames, roomName: room, photo: signed.data?.signedUrl } satisfies CreatedPost;
  }));

  return <HomeFeed linkedChildren={(data ?? []) as FeedChild[]} initialPosts={initialPosts} canCreatePosts={profile?.status === "active" && profile.role === "staff"} />;
}
