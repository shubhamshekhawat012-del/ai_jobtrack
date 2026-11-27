import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import {
  Sparkles,
  Copy,
  Check,
  Download,
  AlertCircle,
  RefreshCw,
  Award,
  ArrowRight,
  Bot,
} from 'lucide-react'

export default function ResumeAnalyzer() {
  const [searchParams] = useSearchParams()
  const initialResumeId = searchParams.get('resumeId')

  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId || '')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [atsScore, setAtsScore] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      setLoadingResumes(true)
      const res = await api.get('/resumes/')
      setResumes(res.data || [])

      if (res.data?.length > 0) {
        if (
          !selectedResumeId ||
          !res.data.some((r) => r.id === parseInt(selectedResumeId))
        ) {
          setSelectedResumeId(res.data[0].id.toString())
        }
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch resumes.')
    } finally {
      setLoadingResumes(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      setError('Please select a resume to analyze.')
      return
    }

    setError('')
    setAnalyzing(true)
    setAnalysisResult(null)
    setAtsScore(null)

    try {
      const res = await api.post(`/ai/resume/${selectedResumeId}/analyze`)
      setAnalysisResult(res.data.analysis)
      setAtsScore(res.data.ats_score || null)
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.detail ||
          'Failed to complete resume analysis. Please try again.'
      )
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCopy = () => {
    if (!analysisResult) return

    navigator.clipboard.writeText(analysisResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!analysisResult) return

    const blob = new Blob([analysisResult], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `resume_analysis_${selectedResumeId}.md`
    a.click()

    URL.revokeObjectURL(url)
  }

  const renderFormattedAnalysis = (text) => {
    if (!text) return null

    const lines = text.split('\n')

    return (
      <div className="resume-analysis-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim()

          if (
            trimmed.startsWith('### ') ||
            trimmed.startsWith('## ') ||
            trimmed.startsWith('# ')
          ) {
            return (
              <h3 key={idx} className="analysis-heading">
                {trimmed.replace(/^#+\s*/, '')}
              </h3>
            )
          }

          if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            return (
              <h4 key={idx} className="analysis-subheading">
                {trimmed.replace(/\*\*/g, '')}
              </h4>
            )
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={idx} className="analysis-list-item">
                {trimmed.replace(/^[-*]\s*/, '')}
              </li>
            )
          }

          if (/^\d+\./.test(trimmed)) {
            return (
              <div key={idx} className="analysis-numbered-item">
                {trimmed}
              </div>
            )
          }

          if (!trimmed) {
            return <div key={idx} className="analysis-empty-line" />
          }

          return (
            <p key={idx} className="analysis-paragraph">
              {line}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-in resume-analyzer-page">

      {/* Header */}
      <div className="page-header resume-analyzer-header">
        <div className="resume-analyzer-badge">
          <span className="badge">
            AI RECRUITER ENGINE
          </span>
        </div>

        <h1>AI Resume Analyzer & ATS Optimizer</h1>

        <p>
          Obtain recruiter-level feedback on ATS optimization, technical
          strengths, skill gaps, and tailored role suggestions.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error resume-analyzer-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Resume Selection */}
      <div className="card resume-analyzer-control">

        <div className="resume-analyzer-select-area">
          <label className="form-label">
            Choose Target Resume for AI Review
          </label>

          {loadingResumes ? (
            <div className="resume-loading-text">
              Loading documents...
            </div>
          ) : resumes.length > 0 ? (
            <select
              className="form-input form-select resume-analyzer-select"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.file_name} (Uploaded{' '}
                  {new Date(r.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          ) : (
            <div className="resume-empty-message">
              No resumes found.{' '}
              <Link to="/resumes">
                Upload a resume first
              </Link>
            </div>
          )}
        </div>

        <div className="resume-analyzer-button-area">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || resumes.length === 0 || loadingResumes}
            className="btn btn-primary resume-analyze-button"
          >
            {analyzing ? (
              <>
                <RefreshCw
                  size={18}
                  className="resume-spin-icon"
                />
                <span>Analyzing Document...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Run Deep AI Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {analyzing && (
        <div className="card resume-analyzing-card">
          <div className="resume-analyzing-icon">
            <Bot size={28} color="white" />
          </div>

          <h3>
            Recruiter AI is Analyzing Your Profile
          </h3>

          <p>
            Checking ATS keyword density, formatting, technical domain
            experience, and compiling actionable recommendations...
          </p>
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && !analyzing && (
        <div className="card animate-fade-in-up resume-result-card">

          {/* Action Bar */}
          <div className="resume-result-header">

            <div className="resume-result-title">
              <Award size={20} color="var(--accent-secondary)" />

              <h2>
                Analysis & Recruiter Verdict
              </h2>
            </div>

            <div className="resume-result-actions">
              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check size={16} color="var(--accent-success)" />
                ) : (
                  <Copy size={16} />
                )}

                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="btn btn-secondary btn-sm"
                title="Download Report"
              >
                <Download size={16} />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* ATS Score */}
          {atsScore && (
            <section
              aria-label="ATS readiness score"
              className="resume-ats-section"
            >
              <div className="resume-ats-top">

                <div
                  className="resume-ats-circle"
                  style={{
                    borderColor:
                      atsScore.score >= 75
                        ? 'var(--accent-success)'
                        : atsScore.score >= 50
                          ? 'var(--accent-warning)'
                          : 'var(--accent-danger)',
                  }}
                >
                  <div>
                    <strong>{atsScore.score}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className="resume-ats-description">
                  <h3>ATS Readiness Score</h3>

                  <p>
                    A heuristic estimate based on extracted text, common
                    resume sections, contact details, keywords, and measurable
                    achievements. It is not a score from a specific employer's ATS.
                  </p>
                </div>
              </div>

              <div className="resume-ats-breakdown">
                {atsScore.breakdown?.map((item) => (
                  <div
                    key={item.category}
                    className="resume-ats-breakdown-card"
                  >
                    <div className="resume-ats-breakdown-heading">
                      <strong>{item.category}</strong>

                      <span>
                        {item.score}/{item.max_score}
                      </span>
                    </div>

                    <p>{item.feedback}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Analysis Text */}
          <div className="resume-analysis-output">
            {renderFormattedAnalysis(analysisResult)}
          </div>

          {/* Next Steps */}
          <div className="resume-next-steps">

            <div className="resume-next-steps-content">
              <h4>
                Ready to test against live roles?
              </h4>

              <p>
                Use our Smart Job Matcher to see how closely your resume
                aligns with specific openings.
              </p>
            </div>

            <button
              onClick={() => navigate('/ai/job-match')}
              className="btn btn-primary btn-sm resume-job-match-button"
            >
              Run Job Match
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      )}
    </div>
  )
}