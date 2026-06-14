/**
 * Protocol Data
 * Protocolo CDMX - Static Content
 */

import type { Protocol, LegalResource, Resource } from "@/types";

export const protocols: Protocol[] = [
  {
    id: "prevencion-1",
    category: "prevention",
    title: "Prevención de Desalojos",
    description:
      "Medidas preventivas para evitar desalojos ilegales antes de que ocurran",
    isEmergency: false,
    steps: [
      {
        id: "p1-s1",
        order: 1,
        title: "Documenta tu situación de vivienda",
        description:
          "Reúne y guarda en lugar seguro todos los documentos que acrediten tu residencia y derechos de ocupación.",
        actions: [
          "Conserva copias de contratos de arrendamiento o comodato",
          "Guarda recibos de pago de renta o servicios a tu nombre",
          "Documenta fotográficamente el estado de la vivienda",
          "Mantén identificación oficial vigente con la dirección actual",
        ],
        estimatedTime: "1-2 días",
      },
      {
        id: "p1-s2",
        order: 2,
        title: "Establece comunicación con el propietario",
        description:
          "Mantén canales de comunicación abiertos y documenta todas las interacciones.",
        actions: [
          "Comunicación preferentemente por escrito (WhatsApp, email)",
          "Guarda capturas de pantalla de todas las conversaciones",
          "Solicita acuerdos formales por escrito",
          "No firmes documentos sin asesoría legal",
        ],
        warnings: [
          "Nunca firmes documentos que no comprendas completamente",
          "No aceptes presiones para desalojar voluntariamente sin garantías",
        ],
      },
      {
        id: "p1-s3",
        order: 3,
        title: "Conoce tus derechos",
        description:
          "Infórmate sobre tus derechos como inquilino u ocupante legal.",
        actions: [
          "Consulta la Ley de Vivienda del CDMX",
          "Busca asesoría en organizaciones de vivienda",
          "Conoce el procedimiento legal de desalojo formal",
          "Entiende que ningún desalojo puede ser ejecutado sin orden judicial",
        ],
      },
    ],
    resources: [
      {
        id: "r1",
        type: "organization",
        name: "Colectivo de Vivienda CDMX",
        description: "Asesoría legal gratuita en temas de vivienda",
      },
    ],
  },
  {
    id: "respuesta-inmediata",
    category: "immediate_response",
    title: "Respuesta Inmediata",
    description: "Qué hacer durante un desalojo en proceso",
    isEmergency: true,
    steps: [
      {
        id: "ri-s1",
        order: 1,
        title: "Mantén la calma y activa el protocolo",
        description:
          "Si hay presencia de fuerza pública o particulares intentando desalojar, actúa de inmediato.",
        actions: [
          "Presiona el botón de emergencia en esta app",
          "Solicita ver la orden judicial de desalojo",
          "Exige que se respete el debido proceso",
          "No resistas físicamente, pero documenta todo",
        ],
        warnings: [
          "Ningún desalojo es legal sin orden firmada por un juez",
          "La policía no puede desalojar sin orden judicial",
          "Documenta nombres y placas de servidores públicos",
        ],
        estimatedTime: "Inmediato",
      },
      {
        id: "ri-s2",
        order: 2,
        title: "Contacta a tu red de apoyo",
        description:
          "Activa inmediatamente tus contactos de emergencia y organizaciones de apoyo.",
        actions: [
          "Llama a tus contactos de emergencia registrados",
          "Contacta a organizaciones de derechos humanos",
          "Solicita presencia de representantes legales",
          "Comunica la situación a vecinos y comunidad",
        ],
        estimatedTime: "5-10 minutos",
      },
      {
        id: "ri-s3",
        order: 3,
        title: "Documenta la situación",
        description: "Graba, fotografía y documenta todo lo que ocurra.",
        actions: [
          "Graba video de todas las personas presentes",
          "Fotografía documentos que presenten",
          "Anota nombres y placas de identificación",
          "Conserva toda la evidencia de manera segura",
        ],
        warnings: [
          "Tienes derecho a grabar en espacios públicos",
          "La evidencia digital es válida ante autoridades",
        ],
      },
      {
        id: "ri-s4",
        order: 4,
        title: "Busca asesoría legal urgente",
        description: "Contacta abogados o defensores especializados.",
        actions: [
          "Llama a la línea de orientación jurídica gratuita",
          "Contacta al Instituto de Defensoría Pública",
          "Solicita amparo si es necesario",
          "No firmes ningún documento sin asesoría",
        ],
      },
    ],
    resources: [
      {
        id: "r2",
        type: "emergency_service",
        name: "Policía CDMX",
        contact: { phone: "555-524-2507" },
        description: "Denuncia desalojos ilegales",
      },
    ],
  },
  {
    id: "proceso-legal",
    category: "legal_process",
    title: "Proceso Legal de Desalojo",
    description: "Entiende y navega el proceso legal formal de desalojo",
    isEmergency: false,
    steps: [
      {
        id: "pl-s1",
        order: 1,
        title: "Notificación inicial",
        description: "El propietario debe iniciar un juicio civil de desalojo.",
        actions: [
          "Verifica que recibas notificación por parte del juzgado",
          "Asegúrate de que tengas tiempo de contrademanda",
          "Busca asesoría legal inmediata",
          "No ignores citatorios del juzgado",
        ],
      },
      {
        id: "pl-s2",
        order: 2,
        title: "Contestación de demanda",
        description: "Tienes derecho a contestar y presentar defensas.",
        actions: [
          "Contrademanda dentro del plazo legal (generalmente 9 días)",
          "Presenta excepciones y defensas procedentes",
          "Solicita medidas cautelares si aplica",
          "Ofrece pruebas de tu residencia legal",
        ],
        estimatedTime: "9 días hábiles",
      },
      {
        id: "pl-s3",
        order: 3,
        title: "Audiencia y resolución",
        description: "El juez resolverá conforme a derecho.",
        actions: [
          "Asiste a todas las audiencias programadas",
          "Presenta testigos y evidencias documentales",
          "Solicita la intervención del Ministerio Público si hay vulnerabilidad",
          "Conoce la resolución y tus opciones de apelación",
        ],
      },
    ],
    resources: [],
  },
  {
    id: "documentacion",
    category: "documentation",
    title: "Documentación de Evidencias",
    description: "Cómo documentar adecuadamente para defensa legal",
    isEmergency: false,
    steps: [
      {
        id: "doc-s1",
        order: 1,
        title: "Evidencia fotográfica y videográfica",
        description: "Documenta visualmente toda la situación.",
        actions: [
          "Fotografía el estado actual de la vivienda",
          "Graba videos con fecha y hora visible",
          "Documenta a las personas involucradas",
          "Conserva copias de seguridad en múltiples ubicaciones",
        ],
      },
      {
        id: "doc-s2",
        order: 2,
        title: "Documentos legales",
        description: "Organiza y respalda toda tu documentación legal.",
        actions: [
          "Digitaliza contratos de arrendamiento",
          "Guarda recibos de pago de los últimos 2 años",
          "Respaldar identificaciones oficiales",
          "Conserva copias de correspondencia con el arrendador",
        ],
      },
    ],
    resources: [],
  },
];

