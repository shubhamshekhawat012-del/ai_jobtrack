import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import JobCard from '../components/JobCard'
import EmptyState from '../components/EmptyState'
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  X,
  MapPin,
  DollarSign,
  Building,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default function Jobs() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [jobs, setJobs] = useState([])
  const [externalJobs, setExternalJobs] = useState([])
  const [externalTotal, setExternalTotal] = useState(0)
  const [externalPage, setExternalPage] = useState(1)
  const [externalLoading, setExternalLoading] = useState(true)
  const [loadingMoreExternal, setLoadingMoreExternal] = useState(false)
  const externalRequestId = useRef(0)
  const loadMoreSentinel = useRef(null)
  const [externalError, setExternalError] = useState('')
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedType, setSelectedType] = useState('All')
  const [selectedExp, setSelectedExp] = useState('All')

  useEffect(() => {
    const q = searchParams.get('search')
    if (q !== null) {
      searchForJobs(q)
    }
  }, [searchParams])

  // New Job Modal state
  const [showPostModal, setShowPostModal] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')
  const [postSuccess, setPostSuccess] = useState('')

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    salary: '',
    required_skills: '',
    description: '',
    application_url: '',
  })

  useEffect(() => {
    fetchJobsAndSaved()
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const requestId = ++externalRequestId.current
      setExternalLoading(externalPage === 1)
      try {
        const response = await api.get('/jobs/external', {
          params: {
            q: searchQuery.trim(),
            page: externalPage,
            seniority: selectedExp === 'All' ? undefined : selectedExp === 'Lead' ? 'Senior' : selectedExp,
            employment_type: {
              'Full-time': 'Full Time',
              'Part-time': 'Part Time',
              Contract: 'Contractor',
              Internship: 'Intern',
            }[selectedType],
          },
        })
        if (requestId !== externalRequestId.current) return
        const results = response.data?.jobs || []
        setExternalJobs((current) => externalPage === 1 ? results : [
          ...current,
          ...results.filter((job) => !current.some((loaded) => loaded.id === job.id)),
        ])
        setExternalTotal(response.data?.total || results.length)
        setExternalError('')
      } catch (err) {
        if (requestId !== externalRequestId.current) return
        if (externalPage === 1) {
          setExternalJobs([])
          setExternalTotal(0)
        }
        const reason = err.response?.data?.detail
        setExternalError(reason
          ? `Himalayas jobs could not be loaded: ${reason}. Your local listings are still available.`
          : 'Himalayas jobs could not be loaded. Check that the backend is running and can access the internet. Your local listings are still available.')
        console.error('Failed to load Himalayas jobs', err)
      } finally {
        if (requestId === externalRequestId.current) {
          setExternalLoading(false)
          setLoadingMoreExternal(false)
        }
      }
    }, searchQuery.trim() ? 350 : 0)
    return () => clearTimeout(timer)
  }, [searchQuery, externalPage, selectedExp, selectedType])

  useEffect(() => {
    const sentinel = loadMoreSentinel.current
    if (!sentinel || externalLoading || externalJobs.length === 0 || externalJobs.length >= externalTotal) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMoreExternal) {
        setLoadingMoreExternal(true)
        setExternalPage((page) => page + 1)
      }
    }, { rootMargin: '300px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [externalJobs.length, externalTotal, externalLoading, loadingMoreExternal])

  const searchForJobs = (value) => {
    setSearchQuery(value)
    setExternalPage(1)
    setExternalJobs([])
    setExternalTotal(0)
  }

  const updateRemoteFilter = (setter, value) => {
    setter(value)
    setExternalPage(1)
    setExternalJobs([])
    setExternalTotal(0)
  }

  const fetchJobsAndSaved = async () => {
    try {
      setLoading(true)
      const [jobsRes, savedRes] = await Promise.all([
        api.get('/jobs/'),
        api.get('/saved-jobs/'),
      ])
      setJobs(jobsRes.data || [])
      const ids = new Set((savedRes.data || []).map((s) => s.job_id))
      setSavedJobIds(ids)
    } catch (err) {
      console.error('Failed to load jobs data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveJob = async (jobId) => {
    try {
      await api.post('/saved-jobs/', { job_id: jobId })
      setSavedJobIds((prev) => new Set([...prev, jobId]))
    } catch (err) {
      console.error('Failed to save job', err)
    }
  }

  const handleUnsaveJob = async (jobId) => {
    try {
      await api.delete(`/saved-jobs/${jobId}`)
      setSavedJobIds((prev) => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
    } catch (err) {
      console.error('Failed to remove saved job', err)
    }
  }

  const handleUseAI = async (externalJob) => {
    try {
      const existing = externalJob.application_url
        ? jobs.find((job) => job.application_url === externalJob.application_url)
        : jobs.find((job) => job.title === externalJob.title && job.company === externalJob.company)
      const savedJob = existing || (await api.post('/jobs/', {
        title: externalJob.title,
        company: externalJob.company,
        location: externalJob.location,
        job_type: externalJob.job_type,
        experience_level: externalJob.experience_level,
        description: externalJob.description,
        required_skills: externalJob.required_skills,
        salary: externalJob.salary,
        application_url: externalJob.application_url,
      })).data
      if (!existing) setJobs((current) => [savedJob, ...current])
      navigate(`/jobs/${savedJob.id}`)
    } catch (err) {
      console.error('Could not prepare this job for AI tools', err)
      setExternalError(err.response?.data?.detail || 'Could not open AI tools for this job. Please sign in again and retry.')
    }
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    setPostError('')
    setPosting(true)

    try {
      // Optional inputs are controlled as strings, but the API expects an
      // omitted URL to be null (an empty string is not a valid HttpUrl).
      const payload = {
        ...newJob,
        title: newJob.title.trim(),
        company: newJob.company.trim(),
        location: newJob.location.trim() || null,
        salary: newJob.salary.trim() || null,
        required_skills: newJob.required_skills.trim() || null,
        description: newJob.description.trim(),
        application_url: newJob.application_url.trim() || null,
      }
      const res = await api.post('/jobs/', payload)
      setJobs((current) => [res.data, ...current])
      setShowPostModal(false)
      setPostSuccess('Job published successfully.')
      setNewJob({
          title: '',
          company: '',
          location: '',
          job_type: 'Full-time',
          experience_level: 'Mid-level',
          salary: '',
          required_skills: '',
          description: '',
          application_url: '',
        })
    } catch (err) {
      console.error(err)
      setPostError(err.response?.data?.detail || 'Failed to post job. Check required fields.')
    } finally {
      setPosting(false)
    }
  }

  // Filtered jobs calculation
  const filteredJobs = useMemo(() => {
    return [...jobs, ...externalJobs].filter((job) => {
      const matchesSearch =
        searchQuery === '' ||
        (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.required_skills || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = selectedType === 'All' || job.job_type === selectedType
      const seniorities = (job.experience_level || '').split(',').map((value) => value.trim().toLowerCase())
      const matchesExp = selectedExp === 'All' || seniorities.includes(selectedExp.toLowerCase()) ||
        (selectedExp === 'Entry-level' && seniorities.includes('junior'))

      return matchesSearch && matchesType && matchesExp
    })
  }, [jobs, externalJobs, searchQuery, selectedType, selectedExp])

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
            Explore Opportunities
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: 'var(--font-base)' }}>
            Discover tech and engineering roles, bookmark favorites, or publish new listings.
          </p>
        </div>

        <button onClick={() => setShowPostModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Post New Job</span>
        </button>
      </div>

      {postSuccess && (
        <div className="alert alert-success" role="status" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={18} />
          <span>{postSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
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
            placeholder="Search by title, company, skills (e.g. Python, React)..."
            value={searchQuery}
          onChange={(e) => searchForJobs(e.target.value)}
          />
        </div>

        {/* Job Type Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-input form-select"
            value={selectedType}
            onChange={(e) => updateRemoteFilter(setSelectedType, e.target.value)}
          >
            <option value="All">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* Experience Level Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-input form-select"
            value={selectedExp}
            onChange={(e) => updateRemoteFilter(setSelectedExp, e.target.value)}
          >
            <option value="All">All Experience</option>
            <option value="Entry-level">Entry-level</option>
            <option value="Mid-level">Mid-level</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>
        </div>

        {/* Clear filters button if active */}
        {(searchQuery || selectedType !== 'All' || selectedExp !== 'All') && (
          <button
            onClick={() => {
              searchForJobs('')
              updateRemoteFilter(setSelectedType, 'All')
              updateRemoteFilter(setSelectedExp, 'All')
            }}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-primary)' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          fontSize: 'var(--font-sm)',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredJobs.length}</strong>{' '}
          {filteredJobs.length === 1 ? 'position' : 'positions'}
          {externalTotal > 0 && <span> · {externalTotal} matching Himalayas jobs available</span>}
        </span>
      </div>

      {/* Jobs Grid */}
      {loading || externalLoading ? (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="card skeleton"
              style={{ height: '220px', border: '1px solid var(--border-primary)' }}
            />
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobIds.has(job.id)}
              onSave={handleSaveJob}
              onUnsave={handleUnsaveJob}
              onUseAI={handleUseAI}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No jobs found matching your criteria"
          description="Try modifying your keyword search or adjusting your experience and type filters."
          action={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => {
                searchForJobs('')
                  setSelectedType('All')
                  setSelectedExp('All')
                }}
                className="btn btn-secondary btn-sm"
              >
                Clear All Filters
              </button>
              {externalError && <a href="https://himalayas.app/jobs" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Browse Himalayas jobs</a>}
            </div>
          }
        />
      )}
      {!loading && externalJobs.length > 0 && externalJobs.length < externalTotal && (
        <div ref={loadMoreSentinel} role="status" style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          {loadingMoreExternal ? 'Loading more matching jobs…' : 'Scroll to see more matching jobs'}
        </div>
      )}
      {externalError && <p role="status" style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{externalError}</p>}
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginTop: '1.5rem' }}>
        Remote listings sourced from <a href="https://himalayas.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>Himalayas</a>.
      </p>

      {/* Post New Job Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Post a New Job Opportunity</h2>
              <button
                className="modal-close"
                onClick={() => setShowPostModal(false)}
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {postError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{postError}</span>
              </div>
            )}

            <form onSubmit={handlePostJob}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Stripe, Acme Corp"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Remote, San Francisco, CA"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. $130,000 - $160,000"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-input form-select"
                    value={newJob.job_type}
                    onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select
                    className="form-input form-select"
                    value={newJob.experience_level}
                    onChange={(e) => setNewJob({ ...newJob, experience_level: e.target.value })}
                  >
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. React, TypeScript, GraphQL, CSS"
                  value={newJob.required_skills}
                  onChange={(e) => setNewJob({ ...newJob, required_skills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://company.com/careers/apply"
                  value={newJob.application_url}
                  onChange={(e) => setNewJob({ ...newJob, application_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description *</label>
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  placeholder="Provide responsibilities, requirements, and background..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPostModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={posting}>
                  {posting ? 'Posting Job...' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
