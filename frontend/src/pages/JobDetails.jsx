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

  const skillList = job.required_skills
    ? job.required_skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  return (
    <div className="page-container animate-fade-in job-details-page">
      <button
        onClick={() => navigate('/jobs')}
        className="btn btn-ghost btn-sm job-back-button"
      >
        <ArrowLeft size={16} /> Back to Job Listings
      </button>

      {/* Job Banner */}
      <div className="card job-details-banner">
        <div className="job-details-banner-top">
          <div className="job-details-heading">
            <span className="job-details-type">
              {job.job_type || 'Full-time'}
            </span>

            <h1>{job.title}</h1>

            <div className="job-details-meta">
              <span>
                <Building2 size={16} />
                {job.company}
              </span>

              {job.location && (
                <span>
                  <MapPin size={16} />
                  {job.location}
                </span>
              )}

              {job.experience_level && (
                <span>
                  <Clock size={16} />
                  {job.experience_level}
                </span>
              )}

              {job.salary && (
                <span className="job-details-salary">
                  <DollarSign size={16} />
                  {job.salary}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="job-details-actions">
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
              <div className="job-applied-badge">
                <CheckCircle size={18} />
                <span>Applied</span>
              </div>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="btn btn-primary"
              >
                <Send size={18} />
                <span>Apply & Track</span>
              </button>
            )}

            {job.application_url && (
              <a
                href={job.application_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary job-external-button"
                title="Open external company portal"
              >
                <ExternalLink size={16} />
                <span className="job-external-text">Company Portal</span>
              </a>
            )}
          </div>
        </div>

        {/* Skills */}
        {skillList.length > 0 && (
          <div className="job-details-skills">
            {skillList.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="job-details-layout">
        {/* Job Description */}
        <div className="job-details-description-column">
          <div className="card job-details-description-card">
            <h2>Role Description & Expectations</h2>

            <div className="job-details-description">
              {job.description}
            </div>
          </div>
        </div>

        {/* AI Tools */}
        <div className="job-details-sidebar">
          <div className="card job-ai-card">
            <div className="job-ai-heading">
              <Sparkles size={18} />
              <h3>AI Tailored Accelerators</h3>
            </div>

            <p className="job-ai-description">
              Run intelligent AI tools specifically calibrated to this opening:
            </p>

            <div className="job-ai-links">
              <Link
                to={`/ai/job-match?jobId=${job.id}`}
                className="btn btn-secondary"
              >
                <Target size={16} color="var(--accent-secondary)" />
                <span>Calculate Job Match Score</span>
              </Link>

              <Link
                to={`/ai/cover-letter?jobId=${job.id}`}
                className="btn btn-secondary"
              >
                <Wand2 size={16} color="var(--accent-success)" />
                <span>Generate Cover Letter</span>
              </Link>

              <Link
                to={`/ai/interview-prep?jobId=${job.id}`}
                className="btn btn-secondary"
              >
                <MessageSquare size={16} color="var(--accent-warning)" />
                <span>Prepare Interview Questions</span>
              </Link>
            </div>
          </div>

          <div className="card job-application-tip">
            <h4>💡 Application Tip</h4>
            <p>
              Use our AI Resume Analyzer first to ensure your resume contains
              high-frequency keywords required by {job.company}.
            </p>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div
          className="modal-overlay job-apply-overlay"
          onClick={() => setShowApplyModal(false)}
        >
          <div
            className="modal-content job-apply-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Apply to {job.title}</h2>

              <button
                className="modal-close"
                onClick={() => setShowApplyModal(false)}
              >
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
                        {r.file_name} (Uploaded{' '}
                        {new Date(r.created_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="job-no-resume">
                    No uploaded resumes found.{' '}
                    <Link to="/resumes">
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

              <div className="job-apply-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingApp}
                >
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