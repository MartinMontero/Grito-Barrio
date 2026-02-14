import React from 'react'
import { Home, BookOpen, Scale, Phone, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/types'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Inicio', path: '/home', icon: 'Home' },
  { id: 'protocols', label: 'Protocolos', path: '/protocols', icon: 'BookOpen' },
  { id: 'legal', label: 'Legal', path: '/legal', icon: 'Scale' },
  { id: 'resources', label: 'Recursos', path: '/resources', icon: 'Phone' },
  { id: 'settings', label: 'Ajustes', path: '/settings', icon: 'Settings' }
]

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  BookOpen,
  Scale,
  Phone,
  Settings
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = iconComponents[item.icon]
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
