"use client";

import { useState } from "react";

type LinkParentForm = {
  name: string;
  email: string;
  relationship: "" | "Mamá" | "Papá" | "Tutor/a";
};

type LinkParentStep = "form" | "verification";

type LinkParentModalProps = {
  childName: string;
  isOpen: boolean;
  onClose: () => void;
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

  function handleClose() {
    setForm(initialForm);
    setStep("form");
    onClose();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="link-parent-modal-overlay">
      <section
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
            Cerrar
          </button>
        </header>

        <form
          className="link-parent-modal-content"
          onSubmit={(event) => event.preventDefault()}
        >
          <p>
            {step === "form"
              ? "Completa los datos para enviar una invitación."
              : "Introduce el código de verificación enviado por email."}
          </p>

          <output aria-live="polite" hidden>
            {form.name} {form.email} {form.relationship}
          </output>
        </form>
      </section>
    </div>
  );
}
