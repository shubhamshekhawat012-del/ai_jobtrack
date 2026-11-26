import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import {
  Wand2,
  FileText,
  Briefcase,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Edit3,
} from 'lucide-react'

export default function CoverLetter() {
  const [searchParams] = useSearchParams()
  const initialJobId = searchParams.get('jobId')
  const initialResumeId = searchParams.get('resumeId')

  const [jobs, setJobs] = useState([])
  const [resumes, setResumes] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '')
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId || '')
  const [tone, setTone] = useState('professional')

  const [generating, setGenerating] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const tones = [
    { id: 'professional', label: 'Professional', desc: 'Balanced, formal, industry-standard' },
    { id: 'enthusiastic', label: 'Enthusiastic', desc: 'High energy, passion for the mission' },
    { id: 'confident', label: 'Confident', desc: 'Direct, results-oriented, leadership tone' },
    { id: 'concise', label: 'Concise', desc: 'Punchy, executive-level brevity' },
    { id: 'creative', label: 'Story-Driven', desc: 'Narrative style highlighting problem solving' },
  ]

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
      const res = await api.post('/ai/cover-letter', {
        job_id: parseInt(selectedJobId),
        resume_id: parseInt(selectedResumeId),
        tone,
      })
      setCoverLetter(res.data.cover_letter)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to generate cover letter.')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!coverLetter) return
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!coverLetter) return
    const blob = new Blob([coverLetter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover_letter_job_${selectedJobId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const wordCount = coverLetter ? coverLetter.trim().split(/\s+/).length : 0

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)' }}>
            GENAI WRITING ASSISTANT
          </span>
        </div>
        <h1>AI Tailored Cover Letter Generator</h1>
        <p>
          Craft highly persuasive, bespoke cover letters strictly grounded in your actual verified
          experience and matching the targeted company's requirements.
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
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          {/* Select Resume */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} color="var(--accent-primary)" />
              <span>Resume to Source Experience From</span>
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
        </div>

        {/* Tone Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Voice & Tone Archetype</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {tones.map((t) => {
              const isSelected = tone === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected
                      ? '1px solid var(--accent-primary)'
                      : '1px solid var(--border-primary)',
                    backgroundColor: isSelected
                      ? 'var(--accent-primary-glow)'
                      : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'var(--font-sm)',
                      fontWeight: 600,
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{t.label}</span>
                    {isSelected && <Check size={14} color="var(--accent-primary)" />}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {t.desc}
                  </div>
                </div>
              )
            })}
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
                <span>Drafting Tailored Letter...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Generate Cover Letter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Letter Area */}
      {generating && (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Sparkles size={28} color="white" />
          </div>
          <h3 style={{ fontSize: 'var(--font-lg)', color: 'var(--text-heading)' }}>
            Writing Your Custom Cover Letter
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '0.5rem' }}>
            Aligning your accomplishments with company requirements in a {tone} tone...
          </p>
        </div>
      )}

      {coverLetter && !generating && (
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
                Your Custom Cover Letter
              </h2>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                {wordCount} words • Tone: {tone.toUpperCase()} • Click to edit directly
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                {copied ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button onClick={handleDownload} className="btn btn-secondary btn-sm">
                <Download size={16} />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          <textarea
            className="form-input form-textarea"
            rows={16}
            style={{
              lineHeight: 1.8,
              fontSize: 'var(--font-base)',
              fontFamily: 'inherit',
              padding: '1.5rem',
              backgroundColor: 'rgba(10, 14, 26, 0.5)',
              border: '1px solid var(--border-primary)',
            }}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.25rem',
              fontSize: 'var(--font-xs)',
              color: 'var(--text-muted)',
            }}
          >
            <span>Tip: You can edit or personalize any paragraph before copying.</span>
            <Link
              to={`/jobs/${selectedJobId}`}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 'var(--font-xs)' }}
            >
              Back to Job Specification
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
