/**
 * BottomNavigation Component
 * Protocolo CDMX
 *
 * Mobile bottom navigation bar with 5 main tabs
 * Active state highlighting, badges, and smooth transitions
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Scale, Map, Settings, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get badge counts from store
  const unreadNotifications = 0;
  const activeProtocols = 0;

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Inicio",
      path: "/",
      icon: Home,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    {
      id: "protocols",
      label: "Protocolos",
      path: "/protocols",
      icon: BookOpen,
      badge: activeProtocols > 0 ? activeProtocols : undefined,
    },
    {
      id: "legal",
      label: "Legal",
      path: "/legal",
      icon: Scale,
    },
    {
      id: "resources",
      label: "Recursos",
      path: "/resources",
      icon: Map,
    },
    {
      id: "settings",
      label: "Ajustes",
      path: "/settings",
      icon: Settings,
    },
  ];

  // Determine active tab from location if not provided
  const currentTab =
    activeTab ||
    (() => {
      const path = location.pathname;
      if (path === "/" || path === "/home") return "home";
      if (path.startsWith("/protocols")) return "protocols";
      if (path.startsWith("/legal")) return "legal";
      if (path.startsWith("/resources")) return "resources";
      if (path.startsWith("/settings")) return "settings";
      return "home";
    })();

  const handleTabClick = (item: NavItem) => {
    onTabChange?.(item.id);
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1",
                "transition-all duration-200 ease-in-out",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Icon Container */}
              <div
                className={cn(
                  "relative flex items-center justify-center",
                  "transition-transform duration-200",
                  isActive && "scale-110",
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive ? "stroke-[2.5px]" : "stroke-2",
                  )}
                />

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-80",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Indicator Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{
            width: `${100 / navItems.length}%`,
            transform: `translateX(${navItems.findIndex((item) => item.id === currentTab) * 100}%)`,
          }}
        />
      </div>
    </nav>
  );
};

export default BottomNavigation;
