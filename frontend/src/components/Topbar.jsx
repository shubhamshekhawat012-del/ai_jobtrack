import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Bell, Search, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <header style={{
      height: 'var(--topbar-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-8)',
      borderBottom: '1px solid var(--border-primary)',
      background: 'rgba(10, 14, 26, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Search bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 14px',
        width: 320,
        transition: 'border-color var(--transition-fast)',
      }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search jobs, titles, or skills (Enter)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchSubmit}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-sm)',
            width: '100%',
          }}
        />
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* Notification */}
        <button style={{
          width: 38,
          height: 38,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          transition: 'all var(--transition-fast)',
          position: 'relative',
        }}
        >
          <Bell size={18} />
        </button>

        {/* Separator */}
        <div style={{ width: 1, height: 24, background: 'var(--border-primary)' }} />

        {/* User info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 'var(--radius-md)',
            transition: 'background var(--transition-fast)',
          }}
          onClick={() => navigate('/profile')}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User size={16} color="white" />
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
              {user?.full_name || 'User'}
            </p>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              {user?.email || ''}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
