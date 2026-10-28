"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Form = { name: string; email: string; relationship: "" | "Mamá" | "Papá" | "Tutor/a" };
type Props = { childId: string; childName: string; isOpen: boolean; onClose: () => void };
const initial: Form = { name: "", email: "", relationship: "" };

export default function LinkParentModal({ childId, childName, isOpen, onClose }: Props) {
  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => { if (isOpen) dialogRef.current?.querySelector<HTMLElement>("input")?.focus(); }, [isOpen]);
  function close() { setForm(initial); setErrors({}); setSuccess(""); setLoading(false); onClose(); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const next: Partial<Record<keyof Form, string>> = {};
    if (!form.name.trim()) next.name = "Indica el nombre del padre o madre.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Introduce un email válido.";
    if (!form.relationship) next.relationship = "Selecciona un parentesco.";
    setErrors(next); if (Object.keys(next).length) return;
    setLoading(true); setSuccess("");
    const response = await fetch("/api/invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ childId, ...form }) });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) { setErrors({ email: result.error ?? "No pudimos enviar la invitación." }); return; }
    setSuccess("Invitación enviada correctamente.");
  }
  if (!isOpen) return null;
  return <div className="link-parent-modal-overlay"><section ref={dialogRef} className="link-parent-modal" role="dialog" aria-modal="true" aria-labelledby="link-parent-modal-title">
    <header className="link-parent-modal-header"><div><h2 id="link-parent-modal-title">Vincular padre</h2><p>a {childName}</p></div><button type="button" onClick={close} aria-label="Cerrar modal">×</button></header>
    <form className="link-parent-modal-content" onSubmit={submit} noValidate>
      <div className="link-parent-info"><span aria-hidden="true">ⓘ</span><span>Le enviaremos un correo con un enlace para activar su cuenta. Solo verá el feed de {childName}.</span></div>
      <div className="link-parent-field"><label htmlFor="link-parent-name">Nombre del padre/madre</label><input id="link-parent-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} aria-describedby={errors.name ? "link-parent-name-error" : undefined} required placeholder="Ej. Diego Fernández" />{errors.name && <p id="link-parent-name-error" className="link-parent-error" role="alert">{errors.name}</p>}</div>
      <div className="link-parent-field"><label htmlFor="link-parent-email">Email</label><input id="link-parent-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} aria-describedby={errors.email ? "link-parent-email-error" : undefined} required placeholder="correo@ejemplo.com" />{errors.email && <p id="link-parent-email-error" className="link-parent-error" role="alert">{errors.email}</p>}</div>
      <fieldset className="link-parent-field link-parent-relationship"><legend>Parentesco</legend><div className="link-parent-relationship-options">{(["Mamá", "Papá", "Tutor/a"] as const).map((relationship) => <label key={relationship}><input type="radio" name="relationship" value={relationship} checked={form.relationship === relationship} onChange={() => setForm({ ...form, relationship })} /> <span>{relationship}</span></label>)}</div>{errors.relationship && <p className="link-parent-error" role="alert">{errors.relationship}</p>}</fieldset>
      {success && <p role="status" aria-live="polite">{success}</p>}
      <button type="submit" disabled={loading}>{loading ? "Enviando invitación…" : "Enviar invitación"}</button>
    </form>
  </section></div>;
}

export function LinkParentTrigger({ childId, childName, hasLinkedParents }: { childId: string; childName: string; hasLinkedParents: boolean }) {
  const [isOpen, setIsOpen] = useState(false); const triggerRef = useRef<HTMLButtonElement>(null);
  function close() { setIsOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()); }
  return <><button ref={triggerRef} className="link-parent" type="button" onClick={() => setIsOpen(true)} aria-haspopup="dialog" aria-expanded={isOpen}><span className="link-parent-icon" aria-hidden="true">＋</span>{hasLinkedParents ? "Vincular otro padre" : "Vincular padre"}</button><LinkParentModal childId={childId} childName={childName} isOpen={isOpen} onClose={close} /></>;
}
