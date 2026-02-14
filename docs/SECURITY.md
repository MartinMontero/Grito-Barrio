# Seguridad - Protocolo CDMX

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

Protocolo CDMX fue diseñado con **seguridad y privacidad como prioridades fundamentales**. Entendemos que la herramienta puede ser utilizada en situaciones de alto riesgo, donde la protección de datos puede ser crítica para la seguridad de las personas involucradas.

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
- **Derivación de claves**: PBKDF2 con 100,000 iteraciones
- **Salt**: 32 bytes aleatorios
- **IV**: 12 bytes único por operación

#### Cifrado en Transito

- Datos sincronizados utilizan cifrado TLS 1.3
- No se envían datos sin cifrado
- Verificación de certificados

### 2.3 Gestión de Sesiones

- Sesiones de 30 minutos de duración máxima
- Renovación automática de claves de sesión
- Invalidación remota posible
- Limpieza automática de datos temporales

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
[PBKDF2] Derivar clave (100,000 iteraciones)
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
  ITERATIONS: 100000,     // PBKDF2
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

### 4.3 Características del Modo Coerción

- **Datos Falsos**: Muestra información ficticia preconfigurada
- **Acceso Oculto**: Permite acceso a funciones ocultas con gestos especiales
- **Eliminación Programada**: Puede programar eliminación de datos reales después de un tiempo
- **Alerta Silenciosa**: Opción de enviar alerta a contactos de confianza

### 4.4 Configuración

```typescript
// Configurar contraseña de coerción
await securityManager.setDuressPassword('clave-coercion-123')

// Configurar datos falsos
await securityManager.setFakeData({
  incidents: [...],  // Incidentes ficticios
  contacts: [...],   // Contactos inocuos
  user: { ... }      // Perfil falso
})

// Activar alerta silenciosa
securityManager.configureSilentAlert({
  enabled: true,
  contacts: ['coordinador1', 'coordinador2'],
  message: 'Usuario en modo coerción'
})
```

### 4.5 Uso del Modo de Coerción

1. **Activación**: Ingresar contraseña de coerción en lugar de la real
2. **Funcionamiento Normal**: La app funciona normalmente pero con datos falsos
3. **Acceso Oculto**: Doble toque en el logo + gesto secreto para acceso real
4. **Eliminación**: Después del tiempo configurado, los datos reales se eliminan

---

## 5. Modelo de Amenazas

### 5.1 Amenazas Consideradas

| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| **Acceso físico al dispositivo** | Alto | Alta | Bloqueo, cifrado, autobloqueo |
| **Coerción para obtener contraseña** | Alto | Media | Modo de coerción |
| **Extracción de datos forense** | Alto | Baja | Cifrado, eliminación remota |
| **Malware en dispositivo** | Medio | Media | Sin permisos innecesarios |
| **Interceptación de comunicaciones** | Alto | Baja | E2E encryption, TLS |
| **Ingeniería social** | Alto | Media | Capacitación, UX segura |
| **Acceso por parte de autoridades** | Alto | Media | Modo coerción, eliminación |

### 5.2 Vector de Ataque: Dispositivo Perdido/Robado

**Escenario**: Un dispositivo con la app instalada es robado o confiscado.

**Defensas**:
1. Bloqueo biométrico/PIN del sistema operativo
2. Cifrado de todo el almacenamiento
3. Autobloqueo de la app
4. Contraseña de coerción
5. Eliminación remota posible (si hay conexión)

**Mitigación**: Los datos están cifrados y protegidos por múltiples capas.

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

1. **Email**: Envía un correo a `security@protocolo-cdmx.org`
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

## 7. Auditorías de Seguridad

### 7.1 Auditorías Internas

| Fecha | Alcance | Resultado |
|-------|---------|-----------|
| 2025-01-15 | Cifrado y almacenamiento | ✅ Aprobado |
| 2025-01-20 | Autenticación y sesiones | ✅ Aprobado |
| 2025-01-25 | Módulo de coerción | ✅ Aprobado |

### 7.2 Auditorías Externas (Planificadas)

- **Q2 2025**: Auditoría de seguridad completa por firma externa
- **Q3 2025**: Pentesting de aplicación móvil
- **Q4 2025**: Revisión de código por especialistas

### 7.3 Reportes de Vulnerabilidades

| CVE | Descripción | Severidad | Estado |
|-----|-------------|-----------|--------|
| Ninguna reportada | - | - | - |

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

- **Email**: security@protocolo-cdmx.org
- **PGP Key**: [Descargar clave pública](./security-pgp-key.asc)
- **Respuesta esperada**: 24-72 horas

---

**⚠️ IMPORTANTE**: Esta documentación de seguridad es pública intencionalmente. La seguridad por oscuridad no es seguridad real. La seguridad de Protocolo CDMX se basa en:

- Algoritmos criptográficos probados (AES-256, SHA-256, PBKDF2)
- Código abierto auditado por la comunidad
- Diseño con seguridad en mente desde el inicio

**Protocolo CDMX** - Protegiendo a los defensores de derechos humanos
