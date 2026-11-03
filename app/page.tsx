import { notFound, redirect } from "next/navigation";
import { destinationForRole, getCurrentUserContext } from "@/utils/auth";

export default async function Page() {
  const { user, profile } = await getCurrentUserContext();
  if (!user) redirect("/login");
  if (!profile || profile.status !== "active") notFound();
  redirect(destinationForRole(profile.role));
}
