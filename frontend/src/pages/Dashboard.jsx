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
  Clock,
  CheckCircle2,
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
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/ai/dashboard-analytics')
      setAnalytics(res.data)
    } catch (err) {
      console.error('Failed to load dashboard analytics', err)
      setError('Could not fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Format status chart data
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
    <div className="page-container animate-fade-in">
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-3xl)',
              fontWeight: 700,
              color: 'var(--text-heading)',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome back, {user?.full_name?.split(' ')[0] || 'Explorer'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: 'var(--font-base)' }}>
            Track your pipeline, monitor application status, and leverage GenAI intelligence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/jobs')} className="btn btn-secondary btn-sm">
            <Briefcase size={16} />
            <span>Browse Jobs</span>
          </button>
          <button onClick={() => navigate('/ai/resume-analyzer')} className="btn btn-primary btn-sm">
            <Sparkles size={16} />
            <span>Analyze Resume</span>
          </button>
        </div>
      </div>

      {/* 4 StatCards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
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
      </div>

      {/* Analytics & Pipeline Status Section */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Application Stage Breakdown */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-heading)' }}>
                Application Pipeline Stages
              </h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                Distribution across hiring stages
              </p>
            </div>
            <TrendingUp size={20} color="var(--accent-primary)" />
          </div>

          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                No active applications yet. Apply to jobs to see your pipeline metrics!
              </p>
              <button
                onClick={() => navigate('/jobs')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                Explore Jobs
              </button>
            </div>
          )}
        </div>

        {/* AI Career Suite Launchpad */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-heading)' }}>
                AI Career Copilot
              </h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                Intelligent career accelerators
              </p>
            </div>
            <Sparkles size={20} color="var(--accent-secondary)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {aiTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.title}
                  to={tool.path}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: tool.gradient,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = tool.color
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} color={tool.color} />
                    </div>
                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tool.title}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {tool.description}
                  </p>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: tool.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Launch Tool <ArrowRight size={12} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-heading)' }}>
              Recent Applications
            </h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              Latest job applications and their current progression
            </p>
          </div>
          <Link
            to="/applications"
            style={{
              fontSize: 'var(--font-sm)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            View All Applications <ArrowRight size={14} />
          </Link>
        </div>

        {analytics?.recent_applications?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    ROLE & COMPANY
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    STAGE
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    APPLIED ON
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.recent_applications.map((app) => (
                  <tr
                    key={app.application_id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        {app.job_title}
                      </div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                        {app.company}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} />
                        {new Date(app.applied_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/jobs/${app.job_id}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
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
              <button onClick={() => navigate('/jobs')} className="btn btn-primary btn-sm">
                Browse Available Jobs
              </button>
            }
          />
        )}
      </div>
    </div>
  )
}
