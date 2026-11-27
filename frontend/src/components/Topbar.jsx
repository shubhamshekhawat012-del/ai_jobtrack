
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Bell,
  Search,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchTerm.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  return (
    <header className="app-topbar">
      {/* Left section */}
      <div className="topbar-left">
        <button
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={23} />
        </button>

        {/* Desktop Search */}
        <div className="topbar-search desktop-search">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search jobs, titles, or skills (Enter)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>

        {/* Mobile Search Button */}
        <button
          className="mobile-search-button"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          aria-label="Search jobs"
        >
          {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
        </button>
      </div>

      {/* Mobile Search Input */}
      {mobileSearchOpen && (
        <div className="mobile-search-panel">
          <Search size={17} color="var(--text-muted)" />
          <input
            autoFocus
            type="text"
            placeholder="Search jobs or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>
      )}

      {/* Right section */}
      <div className="topbar-right">
        <button
          className="topbar-icon-button"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="topbar-separator" />

        <button
          className="topbar-user"
          onClick={() => navigate('/profile')}
        >
          <div className="topbar-avatar">
            <User size={16} color="white" />
          </div>

          <div className="topbar-user-info">
            <p>{user?.full_name || 'User'}</p>
            <span>{user?.email || ''}</span>
          </div>
        </button>

        <button
          className="topbar-icon-button desktop-logout"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}

