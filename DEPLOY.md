# DEPLOY — commerce-crm → `targetvox.com` (Droplet gradioFish)

Despliegue de commerce-crm (SvelteKit + `adapter-node`) como **cara principal del apex
`targetvox.com`**, corriendo en `127.0.0.1:3100` bajo **pm2**, detrás de **nginx** + **Certbot**.

## Contexto

- **App**: SvelteKit (Svelte 5) + `@sveltejs/adapter-node`. Repo: `git@github.com:Moibe/commerce-crm.git` (rama `main`, privado).
- **Droplet**: `gradioFish` — IP `165.22.53.200`, Ubuntu, user `root`. Node/npm/pm2 bajo **nvm**. nginx enruta; sus configs viven en el repo hermano **`nx-routes`** (auto-deploy por GitHub Action al pushear).
- **Objetivo**: commerce-crm es el **apex** de `targetvox.com` (antes una landing estática "Splashmix"). El subdominio **`app.targetvox.com` (dev de Splashmix) NO se toca** — es otro server block.

## Estado del DNS/SSL — YA HECHO ✅

- `targetvox.com` + `www` ya están en DigitalOcean (nameservers de DO) y sus registros **A ya apuntan a `165.22.53.200`**. No hay que tocar DNS.
- El certificado `/etc/letsencrypt/live/targetvox.com/` ya existe (cubre apex + www + api). **No hay que emitir cert nuevo.**

---

## Despliegue automático (GitHub Action)

Cada push a `main` dispara `.github/workflows/deploy.yml`, que hace SSH al droplet y:
clona si no existe → `npm ci` → `npm run build` → `pm2 start/restart commerce-crm` en `:3100`
→ `pm2 save` → `curl 127.0.0.1:3100` (verifica 200).

### Secrets requeridos (en el repo de GitHub → Settings → Secrets and variables → Actions)

Son los **mismos** que usa el repo `quiniela`:

| Secret | Valor |
|--------|-------|
| `SSH_PRIVATE_KEY` | La llave privada autorizada como `root` en el droplet (la del CI; en el droplet: `cat /root/.ssh/id_rsa`). |
| `SSH_HOST` | `165.22.53.200` |
| `SSH_USER` | `root` |

Sin estos secrets el Action falla en el paso de SSH.

---

## nginx — apex → commerce-crm (vía `nx-routes`)

> ⚠️ **Orden crítico**: la app debe estar viva en `:3100` (Action en verde) **antes** de
> pushear el cambio de nginx. Si nginx apunta `/` a `:3100` y no hay nada, `targetvox.com` da 502.

En el repo `nx-routes`, el archivo `targetvox.com` se reemplaza para que el apex haga proxy a `:3100`
(se eliminan la raíz estática y los redirects `/login` `/buy`). Se conserva el bloque SSL existente.
Push a `main` de `nx-routes` → su Action recarga nginx en el droplet.

---

## Admin (admin.targetvox.com)

Sección de administración protegida por login, en el subdominio `admin.targetvox.com`
(mismo app commerce-crm; `hooks.server.ts` detecta el host y manda la raíz a `/admin`).
Mecanismo idéntico a quiniela: contraseña en `ADMIN_PASSWORD`, comparación timing-safe de
hashes SHA256, cookie `admin` httpOnly + sameSite=strict + secure (30 días). Login en
`/acceso` (solo en el subdominio; el apex lo devuelve 404). Rutas: `/admin` (sección, en
blanco por ahora) y `/acceso` (login/logout).

Requisitos en el droplet para el admin:
1. **`.env`** en `~/code/commerce-crm/.env` con `ADMIN_PASSWORD=<fuerte>` (el Action hace `source`).
2. **Cert SSL** del subdominio: `sudo certbot certonly --nginx -d admin.targetvox.com`.
3. **DNS**: A record `admin.targetvox.com` → 165.22.53.200 (creado en DO vía doctl).
4. **nginx**: bloque `admin.targetvox.com` en `nx-routes/targetvox.com` (push tras tener el cert).

## Verificación final

```bash
curl -s -o /dev/null -w "targetvox.com -> %{http_code}\n" https://targetvox.com/
curl -s -o /dev/null -w "app.targetvox.com -> %{http_code}\n" https://app.targetvox.com/   # debe seguir 200
```

## Redespliegue futuro

Solo haz `git push` a `main` de commerce-crm — el Action redespliega solo.

## Rollback rápido

- App: `pm2 stop commerce-crm` en el droplet (el apex daría 502 hasta revertir nginx).
- nginx: revertir el commit en `nx-routes` y pushear (su Action recarga la versión anterior).

## Fallback manual (si no usas el Action)

Requiere SSH al droplet con la llave correcta cargada en el agente (`ssh-add`).

```bash
ssh root@165.22.53.200 'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use node \
  && cd ~/code && git clone git@github.com:Moibe/commerce-crm.git commerce-crm && cd commerce-crm \
  && npm ci && npm run build \
  && PORT=3100 HOST=127.0.0.1 ORIGIN=https://targetvox.com pm2 start build/index.js --name commerce-crm --update-env \
  && pm2 save && curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3100/'
```

## Gotchas

- **Orden**: app viva en `:3100` ANTES de tocar nginx (si no, 502).
- **Puerto 3100**: se asume libre en el droplet (quiniela usa 3000; app.targetvox.com usa 7800/8000). Si estuviera ocupado, cambiar `PORT` en el Action + el `proxy_pass` de `nx-routes`.
- **`ORIGIN`**: debe ser `https://targetvox.com` o fallan cookies/CSRF de futuras form actions.
- **No tocar `app.targetvox.com`**: es el dev de Splashmix, server block aparte.
