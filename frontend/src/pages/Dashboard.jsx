
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import {
  Briefcase,
  Send,
  Bookmark,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Wand2,
  MessageSquare,
  Calendar,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const res = await api.get('/ai/dashboard-analytics')
        setAnalytics(res.data)
        setError(null)
      } catch (err) {
        console.error('Failed to load dashboard analytics', err)
        setError('Could not fetch analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statusColors = {
    Applied: '#3b82f6',
    Screening: '#f59e0b',
    Interview: '#8b5cf6',
    Offer: '#10b981',
    Rejected: '#ef4444',
    Withdrawn: '#64748b',
  }

  const chartData = analytics?.application_status
    ? Object.entries(analytics.application_status).map(([name, count]) => ({
        name,
        count,
        color: statusColors[name] || '#8b5cf6',
      }))
    : []

  const aiTools = [
    {
      title: 'AI Resume Analyzer',
      description: 'Audit your resume for ATS compliance, strengths, and keywords.',
      path: '/ai/resume-analyzer',
      icon: Sparkles,
      color: 'var(--accent-primary)',
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
    },
    {
      title: 'Smart Job Match',
      description: 'Calculate match percentage & identify missing skill requirements.',
      path: '/ai/job-match',
      icon: Target,
      color: 'var(--accent-secondary)',
      gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))',
    },
    {
      title: 'AI Cover Letter',
      description: 'Generate high-impact, tailored letters matched to any job spec.',
      path: '/ai/cover-letter',
      icon: Wand2,
      color: 'var(--accent-success)',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
    },
    {
      title: 'Interview Simulator',
      description: 'Practice targeted behavioral & technical questions with AI guidance.',
      path: '/ai/interview-prep',
      icon: MessageSquare,
      color: 'var(--accent-warning)',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
    },
  ]

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'offer':
        return 'badge-offer'
      case 'interview':
        return 'badge-interview'
      case 'screening':
        return 'badge-screening'
      case 'rejected':
        return 'badge-rejected'
      case 'withdrawn':
        return 'badge-withdrawn'
      default:
        return 'badge-applied'
    }
  }

  return (
    <div className="page-container animate-fade-in dashboard-page">

      {/* Welcome Header */}
      <section className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>
            Welcome back, {user?.full_name?.split(' ')[0] || 'Explorer'} 👋
          </h1>
          <p>
            Track your pipeline, monitor application status, and leverage
            GenAI intelligence.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            onClick={() => navigate('/jobs')}
            className="btn btn-secondary btn-sm"
          >
            <Briefcase size={16} />
            <span>Browse Jobs</span>
          </button>

          <button
            onClick={() => navigate('/ai/resume-analyzer')}
            className="btn btn-primary btn-sm"
          >
            <Sparkles size={16} />
            <span>Analyze Resume</span>
          </button>
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}. Please refresh the page and try again.
        </div>
      )}

      {/* Statistics */}
      <section className="grid-4 dashboard-stats">
        <StatCard
          title="Total Open Jobs"
          value={loading ? '...' : analytics?.total_jobs ?? 0}
          icon={Briefcase}
          gradient="var(--gradient-purple)"
          delay={0}
        />

        <StatCard
          title="Applications Sent"
          value={loading ? '...' : analytics?.total_applications ?? 0}
          icon={Send}
          gradient="var(--gradient-blue)"
          delay={50}
        />

        <StatCard
          title="Saved Bookmarks"
          value={loading ? '...' : analytics?.total_saved_jobs ?? 0}
          icon={Bookmark}
          gradient="var(--gradient-teal)"
          delay={100}
        />

        <StatCard
          title="Uploaded Resumes"
          value={loading ? '...' : analytics?.total_resumes ?? 0}
          icon={FileText}
          gradient="var(--gradient-amber)"
          delay={150}
        />
      </section>

      {/* Analytics and AI Tools */}
      <section className="grid-2 dashboard-main-grid">

        {/* Application Pipeline Chart */}
        <div className="card dashboard-panel">
          <div className="dashboard-section-heading">
            <div>
              <h3>Application Pipeline Stages</h3>
              <p>Distribution across hiring stages</p>
            </div>
            <TrendingUp size={20} color="var(--accent-primary)" />
          </div>

          {chartData.length > 0 ? (
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border-primary)' }}
                  />

                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={12}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border-primary)' }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />

                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="dashboard-empty-chart">
              <p>
                {loading
                  ? 'Loading application analytics...'
                  : 'No active applications yet. Apply to jobs to see your pipeline metrics!'}
              </p>

              {!loading && (
                <button
                  onClick={() => navigate('/jobs')}
                  className="btn btn-secondary btn-sm"
                >
                  Explore Jobs
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI Career Suite */}
        <div className="card dashboard-panel">
          <div className="dashboard-section-heading">
            <div>
              <h3>AI Career Copilot</h3>
              <p>Intelligent career accelerators</p>
            </div>
            <Sparkles size={20} color="var(--accent-secondary)" />
          </div>

          <div className="dashboard-ai-tools">
            {aiTools.map((tool) => {
              const Icon = tool.icon

              return (
                <Link
                  key={tool.title}
                  to={tool.path}
                  className="dashboard-ai-tool"
                  style={{
                    background: tool.gradient,
                    '--tool-color': tool.color,
                  }}
                >
                  <div className="dashboard-ai-tool-heading">
                    <div className="dashboard-ai-tool-icon">
                      <Icon size={16} color={tool.color} />
                    </div>

                    <span>{tool.title}</span>
                  </div>

                  <p>{tool.description}</p>

                  <div className="dashboard-ai-tool-link">
                    Launch Tool <ArrowRight size={12} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Applications */}
      <section className="card dashboard-recent-section">
        <div className="dashboard-section-heading dashboard-recent-heading">
          <div>
            <h3>Recent Applications</h3>
            <p>Latest job applications and their current progression</p>
          </div>

          <Link to="/applications" className="dashboard-view-all">
            View All Applications <ArrowRight size={14} />
          </Link>
        </div>

        {analytics?.recent_applications?.length > 0 ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ROLE & COMPANY</th>
                  <th>STAGE</th>
                  <th>APPLIED ON</th>
                  <th className="dashboard-action-column">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {analytics.recent_applications.map((app) => (
                  <tr key={app.application_id}>
                    <td>
                      <div className="dashboard-job-title">
                        {app.job_title}
                      </div>
                      <div className="dashboard-company">
                        {app.company}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>

                    <td>
                      <span className="dashboard-date">
                        <Calendar size={14} />
                        {new Date(app.applied_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    <td className="dashboard-action-column">
                      <button
                        onClick={() => navigate(`/jobs/${app.job_id}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No applications tracked yet"
            description="Start applying to open opportunities or log external applications to monitor your progress."
            action={
              <button
                onClick={() => navigate('/jobs')}
                className="btn btn-primary btn-sm"
              >
                Browse Available Jobs
              </button>
            }
          />
        )}
      </section>
    </div>
  )
}
