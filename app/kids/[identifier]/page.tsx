import Link from "next/link";
import { notFound } from "next/navigation";
import { getKidByIdentifier, kids } from "../data";

export function generateStaticParams() {
  return kids.flatMap((kid) => [
    { identifier: String(kid.id) },
    { identifier: kid.slug },
  ]);
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default async function KidProfilePage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;
  const kid = getKidByIdentifier(identifier);

  if (!kid) {
    notFound();
  }

  return (
    <div className="app-shell">
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
        <div className="profile-container">
          <Link className="back-to-kids" href="/kids">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver a Niños
          </Link>

          <div className="profile-layout">
            <div className="profile-main-column">
              <header className="kid-profile-header">
                <div className="kid-profile-avatar" style={{ backgroundColor: kid.avatarColor, color: kid.avatarTextColor }} aria-hidden="true">
                  {kid.initial}
                </div>
                <div className="kid-profile-heading">
                  <h1>{kid.name}</h1>
                  <p>{kid.age} años · Sala {kid.room}</p>
                </div>
                <a className="edit-kid-link" href="#">Editar</a>
              </header>

              <section className="notes-alert" aria-labelledby="notes-heading">
                <div className="notes-icon" aria-hidden="true">!</div>
                <div>
                  <h2 id="notes-heading">Alergias y notas</h2>
                  <p>{kid.notes ?? "Sin alergias ni notas registradas."}</p>
                </div>
              </section>

              <dl className="kid-details">
                <div>
                  <dt>Fecha de nacimiento</dt>
                  <dd>{kid.birthDate}</dd>
                </div>
                <div>
                  <dt>Sala</dt>
                  <dd>{kid.room}</dd>
                </div>
                <div>
                  <dt>Ingreso</dt>
                  <dd>{kid.admissionDate}</dd>
                </div>
              </dl>
            </div>

            <aside className="profile-side-column">
              <a className="day-summary-link" href="#">
                <span className="sun-icon" aria-hidden="true">✦</span>
                Resumen del día
              </a>

              <section className="linked-parents" aria-labelledby="parents-heading">
                <h2 id="parents-heading">Padres vinculados</h2>
                <div className="linked-parents-list">
                  {kid.linkedParents.map((parent) => (
                    <div className="linked-parent" key={parent.name}>
                      <span className="parent-avatar" style={{ backgroundColor: parent.color }} aria-hidden="true">{parent.initial}</span>
                      <span className="parent-copy">
                        <strong>{parent.name}</strong>
                        <span>{parent.relationship} · {parent.status === "active" ? "activa" : "invitación enviada"}</span>
                      </span>
                      <span className={`parent-status parent-status-${parent.status}`}>
                        {parent.status === "active" ? "ACTIVA" : "PENDIENTE"}
                      </span>
                    </div>
                  ))}
                  {!kid.linkedParents.length && <p className="no-linked-parents">Todavía no hay padres vinculados.</p>}
                  <a className="link-parent" href="#">
                    <span className="link-parent-icon" aria-hidden="true"><PlusIcon /></span>
                    Vincular otro padre
                  </a>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
