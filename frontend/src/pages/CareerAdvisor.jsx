import { useState } from 'react'
import api from '../services/api'
import {
  Compass,
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export default function CareerAdvisor() {
  const [careerGoal, setCareerGoal] = useState('')
  const [currentSkills, setCurrentSkills] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Mid-level')
  const [interests, setInterests] = useState('')

  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const quickPresets = [
    {
      goal: 'Senior AI / Machine Learning Engineer',
      skills: 'Python, PyTorch, SQL, REST APIs, Docker',
      level: 'Mid-level',
      interests: 'Large Language Models, GenAI Agents, MLOps',
    },
    {
      goal: 'Staff Full-Stack Architect',
      skills: 'TypeScript, React, Node.js, PostgreSQL, AWS, GraphQL',
      level: 'Senior',
      interests: 'Distributed systems, microfrontends, high concurrency',
    },
    {
      goal: 'Lead DevOps / Platform Engineer',
      skills: 'Linux, Kubernetes, Terraform, Go, CI/CD, Python',
      level: 'Mid-level',
      interests: 'Cloud reliability, GitOps, infrastructure security',
    },
  ]

  const handleApplyPreset = (preset) => {
    setCareerGoal(preset.goal)
    setCurrentSkills(preset.skills)
    setExperienceLevel(preset.level)
    setInterests(preset.interests)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!careerGoal.trim() || !currentSkills.trim()) {
      setError('Career goal and current skills are required.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await api.post('/ai/career-advice', {
        career_goal: careerGoal,
        current_skills: currentSkills,
        experience_level: experienceLevel,
        interests: interests || null,
      })
      setAdvice(res.data.advice)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to generate career strategy.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!advice) return
    navigator.clipboard.writeText(advice)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!advice) return
    const blob = new Blob([advice], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `career_advice_${careerGoal.replace(/\s+/g, '_').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)' }}>
            STRATEGIC CAREER COPILOT
          </span>
        </div>
        <h1>AI Strategic Career Advisor</h1>
        <p>
          Formulate personalized trajectory plans, identify critical skill gaps, and explore
          project portfolios designed to transition you into your dream role.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Inspiration Presets */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
          💡 Popular Transition Trajectories (Click to prefill):
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {quickPresets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {p.goal}
            </button>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Desired Target Role / Career Goal *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Machine Learning Engineer at Anthropic"
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
                <option value="Entry-level">Entry-level (0-2 years)</option>
                <option value="Mid-level">Mid-level (3-5 years)</option>
                <option value="Senior">Senior (5-8 years)</option>
                <option value="Lead">Lead / Staff (8+ years)</option>
                <option value="Executive">Executive / Director</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Current Core Skills *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. JavaScript, React, Python, PostgreSQL, Git, Docker"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Special Interests & Preferences (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Remote work, high-scale latency, GenAI agent frameworks, open source"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 28px' }}>
              {loading ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Synthesizing Advisory Strategy...</span>
                </>
              ) : (
                <>
                  <Compass size={18} />
                  <span>Generate Career Strategy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Advisory Output View */}
      {advice && !loading && (
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
                Target Blueprint: {careerGoal}
              </h2>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                Customized recommendation based on {experienceLevel} profile
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                {copied ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button onClick={handleDownload} className="btn btn-secondary btn-sm">
                <Download size={16} />
                <span>Export Report</span>
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
            {advice}
          </div>
        </div>
      )}
    </div>
  )
}
