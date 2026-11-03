"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";

export type PostType = "Comida" | "Siesta" | "Actividad" | "Logro" | "Ánimo" | "Foto" | "Anuncio";
export type PostChild = { id: string; full_name: string; room_id: string; room_name: string };
export type CreatedPost = { id: string; title: string; body: string; type: PostType; childNames: string[]; roomName?: string; photo?: string };
type Errors = Partial<Record<"recipient" | "type" | "title" | "description", string>>;
type Props = { isOpen: boolean; onClose: () => void; originRef?: RefObject<HTMLElement | null>; postChildren: PostChild[]; onCreated?: (post: CreatedPost) => void };

const postTypes: PostType[] = ["Comida", "Siesta", "Actividad", "Logro", "Ánimo", "Foto", "Anuncio"];
const focusableSelector = 'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])';

export default function CreatePostModal({ isOpen, onClose, originRef, postChildren, onCreated }: Props) {
  const [childIds, setChildIds] = useState<string[]>([]);
  const [roomId, setRoomId] = useState("");
  const [type, setType] = useState<PostType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLElement | null>(null);
  const rooms = Array.from(new Map(postChildren.map((child) => [child.room_id, child.room_name])).entries());

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    setChildIds([]); setRoomId(""); setType(""); setTitle(""); setDescription(""); setPhoto(null); setErrors({}); setServerError("");
    const modal = modalRef.current;
    const origin = originRef?.current;
    const getFocusable = () => Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
    getFocusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); return; }
      if (event.key !== "Tab") return;
      const elements = getFocusable(), first = elements[0], last = elements[elements.length - 1];
      if (!first || !last) return event.preventDefault();
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); origin?.focus(); };
  }, [isOpen, originRef]);

  if (!isOpen) return null;

  const toggleChild = (id: string) => { setRoomId(""); setChildIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); };
  const reset = () => { setChildIds([]); setRoomId(""); setType(""); setTitle(""); setDescription(""); setPhoto(null); setErrors({}); setServerError(""); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {};
    if (!childIds.length && !roomId) next.recipient = "Elegí uno o más niños o una sala.";
    if (!type) next.type = "Elegí un tipo de publicación.";
    if (!title.trim()) next.title = "Escribí un título.";
    if (!description.trim()) next.description = "Escribí una descripción.";
    setErrors(next);
    if (Object.keys(next).length || isSubmitting || !type) return;
    const data = new FormData();
    data.set("title", title.trim()); data.set("body", description.trim()); data.set("type", type);
    if (childIds.length) data.set("childIds", childIds.join(",")); else data.set("roomId", roomId);
    if (photo) data.set("photo", photo);
    setIsSubmitting(true); setServerError("");
    try {
      const response = await fetch("/api/posts", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No se pudo publicar.");
      onCreated?.({ id: result.id, title: title.trim(), body: description.trim(), type, childNames: postChildren.filter((child) => childIds.includes(child.id)).map((child) => child.full_name), roomName: rooms.find(([id]) => id === roomId)?.[1], photo: photo ? URL.createObjectURL(photo) : undefined });
      reset(); onClose();
    } catch (error) { setServerError(error instanceof Error ? error.message : "No se pudo publicar."); }
    finally { setIsSubmitting(false); }
  };

  return <div className="create-post-modal-overlay"><section ref={modalRef} className="create-post-modal" role="dialog" aria-modal="true" aria-labelledby="create-post-modal-title">
    <form onSubmit={submit}>
      <header className="create-post-modal-header"><button type="button" onClick={() => { reset(); onClose(); }}>Cancelar</button><h2 id="create-post-modal-title">Nueva publicación</h2><button type="submit" disabled={isSubmitting}>{isSubmitting ? "Publicando…" : "Publicar"}</button></header>
      <div className="create-post-modal-body">
        <fieldset className="create-post-fieldset" aria-invalid={Boolean(errors.recipient)}><legend>Para</legend><div className="create-post-options">
          {postChildren.map((child) => <label key={child.id}><input type="checkbox" checked={childIds.includes(child.id)} onChange={() => toggleChild(child.id)} /><span className="recipient-avatar" aria-hidden="true">{child.full_name[0]}</span>{child.full_name}</label>)}
          {rooms.map(([id, name]) => <label key={id}><input type="radio" name="room" checked={roomId === id} onChange={() => { setRoomId(id); setChildIds([]); }} />Toda la sala · {name}</label>)}
        </div>{errors.recipient && <p role="alert">{errors.recipient}</p>}</fieldset>
        <fieldset className="create-post-fieldset" aria-invalid={Boolean(errors.type)}><legend>Tipo</legend><div className="create-post-options">{postTypes.map((item) => <label key={item} className={`post-type-${item.toLowerCase()}`}><input type="radio" name="type" checked={type === item} onChange={() => setType(item)} />{item}</label>)}</div>{errors.type && <p role="alert">{errors.type}</p>}</fieldset>
        <div className="create-post-fieldset"><label htmlFor="create-post-title">Título</label><input id="create-post-title" value={title} aria-invalid={Boolean(errors.title)} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Pintamos con témperas" />{errors.title && <p role="alert">{errors.title}</p>}</div>
        <div className="create-post-fieldset"><label htmlFor="create-post-description">Descripción</label><textarea id="create-post-description" value={description} aria-invalid={Boolean(errors.description)} onChange={(event) => setDescription(event.target.value)} placeholder="Contá cómo le fue hoy…" />{errors.description && <p role="alert">{errors.description}</p>}</div>
        <div className="create-post-fieldset"><span>Foto (opcional)</span><div className="create-post-photos"><div className="create-post-photo-placeholder" aria-label={photo?.name ?? "Sin foto seleccionada"}>{photo ? photo.name : "Sin foto"}</div><input id="create-post-photo" type="file" accept="image/*" hidden onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} /><label className="create-post-add-photo" htmlFor="create-post-photo"><span aria-hidden="true">+</span>{photo ? "Cambiar" : "Agregar"}</label></div></div>
        {serverError && <p className="create-post-server-error" role="alert">{serverError}</p>}
      </div>
    </form>
  </section></div>;
}
