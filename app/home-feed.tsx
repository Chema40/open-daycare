"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import CreatePostModal from "@/app/create-post-modal";

type FeedChild = {
  id: string;
  full_name: string;
  rooms: { name: string } | { name: string }[] | null;
};

type Props = { linkedChildren: FeedChild[] };

function roomName(child: FeedChild) {
  return Array.isArray(child.rooms) ? child.rooms[0]?.name ?? "Sin sala" : child.rooms?.name ?? "Sin sala";
}

export default function Home({ linkedChildren }: Props) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const createPostTriggerRef = useRef<HTMLElement | null>(null);

  const openCreatePost = (event: MouseEvent<HTMLButtonElement>) => {
    createPostTriggerRef.current = event.currentTarget;
    setIsCreatePostOpen(true);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <Link className="brand" href="/" aria-label="Ir al inicio de OpenDayCare">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-copy"><strong>OpenDayCare</strong><span>Sala Soles</span></span>
        </Link>
        <button className="new-post-link" type="button" onClick={openCreatePost}>＋ Nueva publicación</button>
        <nav className="main-nav" aria-label="Secciones de OpenDayCare">
          <Link className="nav-link is-active" href="/" aria-current="page">⌂ Feed</Link>
          <Link className="nav-link" href="/kids">♧ Niños</Link>
          <a className="nav-link" href="#">♢ Avisos</a>
          <a className="nav-link" href="#">♙ Mi cuenta</a>
        </nav>
        <div className="profile-summary"><div className="profile-avatar" aria-hidden="true">C</div><div className="profile-copy"><strong>OpenDayCare</strong><span>Feed personalizado</span></div></div>
      </aside>

      <main className="feed-main">
        <div className="feed-container">
          <header className="feed-header">
            <p className="eyebrow">GUARDERÍA · FEED</p>
            <h1>Actualizaciones de tus niños</h1>
            <p className="feed-date">{linkedChildren.length} {linkedChildren.length === 1 ? "niño vinculado" : "niños vinculados"}</p>
          </header>

          <button className="composer" type="button" onClick={openCreatePost} aria-label="Crear una nueva publicación">
            <span className="composer-avatar" aria-hidden="true">＋</span>
            <span className="composer-placeholder">Compartí un momento…</span>
            <span className="composer-action" aria-hidden="true">＋</span>
          </button>

          <div className="feed-divider"><span>PUBLICACIONES</span><span aria-hidden="true" /></div>
          {linkedChildren.length === 0 ? (
            <section className="kids-empty" aria-labelledby="feed-empty-title">
              <span aria-hidden="true">♡</span>
              <h2 id="feed-empty-title">Todavía no hay niños vinculados</h2>
              <p>Cuando aceptes una invitación, las actualizaciones de ese niño aparecerán aquí.</p>
            </section>
          ) : (
            <section className="posts" aria-label="Publicaciones de niños vinculados">
              {linkedChildren.map((child) => (
                <article className="post-card" aria-label={`Actualizaciones de ${child.full_name}`} key={child.id}>
                  <header className="post-header">
                    <div className="post-avatar post-avatar-child" aria-hidden="true">{child.full_name[0]}</div>
                    <div className="post-author"><strong>{child.full_name}</strong><span>Sala {roomName(child)} · hoy</span></div>
                    <div className="post-status status-achievement"><span aria-hidden="true" /> VINCULADO</div>
                  </header>
                  <div className="post-recipient">Actualizaciones privadas de {child.full_name}</div>
                  <p className="post-text">Este feed muestra únicamente la información de los niños vinculados con tu cuenta.</p>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} originRef={createPostTriggerRef} />
    </div>
  );
}
