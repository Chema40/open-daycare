"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

const genericLoginError = "No pudimos iniciar sesión. Revisá tu email y contraseña e intentá nuevamente.";

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("caro@opendaycare.com");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: LoginErrors = {};

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Ingresá un email válido.";
    }

    if (!password) {
      nextErrors.password = "Ingresá tu contraseña.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        if (nextErrors.email) {
          emailRef.current?.focus();
        } else {
          passwordRef.current?.focus();
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrors({ form: genericLoginError });
        requestAnimationFrame(() => formErrorRef.current?.focus());
        return;
      }

      router.push("/");
    } catch {
      setErrors({ form: genericLoginError });
      requestAnimationFrame(() => formErrorRef.current?.focus());
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      className="login-form"
      noValidate
      onSubmit={handleSubmit}
      aria-busy={isLoading}
      aria-describedby={errors.form ? "login-error" : undefined}
    >
      <div className="login-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          ref={emailRef}
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="login-field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          ref={passwordRef}
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <p id="password-error" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <a className="login-recovery-link" href="/login" aria-disabled={isLoading}>
        ¿Olvidaste tu contraseña?
      </a>
      <button className="login-submit" type="submit" disabled={isLoading}>
        {isLoading ? "Ingresando..." : "Iniciar sesión"}
      </button>
      {errors.form && (
        <p id="login-error" ref={formErrorRef} role="alert" tabIndex={-1}>
          {errors.form}
        </p>
      )}
      <p className="login-status" aria-live="polite">
        {isLoading ? "Comprobando tus datos..." : ""}
      </p>
    </form>
  );
}
