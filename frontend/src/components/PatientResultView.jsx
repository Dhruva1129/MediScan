import styles from '../pages/AppLayout.module.css'

export function PatientResultView({ resultData, onBack, onFindHospitals }) {
    if (!resultData) return null

    const { patient_info, analysis } = resultData

    return (
        <div className={`${styles.viewInner} animate-fade-in`}>
            <div className={styles.resultsWrap} style={{ paddingBottom: '2rem' }}>
                <div className={styles.resultsTopBar}>
                    <button className={styles.backBtn} onClick={onBack}>← Dashboard</button>
                    <div style={{ flex: 1 }}>
                        <h2 className={styles.pageTitle} style={{ margin: 0, fontSize: '1.6rem' }}>Clinical Analysis</h2>
                        <p style={{ color: 'var(--text-sec)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Generated assessment based on reported symptoms</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={styles.analysisCard} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                👤
                            </div>
                            <div>
                                <h3 className={styles.clinicalCardSubtitle}>{patient_info.name}</h3>
                                <div className={styles.clinicalMeta}>
                                    {patient_info.age}y {patient_info.gender} • {patient_info.location}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className={styles.clinicalLabel}>Primary Symptoms</div>
                            <div className={styles.clinicalSymptoms}>{patient_info.symptoms}</div>
                            <div className={styles.clinicalMeta} style={{ marginTop: '0.5rem' }}>Duration: {patient_info.duration}</div>
                        </div>
                    </div>

                    <div className={styles.analysisCard} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                            <h3 className={styles.clinicalCardTitle}>Assessment Results</h3>
                            <div className={styles.clinicalHighlight}>
                                <span>Recommended:</span> {analysis.recommended_doctor_type}
                            </div>
                        </div>

                        <div className={styles.clinicalTextData}>
                            {analysis.description}
                        </div>
                    </div>

                    <div className={styles.analysisCard} style={{ backgroundColor: 'var(--bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--ink)' }}>Ready to see a specialist?</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-sec)' }}>Find top-rated {analysis.recommended_doctor_type}s near {patient_info.location}.</p>
                        </div>
                        <button className={styles.btnPrimary} onClick={() => onFindHospitals(patient_info.location, analysis.recommended_doctor_type)}>
                            Find Hospitals →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
