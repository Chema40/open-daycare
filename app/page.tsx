import Link from "next/link";

export default function Home() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <a className="brand" href="#" aria-label="Ir al inicio de OpenDayCare">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-copy">
            <strong>OpenDayCare</strong>
            <span>Sala Soles</span>
          </span>
        </a>

        <a className="new-post-link" href="#">
          <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva publicación
        </a>

        <nav className="main-nav" aria-label="Secciones de OpenDayCare">
          <a className="nav-link is-active" href="#" aria-current="page">
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
            Feed
          </a>
          <Link className="nav-link" href="/kids">
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="7" r="3" />
              <circle cx="17" cy="9" r="2.4" />
              <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
            </svg>
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
        <div className="feed-container">
          <header className="feed-header">
            <p className="eyebrow">GUARDERÍA · SALA SOLES</p>
            <h1>Buenas, Caro</h1>
            <p className="feed-date">12 niños · martes 17 jun</p>
          </header>

          <a className="composer" href="#" aria-label="Crear una nueva publicación">
            <span className="composer-avatar" aria-hidden="true">C</span>
            <span className="composer-placeholder">Compartí un momento…</span>
            <span className="composer-action" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </span>
          </a>

          <div className="feed-divider">
            <span>PUBLICADO HOY</span>
            <span aria-hidden="true" />
          </div>

          <section className="posts" aria-label="Publicaciones de hoy">
            <article className="post-card" aria-label="Publicación de logro de Mateo">
              <header className="post-header">
                <div className="post-avatar post-avatar-child" aria-hidden="true">M</div>
                <div className="post-author">
                  <strong>Mateo</strong>
                  <span>14:20 · publicado por vos</span>
                </div>
                <div className="post-status status-achievement">
                  <span aria-hidden="true" />
                  LOGRO
                </div>
              </header>
              <div className="post-recipient">Para: familia de Mateo</div>
              <p className="post-text">¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.</p>
              <footer className="post-footer">
                <span className="post-count post-likes">
                  <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                  3
                </span>
                <a className="post-count post-comments" href="#" aria-label="Ver 1 comentario">
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
                  </svg>
                  1
                </a>
                <span className="post-spacer" />
                <a className="post-edit" href="#">Editar</a>
              </footer>
            </article>

            <article className="post-card" aria-label="Publicación de actividad de Mateo">
              <header className="post-header">
                <div className="post-avatar post-avatar-child" aria-hidden="true">M</div>
                <div className="post-author">
                  <strong>Mateo</strong>
                  <span>09:40 · publicado por vos</span>
                </div>
                <div className="post-status status-activity">
                  <span aria-hidden="true" />
                  ACTIVIDAD
                </div>
              </header>
              <div className="post-recipient">Para: familia de Mateo</div>
              <p className="post-text">Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.</p>
              <a className="photo-placeholder" href="#" aria-label="Ver foto pintando con témperas">
                <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
                </svg>
                <span>Foto · pintando con témperas</span>
              </a>
              <footer className="post-footer">
                <span className="post-count post-likes">
                  <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                  5
                </span>
                <a className="post-count post-comments" href="#" aria-label="Ver 2 comentarios">
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
                  </svg>
                  2
                </a>
                <span className="post-spacer" />
                <a className="post-edit" href="#">Editar</a>
              </footer>
            </article>

            <article className="post-card" aria-label="Anuncio general">
              <header className="post-header">
                <div className="post-avatar post-avatar-announcement" aria-hidden="true">
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                </div>
                <div className="post-author">
                  <strong>Anuncio general</strong>
                  <span>07:50 · publicado por vos</span>
                </div>
                <div className="post-status status-announcement">
                  <span aria-hidden="true" />
                  ANUNCIO
                </div>
              </header>
              <div className="post-recipient">Para: toda la sala</div>
              <p className="post-text">El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.</p>
              <footer className="post-footer">
                <span className="post-count post-likes">
                  <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                  8
                </span>
                <a className="post-count post-comments" href="#" aria-label="Ver 0 comentarios">
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
                  </svg>
                  0
                </a>
                <span className="post-spacer" />
                <a className="post-edit" href="#">Editar</a>
              </footer>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
