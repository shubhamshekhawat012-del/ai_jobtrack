import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Briefcase,
  Send,
  Bookmark,
  FileText,
  Sparkles,
  Target,
  Wand2,
  MessageSquare,
  Compass,
  GraduationCap,
  User,
  LogOut,
  Zap,
} from 'lucide-react'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Applications', path: '/applications', icon: Send },
    { name: 'Saved Jobs', path: '/saved-jobs', icon: Bookmark },
    { name: 'My Resumes', path: '/resumes', icon: FileText },
  ]

  const aiSuiteNav = [
    { name: 'Resume Analyzer', path: '/ai/resume-analyzer', icon: Sparkles, badge: 'AI' },
    { name: 'Job Matching', path: '/ai/job-match', icon: Target, badge: 'AI' },
    { name: 'Cover Letter', path: '/ai/cover-letter', icon: Wand2, badge: 'AI' },
    { name: 'Interview Prep', path: '/ai/interview-prep', icon: MessageSquare, badge: 'AI' },
    { name: 'Career Advisor', path: '/ai/career-advisor', icon: Compass, badge: 'AI' },
    { name: 'Learning Roadmap', path: '/ai/learning-roadmap', icon: GraduationCap, badge: 'AI' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        overflowY: 'auto',
      }}
    >
      {/* Brand Logo */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)',
          }}
        >
          <Zap size={22} color="white" />
        </div>
        <div>
          <h1
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--text-heading)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            AI Job<span style={{ color: 'var(--accent-primary)' }}>Track</span>
          </h1>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            Career Intelligence
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Main Section */}
        <div>
          <div
            style={{
              padding: '0 0.75rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}
          >
            Overview & Tracking
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {mainNav.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-sm)',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                  })}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* AI Career Suite */}
        <div>
          <div
            style={{
              padding: '0 0.75rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--accent-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>AI Copilot Suite</span>
            <span
              style={{
                fontSize: '0.625rem',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-secondary)',
                fontWeight: 700,
              }}
            >
              GEN AI
            </span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {aiSuiteNav.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-sm)',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                    transition: 'all var(--transition-fast)',
                  })}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: 'var(--accent-primary)',
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-primary)',
          backgroundColor: 'rgba(10, 14, 26, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            color: isActive ? 'white' : 'var(--text-secondary)',
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            transition: 'all var(--transition-fast)',
          })}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={16} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div
              style={{
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.full_name || 'My Account'}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email || 'Settings'}
            </div>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-danger)',
            fontSize: 'var(--font-sm)',
            fontWeight: 500,
            width: '100%',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
