import { ReactNode, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const isMobile = useUIStore((state) => state.isMobile);
  const setIsMobile = useUIStore((state) => state.setIsMobile);
  const closeSidebar = useUIStore((state) => state.closeSidebar);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Overlay on mobile, fixed on desktop */}
      {isMobile ? (
        <>
          {/* Mobile backdrop */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={closeSidebar}
              aria-hidden="true"
            />
          )}

          {/* Mobile sidebar drawer */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {sidebar}
          </aside>
        </>
      ) : (
        /* Desktop sidebar */
        <aside
          className={`transition-all duration-300 ease-in-out bg-white border-r border-gray-200 ${
            isSidebarOpen ? 'w-80' : 'w-0'
          } overflow-hidden`}
        >
          {sidebar}
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
