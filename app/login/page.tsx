export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-hero" aria-labelledby="login-hero-title">
        <div className="login-hero-decoration login-hero-decoration-top" aria-hidden="true" />
        <div className="login-hero-decoration login-hero-decoration-bottom" aria-hidden="true" />

        <a className="login-brand" href="#" aria-label="Ir al inicio de OpenDayCare">
          <span className="login-brand-mark" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </span>
          <span>OpenDayCare</span>
        </a>

        <div className="login-hero-copy">
          <h1 id="login-hero-title">
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p>Publicá momentos, gestioná las salas y mantené a las familias cerca, desde un solo lugar.</p>
        </div>

        <p className="login-hero-footer">Guardería Sala Soles</p>
      </section>

      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-form-container">
          <h2 id="login-title">Iniciar sesión</h2>
          <p className="login-subtitle">Ingresá para ver el día de hoy.</p>

          <form className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" defaultValue="caro@opendaycare.com" />
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" placeholder="••••••••" />
            </div>

            <a className="login-recovery-link" href="#">¿Olvidaste tu contraseña?</a>
            <a className="login-submit" href="#">Iniciar sesión</a>
          </form>

          <p className="login-activation-prompt">
            ¿Te invitó la guardería? <a href="#">Activá tu cuenta</a>
          </p>
        </div>
      </section>
    </main>
  );
}