export const legalResources: LegalResource[] = [
  {
    id: "legal-1",
    category: "rights",
    title: "Derechos del Inquilino",
    content: `Como inquilino en la Ciudad de México, tienes los siguientes derechos fundamentales:

1. **Derecho a vivienda digna**: Toda persona tiene derecho a una vivienda digna y decorosa.

2. **Prohibición de desalojo forzoso**: Nadie puede ser desalojado de su vivienda sin orden judicial previa.

3. **Debido proceso**: Todo desalojo debe seguir un procedimiento legal establecido.

4. **Contrademanda**: Tienes derecho a contestar cualquier demanda de desalojo.

5. **Asesoría legal**: Derecho a ser asesorado por un defensor en todo momento del proceso.

6. **Notificación previa**: Debes ser notificado con tiempo razonable de cualquier procedimiento legal.

7. **Plazos legales**: Los plazos para contestar deben ser respetados.

8. **Respeto a la dignidad**: En ningún caso puede violentarse tu integridad física o moral durante un desalojo.`,
    lastUpdated: new Date("2024-01-15"),
  },
  {
    id: "legal-2",
    category: "laws",
    title: "Ley de Vivienda de la CDMX",
    content: `La Ley de Vivienda para la Ciudad de México establece:

**Artículo 1°**: Toda persona tiene derecho a una vivienda digna y decorosa.

**Artículo 5°**: El derecho a la vivienda es irrenunciable.

**Artículo 12°**: Prohibición de desalojo forzoso:
- Nadie puede ser privado de su vivienda sino por orden escrita de autoridad competente
- El desalojo debe fundarse y motivarse conforme a la ley
- Debe respetarse el debido proceso en todo momento

**Artículo 15°**: Las autoridades deben garantizar el acceso a la vivienda y prevenir los desalojos forzosos.

**Artículo 20°**: En caso de desalojo, las autoridades deben asegurar el traslado digno de las personas y sus bienes.`,
    lawReference: "Ley de Vivienda para la Ciudad de México",
    articleReference: "Artículos 1°, 5°, 12°, 15° y 20°",
    lastUpdated: new Date("2024-01-15"),
  },
  {
    id: "legal-3",
    category: "defenses",
    title: "Defensas Legales Disponibles",
    content: `Ante un juicio de desalojo, puedes presentar las siguientes defensas:

**1. Excepciones de Mérito:**
- Falta de legitimidad del demandante
- Falta de personalidad del demandado
- Falta de agotamiento de vías previas
- Incompetencia del juez

**2. Defensas Sustanciales:**
- Pago de rentas adeudadas (si es por falta de pago)
- Cumplimiento de contrato
- Prescripción de la acción
- Arras o depósito en consignación
- Mejoras al inmueble

**3. Medidas Cautelares:**
- Suspensión del desalojo
- Provisión de medidas de protección
- Amparo indirecto ante vulneración de derechos fundamentales

**4. Recursos:**
- Apelación contra la sentencia
- Amparo directo
- Revisión ante instancias superiores`,
    lastUpdated: new Date("2024-01-15"),
  },
];

