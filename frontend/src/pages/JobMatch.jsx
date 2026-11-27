import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import {
  Target,
  FileText,
  Briefcase,
  Check,
  Copy,
  RefreshCw,
  Wand2,
  AlertCircle,
} from 'lucide-react'

export default function JobMatch() {
  const [searchParams] = useSearchParams()
  const initialJobId = searchParams.get('jobId')
  const initialResumeId = searchParams.get('resumeId')

  const [jobs, setJobs] = useState([])
  const [resumes, setResumes] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '')
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId || '')

  const [matching, setMatching] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true)

      const [jobsRes, resumesRes] = await Promise.all([
        api.get('/jobs/'),
        api.get('/resumes/'),
      ])

      const jData = jobsRes.data || []
      const rData = resumesRes.data || []

      setJobs(jData)
      setResumes(rData)

      if (
        jData.length > 0 &&
        (!selectedJobId || !jData.some((j) => j.id === parseInt(selectedJobId)))
      ) {
        setSelectedJobId(jData[0].id.toString())
      }

      if (
        rData.length > 0 &&
        (!selectedResumeId || !rData.some((r) => r.id === parseInt(selectedResumeId)))
      ) {
        setSelectedResumeId(rData[0].id.toString())
      }
    } catch (err) {
      console.error(err)
      setError('Could not load jobs or resumes list.')
    } finally {
      setLoadingOptions(false)
    }
  }

  const handleMatch = async () => {
    if (!selectedJobId || !selectedResumeId) {
      setError('Please select both a job and a resume.')
      return
    }

    setError('')
    setMatching(true)
    setMatchResult(null)

    try {
      const res = await api.post('/ai/job-match', {
        job_id: parseInt(selectedJobId),
        resume_id: parseInt(selectedResumeId),
      })

      setMatchResult(res.data.analysis)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to analyze job match.')
    } finally {
      setMatching(false)
    }
  }

  const handleCopy = async () => {
    if (!matchResult) return

    try {
      await navigator.clipboard.writeText(matchResult)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
      setError('Unable to copy. Please try again.')
    }
  }

  const extractScore = (text) => {
    if (!text) return null

    const match =
      text.match(/Match Score:\s*(\d{1,3})/i) ||
      text.match(/(\d{1,3})\s*(\/100|%)/i)

    return match ? parseInt(match[1]) : null
  }

  const score = matchResult ? extractScore(matchResult) : null

  const getScoreColor = (sc) => {
    if (sc >= 80) return 'var(--accent-success)'
    if (sc >= 60) return 'var(--accent-warning)'
    return 'var(--accent-danger)'
  }

  return (
    <div className="page-container animate-fade-in job-match-page">

      {/* Header */}
      <div className="page-header job-match-header">
        <div className="job-match-badge">
          <span className="badge">
            RECRUITMENT FIT ENGINE
          </span>
        </div>

        <h1>AI Smart Job Matcher</h1>

        <p>
          Compare your resume qualifications directly against any job
          description to assess match percentage, identify skill deficits,
          and receive targeted optimization advice.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error job-match-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Selectors */}
      <div className="card job-match-selector-card">

        <div className="job-match-select-grid">

          {/* Resume */}
          <div className="form-group job-match-form-group">
            <label className="form-label job-match-label">
              <FileText size={16} color="var(--accent-primary)" />
              <span>Select Your Resume</span>
            </label>

            {loadingOptions ? (
              <div className="job-match-loading-text">
                Loading resumes...
              </div>
            ) : resumes.length > 0 ? (
              <select
                className="form-input form-select"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.file_name} ({new Date(r.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            ) : (
              <div className="job-match-empty-message">
                No resumes uploaded.{' '}
                <Link to="/resumes">
                  Upload one now
                </Link>
              </div>
            )}
          </div>

          {/* Job */}
          <div className="form-group job-match-form-group">
            <label className="form-label job-match-label">
              <Briefcase size={16} color="var(--accent-secondary)" />
              <span>Select Target Opportunity</span>
            </label>

            {loadingOptions ? (
              <div className="job-match-loading-text">
                Loading jobs...
              </div>
            ) : jobs.length > 0 ? (
              <select
                className="form-input form-select"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} @ {j.company} {j.location ? `(${j.location})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="job-match-empty-message">
                No jobs available.{' '}
                <Link to="/jobs">
                  Post or browse jobs
                </Link>
              </div>
            )}
          </div>

        </div>

        <div className="job-match-button-area">
          <button
            onClick={handleMatch}
            disabled={
              matching ||
              loadingOptions ||
              !selectedJobId ||
              !selectedResumeId
            }
            className="btn btn-primary job-match-submit-button"
          >
            {matching ? (
              <>
                <RefreshCw size={18} className="job-match-spin" />
                <span>Comparing Qualifications...</span>
              </>
            ) : (
              <>
                <Target size={18} />
                <span>Calculate Match Score</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {matching && (
        <div className="card job-match-loading-card">
          <div className="job-match-loading-icon">
            <Target size={28} color="white" />
          </div>

          <h3>
            Comparing Resume with Job Description
          </h3>

          <p>
            Cross-referencing required skills, years of experience,
            and role qualifications...
          </p>
        </div>
      )}

      {/* Results */}
      {matchResult && !matching && (
        <div className="card animate-fade-in-up job-match-result-card">

          {/* Result Header */}
          <div className="job-match-result-header">

            <div className="job-match-result-heading">

              {score !== null && (
                <div
                  className="job-match-score-circle"
                  style={{
                    borderColor: getScoreColor(score),
                    boxShadow: `0 0 20px ${getScoreColor(score)}33`,
                  }}
                >
                  <span style={{ color: getScoreColor(score) }}>
                    {score}%
                  </span>

                  <small>Match</small>
                </div>
              )}

              <div className="job-match-result-title">
                <h2>Compatibility Analysis</h2>

                <p>
                  AI breakdown of skill overlap, strengths, and missing requirements
                </p>
              </div>
            </div>

            <div className="job-match-result-actions">

              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
              >
                {copied ? (
                  <Check size={16} color="var(--accent-success)" />
                ) : (
                  <Copy size={16} />
                )}

                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/ai/cover-letter?jobId=${selectedJobId}&resumeId=${selectedResumeId}`
                  )
                }
                className="btn btn-primary btn-sm"
              >
                <Wand2 size={16} />
                <span>Write Cover Letter</span>
              </button>

            </div>
          </div>

          {/* Result Content */}
          <div className="job-match-result-content">
            {matchResult}
          </div>

        </div>
      )}

    </div>
  )
}