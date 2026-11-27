import { useState } from 'react'
import api from '../services/api'
import {
  Compass,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertCircle,
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
    <div className="page-container animate-fade-in career-advisor-page">

      {/* Header */}
      <div className="page-header career-advisor-header">
        <div className="career-advisor-badge">
          <span className="badge career-advisor-genai-badge">
            STRATEGIC CAREER COPILOT
          </span>
        </div>

        <h1>AI Strategic Career Advisor</h1>

        <p>
          Formulate personalized trajectory plans, identify critical skill gaps, and explore
          project portfolios designed to transition you into your dream role.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error career-advisor-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Presets */}
      <div className="career-advisor-presets">
        <span className="career-advisor-presets-label">
          💡 Popular Transition Trajectories (Click to prefill):
        </span>

        <div className="career-advisor-presets-list">
          {quickPresets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="btn btn-secondary btn-sm career-advisor-preset-btn"
            >
              {p.goal}
            </button>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="card career-advisor-form-card">
        <form onSubmit={handleSubmit}>

          <div className="grid-2 career-advisor-form-grid">

            {/* Career Goal */}
            <div className="form-group career-advisor-form-group">
              <label className="form-label">
                Desired Target Role / Career Goal *
              </label>

              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Machine Learning Engineer at Anthropic"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                required
              />
            </div>

            {/* Experience Level */}
            <div className="form-group career-advisor-form-group">
              <label className="form-label">
                Current Experience Level
              </label>

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

          {/* Skills */}
          <div className="form-group career-advisor-form-group">
            <label className="form-label">
              Your Current Core Skills *
            </label>

            <input
              type="text"
              className="form-input"
              placeholder="e.g. JavaScript, React, Python, PostgreSQL, Git, Docker"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              required
            />
          </div>

          {/* Interests */}
          <div className="form-group career-advisor-form-group">
            <label className="form-label">
              Special Interests & Preferences (Optional)
            </label>

            <input
              type="text"
              className="form-input"
              placeholder="e.g. Remote work, high-scale latency, GenAI agent frameworks, open source"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="career-advisor-submit-wrapper">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary career-advisor-submit-btn"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="career-advisor-spin" />
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

      {/* Loading */}
      {loading && (
        <div className="card career-advisor-loading">
          <div className="career-advisor-loading-icon">
            <Compass size={28} color="white" />
          </div>

          <h3>Building Your Career Strategy</h3>

          <p>
            Analyzing your skills, experience and career goals...
          </p>
        </div>
      )}

      {/* Advisory Output */}
      {advice && !loading && (
        <div className="card animate-fade-in-up career-advisor-output">

          {/* Output Header */}
          <div className="career-advisor-output-header">

            <div className="career-advisor-output-info">
              <h2>Target Blueprint: {careerGoal}</h2>

              <span>
                Customized recommendation based on {experienceLevel} profile
              </span>
            </div>

            <div className="career-advisor-actions">
              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
              >
                {copied ? (
                  <Check size={16} color="var(--accent-success)" />
                ) : (
                  <Copy size={16} />
                )}

                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="btn btn-secondary btn-sm"
              >
                <Download size={16} />
                <span>Export Report</span>
              </button>
            </div>

          </div>

          {/* Advice Content */}
          <div className="career-advisor-advice">
            {advice}
          </div>

        </div>
      )}

    </div>
  )
}