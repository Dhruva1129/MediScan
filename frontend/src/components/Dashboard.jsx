import styles from '../pages/AppLayout.module.css'
import { renderMd } from '../utils/renderMd'

export function Dashboard({ summaries, user, setView, onSelectSummary }) {
    return (
        <div className={`${styles.viewInner} animate-fade-in`}>
            <div className={styles.welcomeBanner}>
                <div className={styles.welcomeOrb} />
                <div className={styles.welcomeContent}>
                    <div className={styles.welcomeGreet}>Good day 👋</div>
                    <h1 className={styles.welcomeTitle}>Hello, <em>{user?.username}</em></h1>
                    <p className={styles.welcomeDesc}>Upload a medical report to get an instant AI-powered analysis. All your past analyses are saved and accessible.</p>
                    <button className={styles.btnPrimary} onClick={() => setView('upload')}>
                        + Analyze new report
                    </button>
                </div>
            </div>

            <div className={styles.quickGrid}>
                {[
                    { icon: '⬆️', label: 'Upload Report', sub: 'Analyze a new document', onClick: () => setView('upload') },
                    { icon: '💬', label: 'Chat', sub: 'Ask follow-up questions', onClick: () => setView('chat') },
                    { icon: '📁', label: `${summaries.length} Reports`, sub: 'Total analyses done', onClick: null },
                ].map((c, i) => (
                    <div key={i} className={styles.quickCard} onClick={c.onClick || undefined} style={{ cursor: c.onClick ? 'pointer' : 'default' }}>
                        <div className={styles.quickIcon}>{c.icon}</div>
                        <div className={styles.quickLabel}>{c.label}</div>
                        <div className={styles.quickSub}>{c.sub}</div>
                    </div>
                ))}
            </div>

            <div className={styles.recentTitle}>Recent Analyses</div>
            {summaries.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📄</div>
                    <div className={styles.emptyLabel}>No reports yet</div>
                    <div className={styles.emptyDesc}>Upload your first medical report to get started</div>
                </div>
            ) : (
                <div className={styles.recentGrid}>
                    {[...summaries].reverse().slice(0, 6).map(s => (
                        <div key={s.id} className={styles.recentCard} onClick={() => onSelectSummary(s.id)}>
                            <div className={styles.recentIcon}>📋</div>
                            <div>
                                <div className={styles.recentCardTitle}>{renderMd(s.title) || `Report #${s.id}`}</div>
                                <div className={styles.recentCardDate}>{s.created_at}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
