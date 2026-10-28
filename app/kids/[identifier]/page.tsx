import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LinkParentTrigger } from "./link-parent-modal";

type ChildRow = {
  id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[] | null;
  photo_consent: boolean;
  rooms: { name: string }[] | { name: string } | null;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function ageLabel(value: string) {
  const birthDate = new Date(`${value}T00:00:00Z`);
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday = today.getUTCMonth() < birthDate.getUTCMonth() || (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return `${age} ${age === 1 ? "año" : "años"}`;
}

export default async function KidProfilePage({ params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params;
  const supabase = createClient(await cookies());
  const { data } = await supabase.from("children").select("id, full_name, birth_date, enrolled_at, medical_notes, allergy_tags, photo_consent, rooms(name)").eq("id", identifier).eq("status", "active").maybeSingle();
  const kid = data as ChildRow | null;
  if (!kid) notFound();

  const roomName = Array.isArray(kid.rooms) ? kid.rooms[0]?.name ?? "Sin sala" : kid.rooms?.name ?? "Sin sala";
  const allergies = kid.allergy_tags ?? [];

  return <div className="app-shell">
    <aside className="sidebar" aria-label="Navegación principal">
      <Link className="brand" href="/" aria-label="Ir al inicio de OpenDayCare"><span className="brand-mark" aria-hidden="true" /><span className="brand-copy"><strong>OpenDayCare</strong><span>Sala Soles</span></span></Link>
      <a className="new-post-link" href="#"><span aria-hidden="true">＋</span>Nueva publicación</a>
      <nav className="main-nav" aria-label="Secciones de OpenDayCare"><Link className="nav-link" href="/"><span aria-hidden="true">⌂</span>Feed</Link><Link className="nav-link is-active" href="/kids" aria-current="page"><span aria-hidden="true">♧</span>Niños</Link><a className="nav-link" href="#"><span aria-hidden="true">♧</span>Avisos</a><a className="nav-link" href="#"><span aria-hidden="true">♙</span>Mi cuenta</a></nav>
      <div className="profile-summary"><div className="profile-avatar" aria-hidden="true">C</div><div className="profile-copy"><strong>Caro Giménez</strong><span>Maestra · Soles</span></div><a className="logout-link" href="#" aria-label="Cerrar sesión">↪</a></div>
    </aside>
    <main className="feed-main"><div className="profile-container"><Link className="back-to-kids" href="/kids">← Volver a Niños</Link><div className="profile-layout"><div className="profile-main-column"><header className="kid-profile-header"><div className="kid-profile-avatar" aria-hidden="true">{kid.full_name[0]?.toUpperCase()}</div><div className="kid-profile-heading"><h1>{kid.full_name}</h1><p>{ageLabel(kid.birth_date)} · Sala {roomName}</p></div><Link className="edit-kid-link" href="/kids">Editar</Link></header><section className="notes-alert" aria-labelledby="notes-heading"><div className="notes-icon" aria-hidden="true">!</div><div><h2 id="notes-heading">Alergias y notas</h2><p>{allergies.length ? `Alergias: ${allergies.join(", ")}. ` : ""}{kid.medical_notes ?? "Sin alergias ni notas registradas."}</p></div></section><dl className="kid-details"><div><dt>Fecha de nacimiento</dt><dd>{dateLabel(kid.birth_date)}</dd></div><div><dt>Sala</dt><dd>{roomName}</dd></div><div><dt>Ingreso</dt><dd>{dateLabel(kid.enrolled_at)}</dd></div><div><dt>Consentimiento de fotos</dt><dd>{kid.photo_consent ? "Sí" : "No"}</dd></div></dl></div><aside className="profile-side-column"><a className="day-summary-link" href="#"><span className="sun-icon" aria-hidden="true">✦</span>Resumen del día</a><section className="linked-parents" aria-labelledby="parents-heading"><h2 id="parents-heading">Padres vinculados</h2><div className="linked-parents-list"><p className="no-linked-parents">Todavía no hay padres vinculados.</p><LinkParentTrigger childId={kid.id} childName={kid.full_name} hasLinkedParents={false} /></div></section></aside></div></div></main>
  </div>;
}
