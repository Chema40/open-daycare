"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type LinkParentForm = {
  name: string;
  email: string;
  relationship: "" | "Mamá" | "Papá" | "Tutor/a";
};

type LinkParentStep = "form" | "verification";

type LinkParentErrors = Partial<Record<keyof LinkParentForm, string>>;

type LinkParentModalProps = {
  childName: string;
  isOpen: boolean;
  onClose: () => void;
};

type LinkParentTriggerProps = {
  childName: string;
  hasLinkedParents: boolean;
};

const initialForm: LinkParentForm = {
  name: "",
  email: "",
  relationship: "",
};

export default function LinkParentModal({
  childName,
  isOpen,
  onClose,
}: LinkParentModalProps) {
  const [form, setForm] = useState<LinkParentForm>(initialForm);
  const [step, setStep] = useState<LinkParentStep>("form");
  const [errors, setErrors] = useState<LinkParentErrors>({});
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClose() {
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
    }
    if (resendTimeoutRef.current) {
      clearTimeout(resendTimeoutRef.current);
    }
    setForm(initialForm);
    setStep("form");
    setErrors({});
    setVerificationCode("");
    setVerificationError("");
    setResendMessage("");
    setConfirmationVisible(false);
    onClose();
  }

  useEffect(() => {
    if (!isOpen || !dialogRef.current) {
      return;
    }

    const dialog = dialogRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstInput = dialog.querySelector<HTMLElement>(
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );
    const focusableElements = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));

    (firstInput ?? dialog.querySelector<HTMLElement>(focusableSelector))?.focus();

    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") {
        return;
      }

      const elements = focusableElements();
      if (!elements.length) {
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", trapFocus);

    return () => {
      document.removeEventListener("keydown", trapFocus);
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
      }
      if (resendTimeoutRef.current) {
        clearTimeout(resendTimeoutRef.current);
      }
    };
  }, [isOpen, step]);

  function validateForm() {
    const nextErrors: LinkParentErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Indica el nombre del padre o madre.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Indica un email.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Introduce un email válido.";
    }

    if (!form.relationship) {
      nextErrors.relationship = "Selecciona un parentesco.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (validateForm()) {
      setStep("verification");
    }
  }

  function handleVerificationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (verificationCode !== "123456") {
      setVerificationError("El código de verificación no es correcto.");
      return;
    }

    setVerificationError("");
    setConfirmationVisible(true);
    confirmationTimeoutRef.current = setTimeout(handleClose, 1400);
  }

  function handleResend() {
    setResendMessage("Código reenviado visualmente. Revisa tu email.");

    if (resendTimeoutRef.current) {
      clearTimeout(resendTimeoutRef.current);
    }

    resendTimeoutRef.current = setTimeout(() => {
      setResendMessage("");
    }, 2200);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="link-parent-modal-overlay">
      <section
        ref={dialogRef}
        className="link-parent-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-parent-modal-title"
      >
        <header className="link-parent-modal-header">
          <div>
            <h2 id="link-parent-modal-title">Vincular padre</h2>
            <p>a {childName}</p>
          </div>
          <button type="button" onClick={handleClose} aria-label="Cerrar modal">
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {step === "form" ? (
          <form
            className="link-parent-modal-content"
            onSubmit={handleSubmit}
            noValidate
            data-step={step}
          >
            <div className="link-parent-info">
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>
                Le enviaremos un correo con un código para que active su cuenta. Solo verá el
                feed de {childName}.
              </span>
            </div>

            <div className="link-parent-field">
              <label htmlFor="link-parent-name">Nombre del padre/madre</label>
              <input
                id="link-parent-name"
                name="name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "link-parent-name-error" : undefined}
                required
                placeholder="Ej. Diego Fernández"
              />
              {errors.name && (
                <p id="link-parent-name-error" className="link-parent-error" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="link-parent-field">
              <label htmlFor="link-parent-email">Email</label>
              <input
                id="link-parent-email"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "link-parent-email-error" : undefined}
                required
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <p id="link-parent-email-error" className="link-parent-error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <fieldset
              className="link-parent-field link-parent-relationship"
              aria-describedby={errors.relationship ? "link-parent-relationship-error" : undefined}
            >
              <legend>Parentesco</legend>
              <div className="link-parent-relationship-options">
                {(["Mamá", "Papá", "Tutor/a"] as const).map((relationship) => (
                  <label key={relationship}>
                    <input
                      type="radio"
                      name="relationship"
                      value={relationship}
                      checked={form.relationship === relationship}
                      onChange={() =>
                        setForm((current) => ({ ...current, relationship }))
                      }
                      required={relationship === "Mamá"}
                    />
                    <span>{relationship}</span>
                  </label>
                ))}
              </div>
              {errors.relationship && (
                <p id="link-parent-relationship-error" className="link-parent-error" role="alert">
                  {errors.relationship}
                </p>
              )}
            </fieldset>

            <div className="link-parent-invitation-code">
              <span>Código de invitación</span>
              <strong>7K4P9</strong>
              <small>Vence en 7 días</small>
            </div>

            <button type="submit">Enviar invitación</button>
          </form>
        ) : (
          <form
            className="link-parent-modal-content"
            onSubmit={handleVerificationSubmit}
            noValidate
            data-step={step}
          >
            <p>
              Hemos enviado un código de verificación a <strong>{form.email}</strong>.
            </p>

            <div className="link-parent-field">
              <label htmlFor="link-parent-verification-code">Código de verificación</label>
              <input
                id="link-parent-verification-code"
                name="verificationCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verificationCode}
                onChange={(event) => {
                  setVerificationCode(event.target.value);
                  setVerificationError("");
                }}
                aria-invalid={Boolean(verificationError)}
                aria-describedby={
                  verificationError ? "link-parent-verification-error" : undefined
                }
                required
              />
              {verificationError && (
                <p
                  id="link-parent-verification-error"
                  className="link-parent-error"
                  role="alert"
                >
                  {verificationError}
                </p>
              )}
            </div>

            <button type="button" onClick={handleResend}>
              Reenviar código
            </button>
            {resendMessage && <p aria-live="polite">{resendMessage}</p>}
            {confirmationVisible && (
              <p role="status" aria-live="polite">
                Invitación verificada correctamente.
              </p>
            )}

            <button type="submit">Verificar código</button>
          </form>
        )}
      </section>
    </div>
  );
}

export function LinkParentTrigger({
  childName,
  hasLinkedParents,
}: LinkParentTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerLabel = hasLinkedParents ? "Vincular otro padre" : "Vincular padre";

  function handleClose() {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="link-parent"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="link-parent-icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        {triggerLabel}
      </button>
      <LinkParentModal
        childName={childName}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  );
}
