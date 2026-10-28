# Open Daycare

Aplicación web para la gestión de una guardería. Está construida con Next.js,
Supabase y Resend.

## Requisitos

- Node.js 20 o superior.
- npm.
- Acceso al proyecto de Supabase si se van a consultar datos o aplicar migraciones.

## Instalación y puesta en marcha

1. Clona el repositorio y entra en su directorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd 06-open-daycare
   ```

2. Instala las dependencias usando el lockfile:

   ```bash
   npm ci
   ```

3. Crea el archivo local de variables de entorno:

   ```bash
   cp .env.template .env.local
   ```

   Completa `.env.local` con los valores del proyecto de Supabase y de Resend.
   Las variables `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` se pueden obtener desde la configuración
   de API de Supabase. `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_DB_PASSWORD` son
   secretos: solo deben permanecer en el entorno local o del servidor y nunca
   deben exponerse al navegador ni subirse al repositorio.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

### Comandos útiles

```bash
npm run lint          # Comprueba el código
npx tsc --noEmit     # Comprueba los tipos
npm run build        # Genera la compilación de producción
npm run start        # Sirve la compilación de producción
```

## Supabase CLI y autenticación del equipo

El directorio `supabase/migrations` contiene las migraciones de la base de
datos. El login de cada miembro del equipo se hace de forma individual; no se
debe compartir el token ni las credenciales de otro miembro.

### Instalar y hacer login en el CLI

En macOS se puede instalar el CLI con Homebrew:

```bash
brew install supabase/tap/supabase
supabase --version
```

También se puede ejecutar sin instalación global con `npx supabase`.

Cada miembro debe:

1. Tener una cuenta de Supabase e invitación a la organización/proyecto con el
   rol mínimo necesario.
2. Crear un **Personal Access Token** desde la sección de tokens de su cuenta.
   Para el trabajo diario se recomienda un token con alcance limitado al
   proyecto y con fecha de expiración.
3. Autenticar su CLI:

   ```bash
   supabase login
   ```

   Cuando lo solicite, pega el token. Para automatizaciones también se puede
   usar un token mediante variable de entorno, sin guardarlo en el repositorio:

   ```bash
   export SUPABASE_ACCESS_TOKEN=sbp_...
   supabase projects list
   ```

4. Comprobar el acceso y vincular el repositorio al proyecto remoto:

   ```bash
   supabase projects list
   supabase link --project-ref <PROJECT_REF>
   ```

   El `PROJECT_REF` está en la URL del proyecto de Supabase o en su configuración
   general. Para aplicar las migraciones pendientes al proyecto vinculado:

   ```bash
   supabase db push
   ```

   `supabase db push` puede solicitar la contraseña de la base de datos. No la
   incluyas en comandos versionados ni en capturas de pantalla.

## MCP remoto de Supabase

El MCP remoto de Supabase se conecta a través de
`https://mcp.supabase.com/mcp`. Su autenticación es independiente del login
guardado por el CLI:

- En un cliente MCP compatible con OAuth, configura el servidor con esta URL,
  inicia la conexión y completa en el navegador el login y la autorización de
  Supabase. No es necesario copiar el token del CLI.
- Para CI u otros clientes sin OAuth, usa un Personal Access Token limitado al
  proyecto y pásalo como `Authorization: Bearer <TOKEN>` según el formato de
  configuración del cliente. No guardes ese token en `.mcp.json`, el README ni
  el repositorio.

Configuración base del servidor remoto (sin credenciales):

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

Si el cliente MCP no muestra las herramientas después de configurar el servidor,
recarga la sesión y repite el flujo OAuth. Para operaciones sensibles, usa
tokens con el menor número de permisos posible y verifica que el usuario tenga
acceso al proyecto correcto.

## Estructura relevante

- `app/`: páginas y rutas de Next.js.
- `utils/supabase/`: clientes de Supabase para navegador, servidor y sesión.
- `supabase/migrations/`: migraciones SQL versionadas.
- `.env.template`: variables necesarias para configurar el entorno local.
