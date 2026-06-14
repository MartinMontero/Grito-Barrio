# 🚀 Guía de Despliegue - Cloudflare Pages

**Grito & Barrio** - Emergency Response PWA

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Cloudflare](#configuración-de-cloudflare)
3. [Métodos de Despliegue](#métodos-de-despliegue)
4. [Configuración Personalizada](#configuración-personalizada)
5. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### 1. Cuenta de Cloudflare

- Crear cuenta gratuita en [cloudflare.com](https://dash.cloudflare.com/sign-up)
- Verificar email

### 2. Repositorio en GitHub

- El código debe estar en un repositorio de GitHub
- Permisos de administrador en el repositorio

### 3. Variables de Entorno Necesarias

```bash
# Estas variables se configuran en GitHub Secrets
CLOUDFLARE_API_TOKEN      # Token de API de Cloudflare
CLOUDFLARE_ACCOUNT_ID     # ID de tu cuenta de Cloudflare
```

---

## Configuración de Cloudflare

### Paso 1: Obtener Account ID

1. Inicia sesión en [Cloudflare Dashboard](https://dash.cloudflare.com)
2. El Account ID aparece en el sidebar derecho
3. Copia este valor (será algo como: `a1b2c3d4e5f6g7h8i9j0`)

### Paso 2: Crear API Token

1. Ve a [My Profile > API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click en **Create Token**
3. Usar template **Cloudflare Pages**
4. Configurar permisos:
   - **Zone:Read** - Todas las zonas
   - **Page:Edit** - Todas las páginas
5. Click **Continue to summary**
6. Click **Create Token**
7. **¡Copia el token inmediatamente!** (solo se muestra una vez)

### Paso 3: Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Settings > Secrets and variables > Actions
3. Click **New repository secret**
4. Agregar los siguientes secretos:

```yaml
Name: CLOUDFLARE_API_TOKEN
Value: <tu-token-de-api>
```

```yaml
Name: CLOUDFLARE_ACCOUNT_ID
Value: <tu-account-id>
```

---

## Métodos de Despliegue

### Método 1: Git Integration (Recomendado)

Cloudflare Pages se integra directamente con GitHub:

1. Ve a [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click **Create a project**
3. Conectar cuenta de GitHub
4. Seleccionar repositorio: `MartinMontero/grito-barrio`
5. Configurar build:

```yaml
Project name: grito-barrio
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: /
```

6. Click **Save and Deploy**

**✅ Ventajas:**
- Deploy automático en cada push a `main`
- Preview deployments para PRs
- Sin necesidad de GitHub Actions

---

### Método 2: GitHub Actions

Usar el workflow ya configurado en `.github/workflows/cloudflare-deploy.yml`:

1. Asegurar que los secrets estén configurados
2. Hacer push a `main` o crear un tag `v*`
3. El workflow se ejecutará automáticamente

```bash
# Deploy manual
git push origin main

# Deploy con release
git tag v1.0.1
git push origin v1.0.1
```

**✅ Ventajas:**
- Mayor control sobre el proceso
- Tests antes de deploy
- Releases automáticos

---

### Método 3: Wrangler CLI (Local)

Para desarrollo local o deploy manual:

```bash
# Instalar Wrangler
npm install -g wrangler

# Login
wrangler login

# Configurar proyecto
wrangler pages project create grito-barrio

# Deploy
npm run build
wrangler pages deploy dist --project-name=grito-barrio
```

**✅ Ventajas:**
- Deploy rápido desde local
- Útil para testing
- No depende de GitHub

---

## Configuración Personalizada

### Dominio Personalizado

1. Ve a tu proyecto en Cloudflare Pages
2. Custom domains > Set up a custom domain
3. Ingresar tu dominio (ej: `protocolo-cdmx.org`)
4. Seguir instrucciones de DNS

### Variables de Entorno

Configurar en Cloudflare Dashboard:

```bash
# Production
NODE_ENV=production
VITE_APP_VERSION=1.0.0

# Preview (staging)
NODE_ENV=staging
VITE_APP_VERSION=1.0.0-preview
```

### Configuración de Build

El proyecto ya incluye configuración optimizada:

- **Build command:** `npm run build`
- **Build output:** `dist/`
- **Root directory:** `/`
- **Node version:** 18

### Headers y Caché

Configuración personalizada en `_headers`:

```
# Service Worker - Sin caché
/sw.js
  Cache-Control: public, max-age=0, must-revalidate

# Assets - Caché largo
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## Troubleshooting

### Error: "Failed to publish your Function"

**Causa:** Límite de tamaño o configuración incorrecta

**Solución:**
```bash
# Verificar build local
npm run build
ls -la dist/

# Limpiar caché
rm -rf dist node_modules
npm install
npm run build
```

### Error: "Could not find the build output directory"

**Causa:** Directorio de salida incorrecto

**Solución:**
- Verificar que `vite.config.ts` tenga: `outDir: 'dist'`
- Confirmar en Cloudflare: Build output directory = `dist`

### Error: "Invalid API token"

**Causa:** Token expirado o sin permisos

**Solución:**
1. Crear nuevo token en Cloudflare
2. Verificar permisos: Cloudflare Pages (Edit)
3. Actualizar en GitHub Secrets

### PWA No Funciona Offline

**Causa:** Headers de caché incorrectos

**Verificación:**
```bash
# Verificar headers
curl -I https://grito-barrio.pages.dev/sw.js

# Debe mostrar:
# Cache-Control: public, max-age=0, must-revalidate
```

**Solución:** Verificar que `_headers` esté en la raíz del proyecto.

### Assets No Cargan (404)

**Causa:** Rutas incorrectas en el build

**Solución:**
- Verificar `vite.config.ts` tenga: `base: '/'`
- Verificar que las rutas en `manifest.json` sean absolutas (`/icon.png`)

---

## URLs Importantes

| Entorno | URL | Descripción |
|---------|-----|-------------|
| Production | `https://grito-barrio.pages.dev` | Versión estable |
| Preview | `https://<branch>.grito-barrio.pages.dev` | Preview de branches |
| Custom | `https://tudominio.com` | Dominio personalizado |

---

## Comandos Útiles

```bash
# Build local
npm run build

# Preview local
npm run preview

# Deploy manual con Wrangler
wrangler pages deploy dist

# Ver logs
wrangler pages deployment tail

# Listar deployments
wrangler pages deployment list
```

---

## Soporte

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/
- **Issues:** https://github.com/MartinMontero/grito-barrio/issues

---

**Grito & Barrio** - Optimizado para Cloudflare Pages 🚀
