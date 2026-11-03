import { loadFeedData } from "@/app/feed-data";
import HomeFeed from "@/app/home-feed";
import { requireRole } from "@/utils/auth";

export default async function StaffFeedPage() {
  const { supabase, profile } = await requireRole("staff");
  const { children, initialPosts } = await loadFeedData(supabase);
  return <HomeFeed linkedChildren={children} initialPosts={initialPosts} canCreatePosts={profile.status === "active"} panel="staff" profileName={profile.full_name} />;
}
