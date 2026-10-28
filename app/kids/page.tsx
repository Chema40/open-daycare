import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import KidsClient from "./kids-client";
import type { Child, Room } from "./types";

type ChildRow = {
  id: string;
  room_id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[] | null;
  photo_consent: boolean;
  status: "active" | "archived";
  rooms: { name: string }[] | { name: string } | null;
};

export default async function KidsPage() {
  const supabase = createClient(await cookies());
  const [{ data: roomRows }, { data: childRows }] = await Promise.all([
    supabase.from("rooms").select("id, name").order("name"),
    supabase
      .from("children")
      .select("id, room_id, full_name, birth_date, enrolled_at, medical_notes, allergy_tags, photo_consent, status, rooms(name)")
      .eq("status", "active")
      .order("full_name"),
  ]);

  const rooms = (roomRows ?? []) as Room[];
  const children = ((childRows ?? []) as ChildRow[]).map<Child>((child) => ({
    id: child.id,
    roomId: child.room_id,
    roomName: Array.isArray(child.rooms) ? child.rooms[0]?.name ?? "Sin sala" : child.rooms?.name ?? "Sin sala",
    fullName: child.full_name,
    birthDate: child.birth_date,
    enrolledAt: child.enrolled_at,
    medicalNotes: child.medical_notes,
    allergyTags: child.allergy_tags ?? [],
    photoConsent: child.photo_consent,
    status: child.status,
  }));

  return <KidsClient initialRooms={rooms} initialChildren={children} />;
}
