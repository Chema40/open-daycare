import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import ActivationForm from "./activation-form";

export default async function ActivateAccountPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const code = (await searchParams).code?.trim().toUpperCase() ?? "";
  const supabase = createClient(await cookies());
  const { data } = code ? await supabase.rpc("get_invitation_details", { invitation_code: code }) : { data: null };
  const invitation = Array.isArray(data) ? data[0] : data;
  return (
    <main className="activation-page">
      <div className="activation-container">
        <div className="activation-brand-mark" aria-hidden="true"><span>✦</span></div>
        <h1>Bienvenida a OpenDayCare</h1>
        <p className="activation-intro">Te invitaron a seguir el día de tu hijo. Creá tu contraseña para activar la cuenta.</p>
        {invitation ? (
          <>
            <section className="activation-invitation" aria-label="Invitación válida">
              <div className="activation-avatar" aria-hidden="true">{invitation.child_name[0]}</div>
              <div><span>Te invitaron a seguir a</span><strong>{invitation.child_name} · Sala {invitation.room_name}</strong></div>
            </section>
            <ActivationForm code={code} email={invitation.email} name={invitation.full_name} />
          </>
        ) : (
          <p className="activation-error" role="alert">El código de invitación no existe, venció o ya fue utilizado.</p>
        )}
        <p className="activation-login-prompt">¿Ya tenés cuenta? <a href="/login">Iniciar sesión</a></p>
      </div>
    </main>
  );
}
