# Grito & Barrio

## 🚨 Herramienta de Respuesta Comunitaria para Apoyo en Desalojos Ilegales

Grito & Barrio es una Progressive Web App (PWA) diseñada para proporcionar información, recursos y protocolos de emergencia a personas en riesgo de desalojos ilegales en la Ciudad de México.

## ✨ Características

- 📱 **Progressive Web App**: Instalable en dispositivos móviles y de escritorio
- 🌐 **Offline-first**: Funciona sin conexión a internet
- 🔒 **Seguridad**: Encriptación de datos sensibles con crypto-js
- 🎨 **Diseño moderno**: Interfaz construida con Tailwind CSS y shadcn/ui
- 🌙 **Tema oscuro/claro**: Soporte para ambos modos
- 📍 **Optimizado para CDMX**: Información legal y recursos específicos
- 🚨 **Botón de emergencia**: Acceso rápido a protocolos de emergencia
- 🇲🇽 **100% en Español**: Toda la interfaz en español

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MartinMontero/grito-barrio.git
cd grito-barrio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Construcción para Producción

```bash
npm run build
```

Los archivos estáticos se generarán en la carpeta `dist/`

### Despliegue en GitHub Pages

```bash
npm run deploy
```

## 📁 Estructura del Proyecto

```
grito-barrio/
├── public/                    # Activos estáticos
│   ├── manifest.json         # Configuración PWA
│   ├── pwa-192x192.png       # Iconos
│   └── ...
├── src/
│   ├── components/
│   │   ├── ui/               # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── features/         # Componentes de características
│   │       ├── Header.tsx
│   │       ├── BottomNavigation.tsx
│   │       ├── HomePage.tsx
│   │       ├── ProtocolsPage.tsx
│   │       ├── LegalPage.tsx
│   │       ├── ResourcesPage.tsx
│   │       ├── SettingsPage.tsx
│   │       ├── EmergencyModal.tsx
│   │       ├── ProtocolDetailPage.tsx
│   │       └── LegalResourceDetailPage.tsx
│   ├── hooks/                # Hooks personalizados
│   │   └── index.ts
│   ├── lib/                  # Utilidades
│   │   ├── utils.ts
│   │   ├── encryption.ts
│   │   └── storage.ts
│   ├── data/                 # Datos estáticos
│   │   └── protocols.ts
│   ├── types/                # TypeScript interfaces
│   │   └── index.ts
│   ├── store/                # Zustand store
│   │   └── index.ts
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── globals.css          # Estilos globales
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🛠️ Tecnologías

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **PWA**: vite-plugin-pwa
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Encryption**: crypto-js
- **Storage**: idb-keyval (IndexedDB)
- **Routing**: react-router-dom (preparado)

## 🎨 Personalización

### Temas

Los temas se pueden modificar en `src/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 84.2% 60.2%;
  /* ... */
}
```

### Colores

Los colores principales utilizan el sistema HSL de Tailwind. El color primario es rojo (`#dc2626`) para reflejar la naturaleza de emergencia de la aplicación.

## 🔒 Seguridad

- Todos los datos sensibles se encriptan usando AES-256
- Almacenamiento local seguro con IndexedDB
- No se envían datos a servidores externos
- Protección contra XSS y CSRF

## 📱 Características PWA

- **Offline Support**: Service worker con Workbox
- **Installable**: Puede instalarse en home screen
- **Push Notifications**: Soporte preparado
- **Background Sync**: Sincronización en segundo plano
- **Responsive**: Diseño mobile-first

## 🌐 Soporte de Navegadores

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Añade nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## ⚠️ Aviso Legal

Esta aplicación proporciona información orientativa y recursos de apoyo comunitario. **No sustituye el asesoramiento legal profesional**. Siempre consulta con un abogado o defensor especializado para casos específicos.

## 📞 Contacto

Para reportar bugs o solicitar características, por favor abre un issue en GitHub.

## 🙏 Agradecimientos

- Comunidades de vivienda de la CDMX
- Organizaciones defensoras de derechos humanos
- Contribuidores de código abierto

---

<p align="center">Hecho con ❤️ para la comunidad de la Ciudad de México</p>
