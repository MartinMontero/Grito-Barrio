# 🚀 DESPLIEGUE EN CLOUDFLARE PAGES

## ✅ Estado: Configurado y Listo

El proyecto está configurado para desplegarse en **Cloudflare Pages** con soporte completo para PWA.

---

## 🌐 URLs del Proyecto

- **Producción:** `https://protocolo-cdmx.pages.dev`
- **Preview:** `https://<branch>.protocolo-cdmx.pages.dev`

---

## 📋 Requisitos para Desplegar

### 1. Secrets de GitHub (Requeridos)

Configura estos secrets en tu repositorio (`Settings > Secrets > Actions`):

```yaml
CLOUDFLARE_API_TOKEN     # API Token de Cloudflare
CLOUDFLARE_ACCOUNT_ID    # Account ID de Cloudflare
```

### 2. Cómo Obtener los Secrets

**Account ID:**
- Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
- Copia el Account ID del sidebar

**API Token:**
- Ve a [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
- Crea un token con permisos: `Cloudflare Pages:Edit`

---

## 🚀 Métodos de Despliegue

### Opción A: Git Integration (Automático)

1. Ve a [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click **Create a project**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
5. Click **Save and Deploy**

✅ **Ventaja:** Deploy automático en cada push a `main`

### Opción B: GitHub Actions (Control Total)

El proyecto incluye un workflow configurado en `.github/workflows/cloudflare-deploy.yml`.

Simple push a main:
```bash
git add .
git commit -m "feat: nuevo feature"
git push origin main
```

Deploy con release:
```bash
git tag v1.0.1
git push origin v1.0.1
```

✅ **Ventaja:** Tests automáticos, releases, mayor control

---

## ⚙️ Configuración Técnica

### Headers Optimizados (`_headers`)

```
Service Worker:      NO CACHE (crítico para PWA)
Manifest:            1 hora de caché
Assets (hashed):     1 año de caché
Imágenes:            1 día de caché
HTML:                NO CACHE
```

### Seguridad

- ✅ HTTPS forzado
- ✅ HSTS habilitado
- ✅ CSP (Content Security Policy)
- ✅ X-Frame-Options: DENY
- ✅ DDoS protection

### CDN

- 🌍 300+ ciudades globales
- 🚀 Nodos en CDMX, Monterrey, Guadalajara
- 💾 Cache API para PWA offline
- ⚡ HTTP/2 y HTTP/3

---

## 📚 Documentación Adicional

- [Guía completa de despliegue](./docs/CLOUDFLARE_DEPLOYMENT.md)
- [Documentación de Cloudflare](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

## 🎯 Ventajas de Cloudflare Pages

| Característica | GitHub Pages | Cloudflare Pages |
|----------------|--------------|------------------|
| **Costo** | Gratis | ✅ Gratis (ilimitado) |
| **CDN en México** | ⚠️ Básico | ✅✅ Excelente (nodos en CDMX) |
| **Ancho de banda** | 100GB/mes | ✅ Ilimitado |
| **HTTPS** | ✅ Sí | ✅ Sí |
| **Control de headers** | ❌ Limitado | ✅ Completo |
| **PWA Support** | ⚠️ Básico | ✅✅ Optimizado |
| **DDoS Protection** | ❌ No | ✅ Incluido |
| **Preview Deploys** | ❌ No | ✅ Sí |
| **Serverless Functions** | ❌ No | ✅ Workers |

---

## 🚀 Próximos Pasos

1. **Configurar secrets** en GitHub
2. **Hacer push** del código
3. **Verificar deploy** en Cloudflare Dashboard
4. **(Opcional)** Configurar dominio personalizado

---

**¿Listo para deployar?** Sigue los pasos en [CLOUDFLARE_DEPLOYMENT.md](./docs/CLOUDFLARE_DEPLOYMENT.md)
