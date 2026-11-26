import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Send,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Target,
  Wand2,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react'

export default function JobDetails() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedResumeVersion, setSelectedResumeVersion] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [notes, setNotes] = useState('')
  const [submittingApp, setSubmittingApp] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [applySuccess, setApplySuccess] = useState('')

  useEffect(() => {
    fetchJobDetails()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const [jobRes, savedRes, appRes, resumeRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get('/saved-jobs/'),
        api.get('/applications/'),
        api.get('/resumes/'),
      ])

      setJob(jobRes.data)
      setIsSaved((savedRes.data || []).some((s) => s.job_id === parseInt(jobId)))
      setHasApplied((appRes.data || []).some((a) => a.job_id === parseInt(jobId)))
      setResumes(resumeRes.data || [])

      if (resumeRes.data?.length > 0) {
        setSelectedResumeVersion(resumeRes.data[0].file_name)
      }
    } catch (err) {
      console.error(err)
      setError('Job not found or could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${jobId}`)
        setIsSaved(false)
      } else {
        await api.post('/saved-jobs/', { job_id: parseInt(jobId) })
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Error toggling save', err)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setApplyError('')
    setSubmittingApp(true)

    try {
      await api.post('/applications/', {
        job_id: parseInt(jobId),
        resume_version: selectedResumeVersion || null,
        cover_letter: coverLetter || null,
        notes: notes || null,
      })

      setApplySuccess('Application submitted and tracked successfully!')
      setHasApplied(true)
      setTimeout(() => {
        setShowApplyModal(false)
        setApplySuccess('')
      }, 1500)
    } catch (err) {
      console.error(err)
      setApplyError(err.response?.data?.detail || 'Failed to submit application.')
    } finally {
      setSubmittingApp(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="card skeleton" style={{ height: '380px' }} />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error || 'Job not found'}</div>
        <button onClick={() => navigate('/jobs')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Jobs
        </button>
      </div>
    )
  }

  // Parse skills
  const skillList = job.required_skills
    ? job.required_skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  return (
    <div className="page-container animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/jobs')}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={16} /> Back to Job Listings
      </button>

      {/* Main Job Banner Card */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {job.job_type || 'Full-time'}
            </span>
            <h1
              style={{
                fontSize: 'var(--font-3xl)',
                fontWeight: 700,
                color: 'var(--text-heading)',
                marginTop: '0.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              {job.title}
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '0.5rem',
                fontSize: 'var(--font-base)',
                color: 'var(--text-secondary)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={16} color="var(--accent-primary)" /> {job.company}
              </span>
              {job.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} color="var(--text-muted)" /> {job.location}
                </span>
              )}
              {job.experience_level && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color="var(--text-muted)" /> {job.experience_level}
                </span>
              )}
              {job.salary && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--accent-success)',
                    fontWeight: 600,
                  }}
                >
                  <DollarSign size={16} /> {job.salary}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleToggleSave}
              className="btn btn-secondary"
              title={isSaved ? 'Remove Bookmark' : 'Bookmark Job'}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck size={18} color="var(--accent-primary)" />
                  <span>Bookmarked</span>
                </>
              ) : (
                <>
                  <Bookmark size={18} />
                  <span>Save Job</span>
                </>
              )}
            </button>

            {hasApplied ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-success)',
                  fontWeight: 600,
                  fontSize: 'var(--font-sm)',
                }}
              >
                <CheckCircle size={18} />
                <span>Applied</span>
              </div>
            ) : (
              <button onClick={() => setShowApplyModal(true)} className="btn btn-primary">
                <Send size={18} />
                <span>Apply & Track</span>
              </button>
            )}

            {job.application_url && (
              <a
                href={job.application_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                title="Open external company portal"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Skills Tag Pills */}
        {skillList.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {skillList.map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: 'var(--font-xs)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(139, 92, 246, 0.12)',
                  color: 'var(--accent-primary)',
                  fontWeight: 500,
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Description & AI Launchpad */}
      <div className="grid-3" style={{ alignItems: 'start' }}>
        {/* Left 2 Cols: Job Details & Requirements */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2
              style={{
                fontSize: 'var(--font-xl)',
                fontWeight: 600,
                color: 'var(--text-heading)',
                marginBottom: '1rem',
              }}
            >
              Role Description & Expectations
            </h2>
            <div
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                fontSize: 'var(--font-base)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {job.description}
            </div>
          </div>
        </div>

        {/* Right Col: AI Copilot Accelerators for this Job */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ background: 'var(--bg-secondary)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                color: 'var(--accent-secondary)',
              }}
            >
              <Sparkles size={18} />
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--text-heading)' }}>
                AI Tailored Accelerators
              </h3>
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Run intelligent AI tools specifically calibrated to this opening:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to={`/ai/job-match?jobId=${job.id}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px' }}
              >
                <Target size={16} color="var(--accent-secondary)" />
                <span style={{ fontSize: 'var(--font-sm)' }}>Calculate Job Match Score</span>
              </Link>

              <Link
                to={`/ai/cover-letter?jobId=${job.id}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px' }}
              >
                <Wand2 size={16} color="var(--accent-success)" />
                <span style={{ fontSize: 'var(--font-sm)' }}>Generate Cover Letter</span>
              </Link>

              <Link
                to={`/ai/interview-prep?jobId=${job.id}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px' }}
              >
                <MessageSquare size={16} color="var(--accent-warning)" />
                <span style={{ fontSize: 'var(--font-sm)' }}>Prepare Interview Questions</span>
              </Link>
            </div>
          </div>

          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.08))',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
              💡 Application Tip
            </h4>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Use our AI Resume Analyzer first to ensure your resume contains high-frequency keywords required by {job.company}.
            </p>
          </div>
        </div>
      </div>

      {/* Apply & Track Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply to {job.title}</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>
                <X size={20} />
              </button>
            </div>

            {applyError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{applyError}</span>
              </div>
            )}

            {applySuccess && (
              <div className="alert alert-success">
                <CheckCircle size={18} />
                <span>{applySuccess}</span>
              </div>
            )}

            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Select Resume Version</label>
                {resumes.length > 0 ? (
                  <select
                    className="form-input form-select"
                    value={selectedResumeVersion}
                    onChange={(e) => setSelectedResumeVersion(e.target.value)}
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.file_name}>
                        {r.file_name} (Uploaded {new Date(r.created_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    style={{
                      padding: '10px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-xs)',
                      color: 'var(--accent-warning)',
                    }}
                  >
                    No uploaded resumes found.{' '}
                    <Link to="/resumes" style={{ textDecoration: 'underline' }}>
                      Upload one here first
                    </Link>
                    .
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Cover Letter (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  placeholder="Paste or write your custom cover letter..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application Notes (Private)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Applied via referral, hiring manager is Alex"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingApp}>
                  {submittingApp ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
