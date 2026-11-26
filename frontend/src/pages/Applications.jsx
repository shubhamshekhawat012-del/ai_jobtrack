import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import EmptyState from '../components/EmptyState'
import {
  Send,
  Building2,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  FileText,
  Clock,
  Briefcase,
} from 'lucide-react'

const VALID_STATUSES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
]

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [jobsMap, setJobsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/applications/'),
        api.get('/jobs/'),
      ])

      setApplications(appsRes.data || [])

      const jMap = {}
      ;(jobsRes.data || []).forEach((j) => {
        jMap[j.id] = j
      })
      setJobsMap(jMap)
    } catch (err) {
      console.error('Failed to load applications', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId)
      const res = await api.patch(`/applications/${appId}/status`, { status: newStatus })
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: res.data.status } : app))
      )
    } catch (err) {
      console.error('Failed to update status', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'offer':
        return 'badge-offer'
      case 'interview':
        return 'badge-interview'
      case 'screening':
        return 'badge-screening'
      case 'rejected':
        return 'badge-rejected'
      case 'withdrawn':
        return 'badge-withdrawn'
      default:
        return 'badge-applied'
    }
  }

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const job = jobsMap[app.job_id] || {}
      const matchesSearch =
        searchQuery === '' ||
        (job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.company && job.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTab = activeTab === 'All' || app.status === activeTab

      return matchesSearch && matchesTab
    })
  }, [applications, jobsMap, searchQuery, activeTab])

  // Counts for each tab
  const statusCounts = useMemo(() => {
    const counts = { All: applications.length }
    VALID_STATUSES.forEach((s) => (counts[s] = 0))
    applications.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++
      }
    })
    return counts
  }, [applications])

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-3xl)',
              fontWeight: 700,
              color: 'var(--text-heading)',
              letterSpacing: '-0.02em',
            }}
          >
            Application Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: 'var(--font-base)' }}>
            Track every phase of your recruiting pipeline from initial screen to final offer.
          </p>
        </div>

        <button onClick={() => navigate('/jobs')} className="btn btn-primary">
          <Briefcase size={18} />
          <span>Apply to More Jobs</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {['All', ...VALID_STATUSES].map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                border: isActive
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-primary)',
                background: isActive ? 'var(--accent-primary-glow)' : 'var(--bg-secondary)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
              }}
            >
              <span>{tab}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                }}
              >
                {statusCounts[tab] || 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Filter */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by job title, company name, or private notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="card skeleton" style={{ height: '300px' }} />
      ) : filteredApps.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-primary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <th style={{ padding: '1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    ROLE & COMPANY
                  </th>
                  <th style={{ padding: '1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    DATE APPLIED
                  </th>
                  <th style={{ padding: '1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    RESUME USED
                  </th>
                  <th style={{ padding: '1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    STAGE STATUS
                  </th>
                  <th style={{ padding: '1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const job = jobsMap[app.job_id] || {}
                  return (
                    <tr
                      key={app.id}
                      style={{
                        borderBottom: '1px solid var(--border-primary)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <Link
                          to={`/jobs/${app.job_id}`}
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-heading)',
                            fontSize: 'var(--font-base)',
                            display: 'block',
                          }}
                        >
                          {job.title || `Job #${app.job_id}`}
                        </Link>
                        <div
                          style={{
                            fontSize: 'var(--font-xs)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 4,
                          }}
                        >
                          <Building2 size={12} />
                          <span>{job.company || 'Unknown Company'}</span>
                          {job.location && <span>• {job.location}</span>}
                        </div>
                        {app.notes && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              fontStyle: 'italic',
                            }}
                          >
                            📝 {app.notes}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1.25rem 1rem', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          <span>
                            {new Date(app.applied_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '1.25rem 1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                        {app.resume_version ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            <FileText size={12} />
                            {app.resume_version}
                          </span>
                        ) : (
                          <span>Standard</span>
                        )}
                      </td>

                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`badge ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                          <select
                            className="form-input form-select"
                            style={{
                              padding: '4px 28px 4px 10px',
                              fontSize: 'var(--font-xs)',
                              width: 'auto',
                              minWidth: '120px',
                            }}
                            value={app.status}
                            disabled={updatingId === app.id}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          >
                            {VALID_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                Move to {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => navigate(`/jobs/${app.job_id}`)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Job Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Send}
          title={activeTab === 'All' ? 'No applications submitted yet' : `No applications in ${activeTab}`}
          description="Find opportunities in our job board and submit applications to start tracking your interviews and offers."
          action={
            <button onClick={() => navigate('/jobs')} className="btn btn-primary btn-sm">
              Discover Open Positions
            </button>
          }
        />
      )}
    </div>
  )
}
