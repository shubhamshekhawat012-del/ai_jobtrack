import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import EmptyState from '../components/EmptyState'
import {
  Send,
  Building2,
  Calendar,
  Search,
  FileText,
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

      const res = await api.patch(
        `/applications/${appId}/status`,
        { status: newStatus }
      )

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? { ...app, status: res.data.status }
            : app
        )
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

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const job = jobsMap[app.job_id] || {}

      const matchesSearch =
        searchQuery === '' ||
        (job.title &&
          job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.company &&
          job.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.notes &&
          app.notes.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTab =
        activeTab === 'All' || app.status === activeTab

      return matchesSearch && matchesTab
    })
  }, [applications, jobsMap, searchQuery, activeTab])

  const statusCounts = useMemo(() => {
    const counts = { All: applications.length }

    VALID_STATUSES.forEach((s) => {
      counts[s] = 0
    })

    applications.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++
      }
    })

    return counts
  }, [applications])

  return (
    <div className="page-container animate-fade-in applications-page">

      {/* Header */}
      <div className="applications-header">
        <div>
          <h1 className="applications-title">
            Application Pipeline
          </h1>

          <p className="applications-subtitle">
            Track every phase of your recruiting pipeline from
            initial screen to final offer.
          </p>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          className="btn btn-primary applications-apply-button"
        >
          <Briefcase size={18} />
          <span>Apply to More Jobs</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="applications-tabs">
        {['All', ...VALID_STATUSES].map((tab) => {
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`applications-tab ${isActive ? 'active' : ''}`}
            >
              <span>{tab}</span>

              <span className="applications-tab-count">
                {statusCounts[tab] || 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Filter */}
      <div className="card applications-search-card">
        <div className="applications-search-box">
          <Search
            size={18}
            className="applications-search-icon"
          />

          <input
            type="text"
            className="form-input"
            placeholder="Search by job title, company name, or private notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Applications */}
      {loading ? (
        <div
          className="card skeleton"
          style={{ height: '300px' }}
        />
      ) : filteredApps.length > 0 ? (

        <div className="card applications-table-card">
          <div className="applications-table-wrapper">

            <table className="applications-table">
              <thead>
                <tr>
                  <th>ROLE & COMPANY</th>
                  <th>DATE APPLIED</th>
                  <th>RESUME USED</th>
                  <th>STAGE STATUS</th>
                  <th className="applications-actions-heading">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredApps.map((app) => {
                  const job = jobsMap[app.job_id] || {}

                  return (
                    <tr key={app.id}>

                      {/* Role & Company */}
                      <td data-label="ROLE & COMPANY">
                        <div className="application-role-cell">

                          <Link
                            to={`/jobs/${app.job_id}`}
                            className="application-job-title"
                          >
                            {job.title || `Job #${app.job_id}`}
                          </Link>

                          <div className="application-company">
                            <Building2 size={12} />

                            <span>
                              {job.company || 'Unknown Company'}
                            </span>

                            {job.location && (
                              <span>• {job.location}</span>
                            )}
                          </div>

                          {app.notes && (
                            <div className="application-notes">
                              📝 {app.notes}
                            </div>
                          )}

                        </div>
                      </td>

                      {/* Date Applied */}
                      <td data-label="DATE APPLIED">
                        <div className="application-date">
                          <Calendar
                            size={14}
                            color="var(--text-muted)"
                          />

                          <span>
                            {new Date(app.applied_at).toLocaleDateString(
                              undefined,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Resume Used */}
                      <td data-label="RESUME USED">
                        {app.resume_version ? (
                          <span className="application-resume">
                            <FileText size={12} />
                            {app.resume_version}
                          </span>
                        ) : (
                          <span className="application-standard">
                            Standard
                          </span>
                        )}
                      </td>

                      {/* Stage Status */}
                      <td data-label="STAGE STATUS">
                        <div className="application-status-cell">

                          <span
                            className={`badge ${getStatusBadge(app.status)}`}
                          >
                            {app.status}
                          </span>

                          <select
                            className="form-input form-select application-status-select"
                            value={app.status}
                            disabled={updatingId === app.id}
                            onChange={(e) =>
                              handleStatusChange(
                                app.id,
                                e.target.value
                              )
                            }
                          >
                            {VALID_STATUSES.map((status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                Move to {status}
                              </option>
                            ))}
                          </select>

                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        data-label="ACTIONS"
                        className="applications-action-cell"
                      >
                        <button
                          onClick={() =>
                            navigate(`/jobs/${app.job_id}`)
                          }
                          className="btn btn-secondary btn-sm"
                        >
                          Job Details
                        </button>
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
          title={
            activeTab === 'All'
              ? 'No applications submitted yet'
              : `No applications in ${activeTab}`
          }
          description="Find opportunities in our job board and submit applications to start tracking your interviews and offers."
          action={
            <button
              onClick={() => navigate('/jobs')}
              className="btn btn-primary btn-sm"
            >
              Discover Open Positions
            </button>
          }
        />

      )}

    </div>
  )
}