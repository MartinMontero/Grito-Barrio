# Grito & Barrio

Herramienta de respuesta comunitaria para apoyo en desalojos ilegales en la Ciudad de México.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://grito-barrio.pages.dev)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Una PWA (Progressive Web App) desarrollada con React, TypeScript y Vite.

🌐 **Live Demo:** [https://grito-barrio.pages.dev](https://grito-barrio.pages.dev)

---

## ✨ Características

- ⚡ **Offline-first**: Funciona sin conexión a internet
- 📱 **Diseño responsive**: Optimizado para dispositivos móviles
- 🔒 **Seguridad**: Encriptación AES-256-GCM de grado militar
- 🛡️ **Modo de coerción**: Protección ante amenazas
- 🌐 **Multilingüe**: Soporte completo en español (es-MX)
- 🚨 **Botón de emergencia**: Acceso rápido a protocolos de emergencia
- 📚 **Capacitación**: Módulos de entrenamiento integrados
- 📍 **Puntos seguros**: Mapa de refugios verificados

---

## 🚀 Despliegue

El proyecto está configurado para desplegarse automáticamente en **Cloudflare Pages**.

### URLs del Proyecto

- 🌐 **Producción:** [https://grito-barrio.pages.dev](https://grito-barrio.pages.dev)
- 🔧 **Repositorio:** [https://github.com/MartinMontero/grito-barrio](https://github.com/MartinMontero/grito-barrio)

### Configuración Rápida

```bash
# Clonar el repositorio
git clone https://github.com/MartinMontero/grito-barrio.git
cd grito-barrio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

Para instrucciones detalladas de despliegue, ver [DEPLOY.md](./DEPLOY.md).

---

## 📁 Estructura del Proyecto

```
grito-barrio/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes reutilizables
│   │   ├── features/    # Componentes de características
│   │   └── layout/      # Componentes de layout
│   ├── hooks/           # Hooks personalizados
│   ├── lib/             # Utilidades, cifrado y storage
│   ├── store/           # Gestión de estado con Zustand
│   ├── types/           # Interfaces TypeScript
│   ├── tests/           # Suite de tests completa
│   └── data/            # Contenido estático
├── docs/                # Documentación completa
├── public/              # Activos estáticos e íconos
├── _headers             # Configuración de Cloudflare
├── _routes.json         # Rutas SPA para Cloudflare
└── ...config files
```

---

## 📚 Documentación

### Para Usuarios
- 📖 [Guía de Usuario](./docs/USER_GUIDE.md) - Manual completo en español
- 🔒 [Guía de Seguridad](./docs/SECURITY.md) - Características de seguridad

### Para Desarrolladores
- 💻 [Guía de Desarrollo](./docs/DEVELOPER.md) - Arquitectura y APIs
- 🚀 [Guía de Despliegue](./docs/CLOUDFLARE_DEPLOYMENT.md) - Deploy en Cloudflare
- 🤝 [Contribuir](./docs/CONTRIBUTING.md) - Cómo contribuir al proyecto
- 📋 [Código de Conducta](./docs/CODE_OF_CONDUCT.md) - Normas de la comunidad

### Referencia
- 📜 [Changelog](./docs/CHANGELOG.md) - Historial de versiones
- 🗺️ [Roadmap](./docs/ROADMAP.md) - Planes futuros
- ⚡ [Testing](./docs/TESTING_STRATEGY.md) - Estrategia de testing
- 🐳 [Docker](./docs/DEPLOYMENT.md) - Despliegue con Docker

---

## 🛡️ Seguridad

Esta aplicación implementa las siguientes medidas de seguridad:

- **Cifrado AES-256-GCM**: Para datos sensibles (incidentes, evidencia, documentación)
- **Bóveda de claves**: Clave derivada de tu contraseña (PBKDF2, 600k iteraciones)
  y mantenida **solo en memoria**; nunca se guarda en disco
- **Web Crypto API**: Criptografía nativa del navegador (sin dependencias frágiles)
- **Modo de coerción (Duress)**: Bóveda señuelo independiente + borrado de pánico
- **Borrado de pánico local y durable**: elimina todos los datos del dispositivo
  (no requiere conexión; no hay borrado remoto)
- **Almacenamiento 100% local**: sin servidores, sin telemetría, sin rastreadores
- **Seudónimos**: sin nombres reales en el sistema

Para el modelo de amenazas, garantías y **limitaciones conocidas**, ver
[docs/SECURITY.md](./docs/SECURITY.md).

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestra [guía de contribución](./docs/CONTRIBUTING.md).

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📝 Licencia

GPL v3 License - Ver [LICENSE](./LICENSE) para más detalles.

---

## ⚠️ Descargo de Responsabilidad

Esta herramienta es para fines informativos y de apoyo comunitario. **No sustituye el asesoramiento legal profesional**.

En caso de emergencia:
- 📞 **911** - Emergencias
- 📞 **555 534 5500** - Procuraduría Social CDMX
- 📞 **555 208 1100** - CNDH

---

**Grito & Barrio** - Desarrollado con ❤️ para la comunidad de la Ciudad de México

[![Cloudflare](https://img.shields.io/badge/Powered%20by-Cloudflare-F38020?logo=cloudflare)](https://cloudflare.com)
