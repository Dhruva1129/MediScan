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
          <li><a href="#modules">Modules</a></li>
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
            Your complete<br />
            medical AI<br />
            <em>companion</em>
          </h1>
          <p className={styles.heroDesc}>
            Analyze reports, assess patient conditions, find top hospitals, and get visual health insights — all powered by cutting-edge AI in one unified platform.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.btnPrimary} onClick={() => goAuth('signup')}>
              Start for free
            </button>
            <a href="#modules" className={styles.btnGhost}>See all modules</a>
          </div>
          <div className={styles.heroMeta}>
            <span>✓ No credit card</span>
            <span>✓ Instant results</span>
            <span>✓ Secure &amp; private</span>
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

          <div className={`${styles.floatCard} ${styles.cardHospital}`}>
            <div className={styles.cardTopRow}>
              <div className={styles.cardIconWrap} style={{ background: 'rgba(59, 91, 219, 0.1)' }}>
                <span style={{ fontSize: '0.85rem' }}>🏥</span>
              </div>
              <div>
                <div className={styles.cardName}>Apollo Hospital</div>
                <div className={styles.cardSub}>Dr. Sharma · Cardiologist</div>
              </div>
              <div className={styles.analyzedBadge} style={{ background: 'rgba(59,91,219,0.1)', color: '#3b5bdb' }}>⭐ 4.9</div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className={styles.tagGreen}>Top Rated</span>
              <span style={{ background: 'rgba(59,91,219,0.08)', color: '#3b5bdb', border: '1px solid rgba(59,91,219,0.2)', fontSize: '0.67rem', padding: '0.18rem 0.5rem', borderRadius: '100px', fontWeight: 500 }}>New Delhi</span>
            </div>
          </div>

          <div className={`${styles.floatCard} ${styles.cardChart}`}>
            <div className={styles.cardTopRow}>
              <div className={styles.cardIconWrap} style={{ background: 'rgba(200,137,58,0.1)' }}>
                <span style={{ fontSize: '0.85rem' }}>📊</span>
              </div>
              <div>
                <div className={styles.cardName}>Health Score</div>
                <div className={styles.cardSub}>Visual Analytics</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#e8e5df" strokeWidth="4" />
                <circle cx="22" cy="22" r="18" fill="none" stroke="#2a7a6f" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 - 0.78 * 2 * Math.PI * 18}`}
                  transform="rotate(-90 22 22)" />
              </svg>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>78</div>
                <div className={styles.cardSub}>Good health</div>
              </div>
              <span className={styles.tagGreen} style={{ marginLeft: 'auto' }}>Low Risk</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className={styles.statsBar}>
        {[
          { n: '3', l: 'Integrated modules' },
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

      {/* ── Modules ── */}
      <section className={styles.modules} id="modules">
        <div className={styles.sectionTag}>Platform Modules</div>
        <h2 className={styles.sectionTitle}>Three powerful tools,<br /><em>one unified platform</em></h2>
        <div className={styles.modulesGrid}>
          {/* Module 1: Report Analyzer */}
          <div className={`${styles.moduleCard} ${styles.moduleCardTeal}`}>
            <div className={styles.moduleIconRow}>
              <div className={styles.moduleIconBig}>📄</div>
              <span className={styles.moduleBadge} style={{ background: 'rgba(42,122,111,0.12)', color: 'var(--teal)' }}>Report Analyzer</span>
            </div>
            <h3 className={styles.moduleTitle}>AI Medical Report Analysis</h3>
            <p className={styles.moduleDesc}>Upload any medical document — lab results, imaging, prescriptions — and receive a structured breakdown with risk flags and actionable next steps.</p>
            <ul className={styles.moduleList}>
              <li>📋 Plain-language summary of findings</li>
              <li>⚠️ Risk identification &amp; severity levels</li>
              <li>✅ Personalized next-step recommendations</li>
              <li>💬 Intelligent follow-up chat with full context</li>
              <li>🌍 Multi-language translation support</li>
            </ul>
            <button className={styles.moduleBtn} onClick={() => goAuth('signup')}>Try Report Analyzer →</button>
          </div>

          {/* Module 2: Patient & Hospital Services */}
          <div className={`${styles.moduleCard} ${styles.moduleCardBlue}`}>
            <div className={styles.moduleIconRow}>
              <div className={styles.moduleIconBig}>🏥</div>
              <span className={styles.moduleBadge} style={{ background: 'rgba(59,91,219,0.1)', color: '#3b5bdb' }}>Patient Services</span>
            </div>
            <h3 className={styles.moduleTitle}>Patient &amp; Hospital Services</h3>
            <p className={styles.moduleDesc}>Conduct AI-powered clinical patient assessments and discover the highest-rated hospitals and specialist doctors in any location.</p>
            <ul className={styles.moduleList}>
              <li>🩺 AI-driven patient condition analysis</li>
              <li>📍 Location-based hospital recommendations</li>
              <li>👨‍⚕️ Specialist doctor discovery &amp; ratings</li>
              <li>📁 Full patient history &amp; record keeping</li>
              <li>🏥 Detailed hospital profiles &amp; facilities</li>
            </ul>
            <button className={styles.moduleBtn} style={{ background: '#3b5bdb' }} onClick={() => goAuth('signup')}>Explore Patient Tools →</button>
          </div>

          {/* Module 3: Graphics Reports */}
          <div className={`${styles.moduleCard} ${styles.moduleCardAmber}`}>
            <div className={styles.moduleIconRow}>
              <div className={styles.moduleIconBig}>📊</div>
              <span className={styles.moduleBadge} style={{ background: 'rgba(200,137,58,0.1)', color: 'var(--amber)' }}>Visual Analytics</span>
            </div>
            <h3 className={styles.moduleTitle}>Graphics &amp; Health Reports</h3>
            <p className={styles.moduleDesc}>Transform raw medical data into beautiful, interactive visual charts. Get a holistic health score and demographic biomarker analysis at a glance.</p>
            <ul className={styles.moduleList}>
              <li>📈 Auto-generated biomarker charts</li>
              <li>💯 Composite health score (0–100)</li>
              <li>🔴 Risk level classification (Low / Moderate / High)</li>
              <li>👤 Patient demographic analytics</li>
              <li>📅 Historical trend comparisons</li>
            </ul>
            <button className={styles.moduleBtn} style={{ background: 'var(--amber)' }} onClick={() => goAuth('signup')}>View Sample Report →</button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features} id="features">
        <div className={styles.sectionTag}>Capabilities</div>
        <h2 className={styles.sectionTitle}>Everything you need to<br /><em>understand your health</em></h2>
        <div className={styles.featuresGrid}>
          {[
            { icon: '📄', title: 'Smart Document Parsing', desc: 'Upload images, PDFs, or scanned reports. AI extracts and understands medical data regardless of format.' },
            { icon: '🩺', title: 'Patient Condition Analysis', desc: 'Enter patient details and symptoms for a comprehensive AI-driven clinical assessment and care plan.' },
            { icon: '📍', title: 'Hospital & Doctor Finder', desc: 'Find top-rated specialists and hospitals near you, filtered by doctor type and location.' },
            { icon: '📊', title: 'Visual Health Analytics', desc: 'Auto-generated charts and a 0–100 health score provide instant visual clarity on patient data.' },
            { icon: '💬', title: 'Follow-up Chat', desc: 'Ask anything about your report in natural language. The AI remembers full context of your documents.' },
            { icon: '🌍', title: 'Multi-language Translation', desc: 'Translate your medical analysis into any language for patients and caregivers worldwide.' },
            { icon: '⚠️', title: 'Risk Analysis', desc: 'Identify potential health risks and abnormal values with clear explanations of what they mean for you.' },
            { icon: '📁', title: 'Report & Patient History', desc: 'All analyses are stored securely. Track health changes over time and access past records anytime.' },
            { icon: '🔒', title: 'Privacy First', desc: 'All medical data is processed securely and kept strictly confidential. Your health data is yours alone.' },
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
        <h2 className={styles.sectionTitle} style={{ color: 'white' }}>From question to<br /><em>clarity</em> in seconds</h2>
        <div className={styles.stepsGrid}>
          {[
            { n: '1', title: 'Create Account', desc: 'Sign up in seconds. No credit card required to get started.' },
            { n: '2', title: 'Choose Your Module', desc: 'Pick Report Analysis, Patient Services, or Visual Analytics based on your need.' },
            { n: '3', title: 'Enter Your Data', desc: 'Upload a document, enter patient details, or search for hospitals in your area.' },
            { n: '4', title: 'Get AI Insights', desc: 'Receive instant, comprehensive results with actionable recommendations and follow-up chat.' },
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
        <h2 className={styles.sectionTitle}>Trusted by patients &amp;<br /><em>caregivers</em></h2>
        <div className={styles.testimonialsGrid}>
          {[
            { q: '"I received my blood results and had no idea what half of it meant. MediScan gave me a plain-English breakdown in under a minute."', name: 'Sarah R.', role: 'Patient, 34', color: '#2a7a6f' },
            { q: '"The hospital finder helped me find a top cardiologist near my city within seconds. The detailed doctor profiles were incredibly helpful."', name: 'Rajesh K.', role: 'Caregiver', color: '#3b5bdb' },
            { q: '"The health score and visual charts made it so easy to explain my father\'s condition to the rest of our family. Truly life-changing."', name: 'Jamie L.', role: 'Patient, 52', color: '#c8893a' },
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
        <h2 className={styles.sectionTitle}>Ready to take control of<br /><em>your health?</em></h2>
        <p className={styles.ctaDesc}>Join thousands of patients and caregivers who use MediScan to understand, track, and act on their medical information.</p>
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
            <p className={styles.footerDesc}>AI-powered medical intelligence platform. Report analysis, patient services &amp; visual health analytics.</p>
          </div>
          <div>
            <div className={styles.footerColTitle}>Modules</div>
            <div className={styles.footerLinks}>
              <a href="#modules">Report Analyzer</a>
              <a href="#modules">Patient Services</a>
              <a href="#modules">Graphics Reports</a>
            </div>
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
