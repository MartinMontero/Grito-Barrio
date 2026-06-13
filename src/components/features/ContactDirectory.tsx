/**
 * Contact Directory Component
 * Protocolo CDMX
 * 
 * Main contact management interface with search, filter, and CRUD operations
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  Search,
  Phone,
  Mail,
  Star,
  Plus,
  MoreVertical,
  Filter,
  Clock,
  Edit2,
  Trash2,
  Download,
  Upload,
  Users
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Label,
  Switch
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { 
  Contact, 
  ContactCategory, 
  ContactPriority,
  AvailabilityStatus 
} from '@/types/contacts'
import { CONTACT_CATEGORIES, PRIORITY_LABELS } from '@/types/contacts'

// =============================================================================
// TYPES
// =============================================================================

interface ContactDirectoryProps {
  contacts?: Contact[]
  onCall?: (contact: Contact, phone: string) => void
  onEmail?: (contact: Contact, email: string) => void
  onEdit?: (contact: Contact) => void
  onDelete?: (contactId: string) => void
  onAdd?: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void
  onImport?: (contacts: Contact[]) => void
  onExport?: () => void
  className?: string
}

interface ContactFormData {
  name: string
  pseudonym: string
  category: ContactCategory
  role: string
  organization: string
  phone: string
  phoneType: 'mobile' | 'landline' | 'whatsapp' | 'signal'
  email: string
  priority: ContactPriority
  availability: AvailabilityStatus
  availabilityHours: string
  notes: string
  isFavorite: boolean
}

// =============================================================================
// MOCK DATA
// =============================================================================

const DEFAULT_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Comandante de Brigada',
    pseudonym: 'Comandante',
    category: 'brigada',
    role: 'Coordinador',
    phones: [{ number: '55-1234-5678', type: 'signal', primary: true }],
    emails: [],
    priority: 1,
    availability: { status: 'available', hours: '24/7' },
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'C5 CDMX',
    category: 'emergencias',
    role: 'Centro de Comando',
    organization: 'Gobierno CDMX',
    phones: [{ number: '55-5533-5533', type: 'landline', primary: true }],
    emails: [],
    priority: 1,
    availability: { status: 'available', hours: '24/7' },
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'CDHCM',
    category: 'ddhh',
    role: 'Defensoría',
    organization: 'Comisión de Derechos Humanos CDMX',
    phones: [{ number: '55-5029-9300', type: 'landline', primary: true }],
    emails: [{ address: 'atencion@cdhcm.org.mx', primary: true }],
    priority: 1,
    availability: { status: 'available', hours: 'L-V 9:00-18:00' },
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Cruz Roja',
    category: 'emergencias',
    role: 'Emergencias Médicas',
    phones: [{ number: '55-5557-5757', type: 'landline', primary: true }],
    emails: [],
    priority: 1,
    availability: { status: 'available', hours: '24/7' },
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// =============================================================================
// COMPONENT
// =============================================================================

export const ContactDirectory: React.FC<ContactDirectoryProps> = ({
  contacts: propContacts,
  onCall,
  onEmail,
  onEdit,
  onDelete,
  onAdd,
  onImport,
  onExport,
  className
}) => {
  const [contacts, setContacts] = useState<Contact[]>(propContacts || DEFAULT_CONTACTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | 'all'>('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.pseudonym?.toLowerCase().includes(searchLower) ||
        contact.role.toLowerCase().includes(searchLower) ||
        contact.organization?.toLowerCase().includes(searchLower) ||
        contact.phones.some(p => p.number.includes(searchQuery))

      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || contact.category === selectedCategory

      // Favorites filter
      const matchesFavorites = !showFavoritesOnly || contact.isFavorite

      return matchesSearch && matchesCategory && matchesFavorites
    }).sort((a, b) => {
      // Sort by priority, then favorites, then name
      if (a.priority !== b.priority) return a.priority - b.priority
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }, [contacts, searchQuery, selectedCategory, showFavoritesOnly])

  // Group by category
  const groupedContacts = useMemo(() => {
    const groups: Record<string, Contact[]> = {}
    
    filteredContacts.forEach(contact => {
      const cat = contact.category
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(contact)
    })

    return groups
  }, [filteredContacts])

  // Handle call
  const handleCall = useCallback((contact: Contact, phone: string) => {
    onCall?.(contact, phone)
    window.location.href = `tel:${phone.replace(/-/g, '')}`
  }, [onCall])

  // Handle email
  const handleEmail = useCallback((contact: Contact, email: string) => {
    onEmail?.(contact, email)
    window.location.href = `mailto:${email}`
  }, [onEmail])

  // Toggle favorite
  const toggleFavorite = useCallback((contactId: string) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c
    ))
  }, [])

  // Delete contact
  const handleDelete = useCallback((contactId: string) => {
    if (confirm('¿Eliminar este contacto?')) {
      setContacts(prev => prev.filter(c => c.id !== contactId))
      onDelete?.(contactId)
    }
  }, [onDelete])

  // Add/edit contact
  const handleSaveContact = useCallback((formData: ContactFormData) => {
    const contactData: Contact = {
      id: editingContact?.id || Date.now().toString(),
      name: formData.name,
      pseudonym: formData.pseudonym || undefined,
      category: formData.category,
      role: formData.role,
      organization: formData.organization || undefined,
      phones: formData.phone ? [{
        number: formData.phone,
        type: formData.phoneType,
        primary: true
      }] : [],
      emails: formData.email ? [{
        address: formData.email,
        primary: true
      }] : [],
      priority: formData.priority,
      availability: {
        status: formData.availability,
        hours: formData.availabilityHours || undefined
      },
      notes: formData.notes || undefined,
      isFavorite: formData.isFavorite,
      createdAt: editingContact?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? contactData : c))
      onEdit?.(contactData)
    } else {
      setContacts(prev => [...prev, contactData])
      onAdd?.(contactData)
    }

    setShowAddDialog(false)
    setEditingContact(null)
  }, [editingContact, onAdd, onEdit])

  // Export contacts
  const handleExport = useCallback(() => {
    const data = JSON.stringify(contacts, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protocolo_contactos_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    onExport?.()
  }, [contacts, onExport])

  // Import contacts
  const handleImport = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as Contact[]
        setContacts(prev => [...prev, ...imported])
        onImport?.(imported)
      } catch (error) {
        alert('Error al importar contactos')
      }
    }
    reader.readAsText(file)
  }, [onImport])

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Directorio de Contactos
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
              />
              <Button variant="outline" size="icon" asChild>
                <span><Upload className="w-4 h-4" /></span>
              </Button>
            </label>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ContactCategory | 'all')}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {Object.entries(CONTACT_CATEGORIES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star className="w-4 h-4 mr-2" />
            Favoritos
          </Button>
          {Object.entries(CONTACT_CATEGORIES).map(([key, { label, color }]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key as ContactCategory)}
              className={cn(selectedCategory === key && color.replace('bg-', 'bg-opacity-80 '))}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron contactos</p>
            </div>
          ) : selectedCategory === 'all' && !searchQuery ? (
            // Grouped by category
            Object.entries(groupedContacts).map(([category, categoryContacts]) => (
              <div key={category}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", CONTACT_CATEGORIES[category as ContactCategory].color)} />
                  {CONTACT_CATEGORIES[category as ContactCategory].label}
                  <Badge variant="secondary" className="ml-2">{categoryContacts.length}</Badge>
                </h2>
                <div className="space-y-2">
                  {categoryContacts.map(contact => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onCall={handleCall}
                      onEmail={handleEmail}
                      onToggleFavorite={toggleFavorite}
                      onEdit={() => {
                        setEditingContact(contact)
                        setShowAddDialog(true)
                      }}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Flat list
            <div className="space-y-2">
              {filteredContacts.map(contact => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onCall={handleCall}
                  onEmail={handleEmail}
                  onToggleFavorite={toggleFavorite}
                  onEdit={() => {
                    setEditingContact(contact)
                    setShowAddDialog(true)
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add/Edit Dialog */}
      <ContactDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false)
          setEditingContact(null)
        }}
        onSave={handleSaveContact}
        contact={editingContact}
      />
    </div>
  )
}

