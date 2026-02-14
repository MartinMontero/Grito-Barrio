# Protocolo CDMX

Herramienta de respuesta comunitaria para apoyo en desalojos ilegales en la Ciudad de México.

Una PWA (Progressive Web App) desarrollada con React, TypeScript y Vite.

## Características

- ⚡ **Offline-first**: Funciona sin conexión a internet
- 📱 **Diseño responsive**: Optimizado para dispositivos móviles
- 🔒 **Seguridad**: Encriptación de datos sensibles
- 🌐 **Multilingüe**: Soporte completo en español
- 🚨 **Botón de emergencia**: Acceso rápido a protocolos de emergencia

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/protocolo-cdmx.git
cd protocolo-cdmx

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## Estructura del Proyecto

```
protocolo-cdmx/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes de shadcn/ui
│   │   └── features/    # Componentes de características
│   ├── hooks/           # Hooks personalizados
│   ├── lib/             # Utilidades y encriptación
│   ├── data/            # Contenido estático de protocolos
│   ├── types/           # Interfaces TypeScript
│   ├── store/           # Gestión de estado con Zustand
│   └── pages/           # Páginas de la aplicación
├── public/              # Activos estáticos e íconos
└── ...config files
```

## Despliegue en GitHub Pages

```bash
npm run build
npm run deploy
```

## Licencia

MIT License - Ver LICENSE para más detalles.

## Seguridad y Privacidad

Esta aplicación está diseñada para proteger la información sensible de los usuarios. Todos los datos personales se almacenan localmente y se encriptan utilizando crypto-js.

---

**Nota importante**: Esta herramienta es para fines informativos y de apoyo comunitario. No sustituye el asesoramiento legal profesional.
