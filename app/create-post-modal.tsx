"use client";

import type { RefObject } from "react";

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
  if (!isOpen) {
    return null;
  }

  void originRef;

  return (
    <div className="create-post-modal-overlay">
      <section
        className="create-post-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-modal-title"
      >
        <h2 id="create-post-modal-title">Nueva publicación</h2>
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
      </section>
    </div>
  );
}
