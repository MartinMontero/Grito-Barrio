# Seguridad - Grito & Barrio

**Versión**: 1.0.0  
**Última actualización**: Febrero 2025  
**Clasificación**: PÚBLICO

---

## Índice

1. [Visión General de Seguridad](#1-visión-general-de-seguridad)
2. [Características de Seguridad](#2-características-de-seguridad)
3. [Cifrado](#3-cifrado)
4. [Modo de Coerción (Duress Mode)](#4-modo-de-coerción-duress-mode)
5. [Modelo de Amenazas](#5-modelo-de-amenazas)
6. [Divulgación Responsable](#6-divulgación-responsable)
7. [Auditorías de Seguridad](#7-auditorías-de-seguridad)
8. [Mejores Prácticas](#8-mejores-prácticas)

---

## 1. Visión General de Seguridad

### 1.1 Filosofía de Seguridad

Grito & Barrio fue diseñado con **seguridad y privacidad como prioridades fundamentales**. Entendemos que la herramienta puede ser utilizada en situaciones de alto riesgo, donde la protección de datos puede ser crítica para la seguridad de las personas involucradas.

**Principios Clave**:

- **Cifrado de extremo a extremo**: Todos los datos sensibles se cifran en el dispositivo
- **Mínima recolección de datos**: Solo almacenamos lo necesario
- **Control del usuario**: Los usuarios tienen control total sobre sus datos
- **Protección ante coerción**: Modo de coerción para situaciones de peligro
- **Sin rastreo**: No incluimos analytics ni rastreadores de terceros

### 1.2 Alcance de Seguridad

```
┌────────────────────────────────────────────────────────────┐
│                    NIVELES DE SEGURIDAD                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  NIVEL 1: DISPOSITIVO                                       │
│  ├── Bloqueo biométrico/PIN                                │
│  ├── Autobloqueo por inactividad                           │
│  └── Cifrado de almacenamiento local                       │
│                                                            │
│  NIVEL 2: APLICACIÓN                                       │
│  ├── Cifrado AES-256-GCM                                   │
│  ├── Modo de coerción (Duress)                             │
│  └── Eliminación de emergencia                             │
│                                                            │
│  NIVEL 3: DATOS                                            │
│  ├── Seudónimos (sin nombres reales)                       │
│  ├── Metadatos eliminados                                  │
│  └── Ofuscación de ubicación                               │
│                                                            │
│  NIVEL 4: COMUNICACIÓN                                     │
│  ├── Sin servidor central                                  │
│  ├── P2P sync opcional                                     │
│  └── Sin logs en servidores                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Características de Seguridad

### 2.1 Autenticación y Acceso

#### Bloqueo por Contraseña/PIN

- Configuración de PIN o contraseña alfanumérica
- Bloqueo automático después de 5 intentos fallidos
- Tiempo de espera progresivo entre intentos fallidos
- Opción de autenticación biométrica (huella/facial)

```typescript
interface SecurityConfig {
  autoLockTimeout: number      // minutos
  maxFailedAttempts: number    // 5 por defecto
  lockoutDuration: number      // minutos
  biometricEnabled: boolean
}
```

#### Autobloqueo

El sistema se bloquea automáticamente después de un período de inactividad configurable (5 minutos por defecto).

### 2.2 Protección de Datos

#### Cifrado en Reposo

- **Algoritmo**: AES-256-GCM
- **Derivación de claves**: PBKDF2 con 600,000 iteraciones
- **Salt**: 32 bytes aleatorios
- **IV**: 12 bytes único por operación

#### Transmisión de datos

Grito & Barrio es **offline-first y no tiene servidor central**: los datos de
incidentes **no salen del dispositivo**. No hay sincronización en la nube ni
telemetría. La única forma de mover datos entre dispositivos es exportar un
**respaldo cifrado con contraseña** (AES-256-GCM) y restaurarlo manualmente.

### 2.3 Gestión de Sesiones

- La clave de cifrado vive **solo en memoria** mientras la app está desbloqueada.
- Autobloqueo por inactividad (configurable; 5 min por defecto): vuelve a pedir
  la contraseña y descarta la clave de memoria.
- Al recargar o cerrar la app, la clave se pierde y hay que volver a desbloquear.
- **No existe "invalidación remota"** (no hay servidor): la protección es local.

### 2.4 Auditoría de Seguridad

```typescript
interface SecurityLog {
  id: string
  timestamp: string
  type: 'login' | 'logout' | 'duress' | 'lock' | 'unlock' | 'wipe' | 'failed_attempt'
  details: string
  pseudonym?: string
  ip?: string  // Solo local, no se envía a servidores
}
```

---

## 3. Cifrado

### 3.1 Arquitectura de Cifrado

```
Datos Sensibles
      ↓
[TextEncoder] → ArrayBuffer
      ↓
[PBKDF2] Derivar clave (600,000 iteraciones)
      ↓
[AES-256-GCM] Cifrar con IV aleatorio
      ↓
[Base64] Codificar para almacenamiento
```

### 3.2 Detalles Técnicos

```typescript
const CRYPTO_CONSTANTS = {
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,        // bits
  ITERATIONS: 600000,     // PBKDF2
  SALT_LENGTH: 32,        // bytes
  IV_LENGTH: 12,          // bytes
  TAG_LENGTH: 128,        // bits
  HASH_ALGORITHM: 'SHA-256',
  KEY_DERIVATION: 'PBKDF2'
}
```

### 3.3 Ejemplo de Uso

```typescript
import { encryptData, decryptData, hashPassword } from '@/lib/encryption'

// Cifrar datos sensibles
const userData = { name: 'Seudónimo', phone: '555-0123' }
const encrypted = await encryptData(JSON.stringify(userData), 'password')

// Almacenar en IndexedDB
await db.set('user-profile', encrypted)

// Descifrar al usar
const encryptedStored = await db.get('user-profile')
const decrypted = await decryptData(encryptedStored, 'password')
const profile = JSON.parse(decrypted)
```

### 3.4 Gestión de Claves

- Las claves se derivan de la contraseña del usuario
- No se almacenan claves en texto plano
- Claves en memoria por tiempo limitado (30 min)
- Limpieza segura de memoria al cerrar sesión

---

## 4. Modo de Coerción (Duress Mode)

### 4.1 ¿Qué es el Modo de Coerción?

El **Modo de Coerción** es una característica de seguridad que permite a los usuarios acceder a una versión "falsa" de la aplicación cuando son forzados a revelar su contraseña bajo coerción.

### 4.2 Funcionamiento

```
Usuario ingresa contraseña
        ↓
┌─────────────────────┐
│ ¿Es contraseña real?│──Sí──→ Acceso normal
└─────────────────────┘
        ↓ No
┌─────────────────────┐
│ ¿Es contraseña de   │──Sí──→ Modo Coerción
│ coerción?           │       (datos falsos)
└─────────────────────┘
        ↓ No
    Acceso denegado
```

### 4.3 Cómo funciona realmente

La contraseña de coerción desbloquea una **bóveda señuelo independiente**, con su
propia clave de cifrado. No es "los mismos datos ocultos": es un espacio
**separado y vacío/ficticio**, de modo que los datos reales permanecen cifrados e
inaccesibles con esa contraseña.

- **Aislamiento criptográfico real**: la clave de coerción no puede descifrar la
  bóveda real (son DEK distintas envueltas en ranuras separadas).
- **Negación plausible**: el registro en disco no marca cuál ranura es "coerción";
  no revela que exista una contraseña de coerción.
- **Borrado automático**: al desbloquear con la contraseña de coerción se
  **programa un borrado de pánico** (con un retraso configurable) que es
  **durable**: sobrevive a recargas y al cierre de la app, y se ejecuta al
  reabrir si venció el plazo.

### 4.4 Configuración

```typescript
// Crear la bóveda real (primera contraseña)
await securityManager.setRealPassword('mi-contraseña-fuerte')

// Añadir una contraseña de coerción (crea la bóveda señuelo)
await securityManager.setDuressPassword('clave-coercion-123')
```

### 4.5 Uso del Modo de Coerción

1. **Activación**: introducir la contraseña de coerción en la pantalla de bloqueo.
2. **Apariencia**: la app abre la bóveda señuelo (sin tus datos reales).
3. **Borrado programado**: se arma un borrado de pánico durable de TODOS los datos.
4. **Recuperación**: si fue un falso positivo, cancela el borrado desde Seguridad
   antes de que venza el plazo.

---

## 5. Modelo de Amenazas

### 5.1 Amenazas Consideradas

| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| **Acceso físico al dispositivo** | Alto | Alta | Bloqueo, cifrado, autobloqueo |
| **Coerción para obtener contraseña** | Alto | Media | Modo de coerción |
| **Extracción de datos forense** | Alto | Baja | Cifrado AES-256-GCM, clave solo en memoria |
| **Malware en dispositivo** | Medio | Media | Sin permisos innecesarios, sin servidor |
| **Interceptación de comunicaciones** | Bajo | Baja | No hay transmisión: los datos no salen del dispositivo |
| **Ingeniería social** | Alto | Media | Capacitación, UX segura |
| **Acceso por parte de autoridades** | Alto | Media | Modo coerción, borrado de pánico local |

### 5.2 Vector de Ataque: Dispositivo Perdido/Robado

**Escenario**: Un dispositivo con la app instalada es robado o confiscado.

**Defensas**:
1. Bloqueo biométrico/PIN del sistema operativo
2. Cifrado AES-256-GCM de los datos sensibles (incidentes, evidencia)
3. Autobloqueo de la app y clave de cifrado solo en memoria
4. Contraseña de coerción (bóveda señuelo)
5. Borrado de pánico **local** y durable (no requiere conexión)

**Mitigación**: sin la contraseña, los datos cifrados son irrecuperables.

### 5.3 Vector de Ataque: Coerción Física

**Escenario**: Un usuario es forzado a revelar su contraseña bajo amenaza.

**Defensas**:
1. Contraseña de coerción con datos falsos
2. Eliminación programada de datos reales
3. Alerta silenciosa a contactos de confianza
4. Acceso oculto a datos reales con gesto secreto

**Mitigación**: El atacante obtiene acceso a datos ficticios mientras los datos reales permanecen protegidos.

### 5.4 Vector de Ataque: Análisis Forense

**Escenario**: Intentan extraer datos del almacenamiento del dispositivo.

**Defensas**:
1. Cifrado AES-256 de todos los datos
2. Claves derivadas de contraseña (no almacenadas)
3. Eliminación segura con sobrescritura
4. Sin copias de seguridad en la nube sin cifrado

**Mitigación**: Sin la contraseña, los datos son irrecuperables.

---

## 6. Divulgación Responsable

### 6.1 Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad, por favor sigue este proceso:

**NO abrir un issue público** - Esto podría poner a los usuarios en riesgo.

### 6.2 Proceso de Reporte

1. **GitHub Security Advisory**: usa "Report a vulnerability" en la pestaña
   *Security* del repositorio (privado hasta su resolución coordinada).
2. **Asunto**: `[SECURITY] Breve descripción de la vulnerabilidad`
3. **Contenido**:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de mitigación (opcional)

### 6.3 Política de Respuesta

| Tiempo | Acción |
|--------|--------|
| 24 horas | Confirmación de recepción |
| 72 horas | Evaluación inicial |
| 7 días | Plan de mitigación |
| 30 días | Parche publicado (según severidad) |
| 90 días | Divulgación pública coordinada |

### 6.4 Reconocimiento

Los investigadores de seguridad que reporten vulnerabilidades válidas serán reconocidos públicamente (si así lo desean) en nuestro Hall of Fame.

---

## 7. Estado de Seguridad y Limitaciones

### 7.1 Estado actual

- El núcleo criptográfico (AES-256-GCM, PBKDF2 600k, bóveda de claves, borrado de
  pánico, coerción) está implementado y cubierto por **pruebas reales** que
  ejercitan el código de producción (cifrado/descifrado, contraseña incorrecta,
  aislamiento de la bóveda señuelo, persistencia fail-closed).
- **Aún no se ha realizado** una auditoría de seguridad externa independiente.
  Antes de un despliegue de alto riesgo, recomendamos una revisión por terceros.

### 7.2 Limitaciones conocidas (importante)

Sé honesto sobre lo que esta herramienta **no** puede hacer:

- **Crypto en el navegador**: la seguridad depende del navegador/SO y de la Web
  Crypto API. Un dispositivo comprometido (malware, keylogger, root) puede
  capturar la contraseña o la memoria mientras la app está desbloqueada.
- **Datos en uso**: mientras la app está desbloqueada, la clave está en memoria y
  los datos son legibles. El autobloqueo reduce, pero no elimina, esta ventana.
- **Metadatos / sistema operativo**: el SO, las copias de seguridad del sistema y
  los servicios del navegador pueden retener rastros fuera del control de la app.
  El borrado de pánico limpia el almacenamiento de la app, no copias del SO.
- **Sin borrado remoto**: no hay servidor; no se puede borrar a distancia.
- **Perfil/ajustes locales**: el seudónimo y los ajustes se guardan en
  `localStorage` (no cifrado). Los datos sensibles (incidentes, evidencia,
  documentación) sí se cifran cuando defines una contraseña.
- **Coacción sofisticada**: la negación plausible ayuda, pero un adversario que
  sepa que existe esta app puede exigir explícitamente una segunda contraseña.

### 7.3 Reporte de vulnerabilidades

Usa los **GitHub Security Advisories** del repositorio (Security → Report a
vulnerability) en lugar de abrir un issue público.

---

## 8. Mejores Prácticas

### 8.1 Para Usuarios

#### Configuración Recomendada

1. **Contraseña Fuerte**
   - Mínimo 12 caracteres
   - Combinar mayúsculas, minúsculas, números y símbolos
   - No reutilizar contraseñas

2. **Habilitar Modo de Coerción**
   - Configurar contraseña de coerción
   - Definir datos falsos realistas
   - Practicar activación

3. **Autobloqueo**
   - Configurar 5 minutos de inactividad
   - Habilitar bloqueo biométrico si está disponible

4. **Backup Seguro**
   - Exportar backup cifrado regularmente
   - Almacenar en ubicación segura
   - Probar restauración periódicamente

#### Lista de Verificación de Seguridad

- [ ] Contraseña fuerte configurada
- [ ] Modo de coerción activado
- [ ] Contraseña de coerción memorizada
- [ ] Autobloqueo habilitado
- [ ] Biometría activada (si disponible)
- [ ] Backup cifrado realizado
- [ ] Datos falsos de coerción configurados
- [ ] Alertas silenciosas configuradas

### 8.2 Para Desarrolladores

#### Desarrollo Seguro

1. **Nunca hardcodear**: No incluir credenciales o claves en el código
2. **Sanitizar input**: Validar y limpiar todas las entradas de usuario
3. **Principio de mínimo privilegio**: Solo solicitar permisos necesarios
4. **Logging seguro**: No loggear datos sensibles
5. **Dependencias actualizadas**: Mantener todas las librerías actualizadas

#### Code Review Checklist de Seguridad

- [ ] No hay datos sensibles hardcodeados
- [ ] Todas las entradas están validadas
- [ ] Consultas a base de datos son seguras
- [ ] No hay información de debug en producción
- [ ] Cookies configuradas correctamente (secure, httpOnly, sameSite)
- [ ] CSP (Content Security Policy) configurado
- [ ] Headers de seguridad presentes

### 8.3 Para Organizaciones

#### Políticas Recomendadas

1. **Capacitación**: Entrenar a usuarios en seguridad y uso del modo de coerción
2. **Protocolos**: Establecer protocolos de respaldo y recuperación
3. **Auditorías**: Realizar auditorías de seguridad regulares
4. **Respuesta**: Tener plan de respuesta ante incidentes de seguridad
5. **Actualizaciones**: Mantener la aplicación actualizada

---

## Contacto de Seguridad

- **Reporte privado**: GitHub Security Advisories del repositorio
  (`Security` → `Report a vulnerability`).
- **Respuesta esperada**: lo antes posible (proyecto comunitario, sin SLA formal).

---

**⚠️ IMPORTANTE**: Esta documentación de seguridad es pública intencionalmente. La seguridad por oscuridad no es seguridad real. La seguridad de Grito & Barrio se basa en:

- Algoritmos criptográficos probados (AES-256, SHA-256, PBKDF2)
- Código abierto auditado por la comunidad
- Diseño con seguridad en mente desde el inicio

**Grito & Barrio** - Protegiendo a los defensores de derechos humanos
