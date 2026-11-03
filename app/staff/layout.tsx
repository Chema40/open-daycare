import { requireRole } from "@/utils/auth";

export default async function StaffLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireRole("staff");
  return children;
}
