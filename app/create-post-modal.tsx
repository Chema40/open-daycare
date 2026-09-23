"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";

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
  description: string;
};

export type CreatePostErrors = Partial<
  Record<"recipient" | "type" | "description", string>
>;

const emptyForm: CreatePostForm = {
  recipient: "",
  type: "",
  description: "",
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

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
  const [errors, setErrors] = useState<CreatePostErrors>({});
  const modalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const modal = modalRef.current;
    const origin = originRef?.current;

    if (!modal) {
      return;
    }

    const getFocusableElements = () =>
      Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));

    getFocusableElements()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      if (
        event.shiftKey &&
        (activeElement === firstElement || !modal.contains(activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || !modal.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      origin?.focus();
    };
  }, [isOpen, originRef]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: CreatePostErrors = {};

    if (!form.recipient) {
      nextErrors.recipient = "Elegí un destinatario.";
    }

    if (!form.type) {
      nextErrors.type = "Elegí un tipo de publicación.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Escribí una descripción.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setForm(emptyForm);
    onClose();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  return (
    <div className="create-post-modal-overlay">
      <section
        ref={modalRef}
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
            <fieldset
              className="create-post-fieldset"
              aria-invalid={Boolean(errors.recipient)}
              aria-describedby={errors.recipient ? "create-post-recipient-error" : undefined}
            >
              <legend>Para</legend>
              <div className="create-post-options">
                {recipients.map((recipient) => (
                  <label key={recipient}>
                    <input
                      type="radio"
                      name="recipient"
                      value={recipient}
                      checked={form.recipient === recipient}
                      aria-describedby={errors.recipient ? "create-post-recipient-error" : undefined}
                      onChange={() => setForm({ ...form, recipient })}
                    />
                    <span aria-hidden="true">{recipient === "Toda la sala" ? "" : recipient[0]}</span>
                    {recipient}
                  </label>
                ))}
              </div>
              {errors.recipient && (
                <p id="create-post-recipient-error" role="alert">
                  {errors.recipient}
                </p>
              )}
            </fieldset>

            <fieldset
              className="create-post-fieldset"
              aria-invalid={Boolean(errors.type)}
              aria-describedby={errors.type ? "create-post-type-error" : undefined}
            >
              <legend>Tipo</legend>
              <div className="create-post-options">
                {postTypes.map((postType) => (
                  <label key={postType}>
                    <input
                      type="radio"
                      name="type"
                      value={postType}
                      checked={form.type === postType}
                      aria-describedby={errors.type ? "create-post-type-error" : undefined}
                      onChange={() => setForm({ ...form, type: postType })}
                    />
                    {postType}
                  </label>
                ))}
              </div>
              {errors.type && (
                <p id="create-post-type-error" role="alert">
                  {errors.type}
                </p>
              )}
            </fieldset>

            <div className="create-post-fieldset">
              <label htmlFor="create-post-description">Descripción</label>
              <textarea
                id="create-post-description"
                name="description"
                placeholder="Contá cómo le fue hoy…"
                value={form.description}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "create-post-description-error" : undefined}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
              {errors.description && (
                <p id="create-post-description-error" role="alert">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="create-post-fieldset">
              <span>Fotos</span>
              <div className="create-post-photos">
                <div className="create-post-photo-placeholder" aria-label="Sin foto seleccionada">
                  <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
                  </svg>
                </div>
                <button className="create-post-add-photo" type="button">
                  <span aria-hidden="true">+</span>
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
