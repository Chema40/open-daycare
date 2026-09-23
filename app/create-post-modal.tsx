"use client";

import { useState, type FormEvent, type RefObject } from "react";

export type PostRecipient = "Mateo" | "Sofía" | "Benjamín" | "Toda la sala";

export type PostType =
  | "Comida"
  | "Siesta"
  | "Actividad"
  | "Logro"
  | "Ánimo"
  | "Foto"
  | "Anuncio";

export type CreatePostForm = {
  recipient: PostRecipient | "";
  type: PostType | "";
};

const emptyForm: CreatePostForm = {
  recipient: "",
  type: "",
};

const recipients: PostRecipient[] = [
  "Mateo",
  "Sofía",
  "Benjamín",
  "Toda la sala",
];

const postTypes: PostType[] = [
  "Comida",
  "Siesta",
  "Actividad",
  "Logro",
  "Ánimo",
  "Foto",
  "Anuncio",
];

export type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  originRef?: RefObject<HTMLElement | null>;
};

export default function CreatePostModal({
  isOpen,
  onClose,
  originRef,
}: CreatePostModalProps) {
  const [form, setForm] = useState<CreatePostForm>(emptyForm);

  if (!isOpen) {
    return null;
  }

  void originRef;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    onClose();
  };

  return (
    <div className="create-post-modal-overlay">
      <section
        className="create-post-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-modal-title"
      >
        <form onSubmit={handleSubmit}>
          <header className="create-post-modal-header">
            <button type="button" onClick={handleCancel}>
              Cancelar
            </button>
            <h2 id="create-post-modal-title">Nueva publicación</h2>
            <button type="submit">Publicar</button>
          </header>

          <div className="create-post-modal-body">
            <fieldset className="create-post-fieldset">
              <legend>Para</legend>
              <div className="create-post-options">
                {recipients.map((recipient) => (
                  <label key={recipient}>
                    <input
                      type="radio"
                      name="recipient"
                      value={recipient}
                      checked={form.recipient === recipient}
                      onChange={() => setForm({ ...form, recipient })}
                    />
                    <span aria-hidden="true">{recipient === "Toda la sala" ? "" : recipient[0]}</span>
                    {recipient}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="create-post-fieldset">
              <legend>Tipo</legend>
              <div className="create-post-options">
                {postTypes.map((postType) => (
                  <label key={postType}>
                    <input
                      type="radio"
                      name="type"
                      value={postType}
                      checked={form.type === postType}
                      onChange={() => setForm({ ...form, type: postType })}
                    />
                    {postType}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </form>
      </section>
    </div>
  );
}
