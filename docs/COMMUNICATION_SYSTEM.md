# Contact and Communication Management System

Grito & Barrio features a comprehensive contact management and communication system for rapid coordination during incidents.

## Overview

The communication system provides:
- **Contact Directory**: Organized contact list with categories and search
- **Contact Tree**: Visual hierarchical view for incident coordination
- **Quick Dial**: Large emergency buttons for one-tap calling
- **Message Templates**: Pre-written messages for rapid communication
- **Call Logging**: Track all communication for accountability

## Components

### 1. ContactDirectory

Full-featured contact management with categories, search, and CRUD operations.

```tsx
import { ContactDirectory } from '@/components/features'

function ContactsPage() {
  return (
    <ContactDirectory
      contacts={contacts}
      onCall={(contact, phone) => console.log('Calling', phone)}
      onEmail={(contact, email) => console.log('Emailing', email)}
      onAdd={(contact) => saveContact(contact)}
      onEdit={(contact) => updateContact(contact)}
      onDelete={(id) => deleteContact(id)}
      onImport={(contacts) => importContacts(contacts)}
      onExport={() => exportContacts()}
    />
  )
}
```

**Features:**
- 10 contact categories (Brigada, Emergencias, Derechos Humanos, Legal, etc.)
- 5 priority levels (P1-Crítica to P5-Referencia)
- Search by name, pseudonym, role, phone
- Filter by category
- Favorites/quick access
- Add/edit/delete contacts
- Import/export JSON
- Phone and email actions

**Categories:**
- `brigada` - Brigade members
- `emergencias` - C5, ERUM, Cruz Roja
- `ddhh` - Derechos Humanos (CDHCM, CNDH)
- `legal` - Legal support
- `coalicion` - Coalition partners
- `prensa` - Media contacts
- `albergues` - Safe houses/shelters
- `medicos` - Medical professionals
- `transporte` - Transportation
- `otros` - Others

### 2. ContactTree

Visual hierarchical tree for incident coordination showing command structure.

```tsx
import { ContactTree } from '@/components/features'

function CoordinationPage() {
  return (
    <ContactTree
      contacts={contacts}
      tree={incidentTree}
      onCall={(contactId) => callContact(contactId)}
      onMessage={(contactId) => messageContact(contactId)}
      onUpdateNode={(nodeId, updates) => updateNode(nodeId, updates)}
      onAddNode={(parentId, contactId) => addToTree(parentId, contactId)}
      onRemoveNode={(nodeId) => removeFromTree(nodeId)}
      onSaveTree={(tree) => saveTree(tree)}
    />
  )
}
```

**Hierarchy Levels:**
1. **Level 1**: Incident Leader
2. **Level 2**: Role leads (Security, Medical, Legal, etc.)
3. **Level 3**: Team members
4. **Level 4**: External contacts

**Status Indicators:**
- 🟢 Online
- 🔵 On scene
- 🟡 Dispatched
- ⚪ Standby
- 🔴 Offline

**Features:**
- Drag and drop (in edit mode)
- Status updates via dropdown
- Response time tracking
- Tap to call/message
- Save tree templates

### 3. QuickDial

Large emergency buttons for instant calling with confirmation dialogs.

```tsx
import { QuickDial } from '@/components/features'

function EmergencyPage() {
  return (
    <QuickDial
      contacts={contacts}
      onCall={(number, name) => logCall(number, name)}
    />
  )
}
```

**Emergency Buttons:**
- 🚨 **C5 CDMX** (55-5533-5533) - Command center
- 🚑 **ERUM** (55-5271-3000) - Medical rescue
- 🏥 **Cruz Roja** (55-5557-5757) - Red Cross
- ⚖️ **CDHCM** (55-5029-9300) - Human Rights
- 👥 **Coalición** - Mass alert
- 📞 **Legal Urgente** - On-call lawyer

**Features:**
- Large touch targets (min 140px height)
- Confirmation dialogs for critical numbers
- Recent calls list
- Call logging with timestamps
- Export call history

### 4. MessageTemplates

Pre-written message templates with variable substitution.

```tsx
import { MessageTemplates } from '@/components/features'

function TemplatesPage() {
  return (
    <MessageTemplates
      templates={templates}
      brigadeName="Brigada CDMX Centro"
      onSend={(content, platform) => sendMessage(content, platform)}
      onSaveTemplate={(template) => saveTemplate(template)}
      onDeleteTemplate={(id) => deleteTemplate(id)}
    />
  )
}
```

**Default Templates:**

1. **Alerta de Desalojo** (Alert)
   ```
   Alerta de la Brigada [brigada]. Posible desalojo en [direccion]. 
   Solicitamos apoyo urgente. Amenaza: [nivel]. 
   Personas en riesgo: [numero]. Contacto: [contacto].
   ```

