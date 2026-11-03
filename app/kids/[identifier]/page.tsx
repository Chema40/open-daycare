import { redirect } from "next/navigation";

export default async function KidProfilePage({ params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params;
  redirect(`/staff/kids/${identifier}`);
}
