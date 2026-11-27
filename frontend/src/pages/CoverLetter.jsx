import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
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
    <div className="page-container animate-fade-in cover-letter-page">

      {/* Header */}
      <div className="page-header cover-letter-header">
        <div className="cover-letter-badge">
          <span className="badge cover-letter-genai-badge">
            GENAI WRITING ASSISTANT
          </span>
        </div>

        <h1>AI Tailored Cover Letter Generator</h1>

        <p>
          Craft highly persuasive, bespoke cover letters strictly grounded in your actual verified
          experience and matching the targeted company's requirements.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error cover-letter-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Card */}
      <div className="card cover-letter-settings">

        {/* Selectors */}
        <div className="grid-2 cover-letter-selectors">

          {/* Resume */}
          <div className="form-group cover-letter-form-group">
            <label className="form-label cover-letter-label">
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
              <div className="cover-letter-empty">
                No resumes uploaded.{' '}
                <Link to="/resumes">Upload one now</Link>
              </div>
            )}
          </div>

          {/* Job */}
          <div className="form-group cover-letter-form-group">
            <label className="form-label cover-letter-label">
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
              <div className="cover-letter-empty">
                No jobs available.{' '}
                <Link to="/jobs">Post or browse jobs</Link>
              </div>
            )}
          </div>

        </div>

        {/* Tone Selector */}
        <div className="cover-letter-tone-section">
          <label className="form-label">Voice & Tone Archetype</label>

          <div className="cover-letter-tone-grid">
            {tones.map((t) => {
              const isSelected = tone === t.id

              return (
                <div
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`cover-letter-tone-card ${
                    isSelected ? 'selected' : ''
                  }`}
                >
                  <div className="cover-letter-tone-title">
                    <span>{t.label}</span>
                    {isSelected && (
                      <Check size={14} color="var(--accent-primary)" />
                    )}
                  </div>

                  <div className="cover-letter-tone-description">
                    {t.desc}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Generate Button */}
        <div className="cover-letter-generate-wrapper">
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedJobId || !selectedResumeId}
            className="btn btn-primary cover-letter-generate-btn"
          >
            {generating ? (
              <>
                <RefreshCw size={18} className="cover-letter-spin" />
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

      {/* Loading */}
      {generating && (
        <div className="card cover-letter-loading">
          <div className="cover-letter-loading-icon">
            <Sparkles size={28} color="white" />
          </div>

          <h3>Writing Your Custom Cover Letter</h3>

          <p>
            Aligning your accomplishments with company requirements in a {tone} tone...
          </p>
        </div>
      )}

      {/* Generated Cover Letter */}
      {coverLetter && !generating && (
        <div className="card animate-fade-in-up cover-letter-output">

          {/* Output Header */}
          <div className="cover-letter-output-header">
            <div className="cover-letter-output-info">
              <h2>Your Custom Cover Letter</h2>

              <span>
                {wordCount} words • Tone: {tone.toUpperCase()} • Click to edit directly
              </span>
            </div>

            <div className="cover-letter-actions">
              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
              >
                {copied ? (
                  <Check size={16} color="var(--accent-success)" />
                ) : (
                  <Copy size={16} />
                )}

                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="btn btn-secondary btn-sm"
              >
                <Download size={16} />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* Editable Letter */}
          <textarea
            className="form-input form-textarea cover-letter-textarea"
            rows={16}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />

          {/* Footer */}
          <div className="cover-letter-output-footer">
            <span>
              Tip: You can edit or personalize any paragraph before copying.
            </span>

            <Link
              to={`/jobs/${selectedJobId}`}
              className="btn btn-secondary btn-sm cover-letter-back-btn"
            >
              Back to Job Specification
            </Link>
          </div>

        </div>
      )}
    </div>
  )
}