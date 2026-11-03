import { requireRole } from "@/utils/auth";

export default async function FamilyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireRole("parent");
  return children;
}