// =============================================================================
// CONTACT CARD SUB-COMPONENT
// =============================================================================

interface ContactCardProps {
  contact: Contact
  onCall: (contact: Contact, phone: string) => void
  onEmail: (contact: Contact, email: string) => void
  onToggleFavorite: (id: string) => void
  onEdit: () => void
  onDelete: (id: string) => void
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onCall,
  onEmail,
  onToggleFavorite,
  onEdit,
  onDelete
}) => {
  const primaryPhone = contact.phones.find(p => p.primary) || contact.phones[0]
  const primaryEmail = contact.emails.find(e => e.primary) || contact.emails[0]
  const categoryInfo = CONTACT_CATEGORIES[contact.category]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar/Icon */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0",
            categoryInfo.color
          )}>
            {contact.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {contact.name}
                  {contact.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </h3>
                {contact.pseudonym && (
                  <p className="text-sm text-muted-foreground">"{contact.pseudonym}"</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {contact.role}
                  {contact.organization && ` · ${contact.organization}`}
                </p>
              </div>

              {/* Priority Badge */}
              {contact.priority <= 2 && (
                <Badge variant={contact.priority === 1 ? 'destructive' : 'default'}>
                  P{contact.priority}
                </Badge>
              )}
            </div>

            {/* Contact Actions */}
            <div className="flex items-center gap-2 mt-3">
              {primaryPhone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCall(contact, primaryPhone.number)}
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {primaryPhone.number}
                </Button>
              )}
              
              {primaryEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEmail(contact, primaryEmail.address)}
                >
                  <Mail className="w-4 h-4" />
                </Button>
              )}

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleFavorite(contact.id)}>
                    <Star className="w-4 h-4 mr-2" />
                    {contact.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(contact.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Additional Info */}
            {(contact.availability.hours || contact.notes) && (
              <div className="mt-2 text-xs text-muted-foreground">
                {contact.availability.hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {contact.availability.hours}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// CONTACT DIALOG SUB-COMPONENT
// =============================================================================

interface ContactDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: ContactFormData) => void
  contact: Contact | null
}

const ContactDialog: React.FC<ContactDialogProps> = ({ open, onClose, onSave, contact }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: contact?.name || '',
    pseudonym: contact?.pseudonym || '',
    category: contact?.category || 'otros',
    role: contact?.role || '',
    organization: contact?.organization || '',
    phone: contact?.phones[0]?.number || '',
    phoneType: contact?.phones[0]?.type || 'mobile',
    email: contact?.emails[0]?.address || '',
    priority: contact?.priority || 3,
    availability: contact?.availability.status || 'available',
    availabilityHours: contact?.availability.hours || '',
    notes: contact?.notes || '',
    isFavorite: contact?.isFavorite || false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.role) {
      alert('Nombre y rol son requeridos')
      return
    }
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Editar Contacto' : 'Nuevo Contacto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label>Seudónimo (para brigadistas)</Label>
            <Input
              value={formData.pseudonym}
              onChange={(e) => setFormData(prev => ({ ...prev, pseudonym: e.target.value }))}
              placeholder="Ej: Comandante"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as ContactCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTACT_CATEGORIES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select 
                value={String(formData.priority)} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, priority: parseInt(v) as ContactPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(p => (
                    <SelectItem key={p} value={String(p)}>
                      {p} - {PRIORITY_LABELS[p as ContactPriority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rol *</Label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              placeholder="Ej: Coordinador, Médico, Abogado"
            />
          </div>

          <div className="space-y-2">
            <Label>Organización</Label>
            <Input
              value={formData.organization}
              onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
              placeholder="Nombre de la organización"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="55-1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={formData.phoneType} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, phoneType: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile">Celular</SelectItem>
                  <SelectItem value="landline">Fijo</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="signal">Signal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Disponibilidad</Label>
            <Select 
              value={formData.availability} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, availability: v as AvailabilityStatus }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="busy">Ocupado</SelectItem>
                <SelectItem value="unavailable">No disponible</SelectItem>
                <SelectItem value="on_call">En llamada</SelectItem>
                <SelectItem value="scheduled">Programado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Horarios</Label>
            <Input
              value={formData.availabilityHours}
              onChange={(e) => setFormData(prev => ({ ...prev, availabilityHours: e.target.value }))}
              placeholder="Ej: L-V 9:00-18:00"
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Información adicional..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isFavorite}
              onCheckedChange={(v) => setFormData(prev => ({ ...prev, isFavorite: v }))}
            />
            <Label>Agregar a favoritos</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {contact ? 'Guardar cambios' : 'Crear contacto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ContactDirectory
