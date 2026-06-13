/**
 * Contact Tree Component
 * Protocolo CDMX
 * 
 * Visual hierarchical tree for incident coordination
 */

import React, { useState, useCallback } from 'react'
import {
  Users,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Plus,
  Save,
  MapPin,
  AlertCircle,
  Signal,
  SignalHigh,
  SignalLow,
  X
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Contact, ContactTree as ContactTreeType, ContactTreeNode } from '@/types/contacts'

// =============================================================================
// TYPES
// =============================================================================

interface ContactTreeProps {
  contacts: Contact[]
  tree?: ContactTreeType
  onCall?: (contactId: string) => void
  onMessage?: (contactId: string) => void
  onUpdateNode?: (nodeId: string, updates: Partial<ContactTreeNode>) => void
  onAddNode?: (parentId: string, contactId: string) => void
  onRemoveNode?: (nodeId: string) => void
  onSaveTree?: (tree: ContactTreeType) => void
  className?: string
}

// =============================================================================
// MOCK TREE DATA
// =============================================================================

const DEFAULT_TREE: ContactTreeType = {
  id: 'tree-1',
  name: 'Árbol de Contactos - Incidente #1',
  root: {
    id: 'root',
    contactId: '1',
    level: 1,
    parentId: null,
    role: 'Incident Leader',
    status: 'online',
    children: [
      {
        id: 'node-2',
        contactId: '2',
        level: 2,
        parentId: 'root',
        role: 'Security Lead',
        status: 'on_scene',
        responseTime: 15,
        children: [
          {
            id: 'node-5',
            contactId: '5',
            level: 3,
            parentId: 'node-2',
            role: 'Perimeter Guard',
            status: 'online',
            children: []
          }
        ]
      },
      {
        id: 'node-3',
        contactId: '3',
        level: 2,
        parentId: 'root',
        role: 'Medical Lead',
        status: 'dispatched',
        responseTime: 8,
        children: []
      },
      {
        id: 'node-4',
        contactId: '4',
        level: 2,
        parentId: 'root',
        role: 'Legal Lead',
        status: 'online',
        children: [
          {
            id: 'node-6',
            contactId: '6',
            level: 3,
            parentId: 'node-4',
            role: 'Documentation',
            status: 'standby',
            children: []
          }
        ]
      }
    ]
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// =============================================================================
// COMPONENT
// =============================================================================

export const ContactTree: React.FC<ContactTreeProps> = ({
  contacts,
  tree: propTree,
  onCall,
  onMessage,
  onUpdateNode,
  onAddNode,
  onRemoveNode,
  onSaveTree,
  className
}) => {
  const [tree, setTree] = useState<ContactTreeType>(propTree || DEFAULT_TREE)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']))
  const [showAddNode, setShowAddNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Toggle node expansion
  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  // Get contact by ID
  const getContact = useCallback((contactId: string): Contact | undefined => {
    return contacts.find(c => c.id === contactId)
  }, [contacts])

  // Update node
  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<ContactTreeNode>) => {
    const updateNodeRecursive = (node: ContactTreeNode): ContactTreeNode => {
      if (node.id === nodeId) {
        return { ...node, ...updates }
      }
      return {
        ...node,
        children: node.children.map(updateNodeRecursive)
      }
    }

    setTree(prev => ({
      ...prev,
      root: updateNodeRecursive(prev.root),
      updatedAt: new Date().toISOString()
    }))

    onUpdateNode?.(nodeId, updates)
  }, [onUpdateNode])

  // Add node
  const handleAddNode = useCallback((parentId: string, contactId: string) => {
    const parent = findNode(tree.root, parentId)
    if (!parent) return

    const newNode: ContactTreeNode = {
      id: `node-${Date.now()}`,
      contactId,
      level: parent.level + 1,
      parentId,
      role: 'Team Member',
      status: 'standby',
      children: []
    }

    const addNodeRecursive = (node: ContactTreeNode): ContactTreeNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...node.children, newNode]
        }
      }
      return {
        ...node,
        children: node.children.map(addNodeRecursive)
      }
    }

    setTree(prev => ({
      ...prev,
      root: addNodeRecursive(prev.root),
      updatedAt: new Date().toISOString()
    }))

    setExpandedNodes(prev => new Set(prev).add(parentId))
    setShowAddNode(null)
    onAddNode?.(parentId, contactId)
  }, [tree, onAddNode])

  // Remove node
  const handleRemoveNode = useCallback((nodeId: string) => {
    const removeNodeRecursive = (node: ContactTreeNode): ContactTreeNode | null => {
      if (node.id === nodeId) {
        return null
      }
      return {
        ...node,
        children: node.children.map(removeNodeRecursive).filter(Boolean) as ContactTreeNode[]
      }
    }

    setTree(prev => ({
      ...prev,
      root: removeNodeRecursive(prev.root) || prev.root,
      updatedAt: new Date().toISOString()
    }))

    onRemoveNode?.(nodeId)
  }, [onRemoveNode])

  // Save tree
  const handleSaveTree = useCallback(() => {
    onSaveTree?.(tree)
    setIsEditing(false)
  }, [tree, onSaveTree])

  // Find node by ID
  const findNode = (node: ContactTreeNode, id: string): ContactTreeNode | null => {
    if (node.id === id) return node
    for (const child of node.children) {
      const found = findNode(child, id)
      if (found) return found
    }
    return null
  }

  // Get status color
  const getStatusColor = (status: ContactTreeNode['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'on_scene': return 'bg-blue-500'
      case 'dispatched': return 'bg-yellow-500'
      case 'standby': return 'bg-gray-400'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  // Get status label
  const getStatusLabel = (status: ContactTreeNode['status']) => {
    switch (status) {
      case 'online': return 'En línea'
      case 'on_scene': return 'En escena'
      case 'dispatched': return 'En camino'
      case 'standby': return 'En espera'
      case 'offline': return 'Desconectado'
      default: return status
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                Árbol de Contactos
              </h1>
              <p className="text-sm text-muted-foreground">{tree.name}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isEditing ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Listo' : 'Editar'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveTree}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            {['online', 'on_scene', 'dispatched', 'standby', 'offline'].map(status => (
              <div key={status} className="flex items-center gap-1">
                <div className={cn("w-3 h-3 rounded-full", getStatusColor(status as any))} />
                <span>{getStatusLabel(status as any)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tree View */}
        <ScrollArea className="flex-1 p-4">
          <TreeNode
            node={tree.root}
            contacts={contacts}
            getContact={getContact}
            expandedNodes={expandedNodes}
            toggleNode={toggleNode}
            onCall={onCall}
            onMessage={onMessage}
            onUpdateNode={handleUpdateNode}
            onAddNode={setShowAddNode}
            onRemoveNode={handleRemoveNode}
            isEditing={isEditing}
            level={0}
          />
        </ScrollArea>

        {/* Add Node Dialog */}
        <Dialog open={!!showAddNode} onOpenChange={() => setShowAddNode(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar miembro al equipo</DialogTitle>
            </DialogHeader>
            <AddNodeForm
              contacts={contacts}
              onAdd={(contactId) => showAddNode && handleAddNode(showAddNode, contactId)}
              onCancel={() => setShowAddNode(null)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// =============================================================================
// TREE NODE COMPONENT
// =============================================================================

interface TreeNodeProps {
  node: ContactTreeNode
  contacts: Contact[]
  getContact: (id: string) => Contact | undefined
  expandedNodes: Set<string>
  toggleNode: (id: string) => void
  onCall?: (contactId: string) => void
  onMessage?: (contactId: string) => void
  onUpdateNode: (nodeId: string, updates: Partial<ContactTreeNode>) => void
  onAddNode: (parentId: string) => void
  onRemoveNode: (nodeId: string) => void
  isEditing: boolean
  level: number
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  contacts,
  getContact,
  expandedNodes,
  toggleNode,
  onCall,
  onMessage,
  onUpdateNode,
  onAddNode,
  onRemoveNode,
  isEditing,
  level
}) => {
  const contact = getContact(node.contactId)
  const isExpanded = expandedNodes.has(node.id)
  const hasChildren = node.children.length > 0
  const primaryPhone = contact?.phones.find(p => p.primary)?.number

  const getStatusColor = (status: ContactTreeNode['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'on_scene': return 'bg-blue-500'
      case 'dispatched': return 'bg-yellow-500'
      case 'standby': return 'bg-gray-400'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="select-none">
      <Card 
        className={cn(
          "mb-2 transition-all",
          level > 0 && "ml-6 border-l-2"
        )}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Expand/Collapse */}
            {hasChildren ? (
              <button
                onClick={() => toggleNode(node.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}

            {/* Status Indicator */}
            <Tooltip>
              <TooltipTrigger>
                <div className={cn("w-3 h-3 rounded-full", getStatusColor(node.status))} />
              </TooltipTrigger>
              <TooltipContent>
                <p className="capitalize">{node.status.replace('_', ' ')}</p>
              </TooltipContent>
            </Tooltip>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {contact?.name.charAt(0).toUpperCase() || '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">
                  {contact?.name || 'Unknown'}
                </span>
                {contact?.pseudonym && (
                  <span className="text-xs text-muted-foreground">
                    "{contact.pseudonym}"
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {node.role}
                {node.responseTime && (
                  <span className="ml-2 text-xs">
                    · {node.responseTime}min
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {primaryPhone && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onCall?.(node.contactId)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Llamar</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onMessage?.(node.contactId)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mensaje</TooltipContent>
              </Tooltip>

              {/* Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUpdateNode(node.id, { status: 'online' })}>
                    <Signal className="w-4 h-4 mr-2 text-green-500" />
                    En línea
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateNode(node.id, { status: 'dispatched' })}>
                    <SignalHigh className="w-4 h-4 mr-2 text-yellow-500" />
                    En camino
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateNode(node.id, { status: 'on_scene' })}>
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    En escena
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateNode(node.id, { status: 'standby' })}>
                    <SignalLow className="w-4 h-4 mr-2 text-gray-500" />
                    En espera
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateNode(node.id, { status: 'offline' })}>
                    <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                    Desconectado
                  </DropdownMenuItem>
                  
                  {isEditing && (
                    <>
                      <DropdownMenuItem onClick={() => onAddNode(node.id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar subordinado
                      </DropdownMenuItem>
                      {node.id !== 'root' && (
                        <DropdownMenuItem 
                          onClick={() => onRemoveNode(node.id)}
                          className="text-destructive"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              contacts={contacts}
              getContact={getContact}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onCall={onCall}
              onMessage={onMessage}
              onUpdateNode={onUpdateNode}
              onAddNode={onAddNode}
              onRemoveNode={onRemoveNode}
              isEditing={isEditing}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// ADD NODE FORM
// =============================================================================

interface AddNodeFormProps {
  contacts: Contact[]
  onAdd: (contactId: string) => void
  onCancel: () => void
}

const AddNodeForm: React.FC<AddNodeFormProps> = ({ contacts, onAdd, onCancel }) => {
  const [selectedContact, setSelectedContact] = useState('')

  const availableContacts = contacts.filter(c => 
    c.category === 'brigada' || c.priority <= 2
  )

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Seleccionar contacto</label>
        <Select value={selectedContact} onValueChange={setSelectedContact}>
          <SelectTrigger>
            <SelectValue placeholder="Elegir contacto..." />
          </SelectTrigger>
          <SelectContent>
            {availableContacts.map(contact => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.name} {contact.pseudonym && `(${contact.pseudonym})`} - {contact.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={() => selectedContact && onAdd(selectedContact)}
          disabled={!selectedContact}
        >
          Agregar
        </Button>
      </DialogFooter>
    </div>
  )
}

export default ContactTree
