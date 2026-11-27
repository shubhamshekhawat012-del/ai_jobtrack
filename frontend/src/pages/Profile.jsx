import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  User,
  ShieldCheck,
  LogOut,
  FileText,
  Send,
  Bookmark,
} from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="page-container animate-fade-in profile-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Account & Profile</h1>
        <p>
          Manage your account settings, credentials, and career tracking
          preferences.
        </p>
      </div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="card profile-main-card">
          <div className="profile-avatar">
            <User size={40} color="white" />
          </div>

          <h2>{user?.full_name || 'User Profile'}</h2>

          <p className="profile-email">
            {user?.email}
          </p>

          <div className="profile-status">
            <ShieldCheck size={14} />
            <span>Active Member</span>
          </div>

          <div className="profile-logout-section">
            <button
              onClick={handleSignOut}
              className="btn btn-danger profile-logout-btn"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="profile-content">
          {/* Personal Information */}
          <div className="card profile-info-card">
            <h3>Personal Information</h3>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-label">
                  Full Name
                </div>
                <div className="profile-info-value">
                  {user?.full_name || 'Not provided'}
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-label">
                  Email Address
                </div>
                <div className="profile-info-value">
                  {user?.email || 'Not provided'}
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-label">
                  Account Identifier
                </div>
                <div className="profile-info-value">
                  User #{user?.id || '—'}
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-label">
                  Joined Date
                </div>
                <div className="profile-info-value">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'Active'}
                </div>
              </div>
            </div>
          </div>

          {/* Career Hub Shortcuts */}
          <div className="card profile-shortcuts-card">
            <h3>Career Hub Shortcuts</h3>

            <div className="profile-shortcuts-grid">
              <Link to="/resumes" className="profile-shortcut resume-shortcut">
                <FileText size={22} color="var(--accent-primary)" />

                <div>
                  <div className="profile-shortcut-title">
                    Resumes
                  </div>
                  <div className="profile-shortcut-description">
                    Upload & Manage
                  </div>
                </div>
              </Link>

              <Link
                to="/applications"
                className="profile-shortcut applications-shortcut"
              >
                <Send size={22} color="var(--accent-info)" />

                <div>
                  <div className="profile-shortcut-title">
                    Applications
                  </div>
                  <div className="profile-shortcut-description">
                    Status Pipeline
                  </div>
                </div>
              </Link>

              <Link
                to="/saved-jobs"
                className="profile-shortcut bookmarks-shortcut"
              >
                <Bookmark size={22} color="var(--accent-secondary)" />

                <div>
                  <div className="profile-shortcut-title">
                    Bookmarks
                  </div>
                  <div className="profile-shortcut-description">
                    Saved Roles
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}