2. **Solicitud de Punto Seguro** (Request)
   ```
   Solicitamos activación de punto seguro [albergue] para [numero] 
   personas afectadas por desalojo en [direccion]. 
   ETA: [tiempo]. Contacto: [contacto].
   ```

3. **Solicitud Legal Urgente** (Request)
   ```
   Urgente: Se requiere presencia legal inmediata en [direccion]. 
   Desalojo en progreso. Juez/actuario presente: [detalles]. 
   Tiempo estimado: [tiempo].
   ```

4. **Respuesta a Prensa** (Response)
   ```
   Gracias por su interés. La Brigada [brigada] puede ofrecer 
   información verificada sobre el caso en [direccion]. 
   Solicitamos respeto a la privacidad de las personas afectadas. 
   Contacto prensa: [contacto].
   ```

5. **Documentación Amenaza** (Documentation)
   ```
   Documentando amenaza de represalia: Fecha/hora: [fecha]. 
   Ubicación: [direccion]. Agresores: [descripcion]. 
   Testigos: [testigos]. Evidencia adjunta.
   ```

6. **Activación Brigada** (Alert)
   ```
   ATENCIÓN BRIGADISTAS: Activación inmediata. Incidente en [direccion]. 
   Punto de encuentro: [punto]. Hora: [hora]. 
   Traer: [equipo]. Coordinador: [coordinador].
   ```

7. **Solicitud Médica** (Request)
   ```
   Se solicita apoyo médico urgente en [direccion]. [numero] personas 
   lesionadas. Tipo de lesiones: [lesiones]. Ambulancia requerida: [si/no].
   ```

**Template Categories:**
- `alert` - Emergency alerts
- `request` - Support requests
- `response` - Replies to inquiries
- `documentation` - Incident documentation
- `custom` - User-created templates

**Variables:**
Templates support dynamic variables in square brackets:
- `[brigada]` - Brigade name
- `[direccion]` - Address/location
- `[numero]` - Number of people
- `[tiempo]` - ETA or time
- `[contacto]` - Contact info
- `[nivel]` - Threat level
- Custom variables

**Sharing Options:**
- Copy to clipboard
- Share via WhatsApp
- Send via SMS

## Types

### Contact

```typescript
interface Contact {
  id: string
  name: string
  pseudonym?: string
  category: ContactCategory
  role: string
  organization?: string
  phones: {
    number: string
    type: 'mobile' | 'landline' | 'whatsapp' | 'signal'
    primary: boolean
  }[]
  emails: {
    address: string
    primary: boolean
  }[]
  priority: 1 | 2 | 3 | 4 | 5
  availability: {
    status: AvailabilityStatus
    hours?: string
    notes?: string
  }
  notes?: string
  isFavorite: boolean
  lastContacted?: string
}
```

### ContactTree

```typescript
interface ContactTree {
  id: string
  name: string
  incidentId?: string
  root: ContactTreeNode
}

interface ContactTreeNode {
  id: string
  contactId: string
  level: number
  parentId: string | null
  role: string
  status: 'online' | 'offline' | 'dispatched' | 'on_scene' | 'standby'
  responseTime?: number
  children: ContactTreeNode[]
}
```

### MessageTemplate

```typescript
interface MessageTemplate {
  id: string
  name: string
  category: 'alert' | 'request' | 'response' | 'documentation' | 'custom'
  content: string
  variables: string[]
  isDefault: boolean
  usageCount: number
}
```

## Usage Examples

### Adding a New Contact

```typescript
const newContact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Dr. María González',
  pseudonym: 'DocM',
  category: 'medicos',
  role: 'Médico Brigadista',
  organization: 'Brigada CDMX',
  phones: [{
    number: '55-9876-5432',
    type: 'signal',
    primary: true
  }],
  emails: [],
  priority: 2,
  availability: {
    status: 'available',
    hours: 'L-V 18:00-06:00'
  },
  isFavorite: true
}

// ContactDirectory handles the save
```

### Creating a Custom Template

```typescript
const customTemplate = {
  name: 'Solicitud de Apoyo Legal',
  category: 'request' as const,
  content: 'Se solicita apoyo legal urgente en [direccion]. Tipo de caso: [tipo]. Personas afectadas: [numero].',
  variables: ['direccion', 'tipo', 'numero'],
  isDefault: false
}

// Save via MessageTemplates component
```

### Managing Contact Tree

```typescript
// During incident setup
const incidentTree: ContactTree = {
  id: 'tree-1',
  name: 'Desalojo Colonia Roma',
  root: {
    id: 'root',
    contactId: '1',
    level: 1,
    parentId: null,
    role: 'Incident Leader',
    status: 'online',
    children: [
      {
        id: 'security-lead',
        contactId: '2',
        level: 2,
        parentId: 'root',
        role: 'Security Lead',
        status: 'on_scene',
        responseTime: 12,
        children: []
      }
    ]
  }
}
```

