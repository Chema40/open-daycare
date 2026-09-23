'use client';

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { kids } from "./data";

type AddKidForm = {
  fullName: string;
  birthDate: string;
  room: "Soles" | "Planetas" | "Cometas";
  allergies: string;
  medicalNotes: string;
};

const initialAddKidForm: AddKidForm = {
  fullName: "",
  birthDate: "",
  room: "Soles",
  allergies: "",
  medicalNotes: "",
};

function UsersIcon() {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
    </svg>
  );
}

export default function KidsPage() {
  const [isAddKidModalOpen, setIsAddKidModalOpen] = useState(false);
  const [, setAddKidForm] = useState<AddKidForm>(initialAddKidForm);
  const addKidButtonRef = useRef<HTMLButtonElement>(null);

  function handleOpenAddKidModal(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsAddKidModalOpen(true);
    setAddKidForm({ ...initialAddKidForm });
  }

  return (
    <div className="app-shell" data-add-kid-modal-open={isAddKidModalOpen}>
      <aside className="sidebar" aria-label="Navegación principal">
        <Link className="brand" href="/" aria-label="Ir al inicio de OpenDayCare">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-copy">
            <strong>OpenDayCare</strong>
            <span>Sala Soles</span>
          </span>
        </Link>

        <a className="new-post-link" href="#">
          <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva publicación
        </a>

        <nav className="main-nav" aria-label="Secciones de OpenDayCare">
          <Link className="nav-link" href="/">
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
            Feed
          </Link>
          <Link className="nav-link is-active" href="/kids" aria-current="page">
            <UsersIcon />
            Niños
          </Link>
          <a className="nav-link" href="#">
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            Avisos
          </a>
          <a className="nav-link" href="#">
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Mi cuenta
          </a>
        </nav>

        <div className="profile-summary">
          <div className="profile-avatar" aria-hidden="true">C</div>
          <div className="profile-copy">
            <strong>Caro Giménez</strong>
            <span>Maestra · Soles</span>
          </div>
          <a className="logout-link" href="#" aria-label="Cerrar sesión">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </a>
        </div>
      </aside>

      <main className="feed-main">
        <div className="kids-container">
          <header className="kids-header">
            <div>
              <p className="eyebrow">GESTIÓN</p>
              <h1>Niños</h1>
            </div>
            <button className="add-kid-link" type="button" ref={addKidButtonRef} onClick={handleOpenAddKidModal}>
              <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Agregar niño
            </button>
          </header>

          <div className="kids-search">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input aria-label="Buscar niño" placeholder="Buscar niño…" />
          </div>

          <div className="room-heading">
            <span>SALA SOLES</span>
            <span>{kids.length} niños</span>
            <span aria-hidden="true" />
          </div>

          <section className="kids-grid" aria-label="Niños de Sala Soles">
            {kids.map((kid) => (
              <Link className="kid-card" href={`/kids/${kid.slug}`} key={kid.id}>
                <span className="kid-avatar" style={{ backgroundColor: kid.avatarColor, color: kid.avatarTextColor }} aria-hidden="true">
                  {kid.initial}
                </span>
                <span className="kid-card-copy">
                  <strong>{kid.name}</strong>
                  <span>{kid.age} años · {kid.linkedParents.length ? `${kid.linkedParents.length} ${kid.linkedParents.length === 1 ? "padre" : "padres"} vinculado${kid.linkedParents.length === 1 ? "" : "s"}` : "sin padres vinculados"}</span>
                </span>
                {kid.tags.length ? (
                  <span className={`kid-tag kid-tag-${kid.tags[0].toLowerCase()}`}>{kid.tags[0]}</span>
                ) : (
                  <svg className="kid-chevron" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                )}
              </Link>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
