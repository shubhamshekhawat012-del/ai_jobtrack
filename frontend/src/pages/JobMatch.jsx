import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import {
  Target,
  FileText,
  Briefcase,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
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

  const navigate = useNavigate()

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const [jobsRes, resumesRes] = await Promise.all([
        api.get('/jobs/'),
        api.get('/resumes/'),
      ])

      const jData = jobsRes.data || []
      const rData = resumesRes.data || []

      setJobs(jData)
      setResumes(rData)

      if (jData.length > 0 && !selectedJobId) {
        setSelectedJobId(jData[0].id.toString())
      }
      if (rData.length > 0 && !selectedResumeId) {
        setSelectedResumeId(rData[0].id.toString())
      }
    } catch (err) {
      console.error(err)
      setError('Could not load jobs or resumes list.')
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

  const handleCopy = () => {
    if (!matchResult) return
    navigator.clipboard.writeText(matchResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Extract score if present
  const extractScore = (text) => {
    if (!text) return null
    const match = text.match(/Match Score:\s*(\d{1,3})/i) || text.match(/(\d{1,3})\s*(\/100|%)/i)
    return match ? parseInt(match[1]) : null
  }

  const score = matchResult ? extractScore(matchResult) : null

  const getScoreColor = (sc) => {
    if (sc >= 80) return 'var(--accent-success)'
    if (sc >= 60) return 'var(--accent-warning)'
    return 'var(--accent-danger)'
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-secondary)' }}>
            RECRUITMENT FIT ENGINE
          </span>
        </div>
        <h1>AI Smart Job Matcher</h1>
        <p>
          Compare your resume qualifications directly against any job description to assess match
          percentage, identify skill deficits, and receive targeted optimization advice.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Selectors Card */}
      <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          {/* Select Resume */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} color="var(--accent-primary)" />
              <span>Select Your Resume</span>
            </label>
            {resumes.length > 0 ? (
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
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--accent-warning)' }}>
                No resumes uploaded.{' '}
                <Link to="/resumes" style={{ textDecoration: 'underline' }}>
                  Upload one now
                </Link>
              </div>
            )}
          </div>

          {/* Select Job */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={16} color="var(--accent-secondary)" />
              <span>Select Target Opportunity</span>
            </label>
            {jobs.length > 0 ? (
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
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--accent-warning)' }}>
                No jobs available.{' '}
                <Link to="/jobs" style={{ textDecoration: 'underline' }}>
                  Post or browse jobs
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleMatch}
            disabled={matching || !selectedJobId || !selectedResumeId}
            className="btn btn-primary"
            style={{ padding: '12px 28px' }}
          >
            {matching ? (
              <>
                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
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

      {/* Loading state */}
      {matching && (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Target size={28} color="white" />
          </div>
          <h3 style={{ fontSize: 'var(--font-lg)', color: 'var(--text-heading)' }}>
            Comparing Resume with Job Description
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '0.5rem' }}>
            Cross-referencing required skills, years of experience, and role qualifications...
          </p>
        </div>
      )}

      {/* Results View */}
      {matchResult && !matching && (
        <div className="card animate-fade-in-up" style={{ padding: '2rem' }}>
          {/* Header & Score Gauge */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-primary)',
              paddingBottom: '1.5rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {score !== null && (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    border: `4px solid ${getScoreColor(score)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    boxShadow: `0 0 20px ${getScoreColor(score)}33`,
                  }}
                >
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor(score), lineHeight: 1 }}>
                    {score}%
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Match
                  </span>
                </div>
              )}
              <div>
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, color: 'var(--text-heading)' }}>
                  Compatibility Analysis
                </h2>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                  AI breakdown of skill overlap, strengths, and missing requirements
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                {copied ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() =>
                  navigate(`/ai/cover-letter?jobId=${selectedJobId}&resumeId=${selectedResumeId}`)
                }
                className="btn btn-primary btn-sm"
              >
                <Wand2 size={16} />
                <span>Write Cover Letter</span>
              </button>
            </div>
          </div>

          {/* Formatted Content */}
          <div
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.5)',
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              fontSize: 'var(--font-base)',
              color: 'var(--text-secondary)',
            }}
          >
            {matchResult}
          </div>
        </div>
      )}
    </div>
  )
}
