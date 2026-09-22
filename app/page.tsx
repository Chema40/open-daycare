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
          Nueva publicación
        </a>

        <nav className="main-nav" aria-label="Secciones de OpenDayCare">
          <a className="nav-link is-active" href="#" aria-current="page">
            Feed
          </a>
          <a className="nav-link" href="#">
            Niños
          </a>
          <a className="nav-link" href="#">
            Avisos
          </a>
          <a className="nav-link" href="#">
            Mi cuenta
          </a>
        </nav>

        <div className="profile-summary">
          <div className="profile-avatar" aria-hidden="true">C</div>
          <div className="profile-copy">
            <strong>Caro Giménez</strong>
            <span>Maestra · Soles</span>
          </div>
          <a className="logout-link" href="#" aria-label="Cerrar sesión" />
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
            <span className="composer-action" aria-hidden="true" />
          </a>

          <div className="feed-divider">
            <span>PUBLICADO HOY</span>
            <span aria-hidden="true" />
          </div>

          <section className="posts" aria-label="Publicaciones de hoy">
            <article className="post-card" aria-label="Publicación de logro" />
            <article className="post-card" aria-label="Publicación de actividad" />
            <article className="post-card" aria-label="Publicación de anuncio" />
          </section>
        </div>
      </main>
    </div>
  );
}
