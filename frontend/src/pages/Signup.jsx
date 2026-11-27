import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signup, login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      await signup({
        full_name: fullName,
        email,
        password,
      })

      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.detail ||
          'Failed to create account. Email may already be in use.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-glow" />

      <div className="glass-card animate-fade-in-up signup-card">
        <div className="signup-header">
          <div className="signup-logo">
            <Zap size={28} color="white" />
          </div>

          <h2>Join AI JobTrack</h2>

          <p>
            Elevate your job search with intelligent tracking & GenAI tools
          </p>
        </div>

        {error && (
          <div className="alert alert-error signup-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">
              Full Name
            </label>

            <div className="signup-input-wrapper">
              <User size={18} className="signup-input-icon" />

              <input
                id="signup-name"
                type="text"
                className="form-input signup-input"
                placeholder="Sarah Connor"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">
              Email Address
            </label>

            <div className="signup-input-wrapper">
              <Mail size={18} className="signup-input-icon" />

              <input
                id="signup-email"
                type="email"
                className="form-input signup-input"
                placeholder="sarah@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">
              Password
            </label>

            <div className="signup-input-wrapper">
              <Lock size={18} className="signup-input-icon" />

              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input signup-input signup-password-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm-password">
              Confirm Password
            </label>

            <div className="signup-input-wrapper">
              <Lock size={18} className="signup-input-icon" />

              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input signup-input"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary signup-submit"
            disabled={loading}
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="signup-footer">
          Already have an account?{' '}
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}