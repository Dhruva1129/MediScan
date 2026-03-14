import styles from '../pages/AppLayout.module.css'
import { Icon } from './Icon'
import { renderMd } from '../utils/renderMd'

export function Sidebar({ view, setView, summaries, currentId, onSelectSummary, onDeleteSummary, patientHistory = [], onSelectHistory, onDeletePatientHistory, currentPatientId, user, onLogout, onNewAnalysis, open, onClose }) {
    const isPatientView = view.startsWith('patient-') || view.startsWith('hospital-')

    return (
        <>
            {open && <div className={styles.overlay} onClick={onClose} />}
            <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <a href="/" className={styles.logo}>
                        <div className={styles.logoMark}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 12h6m-3-3v6M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
                            </svg>
                        </div>
                        <span className={styles.logoText}>Medi<em>Scan</em></span>
                    </a>
                    <div className={styles.userBadge}>
                        <div className={styles.userAvatar}>{user?.username?.slice(0, 2).toUpperCase() || '?'}</div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>{user?.username}</div>
                            <div className={styles.userEmail}>{user?.email}</div>
                        </div>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navLabel}>Menu</div>
                    {[
                        { id: 'main-dashboard', label: 'Hub Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                        { id: 'dashboard', label: 'Report Analyzer', icon: 'M9 12h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
                        { id: 'patient-dashboard', label: 'Patient Services', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
                    ].map(n => (
                        <button
                            key={n.id}
                            className={`${styles.navItem} ${view === n.id ? styles.navActive : ''}`}
                            onClick={() => { setView(n.id); onClose() }}
                        >
                            <Icon d={n.icon} size={15} />
                            {n.label}
                        </button>
                    ))}

                    <div className={styles.navLabel} style={{ marginTop: '1.5rem' }}>Services</div>
                    {[
                        { id: 'patient-form', label: 'Analyze Patient Condition', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                        { id: 'hospital-form', label: 'Find Hospitals', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                        { id: 'upload', label: 'Analyze Report', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
                        { id: 'chat', label: 'Chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
                    ].map(n => (
                        <button
                            key={n.id}
                            className={`${styles.navItem} ${view === n.id ? styles.navActive : ''}`}
                            onClick={() => { setView(n.id); onClose() }}
                        >
                            <Icon d={n.icon} size={15} />
                            {n.label}
                        </button>
                    ))}

                    {view !== 'main-dashboard' && (
                        isPatientView ? (
                            <>
                                <div className={styles.navLabel} style={{ marginTop: '1.5rem' }}>Recent Analyses</div>
                                <div className={styles.historyList}>
                                    {patientHistory.length === 0 && (
                                        <div className={styles.historyEmpty}>No patient records yet</div>
                                    )}
                                    {patientHistory.slice(0, 10).map(h => (
                                        <div
                                            key={h.id}
                                            className={`${styles.historyItem} ${h.id === currentPatientId ? styles.historyActive : ''}`}
                                            onClick={() => { onSelectHistory(h); onClose() }}
                                        >
                                            <div className={styles.histDot} style={{ background: 'var(--teal)' }} />
                                            <div className={styles.histContent}>
                                                <div className={styles.histTitle}>{h.patient_info?.name || 'Unknown Patient'} • {h.patient_info?.age}yo</div>
                                                <div className={styles.histDate}>{h.created_at}</div>
                                            </div>
                                            <button
                                                className={styles.histDelete}
                                                onClick={e => { e.stopPropagation(); onDeletePatientHistory(h.id) }}
                                                title="Delete"
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.navLabel} style={{ marginTop: '1.5rem' }}>Recent Reports</div>
                                <div className={styles.historyList}>
                                    {summaries.length === 0 && (
                                        <div className={styles.historyEmpty}>No reports yet</div>
                                    )}
                                    {[...summaries].reverse().map(s => (
                                        <div
                                            key={s.id}
                                            className={`${styles.historyItem} ${s.id === currentId ? styles.historyActive : ''}`}
                                            onClick={() => { onSelectSummary(s.id); onClose() }}
                                        >
                                            <div className={styles.histDot} />
                                            <div className={styles.histContent}>
                                                <div className={styles.histTitle}>{renderMd(s.title) || `Report #${s.id}`}</div>
                                                <div className={styles.histDate}>{s.created_at}</div>
                                            </div>
                                            <button
                                                className={styles.histDelete}
                                                onClick={e => { e.stopPropagation(); onDeleteSummary(s.id) }}
                                                title="Delete"
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )
                    )}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button className={styles.logoutBtn} onClick={onLogout}>
                        <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" size={14} />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    )
}
