import styles from '../pages/AppLayout.module.css'

export function MainDashboard({ user, setView }) {
    return (
        <div className={`${styles.viewInner} animate-fade-in`} style={{ paddingBottom: '3rem' }}>
            <div className={styles.welcomeBanner} style={{ padding: '3rem 2.5rem', marginBottom: '2.5rem', background: 'linear-gradient(135deg, var(--ink) 0%, #1e2330 100%)', position: 'relative', overflow: 'hidden' }}>
                <div className={styles.welcomeOrb} style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(42, 122, 111, 0.25) 0%, transparent 70%)', right: '-100px', top: '-150px' }} />
                <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', left: '-50px', bottom: '-100px', pointerEvents: 'none' }} />

                <div className={styles.welcomeContent}>
                    <div className={styles.welcomeGreet} style={{ fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--teal-light)' }}>MediScan Central Hub</div>
                    <h1 className={styles.welcomeTitle} style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Welcome back, <em>{user?.username}</em> ☀️</h1>
                    <p className={styles.welcomeDesc} style={{ fontSize: '1rem', maxWidth: '550px', color: 'rgba(255,255,255,0.7)' }}>Your unified medical dashboard. Access intelligent report analysis, track patient histories, and discover top-rated medical specialists powered by advanced AI.</p>
                </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Primary Services</h2>

                <div className={styles.quickGrid2}>
                    {[
                        { icon: '📄', label: 'Report Analyzer', sub: 'Upload & understand medical reports instantly.', onClick: () => setView('dashboard') },
                        { icon: '🏥', label: 'Patient & Hospital Services', sub: 'Diagnose patients and find top doctors.', onClick: () => setView('patient-dashboard') }
                    ].map((c, i) => (
                        <div
                            key={i}
                            className={styles.quickCard}
                            onClick={c.onClick}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.quickIcon}>{c.icon}</div>
                            <div className={styles.quickLabel}>{c.label}</div>
                            <div className={styles.quickSub}>{c.sub}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Informational Section */}
            <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Platform Capabilities</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem', background: 'var(--bg)', padding: '0.8rem', borderRadius: '12px' }}>🔒</div>
                        <div>
                            <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--ink)', fontSize: '1rem' }}>Privacy First</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>All medical data and reports are securely processed and strictly confidential.</p>
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem', background: 'var(--bg)', padding: '0.8rem', borderRadius: '12px' }}>⚡</div>
                        <div>
                            <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--ink)', fontSize: '1rem' }}>Lightning Fast AI</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>Powered by cutting-edge Gemini models to deliver instant, reliable clinical insights.</p>
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem', background: 'var(--bg)', padding: '0.8rem', borderRadius: '12px' }}>📊</div>
                        <div>
                            <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--ink)', fontSize: '1rem' }}>Visual Analytics</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>Automatically generated demographic and biomarker charts for profound report clarity.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
