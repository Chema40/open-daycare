import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type AppRole = "staff" | "parent" | "admin";

export type UserProfile = {
  id: string;
  role: AppRole;
  status: "pending" | "active";
  full_name: string;
};

const appRoles = new Set<AppRole>(["staff", "parent", "admin"]);
const profileStatuses = new Set<UserProfile["status"]>(["pending", "active"]);

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== "object") return false;

  const profile = value as Partial<UserProfile>;
  return (
    typeof profile.id === "string" &&
    typeof profile.full_name === "string" &&
    typeof profile.role === "string" &&
    appRoles.has(profile.role as AppRole) &&
    typeof profile.status === "string" &&
    profileStatuses.has(profile.status as UserProfile["status"])
  );
}

export async function getCurrentUserContext() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, status, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile: isUserProfile(profile) ? profile : null };
}

export function destinationForRole(role: AppRole) {
  return role === "staff" ? "/staff/feed" : role === "parent" ? "/family/feed" : "/admin";
}

export async function requireRole(role: AppRole) {
  const context = await getCurrentUserContext();

  if (!context.user) redirect("/login");
  if (!context.profile || context.profile.status !== "active") notFound();
  if (context.profile.role !== role) redirect(destinationForRole(context.profile.role));

  return context as typeof context & { user: NonNullable<typeof context.user>; profile: UserProfile };
}
