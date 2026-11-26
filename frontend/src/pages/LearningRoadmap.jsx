import { useState } from 'react'
import api from '../services/api'
import {
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertCircle,
  MapPin,
  CheckCircle2,
} from 'lucide-react'

export default function LearningRoadmap() {
  const [careerGoal, setCareerGoal] = useState('')
  const [currentSkills, setCurrentSkills] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Entry-level')
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [targetMonths, setTargetMonths] = useState(3)

  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!careerGoal.trim() || !currentSkills.trim()) {
      setError('Career goal and current skills are required.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await api.post('/ai/learning-roadmap', {
        career_goal: careerGoal,
        current_skills: currentSkills,
        experience_level: experienceLevel,
        available_hours_per_week: parseInt(hoursPerWeek),
        target_months: parseInt(targetMonths),
      })
      setRoadmap(res.data.roadmap)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to generate learning roadmap.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!roadmap) return
    navigator.clipboard.writeText(roadmap)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!roadmap) return
    const blob = new Blob([roadmap], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `learning_roadmap_${targetMonths}_months.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-secondary)' }}>
            CURRICULUM ARCHITECT
          </span>
        </div>
        <h1>AI Personalized Learning Roadmap</h1>
        <p>
          Design a realistic, milestone-driven curriculum tailored to your specific schedule,
          study availability, and target hiring timeline.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Configuration Card */}
      <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target Role / Career Goal *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cloud Solutions Architect or Fullstack Next.js Developer"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Experience Level</label>
              <select
                className="form-input form-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Entry-level">Beginner / Student</option>
                <option value="Junior">Junior Engineer (1-2 yrs)</option>
                <option value="Mid-level">Mid-level Engineer (3-5 yrs)</option>
                <option value="Senior">Senior Engineer (5+ yrs)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Current Skillset & Knowledge Base *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. HTML, CSS, JavaScript basics, Git"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Available Study Hours per Week</label>
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  {hoursPerWeek} hrs/week
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="40"
                step="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '8px' }}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Target Timeline Duration</label>
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                  {targetMonths} {targetMonths === 1 ? 'Month' : 'Months'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={targetMonths}
                onChange={(e) => setTargetMonths(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-secondary)', marginTop: '8px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 28px' }}>
              {loading ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Constructing Learning Schedule...</span>
                </>
              ) : (
                <>
                  <GraduationCap size={18} />
                  <span>Build {targetMonths}-Month Roadmap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Roadmap Output View */}
      {roadmap && !loading && (
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
                {targetMonths}-Month Blueprint: {careerGoal}
              </h2>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                Paced at {hoursPerWeek} hours/week • Milestone & Project-Based
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                {copied ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button onClick={handleDownload} className="btn btn-secondary btn-sm">
                <Download size={16} />
                <span>Export Roadmap</span>
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
            {roadmap}
          </div>
        </div>
      )}
    </div>
  )
}
