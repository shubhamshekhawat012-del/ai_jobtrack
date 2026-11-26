import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
      animation: 'fadeIn 0.4s ease',
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'var(--accent-primary-glow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <Icon size={32} color="var(--accent-primary)" />
      </div>
      <h3 style={{
        fontSize: 'var(--font-lg)',
        fontWeight: 600,
        color: 'var(--text-heading)',
        marginBottom: '0.5rem',
      }}>
        {title}
      </h3>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: 'var(--font-sm)',
        maxWidth: 360,
        lineHeight: 1.6,
      }}>
        {description}
      </p>
      {action && <div style={{ marginTop: '1.5rem' }}>{action}</div>}
    </div>
  )
}
