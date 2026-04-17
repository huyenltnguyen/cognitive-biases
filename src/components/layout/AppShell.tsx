import React, { useState } from 'react';
import type { ReactNode } from 'react';
import styles from './AppShell.module.css';

interface AppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  sidebarAriaLabel?: string;
}

export function AppShell({
  sidebar,
  header,
  children,
  sidebarAriaLabel = 'Course navigation',
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      return false;
    }
    return typeof window !== 'undefined'
      ? localStorage.getItem('sidebar-collapsed') !== 'true'
      : true;
  });

  function handleClose() {
    setSidebarOpen(false);
    localStorage.setItem('sidebar-collapsed', 'true');
  }

  function handleSidebarToggle() {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(!next));
      return next;
    });
  }

  const shellClass = [
    styles.shell,
    sidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed,
  ].join(' ');

  return (
    <div className={shellClass}>
      <div className={styles.header}>
        {React.isValidElement(header)
          ? React.cloneElement(header, {
              onMenuToggle: handleSidebarToggle,
              sidebarOpen,
            } as any)
          : header}
      </div>

      <div className={styles.overlay} onClick={handleClose} aria-hidden="true" />

      <nav className={styles.sidebar} aria-label={sidebarAriaLabel}>
        {sidebar}
      </nav>

      <main className={styles.main} id="main-content">
        {children}
      </main>
    </div>
  );
}