export const externalResources: Resource[] = [
  {
    id: "res-1",
    type: "government",
    name: "Instituto de Defensoría Pública CDMX",
    description:
      "Asesoría y representación legal gratuita para personas sin recursos",
    contact: {
      phone: "555-009-2600",
      email: "orientacionjuridica@icdmx.org",
    },
    address: "República de Brasil No. 33, Col. Centro, Cuauhtémoc, CDMX",
    hours: "Lunes a Viernes 9:00 - 18:00 hrs",
  },
  {
    id: "res-2",
    type: "organization",
    name: "Centro de Derechos Humanos Fray Francisco de Vitoria",
    description: "Acompañamiento a comunidades en riesgo de desalojo",
    contact: {
      phone: "555-574-2800",
      email: "contacto@frayvitoria.org.mx",
    },
  },
  {
    id: "res-3",
    type: "emergency_service",
    name: "Línea de Emergencias CDMX",
    description: "Emergencias y denuncias",
    contact: {
      phone: "911",
    },
    hours: "24 horas",
  },
  {
    id: "res-4",
    type: "government",
    name: "Comisión de Derechos Humanos CDMX",
    description: "Quejas por violaciones a derechos humanos",
    contact: {
      phone: "555-026-9300",
      email: "contacto@cdhcdmx.org.mx",
    },
  },
  {
    id: "res-5",
    type: "legal_aid",
    name: "Bufete Jurídico Universitario UNAM",
    description: "Asesoría legal gratuita",
    contact: {
      phone: "555-622-0806",
    },
  },
];

export const emergencyContacts = [
  { name: "Emergencias", number: "911", type: "emergency" },
  { name: "Policía CDMX", number: "555-524-2507", type: "police" },
  { name: "Cruz Roja", number: "555-557-5757", type: "medical" },
  { name: "Bomberos", number: "068", type: "emergency" },
  { name: "Locatel", number: "5658-1111", type: "information" },
];
