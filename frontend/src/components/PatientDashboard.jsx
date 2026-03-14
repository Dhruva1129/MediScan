import styles from '../pages/AppLayout.module.css'

export function PatientDashboard({ setView, patientHistory = [], onSelectHistory, user }) {
    return (
        <div className={`${styles.viewInner} animate-fade-in`}>
            <div className={styles.welcomeBanner}>
                <div className={styles.welcomeOrb} />
                <div className={styles.welcomeContent}>
                    <div className={styles.welcomeTitle}>Hello <em>{user?.username}</em>👋</div>
                    <h1 className={styles.welcomeTitle}>Patient & Hospital Services</h1>
                    <p className={styles.welcomeDesc}>Analyze patient conditions or find top recommended hospitals and doctors in your area. All your past analyses are saved and accessible.</p>
                    <button className={styles.btnPrimary} onClick={() => setView('patient-form')}>
                        + Analyze new patient
                    </button>
                </div>
            </div>

            <div className={styles.quickGrid}>
                {[
                    { icon: '🩺', label: 'Analyze Condition', sub: 'Clinical medical analysis', onClick: () => setView('patient-form') },
                    { icon: '📍', label: 'Find Hospitals', sub: 'Best doctors by area', onClick: () => setView('hospital-form') },
                    { icon: '📁', label: `${patientHistory?.length || 0} Analyses`, sub: 'Total patients analyzed', onClick: null },
                ].map((c, i) => (
                    <div key={i} className={styles.quickCard} onClick={c.onClick || undefined} style={{ cursor: c.onClick ? 'pointer' : 'default' }}>
                        <div className={styles.quickIcon}>{c.icon}</div>
                        <div className={styles.quickLabel}>{c.label}</div>
                        <div className={styles.quickSub}>{c.sub}</div>
                    </div>
                ))}
            </div>

            <div className={styles.recentTitle}>Recent Analyses</div>
            {patientHistory?.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🩺</div>
                    <div className={styles.emptyLabel}>No patient records yet</div>
                    <div className={styles.emptyDesc}>Analyze your first patient to see history here.</div>
                </div>
            ) : (
                <div className={styles.recentGrid}>
                    {patientHistory?.slice(0, 6).map(h => (
                        <div key={h.id} className={styles.recentCard} onClick={() => onSelectHistory(h)}>
                            <div className={styles.recentIcon}>📋</div>
                            <div>
                                <div className={styles.recentCardTitle}>{h.patient_info?.name || 'Unknown Patient'} • {h.patient_info?.age}yo</div>
                                <div className={styles.recentCardDate}>{h.created_at}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
