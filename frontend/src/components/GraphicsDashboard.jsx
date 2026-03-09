import { useState } from 'react'
import { api } from '../utils/api'
import { PatientInfoModal } from './PatientInfoModal'
import styles from '../pages/AppLayout.module.css'

export function GraphicsDashboard({ reports, onSelectReport, onGenerateNew, onBack, summaryId, user, onGraphics }) {
    const [showPatientModal, setShowPatientModal] = useState(false)
    const [generatingGraphics, setGeneratingGraphics] = useState(false)
    const [loadingId, setLoadingId] = useState(null)

    const riskColors = { low: '#2a7a6f', moderate: '#c8893a', high: '#c0444a' }

    const handleCardClick = async (report) => {
        setLoadingId(report.id)
        try {
            const full = await api.getGraphics(report.id)
            onSelectReport(full.chart_data, {
                name: full.patient_name,
                age: full.patient_age,
                weight: full.patient_weight,
                gender: full.patient_gender,
            })
        } catch (e) {
            alert('Failed to load report: ' + e.message)
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className={`${styles.viewInner} animate-fade-in`}>
            <div className={styles.gfxWrap}>
                <div className={styles.gfxHeader}>
                    <button className={styles.backBtn} onClick={onBack}>← Back to Results</button>
                    <h2 className={styles.gfxTitle}>📊 Graphics Reports</h2>
                    <p className={styles.gfxSubtitle}>
                        {reports.length} report{reports.length !== 1 ? 's' : ''} generated
                    </p>
                </div>

                <div className={styles.gfxDashActions}>
                    <button
                        className={styles.newBtn}
                        onClick={() => setShowPatientModal(true)}
                    >
                        ➕ Generate New Report
                    </button>
                </div>

                <div className={styles.gfxDashGrid}>
                    {reports.map(r => (
                        <div
                            key={r.id}
                            className={styles.gfxDashCard}
                            onClick={() => handleCardClick(r)}
                            style={{ opacity: loadingId === r.id ? 0.6 : 1 }}
                        >
                            {loadingId === r.id && <div className={styles.gfxDashLoader}>Loading…</div>}
                            <div className={styles.gfxDashCardHeader}>
                                <span className={styles.gfxDashAvatar}>
                                    {r.patient_gender === 'Male' ? '👨' : r.patient_gender === 'Female' ? '👩' : '🧑'}
                                </span>
                                <div>
                                    <div className={styles.gfxDashName}>{r.patient_name}</div>
                                    <div className={styles.gfxDashMeta}>{r.patient_age}y · {r.patient_gender}{r.patient_weight ? ` · ${r.patient_weight}kg` : ''}</div>
                                </div>
                            </div>
                            <div className={styles.gfxDashScoreRow}>
                                <div className={styles.gfxDashScore}>
                                    <svg width="44" height="44" viewBox="0 0 44 44">
                                        <circle cx="22" cy="22" r="18" fill="none" stroke="#e8e5df" strokeWidth="4" />
                                        <circle
                                            cx="22" cy="22" r="18" fill="none"
                                            stroke={r.health_score >= 70 ? '#2a7a6f' : r.health_score >= 40 ? '#c8893a' : '#c0444a'}
                                            strokeWidth="4" strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 18}
                                            strokeDashoffset={2 * Math.PI * 18 - (r.health_score / 100) * 2 * Math.PI * 18}
                                            transform="rotate(-90 22 22)"
                                        />
                                    </svg>
                                    <span className={styles.gfxDashScoreNum}>{r.health_score}</span>
                                </div>
                                {r.risk_level && (
                                    <span className={styles.gfxDashRisk} style={{ background: riskColors[r.risk_level] || '#c8893a' }}>
                                        {r.risk_level}
                                    </span>
                                )}
                            </div>
                            <div className={styles.gfxDashDate}>
                                {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showPatientModal && (
                <PatientInfoModal
                    onClose={() => setShowPatientModal(false)}
                    loading={generatingGraphics}
                    onSubmit={async (patient) => {
                        setGeneratingGraphics(true)
                        try {
                            const res = await api.generateGraphics(
                                summaryId, user.id, patient.name, patient.age, patient.weight, patient.gender
                            )
                            const updatedReports = await api.getGraphicsBySummary(summaryId, user.id)
                            setShowPatientModal(false)
                            onGraphics(res.chart_data, patient, updatedReports)
                        } catch (e) {
                            alert('Failed to generate graphics: ' + e.message)
                        } finally {
                            setGeneratingGraphics(false)
                        }
                    }}
                />
            )}
        </div>
    )
}
