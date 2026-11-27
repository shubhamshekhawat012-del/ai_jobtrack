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
} from 'lucide-react'

export default function Resume() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [previewResume, setPreviewResume] = useState(null)

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

      setResumes((prev) => [res.data, ...prev])

      setSuccess(`"${file.name}" uploaded and parsed successfully!`)

      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Failed to upload or parse resume text. Please check the file.'
      )
    } finally {
      setUploading(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return
    }

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
    <div className="page-container animate-fade-in resumes-page">

      {/* Page Header */}
      <div className="page-header resumes-header">
        <h1>Resume Management</h1>

        <p>
          Upload and organize your resumes. Our backend extracts text
          automatically to power AI analysis, job matching, and cover
          letter generation.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error resumes-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success resumes-alert">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        className={`resume-upload-zone ${isDragging ? 'dragging' : ''} ${
          uploading ? 'uploading' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
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

        <div className="resume-upload-icon">
          <UploadCloud size={32} color="white" />
        </div>

        <h3>
          {uploading
            ? 'Processing & Extracting Text...'
            : 'Click or Drag & Drop Resume Here'}
        </h3>

        <p>
          Supports PDF (.pdf) and Word documents (.docx) up to 5 MB
        </p>

        {uploading && (
          <div className="resume-upload-progress">
            Parsing content with OCR / document engine...
          </div>
        )}
      </div>

      {/* Resumes Heading */}
      <div className="resumes-list-header">
        <h2>
          Your Uploaded Documents ({resumes.length})
        </h2>
      </div>

      {/* Loading */}
      {loading ? (

        <div className="resumes-grid">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="card skeleton resume-skeleton"
            />
          ))}
        </div>

      ) : resumes.length > 0 ? (

        /* Resume Cards */
        <div className="resumes-grid">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="card resume-card"
            >
              <div>

                {/* Resume Information */}
                <div className="resume-card-header">

                  <div className="resume-file-info">

                    <div className="resume-file-icon">
                      <FileText size={22} />
                    </div>

                    <div className="resume-file-details">

                      <h4>
                        {resume.file_name}
                      </h4>

                      <div className="resume-file-meta">

                        <span className="resume-file-type">
                          {resume.file_type?.replace('.', '') || 'DOC'}
                        </span>

                        <span>•</span>

                        <span className="resume-date">
                          <Calendar size={12} />

                          {new Date(resume.created_at).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>

                      </div>
                    </div>

                  </div>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="btn btn-ghost btn-sm resume-delete-button"
                    title="Delete resume"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

                {/* Extracted Text */}
                <div className="resume-extracted-preview">
                  {resume.extracted_text
                    ? resume.extracted_text.slice(0, 180) + '...'
                    : 'Text extraction complete'}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="resume-card-actions">

                <button
                  onClick={() => setPreviewResume(resume)}
                  className="btn btn-secondary btn-sm"
                >
                  <Eye size={14} />
                  Preview Text
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/ai/resume-analyzer?resumeId=${resume.id}`
                    )
                  }
                  className="btn btn-primary btn-sm"
                >
                  <Sparkles size={14} />
                  Analyze with AI
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
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary btn-sm"
            >
              <UploadCloud size={16} />
              Select File to Upload
            </button>
          }
        />

      )}

      {/* Extracted Text Preview Modal */}
      {previewResume && (
        <div
          className="modal-overlay resume-modal-overlay"
          onClick={() => setPreviewResume(null)}
        >
          <div
            className="modal-content resume-modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="modal-header resume-modal-header">

              <div className="resume-modal-title">
                <FileCheck
                  size={20}
                  color="var(--accent-primary)"
                />

                <h2>
                  Parsed Content: {previewResume.file_name}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setPreviewResume(null)}
              >
                <X size={20} />
              </button>

            </div>

            <p className="resume-modal-description">
              This is the readable text extracted by the system.
              All AI tools use this structured text for analysis.
            </p>

            {/* Extracted Text */}
            <div className="resume-modal-text">
              {previewResume.extracted_text || 'No text extracted.'}
            </div>

            {/* Modal Actions */}
            <div className="resume-modal-actions">

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
                <Sparkles size={16} />
                Run Full AI Analysis
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}