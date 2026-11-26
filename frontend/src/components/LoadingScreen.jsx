import { Loader } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '1rem',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--gradient-purple)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
      }}>
        <Loader size={24} color="white" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
        Loading AI JobTrack...
      </p>
    </div>
  )
}
