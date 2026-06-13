/**
 * AppShell Component
 * Protocolo CDMX
 *
 * Main layout structure for the application
 * Handles responsive navigation (mobile bottom nav, desktop side nav)
 * Theme support and accessibility features
 */

import React, { useState, useEffect, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TopHeader } from "./TopHeader";
import { BottomNavigation } from "./BottomNavigation";
import { DrawerMenu } from "./DrawerMenu";
import { EmergencyOverlay } from "./EmergencyOverlay";
import { ProtectionBanner } from "./ProtectionBanner";
import { cn } from "@/lib/utils";
import { useProtocoloStore } from "@/store";

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Get theme and accessibility settings from store
  const theme = useProtocoloStore((state) => state.settings?.theme || "system");
  const highContrast = useProtocoloStore(
    (state) => (state.settings as any)?.highContrast || false,
  );
  const largeText = useProtocoloStore(
    (state) => (state.settings as any)?.largeText || false,
  );

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/home") setActiveTab("home");
    else if (path.startsWith("/protocols")) setActiveTab("protocols");
    else if (path.startsWith("/legal")) setActiveTab("legal");
    else if (path.startsWith("/resources")) setActiveTab("resources");
    else if (path.startsWith("/settings")) setActiveTab("settings");
  }, [location]);

  // Handle theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Handle high contrast mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [highContrast]);

  // Handle large text mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }
  }, [largeText]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Navigation is handled by the router in each component
  };

  return (
    <div className={cn("min-h-screen bg-background", largeText && "text-lg")}>
      {/* Top Header - Fixed */}
      <TopHeader onMenuClick={() => setIsDrawerOpen(true)} />

      {/* Side Navigation - Desktop/Tablet */}
      <aside
        className={cn(
          "fixed left-0 top-14 bottom-0 w-64 bg-background border-r border-border z-40",
          "hidden lg:block overflow-y-auto",
        )}
      >
        <DrawerMenu isOpen={true} onClose={() => {}} variant="sidebar" />
      </aside>

      {/* Main Content Area */}
      <main
        className={cn(
          "pt-14 pb-20 lg:pb-6 lg:pl-64 min-h-screen",
          "transition-all duration-300 ease-in-out",
        )}
      >
        <ProtectionBanner />
        <div
          className={cn(
            "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
            largeText && "max-w-full",
          )}
        >
          <Suspense
            fallback={
              <div
                className="flex items-center justify-center min-h-[50vh]"
                role="status"
                aria-label="Cargando"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }
          >
            {children || <Outlet />}
          </Suspense>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <div className="lg:hidden">
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Drawer Menu - Mobile/Tablet Overlay */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        variant="drawer"
      />

      {/* Emergency Overlay */}
      <EmergencyOverlay />
    </div>
  );
};

export default AppShell;
