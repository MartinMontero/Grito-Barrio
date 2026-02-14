# 🚀 Guía de Instalación Rápida - Protocolo CDMX

## Paso 1: Instalar Node.js

Si no tienes Node.js instalado, descárgalo de:
- **Windows/Mac**: https://nodejs.org/ (descarga la versión LTS)
- **Verificar instalación**: `node --version` y `npm --version`

## Paso 2: Navegar al Proyecto

```bash
cd protocolo-cdmx
```

## Paso 3: Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias listadas en `package.json`:
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Zustand
- crypto-js
- Y todas las demás librerías necesarias

## Paso 4: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación se abrirá automáticamente en: **http://localhost:5173**

## Paso 5: Verificar que Todo Funciona

1. Deberías ver la página de inicio de Protocolo CDMX
2. Navega por las diferentes secciones usando el menú inferior
3. Prueba el botón de emergencia
4. Verifica que los protocolos se muestran correctamente

## Paso 6: Construir para Producción (Opcional)

```bash
npm run build
```

Esto creará una carpeta `dist/` con los archivos optimizados.

## Paso 7: Previsualizar la Versión de Producción (Opcional)

```bash
npm run preview
```

## 🌐 Desplegar en GitHub Pages

### 1. Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombra el repositorio: `protocolo-cdmx`
3. Elige si será público o privado
4. No inicialices con README (ya lo tenemos)

### 2. Subir el Código

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "Initial commit: Protocolo CDMX app"

# Conectar con GitHub (reemplaza TU_USUARIO con tu nombre de usuario)
git remote add origin https://github.com/TU_USUARIO/protocolo-cdmx.git

# Subir el código
git push -u origin main
```

### 3. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Pages** (en el menú lateral izquierdo)
3. En **Source**, selecciona **Deploy from a branch**
4. Selecciona la rama `main` y carpeta `/ (root)`
5. Click en **Save**

### 4. Desplegar Automáticamente

El proyecto ya está configurado para desplegar automáticamente con GitHub Actions cuando haces push a main.

Alternativamente, puedes usar:

```bash
npm run deploy
```

Este comando:
1. Construye la aplicación
2. La sube a la rama `gh-pages`
3. GitHub Pages servirá automáticamente desde esa rama

### 5. Verificar el Despliegue

1. Espera 2-5 minutos después del push
2. Ve a: `https://TU_USUARIO.github.io/protocolo-cdmx/`
3. ¡La app debería estar funcionando!

## 📱 Instalar como PWA en el Celular

### Android (Chrome):
1. Abre la app en Chrome
2. Click en el menú (3 puntos) → "Agregar a pantalla de inicio"
3. Confirma la instalación

### iOS (Safari):
1. Abre la app en Safari
2. Click en el botón compartir (cuadrado con flecha)
3. Selecciona "Agregar a inicio"
4. Confirma la instalación

## ⚠️ Solución de Problemas

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 5173 is already in use"
```bash
# Mata el proceso en el puerto 5173
npx kill-port 5173
# O usa otro puerto
npm run dev -- --port 3000
```

### Error: "Command not found"
Asegúrate de estar en la carpeta correcta:
```bash
pwd
# Debe mostrar: .../protocolo-cdmx
```

### Error al desplegar en GitHub Pages
1. Verifica que el repositorio sea público (o GitHub Pro para privados)
2. Asegúrate de que GitHub Pages esté habilitado en Settings
3. Verifica que la rama `gh-pages` exista (creada automáticamente por `npm run deploy`)

### Los estilos no se aplican
```bash
# Reconstruir Tailwind
npm run build
```

## 🎨 Personalización

### Cambiar Colores
Edita `src/globals.css`:
```css
:root {
  --primary: 0 84.2% 60.2%;  /* Cambia estos valores HSL */
}
```

### Agregar Nuevos Protocolos
Edita `src/data/protocols.ts` y agrega nuevos objetos al array `protocols`

### Cambiar Información Legal
Edita `src/data/protocols.ts` y modifica el array `legalResources`

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de error en la consola del navegador (F12)
2. Verifica que todas las dependencias estén instaladas
3. Consulta la documentación en `README-detailed.md`

## 🎉 ¡Listo!

Tu aplicación Protocolo CDMX está lista para usar y ayudar a la comunidad.

---

**Tiempo estimado de instalación**: 5-10 minutos

**Requisitos mínimos**:
- Node.js 18+
- 2GB RAM
- 500MB espacio en disco
