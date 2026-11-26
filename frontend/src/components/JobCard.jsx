import { MapPin, Building2, Clock, Bookmark, BookmarkCheck, ExternalLink, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function JobCard({ job, isSaved, onSave, onUnsave, onUseAI }) {
  const navigate = useNavigate()

  const statusColor = {
    'Full-time': 'var(--accent-success)',
    'Part-time': 'var(--accent-warning)',
    'Contract': 'var(--accent-info)',
    'Internship': 'var(--accent-secondary)',
  }
  const external = job.source === 'Himalayas'

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', position: 'relative' }}
      onClick={() => external ? onUseAI?.(job) : navigate(`/jobs/${job.id}`)}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: 'var(--font-md)',
            fontWeight: 600,
            color: 'var(--text-heading)',
            marginBottom: 'var(--space-1)',
            lineHeight: 1.4,
          }}>
          {job.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            <Building2 size={14} />
            <span>{job.company}</span>
          </div>
          {external && <span style={{ display: 'inline-block', marginTop: 6, color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>via Himalayas</span>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (external) onUseAI?.(job)
            else isSaved ? onUnsave?.(job.id) : onSave?.(job.id)
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isSaved ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            transition: 'all var(--transition-fast)',
            flexShrink: 0,
          }}
          title={external ? 'Open AI tools for this job' : isSaved ? 'Remove from saved' : 'Save job'}
        >
          {external ? <Sparkles size={16} color="var(--accent-secondary)" /> : isSaved
            ? <BookmarkCheck size={16} color="var(--accent-primary)" />
            : <Bookmark size={16} color="var(--text-muted)" />
          }
        </button>
      </div>

      {/* Meta row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
        fontSize: 'var(--font-xs)',
        color: 'var(--text-muted)',
      }}>
        {job.location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} /> {job.location}
          </span>
        )}
        {job.job_type && (
          <span style={{
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: statusColor[job.job_type] || 'var(--text-secondary)',
            fontWeight: 500,
          }}>
            {job.job_type}
          </span>
        )}
        {job.experience_level && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {job.experience_level}
          </span>
        )}
      </div>

      {/* Description preview */}
      <p style={{
        fontSize: 'var(--font-sm)',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        marginBottom: 'var(--space-4)',
      }}>
        {job.description}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--border-primary)',
      }}>
        {job.salary ? (
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--accent-success)' }}>
            {job.salary}
          </span>
        ) : (
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Salary not specified</span>
        )}
        {job.application_url && (
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 'var(--font-xs)',
              color: 'var(--accent-primary)',
            }}
          >
            {external ? 'Apply on Himalayas' : 'Apply'} <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )
}
