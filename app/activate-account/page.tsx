export default function ActivateAccountPage() {
  return (
    <main className="activation-page">
      <div className="activation-container">
        <div className="activation-brand-mark" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>

        <h1>Bienvenida a OpenDayCare</h1>
        <p className="activation-intro">Te invitaron a seguir el día de tu hijo. Creá tu contraseña para activar la cuenta.</p>

        <section className="activation-invitation" aria-label="Invitación para Mateo">
          <div className="activation-avatar" aria-hidden="true">M</div>
          <div>
            <span>Te invitaron a seguir a</span>
            <strong>Mateo · Sala Soles</strong>
          </div>
        </section>

        <form className="activation-form" action="#">
          <div className="activation-field">
            <label htmlFor="invitation-code">Código de invitación</label>
            <input id="invitation-code" name="invitation-code" type="text" defaultValue="7K4P9" readOnly />
          </div>

          <div className="activation-field">
            <label htmlFor="activation-email">Email</label>
            <input id="activation-email" name="email" type="email" defaultValue="lucia.fernandez@gmail.com" readOnly />
          </div>

          <div className="activation-field">
            <label htmlFor="activation-password">Crear contraseña</label>
            <input id="activation-password" name="password" type="password" defaultValue="contraseña" readOnly />
          </div>

          <div className="photo-consent" aria-label="Consentimiento de fotos marcado">
            <span className="photo-consent-check" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span>Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de la app.</span>
          </div>

          <a className="activation-submit" href="#">Activar mi cuenta</a>
        </form>

        <p className="activation-login-prompt">
          ¿Ya tenés cuenta? <a href="#">Iniciar sesión</a>
        </p>
      </div>
    </main>
  );
}
