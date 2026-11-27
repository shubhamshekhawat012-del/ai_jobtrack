import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import {
  FileText,
  Briefcase,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  AlertCircle,
  HelpCircle,
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
    <div className="page-container animate-fade-in interview-prep-page">

      {/* Header */}
      <div className="page-header interview-prep-header">
        <div className="interview-prep-badge">
          <span className="badge interview-prep-genai-badge">
            INTERVIEW SIMULATOR
          </span>
        </div>

        <h1>AI Interview Preparation & Answer Guide</h1>

        <p>
          Simulate real interview questions crafted specifically from your resume background and
          the target job's requirements, complete with what strong answers should cover.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error interview-prep-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Card */}
      <div className="card interview-prep-settings">

        <div className="grid-3 interview-prep-selectors">

          {/* Resume */}
          <div className="form-group interview-prep-form-group">
            <label className="form-label interview-prep-label">
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
              <div className="interview-prep-empty">
                No resumes uploaded.{' '}
                <Link to="/resumes">Upload one now</Link>
              </div>
            )}
          </div>

          {/* Job */}
          <div className="form-group interview-prep-form-group">
            <label className="form-label interview-prep-label">
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
              <div className="interview-prep-empty">
                No jobs available.{' '}
                <Link to="/jobs">Post or browse jobs</Link>
              </div>
            )}
          </div>

          {/* Question Count */}
          <div className="form-group interview-prep-form-group">
            <label className="form-label">
              Number of Questions ({numQuestions})
            </label>

            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              className="interview-prep-range"
            />

            <div className="interview-prep-range-labels">
              <span>5 quick</span>
              <span>10 standard</span>
              <span>25 deep dive</span>
            </div>
          </div>

        </div>

        {/* Generate Button */}
        <div className="interview-prep-generate-wrapper">
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedJobId || !selectedResumeId}
            className="btn btn-primary interview-prep-generate-btn"
          >
            {generating ? (
              <>
                <RefreshCw size={18} className="interview-prep-spin" />
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

      {/* Loading */}
      {generating && (
        <div className="card interview-prep-loading">
          <div className="interview-prep-loading-icon">
            <HelpCircle size={28} color="white" />
          </div>

          <h3>Formulating Behavioral & Technical Questions</h3>

          <p>
            Designing questions mapped to your candidate timeline and the employer's expectations...
          </p>
        </div>
      )}

      {/* Interview Output */}
      {interviewData && !generating && (
        <div className="card animate-fade-in-up interview-prep-output">

          {/* Output Header */}
          <div className="interview-prep-output-header">

            <div className="interview-prep-output-info">
              <h2>Targeted Interview Simulator Guide</h2>

              <span>
                Tailored for {jobs.find((j) => j.id === parseInt(selectedJobId))?.title || 'this role'}
              </span>
            </div>

            <div className="interview-prep-actions">
              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
              >
                {copied ? (
                  <Check size={16} color="var(--accent-success)" />
                ) : (
                  <Copy size={16} />
                )}

                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="btn btn-secondary btn-sm"
              >
                <Download size={16} />
                <span>Export Markdown</span>
              </button>
            </div>

          </div>

          {/* Questions Content */}
          <div className="interview-prep-content">
            {interviewData}
          </div>

        </div>
      )}

    </div>
  )
}