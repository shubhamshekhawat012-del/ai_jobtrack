
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <Sidebar isOpen={menuOpen} onClose={closeMenu} />

      {menuOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={closeMenu}
        />
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: 0,
        }}
      >
        <Topbar onMenuClick={() => setMenuOpen(!menuOpen)} />

        <main style={{ flex: 1, paddingBottom: '3rem', minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
