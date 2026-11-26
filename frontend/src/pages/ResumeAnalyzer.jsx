import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  Download,
  AlertCircle,
  RefreshCw,
  Award,
  ChevronRight,
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
        if (!selectedResumeId || !res.data.some((r) => r.id === parseInt(selectedResumeId))) {
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
        err.response?.data?.detail || 'Failed to complete resume analysis. Please try again.'
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

  // Format markdown helper for structured display
  const renderFormattedAnalysis = (text) => {
    if (!text) return null

    // Split paragraphs or sections
    const lines = text.split('\n')
    return (
      <div style={{ lineHeight: 1.8, fontSize: 'var(--font-base)', color: 'var(--text-primary)' }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            return (
              <h3
                key={idx}
                style={{
                  fontSize: 'var(--font-lg)',
                  fontWeight: 700,
                  color: 'var(--accent-secondary)',
                  marginTop: '1.5rem',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {trimmed.replace(/^#+\s*/, '')}
              </h3>
            )
          }
          if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            return (
              <h4
                key={idx}
                style={{
                  fontSize: 'var(--font-base)',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  marginTop: '1rem',
                  marginBottom: '0.25rem',
                }}
              >
                {trimmed.replace(/\*\*/g, '')}
              </h4>
            )
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li
                key={idx}
                style={{
                  marginLeft: '1.25rem',
                  marginBottom: '0.35rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {trimmed.replace(/^[-*]\s*/, '')}
              </li>
            )
          }
          if (/^\d+\./.test(trimmed)) {
            return (
              <div
                key={idx}
                style={{
                  fontWeight: 600,
                  color: 'var(--text-heading)',
                  marginTop: '1.25rem',
                  marginBottom: '0.25rem',
                }}
              >
                {trimmed}
              </div>
            )
          }
          if (!trimmed) {
            return <div key={idx} style={{ height: '0.5rem' }} />
          }
          return (
            <p key={idx} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              {line}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)' }}>
            AI RECRUITER ENGINE
          </span>
        </div>
        <h1>AI Resume Analyzer & ATS Optimizer</h1>
        <p>
          Obtain recruiter-level feedback on ATS optimization, technical strengths, skill gaps,
          and tailored role suggestions.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Control Panel Card */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 320px' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem' }}>
            Choose Target Resume for AI Review
          </label>
          {loadingResumes ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Loading documents...</div>
          ) : resumes.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select
                className="form-input form-select"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.file_name} (Uploaded {new Date(r.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ color: 'var(--accent-warning)', fontSize: 'var(--font-sm)' }}>
              No resumes found.{' '}
              <Link to="/resumes" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                Upload a resume first
              </Link>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || resumes.length === 0}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            {analyzing ? (
              <>
                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
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

      {/* Analysis Output Section */}
      {analyzing && (
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            animation: 'pulse 1.5s infinite',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--gradient-purple)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(139, 92, 246, 0.4)',
              marginBottom: '1rem',
            }}
          >
            <Bot size={28} color="white" />
          </div>
          <h3 style={{ fontSize: 'var(--font-lg)', color: 'var(--text-heading)' }}>
            Recruiter AI is Analyzing Your Profile
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '0.5rem', maxWidth: '480px', margin: '0.5rem auto 0' }}>
            Checking ATS keyword density, formatting, technical domain experience, and compiling actionable recommendations...
          </p>
        </div>
      )}

      {analysisResult && !analyzing && (
        <div className="card animate-fade-in-up" style={{ padding: '2rem' }}>
          {/* Action Bar */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="var(--accent-secondary)" />
              <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, color: 'var(--text-heading)' }}>
                Analysis & Recruiter Verdict
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn btn-secondary btn-sm" title="Copy to clipboard">
                {copied ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button onClick={handleDownload} className="btn btn-secondary btn-sm" title="Download Report">
                <Download size={16} />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {atsScore && (
            <section
              aria-label="ATS readiness score"
              style={{
                marginBottom: '1.5rem',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{
                  width: 92, height: 92, borderRadius: '50%', flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  border: `7px solid ${atsScore.score >= 75 ? 'var(--accent-success)' : atsScore.score >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)'}`,
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: 'var(--font-xl)', color: 'var(--text-heading)', lineHeight: 1 }}>{atsScore.score}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>/100</span>
                  </div>
                </div>
                <div style={{ flex: '1 1 250px' }}>
                  <h3 style={{ color: 'var(--text-heading)', fontSize: 'var(--font-lg)', marginBottom: '0.35rem' }}>ATS Readiness Score</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                    A heuristic estimate based on extracted text, common resume sections, contact details, keywords, and measurable achievements. It is not a score from a specific employer's ATS.
                  </p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.85rem', marginTop: '1.25rem' }}>
                {atsScore.breakdown?.map((item) => (
                  <div key={item.category} style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <strong style={{ color: 'var(--text-heading)', fontSize: 'var(--font-sm)' }}>{item.category}</strong>
                      <span style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-sm)', whiteSpace: 'nowrap' }}>{item.score}/{item.max_score}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>{item.feedback}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rendered Text */}
          <div
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.5)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
            }}
          >
            {renderFormattedAnalysis(analysisResult)}
          </div>

          {/* Next Steps CTA */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-card)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--text-heading)' }}>
                Ready to test against live roles?
              </h4>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                Use our Smart Job Matcher to see how closely your resume aligns with specific openings.
              </p>
            </div>
            <button
              onClick={() => navigate('/ai/job-match')}
              className="btn btn-primary btn-sm"
            >
              Run Job Match <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
