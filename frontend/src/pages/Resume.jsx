import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import EmptyState from '../components/EmptyState'
import {
  FileText,
  UploadCloud,
  Trash2,
  Eye,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  FileCheck,
  File,
} from 'lucide-react'

export default function Resume() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Preview modal state
  const [previewResume, setPreviewResume] = useState(null)

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      setLoading(true)
      const res = await api.get('/resumes/')
      setResumes(res.data || [])
    } catch (err) {
      console.error('Failed to load resumes', err)
      setError('Could not fetch resumes.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return

    // Validation
    const extension = '.' + file.name.split('.').pop().toLowerCase()
    if (!['.pdf', '.docx'].includes(extension)) {
      setError('Only PDF (.pdf) and Word (.docx) files are supported.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB limit.')
      return
    }

    setError('')
    setSuccess('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setResumes([res.data, ...resumes])
      setSuccess(`"${file.name}" uploaded and parsed successfully!`)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.detail || 'Failed to upload or parse resume text. Please check the file.'
      )
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return

    try {
      await api.delete(`/resumes/${resumeId}`)
      setResumes((prev) => prev.filter((r) => r.id !== resumeId))
      setSuccess('Resume removed successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to delete resume', err)
      setError('Failed to delete resume.')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Resume Management</h1>
        <p>
          Upload and organize your resumes. Our backend extracts text automatically to power AI
          analysis, job matching, and cover letter generation.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging
            ? '2px dashed var(--accent-primary)'
            : '2px dashed var(--border-secondary)',
          backgroundColor: isDragging
            ? 'var(--accent-primary-glow)'
            : 'rgba(26, 31, 46, 0.5)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
          marginBottom: '2.5rem',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0])
            }
          }}
        />

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--gradient-purple)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }}
        >
          <UploadCloud size={32} color="white" />
        </div>

        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-heading)' }}>
          {uploading ? 'Processing & Extracting Text...' : 'Click or Drag & Drop Resume Here'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginTop: '0.25rem' }}>
          Supports PDF (.pdf) and Word documents (.docx) up to 5 MB
        </p>

        {uploading && (
          <div style={{ marginTop: '1rem', color: 'var(--accent-primary)', fontSize: 'var(--font-sm)' }}>
            Parsing content with OCR / document engine...
          </div>
        )}
      </div>

      {/* Resumes List */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, color: 'var(--text-heading)' }}>
          Your Uploaded Documents ({resumes.length})
        </h2>
      </div>

      {loading ? (
        <div className="grid-2">
          {[1, 2].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '160px' }} />
          ))}
        </div>
      ) : resumes.length > 0 ? (
        <div className="grid-2">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: 'var(--font-base)',
                          fontWeight: 600,
                          color: 'var(--text-heading)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {resume.file_name}
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginTop: '2px',
                          fontSize: 'var(--font-xs)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                          {resume.file_type?.replace('.', '') || 'DOC'}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} />
                          {new Date(resume.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="btn btn-ghost btn-sm"
                    title="Delete resume"
                    style={{ color: 'var(--accent-danger)', padding: 6 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-xs)',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {resume.extracted_text
                    ? resume.extracted_text.slice(0, 180) + '...'
                    : 'Text extraction complete'}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-primary)',
                }}
              >
                <button
                  onClick={() => setPreviewResume(resume)}
                  className="btn btn-secondary btn-sm"
                >
                  <Eye size={14} /> Preview Text
                </button>

                <button
                  onClick={() => navigate(`/ai/resume-analyzer?resumeId=${resume.id}`)}
                  className="btn btn-primary btn-sm"
                >
                  <Sparkles size={14} /> Analyze with AI
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No resumes uploaded yet"
          description="Upload your latest CV or resume to enable AI analysis, ATS optimization, and personalized job matching."
          action={
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary btn-sm">
              <UploadCloud size={16} /> Select File to Upload
            </button>
          }
        />
      )}

      {/* Extracted Text Preview Modal */}
      {previewResume && (
        <div className="modal-overlay" onClick={() => setPreviewResume(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '720px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck size={20} color="var(--accent-primary)" />
                <h2>Parsed Content: {previewResume.file_name}</h2>
              </div>
              <button className="modal-close" onClick={() => setPreviewResume(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              This is the readable text extracted by the system. All AI tools use this structured text for analysis.
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                maxHeight: '400px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
              }}
            >
              {previewResume.extracted_text || 'No text extracted.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPreviewResume(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const id = previewResume.id
                  setPreviewResume(null)
                  navigate(`/ai/resume-analyzer?resumeId=${id}`)
                }}
              >
                <Sparkles size={16} /> Run Full AI Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
