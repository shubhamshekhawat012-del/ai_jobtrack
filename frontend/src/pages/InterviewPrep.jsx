import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import {
  MessageSquare,
  FileText,
  Briefcase,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export default function InterviewPrep() {
  const [searchParams] = useSearchParams()
  const initialJobId = searchParams.get('jobId')
  const initialResumeId = searchParams.get('resumeId')

  const [jobs, setJobs] = useState([])
  const [resumes, setResumes] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '')
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId || '')
  const [numQuestions, setNumQuestions] = useState(10)

  const [generating, setGenerating] = useState(false)
  const [interviewData, setInterviewData] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

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

  const handleGenerate = async () => {
    if (!selectedJobId || !selectedResumeId) {
      setError('Please select both a job and a resume.')
      return
    }

    setError('')
    setGenerating(true)

    try {
      const res = await api.post('/ai/interview-prep', {
        job_id: parseInt(selectedJobId),
        resume_id: parseInt(selectedResumeId),
        number_of_questions: parseInt(numQuestions),
      })
      setInterviewData(res.data.interview_questions)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to generate interview preparation.')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!interviewData) return
    navigator.clipboard.writeText(interviewData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!interviewData) return
    const blob = new Blob([interviewData], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview_prep_job_${selectedJobId}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-warning)' }}>
            INTERVIEW SIMULATOR
          </span>
        </div>
        <h1>AI Interview Preparation & Answer Guide</h1>
        <p>
          Simulate real interview questions crafted specifically from your resume background and
          the target job's requirements, complete with what strong answers should cover.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Selectors and Settings Card */}
      <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="grid-3" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
          {/* Select Resume */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} color="var(--accent-primary)" />
              <span>Candidate Resume</span>
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
              <span>Target Opportunity</span>
            </label>
            {jobs.length > 0 ? (
              <select
                className="form-input form-select"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} @ {j.company}
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

          {/* Question Count Picker */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Number of Questions ({numQuestions})</label>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '8px' }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--font-xs)',
                color: 'var(--text-muted)',
                marginTop: '4px',
              }}
            >
              <span>5 quick</span>
              <span>10 standard</span>
              <span>25 deep dive</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedJobId || !selectedResumeId}
            className="btn btn-primary"
            style={{ padding: '12px 28px' }}
          >
            {generating ? (
              <>
                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Generating Interview Prep...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate {numQuestions} Custom Questions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {generating && (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
            }}
          >
            <HelpCircle size={28} color="white" />
          </div>
          <h3 style={{ fontSize: 'var(--font-lg)', color: 'var(--text-heading)' }}>
            Formulating Behavioral & Technical Questions
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '0.5rem' }}>
            Designing questions mapped to your candidate timeline and the employer's expectations...
          </p>
        </div>
      )}

      {/* Questions Output Section */}
      {interviewData && !generating && (
        <div className="card animate-fade-in-up" style={{ padding: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-primary)',
              paddingBottom: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, color: 'var(--text-heading)' }}>
                Targeted Interview Simulator Guide
              </h2>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                Tailored for {jobs.find((j) => j.id === parseInt(selectedJobId))?.title || 'this role'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                {copied ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>
              <button onClick={handleDownload} className="btn btn-secondary btn-sm">
                <Download size={16} />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>

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
            {interviewData}
          </div>
        </div>
      )}
    </div>
  )
}
