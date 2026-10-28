import { cookies } from "next/headers";
import HomeFeed from "@/app/home-feed";
import { createClient } from "@/utils/supabase/server";

type FeedChild = {
  id: string;
  full_name: string;
  rooms: { name: string } | { name: string }[] | null;
};

export default async function Page() {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from("children")
    .select("id, full_name, rooms(name)")
    .eq("status", "active")
    .order("full_name");

  return <HomeFeed linkedChildren={(data ?? []) as FeedChild[]} />;
}
