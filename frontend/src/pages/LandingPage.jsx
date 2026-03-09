import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const goAuth = (tab = 'signup') => navigate(`/auth?tab=${tab}`)

  return (
    <div className={styles.page}>
      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.logoMark}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6m-3-3v6M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
            </svg>
          </div>
          <span className={styles.logoText}>Medi<em>Scan</em></span>
        </div>
        <ul className={styles.navLinks}>
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#testimonials">Reviews</a></li>
        </ul>
        <div className={styles.navCta}>
          {user ? (
            <>
              <button className={styles.btnGhost} onClick={() => { logout(); navigate('/') }}>Sign out</button>
              <button className={styles.btnPrimary} onClick={() => navigate('/app')}>Open app →</button>
            </>
          ) : (
            <>
              <button className={styles.btnGhost} onClick={() => goAuth('login')}>Sign in</button>
              <button className={styles.btnPrimary} onClick={() => goAuth('signup')}>Get started</button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.heroLabel}>
            <span className={styles.labelDot} />
            AI-Powered Medical Intelligence
          </div>
          <h1 className={styles.heroTitle}>
            Understand your<br />
            medical reports<br />
            <em>instantly</em>
          </h1>
          <p className={styles.heroDesc}>
            Upload any medical document — lab results, imaging reports, prescriptions — and get a clear, structured analysis with risk assessment and follow-up chat.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.btnPrimary} onClick={() => goAuth('signup')}>
              Start for free
            </button>
            <a href="#how" className={styles.btnGhost}>See how it works</a>
          </div>
          <div className={styles.heroMeta}>
            <span>✓ No credit card</span>
            <span>✓ Instant results</span>
            <span>✓ Secure & private</span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={`${styles.floatCard} ${styles.cardMain}`}>
            <div className={styles.cardTopRow}>
              <div className={styles.cardIconWrap}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2a7a6f" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>
              </div>
              <div>
                <div className={styles.cardName}>Blood Panel Report</div>
                <div className={styles.cardSub}>CBC + Metabolic</div>
              </div>
              <div className={styles.analyzedBadge}>✓ Analyzed</div>
            </div>
            <div className={styles.bars}>
              {[100, 80, 60, 100, 75].map((w, i) => (
                <div key={i} className={styles.bar} style={{ width: `${w}%`, background: i % 2 === 0 ? 'rgba(42,122,111,0.2)' : 'var(--cream)' }} />
              ))}
            </div>
            <div className={styles.tags}>
              <span className={styles.tagGreen}>Normal CBC</span>
              <span className={styles.tagAmber}>Vit D low</span>
              <span className={styles.tagRose}>LDL ↑</span>
            </div>
          </div>

          <div className={`${styles.floatCard} ${styles.cardChat}`}>
            <div className={styles.chatHeader}>
              <div className={styles.chatAvatar}>M</div>
              <div>
                <div className={styles.cardName}>AI Assistant</div>
                <div className={styles.onlineTag}>● Online</div>
              </div>
            </div>
            <div className={styles.chatBubbles}>
              <div className={styles.bubbleUser}>What does high LDL mean?</div>
              <div className={styles.bubbleAi}>Your LDL of 145 mg/dL is slightly above ideal. This indicates elevated cardiovascular risk and...</div>
              <div className={styles.typingRow}>
                <div className={styles.dot} />
                <div className={styles.dot} style={{ animationDelay: '0.15s' }} />
                <div className={styles.dot} style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className={styles.statsBar}>
        {[
          { n: '4', l: 'Analysis dimensions' },
          { n: '<30s', l: 'Average analysis time' },
          { n: '∞', l: 'Follow-up questions' },
          { n: '100%', l: 'Data privacy' },
        ].map((s, i) => (
          <div key={i} className={styles.stat}>
            <span className={styles.statNum}>{s.n}</span>
            <span className={styles.statLabel}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section className={styles.features} id="features">
        <div className={styles.sectionTag}>Capabilities</div>
        <h2 className={styles.sectionTitle}>Everything you need to<br /><em>understand your health</em></h2>
        <div className={styles.featuresGrid}>
          {[
            { icon: '📄', title: 'Smart Document Parsing', desc: 'Upload images, PDFs, or scanned reports. AI extracts and understands medical data regardless of format.' },
            { icon: '📋', title: 'Structured Summary', desc: 'Get a plain-language breakdown of your medical findings, organized by category and significance.' },
            { icon: '⚠️', title: 'Risk Analysis', desc: 'Identify potential health risks and abnormal values with clear explanations of what they mean for you.' },
            { icon: '✅', title: 'Next Steps Guide', desc: 'Receive personalized recommendations for follow-up actions and when to seek professional care.' },
            { icon: '💬', title: 'Follow-up Chat', desc: 'Ask anything about your report in natural language. The AI remembers full context of your documents.' },
            { icon: '📁', title: 'Report History', desc: 'All analyses are stored securely. Track health changes over time and access past analyses anytime.' },
          ].map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureEmoji}>{f.icon}</div>
              <div className={styles.featureTitle}>{f.title}</div>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className={styles.howSection} id="how">
        <div className={styles.sectionTag} style={{ color: 'rgba(255,255,255,0.3)' }}>Process</div>
        <h2 className={styles.sectionTitle} style={{ color: 'white' }}>From document to<br /><em>clarity</em> in seconds</h2>
        <div className={styles.stepsGrid}>
          {[
            { n: '1', title: 'Upload Document', desc: 'Drop any medical image, PDF, or scan from your device.' },
            { n: '2', title: 'AI Analysis', desc: 'Our Llama 4 vision model reads and understands every detail.' },
            { n: '3', title: 'Get Insights', desc: 'Receive summary, risks, and next steps in plain language.' },
            { n: '4', title: 'Ask Anything', desc: 'Continue with intelligent follow-up questions in chat.' },
          ].map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{s.n}</div>
              <div className={styles.stepTitle}>{s.title}</div>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={styles.testimonials} id="testimonials">
        <div className={styles.sectionTag}>Reviews</div>
        <h2 className={styles.sectionTitle}>Trusted by patients &<br /><em>caregivers</em></h2>
        <div className={styles.testimonialsGrid}>
          {[
            { q: '"I received my blood results and had no idea what half of it meant. MediScan gave me a plain-English breakdown in under a minute."', name: 'Sarah R.', role: 'Patient, 34', color: '#2a7a6f' },
            { q: '"My mother\'s MRI was filled with jargon. The follow-up chat let me ask specific questions and got clear, helpful answers."', name: 'Michael K.', role: 'Caregiver', color: '#c8893a' },
            { q: '"The risk section flagged something my doctor hadn\'t emphasized. This tool could genuinely be life-saving."', name: 'Jamie L.', role: 'Patient, 52', color: '#3b5bdb' },
          ].map((t, i) => (
            <div key={i} className={styles.testCard}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.quote}>{t.q}</p>
              <div className={styles.author}>
                <div className={styles.avatar} style={{ background: t.color }}>{t.name.slice(0, 2)}</div>
                <div>
                  <div className={styles.authorName}>{t.name}</div>
                  <div className={styles.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <h2 className={styles.sectionTitle}>Ready to understand<br /><em>your health?</em></h2>
        <p className={styles.ctaDesc}>Join thousands of patients who've taken control of their medical information.</p>
        <button className={styles.btnPrimary} onClick={() => goAuth('signup')} style={{ padding: '0.9rem 2.5rem', fontSize: '1rem' }}>
          Start for free — no credit card
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.navLogo} style={{ marginBottom: '0.75rem' }}>
              <div className={styles.logoMark}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 12h6m-3-3v6M3 12a9 9 0 1018 0 9 9 0 00-18 0z" /></svg>
              </div>
              <span className={styles.logoText}>Medi<em>Scan</em></span>
            </div>
            <p className={styles.footerDesc}>AI-powered medical report analysis. Understand your health documents clearly.</p>
          </div>
          <div>
            <div className={styles.footerColTitle}>Product</div>
            <div className={styles.footerLinks}>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
            </div>
          </div>
          <div>
            <div className={styles.footerColTitle}>Account</div>
            <div className={styles.footerLinks}>
              <a href="#" onClick={(e) => { e.preventDefault(); goAuth('signup') }}>Sign up</a>
              <a href="#" onClick={(e) => { e.preventDefault(); goAuth('login') }}>Sign in</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 MediScan. All rights reserved.</span>
          <span>Not a substitute for professional medical advice.</span>
        </div>
      </footer>
    </div>
  )
}
