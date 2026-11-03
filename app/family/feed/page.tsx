import { loadFeedData } from "@/app/feed-data";
import HomeFeed from "@/app/home-feed";
import { requireRole } from "@/utils/auth";

export default async function FamilyFeedPage() {
  const { supabase, profile } = await requireRole("parent");
  const { children, initialPosts } = await loadFeedData(supabase);
  return <HomeFeed linkedChildren={children} initialPosts={initialPosts} canCreatePosts={false} panel="family" profileName={profile.full_name} />;
}
