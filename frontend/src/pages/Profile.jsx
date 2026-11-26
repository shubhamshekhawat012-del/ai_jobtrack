import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  LogOut,
  FileText,
  Send,
  Bookmark,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Account & Profile</h1>
        <p>Manage your account settings, credentials, and career tracking preferences.</p>
      </div>

      <div className="grid-3" style={{ alignItems: 'start' }}>
        {/* Left Column: Profile Card */}
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--gradient-purple)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
              marginBottom: '1rem',
            }}
          >
            <User size={40} color="white" />
          </div>

          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--text-heading)' }}>
            {user?.full_name || 'User Profile'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '0.25rem' }}>
            {user?.email}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: '1rem',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-success)',
              fontSize: 'var(--font-xs)',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} />
            <span>Active Member</span>
          </div>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <button
              onClick={handleSignOut}
              className="btn btn-danger"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Account Details and Shortcuts */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Details Card */}
          <div className="card">
            <h3
              style={{
                fontSize: 'var(--font-lg)',
                fontWeight: 600,
                color: 'var(--text-heading)',
                marginBottom: '1.5rem',
              }}
            >
              Personal Information
            </h3>

            <div className="grid-2">
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Full Name
                </div>
                <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.full_name || 'Not provided'}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Email Address
                </div>
                <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.email || 'Not provided'}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Account Identifier
                </div>
                <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  User #{user?.id || '—'}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Joined Date
                </div>
                <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="card">
            <h3
              style={{
                fontSize: 'var(--font-lg)',
                fontWeight: 600,
                color: 'var(--text-heading)',
                marginBottom: '1rem',
              }}
            >
              Career Hub Shortcuts
            </h3>

            <div className="grid-3">
              <Link
                to="/resumes"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--text-primary)',
                }}
              >
                <FileText size={20} color="var(--accent-primary)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>Resumes</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Upload & Manage</div>
                </div>
              </Link>

              <Link
                to="/applications"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--text-primary)',
                }}
              >
                <Send size={20} color="var(--accent-info)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>Applications</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Status Pipeline</div>
                </div>
              </Link>

              <Link
                to="/saved-jobs"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(20, 184, 166, 0.1)',
                  border: '1px solid rgba(20, 184, 166, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--text-primary)',
                }}
              >
                <Bookmark size={20} color="var(--gradient-teal)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>Bookmarks</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Saved Roles</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
