import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import styles from './AuthPage.module.css'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast, showToast } = useToast()

  // Login fields
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  // Signup fields
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!loginForm.username || !loginForm.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const user = await api.login(loginForm.username, loginForm.password)
      login(user)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (!signupForm.username || !signupForm.email || !signupForm.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const user = await api.signup(signupForm.username, signupForm.email, signupForm.password)
      login(user)
      showToast('Account created!', 'success')
      setTimeout(() => navigate('/app'), 800)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <a href="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12h6m-3-3v6M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
              </svg>
            </div>
            <span className={styles.logoText}>Medi<em>Scan</em></span>
          </a>

          <div className={styles.heroText}>
            <h1>Your health records,<br /><em>clearly understood</em></h1>
            <p>Upload any medical document and get an instant AI-powered analysis with risk assessment, next steps, and unlimited follow-up questions.</p>
          </div>

          <div className={styles.features}>
            {[
              { icon: '⚡', label: 'Instant analysis in under 30 seconds' },
              { icon: '🔍', label: 'Risk identification & next steps' },
              { icon: '💬', label: 'Unlimited follow-up chat' },
              { icon: '📁', label: 'Secure report history' },
            ].map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.floatingCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDot} />
              <span>Blood Panel — Analyzed</span>
            </div>
            <div className={styles.cardBars}>
              <div className={styles.bar} style={{ width: '100%', background: 'rgba(42,122,111,0.3)' }} />
              <div className={styles.bar} style={{ width: '75%' }} />
              <div className={styles.bar} style={{ width: '90%', background: 'rgba(42,122,111,0.2)' }} />
              <div className={styles.bar} style={{ width: '60%' }} />
            </div>
            <div className={styles.cardTags}>
              <span className={styles.tagGreen}>Normal CBC</span>
              <span className={styles.tagAmber}>Vit D low</span>
              <span className={styles.tagRed}>LDL ↑</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>{tab === 'login' ? 'Welcome back' : 'Create account'}</h2>
            <p>{tab === 'login' ? 'Sign in to your MediScan account' : 'Start understanding your health today'}</p>
          </div>

          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => { setTab('login'); setError('') }}>
              Sign in
            </button>
            <button className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`} onClick={() => { setTab('signup'); setError('') }}>
              Create account
            </button>
          </div>

          {tab === 'login' ? (
            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.field}>
                <label>Username</label>
                <input
                  type="text"
                  placeholder="your_username"
                  value={loginForm.username}
                  onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                  autoComplete="username"
                />
              </div>
              <div className={styles.field}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Sign in'}
              </button>
              <p className={styles.switchText}>
                Don't have an account?{' '}
                <button type="button" onClick={() => { setTab('signup'); setError('') }}>Create one</button>
              </p>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleSignup}>
              <div className={styles.field}>
                <label>Username</label>
                <input
                  type="text"
                  placeholder="choose_username"
                  value={signupForm.username}
                  onChange={e => setSignupForm(f => ({ ...f, username: e.target.value }))}
                  autoComplete="username"
                />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
              <div className={styles.field}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Create account'}
              </button>
              <p className={styles.switchText}>
                Already have an account?{' '}
                <button type="button" onClick={() => { setTab('login'); setError('') }}>Sign in</button>
              </p>
            </form>
          )}
        </div>

        <p className={styles.disclaimer}>
          Not a substitute for professional medical advice. Always consult your doctor.
        </p>
      </div>

      <Toast toast={toast} />
    </div>
  )
}
