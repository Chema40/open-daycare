"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ActivationForm({ code: initialCode, email: initialEmail, name }: { code: string; email: string; name: string }) {
  const [code, setCode] = useState(initialCode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !code.trim()) { setError("Introduce un email válido y una contraseña de al menos 8 caracteres."); return; }
    setLoading(true);
    const response = await fetch("/api/invitations/accept", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, email, password, name }) });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) { setError(result.error ?? "No pudimos activar la cuenta."); return; }
    setDone(true); router.push("/");
  }
  return <form className="activation-form" onSubmit={submit} noValidate>
    <div className="activation-field"><label htmlFor="invitation-code">Código de invitación</label><input id="invitation-code" name="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoComplete="one-time-code" aria-describedby={error ? "activation-error" : undefined} /></div>
    <div className="activation-field"><label htmlFor="activation-email">Email</label><input id="activation-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
    <div className="activation-field"><label htmlFor="activation-password">Crear contraseña</label><input id="activation-password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} aria-describedby={error ? "activation-error" : undefined} /></div>
    <div className="photo-consent" aria-label="Consentimiento de fotos marcado"><span className="photo-consent-check" aria-hidden="true">✓</span><span>Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de la app.</span></div>
    {error && <p id="activation-error" className="activation-error" role="alert" tabIndex={-1}>{error}</p>}
    {done && <p role="status">Cuenta activada.</p>}
    <button className="activation-submit" type="submit" disabled={loading}>{loading ? "Activando…" : "Activar mi cuenta"}</button>
  </form>;
}