### Making an Emergency Call

```typescript
// QuickDial component handles this automatically
// But you can also trigger programmatically:

function emergencyCall(number: string, name: string) {
  // Log the call
  const callLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    number,
    contactName: name,
    category: 'emergencias',
    status: 'completed'
  }
  
  // Save to localStorage
  const existing = JSON.parse(localStorage.getItem('protocolo_call_log') || '[]')
  localStorage.setItem('protocolo_call_log', JSON.stringify([...existing, callLog]))
  
  // Trigger call
  window.location.href = `tel:${number.replace(/-/g, '')}`
}
```

## Data Persistence

### Contacts Storage
- Primary: IndexedDB (via store system)
- Backup: JSON export/import
- Sync: Via sync queue when online

### Call Log
- Stored in: localStorage
- Key: `protocolo_call_log`
- Format: JSON array of CallLog objects
- Auto-cleanup: Keep last 1000 entries

### Message Templates
- Default templates: Hardcoded
- Custom templates: IndexedDB
- Export: JSON file

## Integration with Other Systems

### Incident Integration
```typescript
// Auto-populate variables from incident
const incident = useAppStore(state => state.activeIncident)

const variables = {
  direccion: incident?.location.address,
  numero: incident?.occupantsAtRisk?.toString(),
  nivel: incident?.threatLevel
}
```

### Security Integration
```typescript
// Hide sensitive contact info in duress mode
const isDuress = securityManager.isDuressActive()

if (isDuress) {
  // Show only fake/generic contacts
  return FAKE_CONTACTS
}
```

### Sync Integration
```typescript
// Queue contact updates for sync
import { queueAction } from '@/lib/sync'

function updateContact(contact: Contact) {
  // Update locally
  db.put('contacts', contact)
  
  // Queue for sync
  queueAction('UPDATE', 'contacts', contact)
}
```

## UI Guidelines

### Contact Cards
- Minimum 72px touch targets
- Clear visual hierarchy
- Color-coded by category
- Priority badges (P1-P5)
- Swipe actions (mobile)

### Emergency Buttons
- Minimum 140px height
- High contrast colors
- Clear icons and labels
- Haptic feedback on press
- Confirmation for critical numbers

### Message Preview
- Live variable substitution
- Character count
- Preview before send
- One-tap copy/share

## Performance

### Optimization
- Virtualized lists for large contact directories
- Debounced search (300ms)
- Lazy load contact avatars
- Tree virtualization for deep hierarchies
- Memoized template processing

### Accessibility
- Screen reader support
- High contrast mode
- Large text support
- VoiceOver/TalkBack labels
- Keyboard navigation

## Security Considerations

1. **Contact Privacy**
   - Pseudonyms for brigade members
   - Hide real names in public mode
   - Encrypt contact details at rest

2. **Call Logging**
   - Log only metadata (not recordings)
   - Secure localStorage
   - Export with encryption

3. **Message Security**
   - No automatic sending
   - User review before share
   - Secure share via Signal/WhatsApp

4. **Tree Visibility**
   - Role-based access
   - Hide sensitive roles from lower levels
   - Audit tree changes

## Best Practices

1. **Keep Contacts Updated**
   - Verify numbers monthly
   - Update availability
   - Remove inactive contacts

2. **Template Maintenance**
   - Review templates quarterly
   - Update legal references
   - Test variable substitution

3. **Tree Organization**
   - Clear chain of command
   - Redundancy for critical roles
   - Regular drills

4. **Call Protocol**
   - Script important calls
   - Document outcomes
   - Follow up in writing

## Export/Import Format

### Contacts JSON
```json
{
  "contacts": [
    {
      "id": "1",
      "name": "Contact Name",
      "category": "brigada",
      "role": "Role",
      "phones": [{"number": "55-1234-5678", "type": "mobile", "primary": true}],
      "priority": 1,
      "isFavorite": true
    }
  ],
  "exportedAt": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### Templates JSON
```json
{
  "templates": [
    {
      "id": "custom-1",
      "name": "Template Name",
      "category": "alert",
      "content": "Message with [variable]",
      "variables": ["variable"]
    }
  ]
}
```

## Future Enhancements

- [ ] WhatsApp Business API integration
- [ ] SMS gateway integration
- [ ] Voice recording with consent
- [ ] Auto-dial sequences
- [ ] Contact verification system
- [ ] Integration with external CRMs
- [ ] Push notifications for tree updates
- [ ] Real-time status via WebSocket
