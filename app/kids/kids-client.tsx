"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Child, ChildForm, Room } from "./types";

type Props = { initialRooms: Room[]; initialChildren: Child[] };
type FormErrors = Partial<Record<keyof ChildForm, string>>;

const emptyForm: ChildForm = {
  fullName: "",
  birthDate: "",
  enrolledAt: "",
  roomId: "",
  allergyTags: "",
  medicalNotes: "",
  photoConsent: true,
};

const avatarColors = [
  ["#A9D9E8", "#1F7A93"],
  ["#F4B8CC", "#C44A7A"],
  ["#B9DEC4", "#3E8B62"],
  ["#F4DC8E", "#9A7B1E"],
  ["#C9B6E8", "#7B5FC0"],
];

function dateLabel(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function avatarFor(name: string) {
  const index = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

function UsersIcon() {
  return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" /></svg>;
}

function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell">
    <aside className="sidebar" aria-label="Navegación principal">
      <Link className="brand" href="/" aria-label="Ir al inicio de OpenDayCare"><span className="brand-mark" aria-hidden="true" /><span className="brand-copy"><strong>OpenDayCare</strong><span>Sala Soles</span></span></Link>
      <a className="new-post-link" href="#"><span aria-hidden="true">＋</span>Nueva publicación</a>
      <nav className="main-nav" aria-label="Secciones de OpenDayCare">
        <Link className="nav-link" href="/"><span aria-hidden="true">⌂</span>Feed</Link>
        <Link className="nav-link is-active" href="/kids" aria-current="page"><UsersIcon />Niños</Link>
        <a className="nav-link" href="#"><span aria-hidden="true">♧</span>Avisos</a>
        <a className="nav-link" href="#"><span aria-hidden="true">♙</span>Mi cuenta</a>
      </nav>
      <div className="profile-summary"><div className="profile-avatar" aria-hidden="true">C</div><div className="profile-copy"><strong>Caro Giménez</strong><span>Maestra · Soles</span></div><a className="logout-link" href="#" aria-label="Cerrar sesión">↪</a></div>
    </aside>
    <main className="feed-main">{children}</main>
  </div>;
}

export default function KidsClient({ initialRooms, initialChildren }: Props) {
  const [rooms] = useState(initialRooms);
  const [children, setChildren] = useState(initialChildren);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<ChildForm>({ ...emptyForm, roomId: initialRooms[0]?.id ?? "" });
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const filteredChildren = useMemo(() => children.filter((child) => child.fullName.toLowerCase().includes(query.toLowerCase())), [children, query]);

  function openCreate() {
    setEditingChild(null);
    setForm({ ...emptyForm, roomId: rooms[0]?.id ?? "" });
    setErrors({});
    setServerError("");
    setIsModalOpen(true);
  }

  function openEdit(child: Child) {
    setEditingChild(child);
    setForm({ fullName: child.fullName, birthDate: child.birthDate, enrolledAt: child.enrolledAt, roomId: child.roomId, allergyTags: child.allergyTags.join(", "), medicalNotes: child.medicalNotes ?? "", photoConsent: child.photoConsent });
    setErrors({});
    setServerError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingChild(null);
    setErrors({});
    setServerError("");
    addButtonRef.current?.focus();
  }

  function validate() {
    const next: FormErrors = {};
    if (!form.fullName.trim()) next.fullName = "Escribe el nombre completo.";
    if (!form.birthDate) next.birthDate = "Selecciona la fecha de nacimiento.";
    if (!form.enrolledAt) next.enrolledAt = "Selecciona la fecha de ingreso.";
    if (form.birthDate && form.enrolledAt && form.enrolledAt < form.birthDate) next.enrolledAt = "El ingreso no puede ser anterior al nacimiento.";
    if (form.birthDate && form.birthDate > new Date().toISOString().slice(0, 10)) next.birthDate = "La fecha de nacimiento no puede ser futura.";
    if (!form.roomId) next.roomId = "Selecciona una sala.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function saveChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    setServerError("");
    const supabase = createClient();
    const payload = {
      room_id: form.roomId,
      full_name: form.fullName.trim(),
      birth_date: form.birthDate,
      enrolled_at: form.enrolledAt,
      medical_notes: form.medicalNotes.trim() || null,
      allergy_tags: form.allergyTags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      photo_consent: form.photoConsent,
    };
    const result = editingChild
      ? await supabase.from("children").update(payload).eq("id", editingChild.id).select().single()
      : await supabase.from("children").insert(payload).select().single();
    if (result.error) {
      setServerError("No se pudo guardar el niño. Comprueba tu sesión e inténtalo de nuevo.");
      setIsSaving(false);
      return;
    }
    const roomName = rooms.find((room) => room.id === form.roomId)?.name ?? "Sin sala";
    const saved: Child = { id: result.data.id, roomId: result.data.room_id, roomName, fullName: result.data.full_name, birthDate: result.data.birth_date, enrolledAt: result.data.enrolled_at, medicalNotes: result.data.medical_notes, allergyTags: result.data.allergy_tags ?? [], photoConsent: result.data.photo_consent, status: result.data.status };
    setChildren((current) => editingChild ? current.map((child) => child.id === saved.id ? saved : child) : [...current, saved].sort((a, b) => a.fullName.localeCompare(b.fullName)));
    setIsSaving(false);
    closeModal();
  }

  async function archiveChild(child: Child) {
    if (!window.confirm(`¿Archivar a ${child.fullName}?`)) return;
    const { error } = await createClient().from("children").update({ status: "archived" }).eq("id", child.id);
    if (error) {
      setServerError("No se pudo archivar el niño.");
      return;
    }
    setChildren((current) => current.filter((item) => item.id !== child.id));
  }

  return <AppShell><div className="kids-container">
    <header className="kids-header"><div><p className="eyebrow">GESTIÓN</p><h1>Niños</h1></div><button className="add-kid-link" ref={addButtonRef} type="button" onClick={openCreate}><span aria-hidden="true">＋</span>Agregar niño</button></header>
    <div className="kids-search"><span aria-hidden="true">⌕</span><input aria-label="Buscar niño" placeholder="Buscar niño…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    <p className="kids-live-region" aria-live="polite">{children.length} {children.length === 1 ? "niño activo" : "niños activos"}</p>
    {serverError && <p className="kids-server-error" role="alert">{serverError}</p>}
    {!children.length ? <section className="kids-empty" aria-labelledby="kids-empty-title"><span aria-hidden="true">♡</span><h2 id="kids-empty-title">Aún no hay niños registrados</h2><p>Agrega el primer niño para comenzar a gestionar la sala.</p><button className="add-kid-link" type="button" onClick={openCreate}>Agregar niño</button></section> : rooms.map((room) => {
      const roomChildren = filteredChildren.filter((child) => child.roomId === room.id);
      return <section key={room.id} aria-labelledby={`room-${room.id}`}><div className="room-heading"><span id={`room-${room.id}`}>SALA {room.name.toUpperCase()}</span><span>{roomChildren.length} {roomChildren.length === 1 ? "niño" : "niños"}</span><span aria-hidden="true" /></div><div className="kids-grid">{roomChildren.map((child) => { const [backgroundColor, color] = avatarFor(child.fullName); return <article className="kid-card" key={child.id}><Link className="kid-card-link" href={`/kids/${child.id}`}><span className="kid-avatar" style={{ backgroundColor, color }} aria-hidden="true">{child.fullName[0]?.toUpperCase()}</span><span className="kid-card-copy"><strong>{child.fullName}</strong><span>{dateLabel(child.birthDate)} · {child.allergyTags.length ? child.allergyTags.join(", ") : "sin alergias registradas"}</span></span></Link><div className="kid-card-actions"><button type="button" onClick={() => openEdit(child)}>Editar</button><button type="button" onClick={() => archiveChild(child)}>Archivar</button></div></article>; })}</div></section>;
    })}
    {children.length > 0 && !filteredChildren.length && <p className="kids-empty-search">No encontramos niños con ese nombre.</p>}
  </div>{isModalOpen && <div className="add-kid-modal-overlay"><section className="add-kid-modal" role="dialog" aria-modal="true" aria-labelledby="child-modal-title"><form noValidate onSubmit={saveChild}><header className="add-kid-modal-header"><button className="add-kid-modal-cancel" type="button" onClick={closeModal}>Cancelar</button><h2 id="child-modal-title">{editingChild ? "Editar niño" : "Agregar niño"}</h2><button className="add-kid-modal-submit" type="submit" disabled={isSaving}>{isSaving ? "Guardando…" : "Guardar"}</button></header><div className="add-kid-modal-body"><p className="add-kid-modal-description">Completa los datos del niño. Los campos marcados son obligatorios.</p><Field label="Nombre completo" id="child-full-name" error={errors.fullName}><input id="child-full-name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Ej. Martina López" /></Field><div className="add-kid-field-row"><Field label="Fecha de nacimiento" id="child-birth-date" error={errors.birthDate}><input id="child-birth-date" type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} /></Field><Field label="Fecha de ingreso" id="child-enrolled-at" error={errors.enrolledAt}><input id="child-enrolled-at" type="date" value={form.enrolledAt} onChange={(event) => setForm({ ...form, enrolledAt: event.target.value })} /></Field></div><Field label="Sala" id="child-room" error={errors.roomId}><select id="child-room" value={form.roomId} onChange={(event) => setForm({ ...form, roomId: event.target.value })}><option value="">Selecciona una sala</option>{rooms.map((room) => <option value={room.id} key={room.id}>{room.name}</option>)}</select></Field><Field label="Alergias (separadas por coma)" id="child-allergies"><input id="child-allergies" value={form.allergyTags} onChange={(event) => setForm({ ...form, allergyTags: event.target.value })} placeholder="peanut, lactose" /></Field><Field label="Notas médicas" id="child-notes"><textarea id="child-notes" value={form.medicalNotes} onChange={(event) => setForm({ ...form, medicalNotes: event.target.value })} /><label className="child-consent"><input type="checkbox" checked={form.photoConsent} onChange={(event) => setForm({ ...form, photoConsent: event.target.checked })} /> Tiene consentimiento para fotos</label></Field>{serverError && <p className="add-kid-field-error" role="alert">{serverError}</p>}</div></form></section></div>}</AppShell>;
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return <div className="add-kid-field"><label htmlFor={id}>{label}</label>{children}{error && <p className="add-kid-field-error" role="alert">{error}</p>}</div>;
}
