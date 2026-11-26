export default function StatCard({ title, value, icon: Icon, gradient, delay = 0 }) {
  return (
    <div style={{
      background: gradient,
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
      animation: `fadeInUp 0.4s ease ${delay}ms both`,
      minHeight: 120,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      {/* Decorative circle */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 'var(--font-sm)',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.8)',
          letterSpacing: '0.02em',
        }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={20} color="white" />
          </div>
        )}
      </div>

      <div style={{
        fontSize: 'var(--font-3xl)',
        fontWeight: 700,
        color: 'white',
        letterSpacing: '-0.02em',
        marginTop: 'var(--space-2)',
      }}>
        {value}
      </div>
    </div>
  )
}
