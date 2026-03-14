import { useState } from 'react'
import { api } from '../utils/api'
import styles from '../pages/AppLayout.module.css'

export function HospitalRecommendationsView({ resultData, onBack, showToast }) {
    const [loadingDetailId, setLoadingDetailId] = useState(null)
    const [detailModal, setDetailModal] = useState(null)

    if (!resultData || !resultData.data || !resultData.data.recommendations) return null

    const { id: recommendationId, location, doctor_type, data } = resultData
    const recommendations = data.recommendations

    const handleViewDetail = async (singleId) => {
        setLoadingDetailId(singleId)
        try {
            const fd = new FormData()
            fd.append('recommendation_id', recommendationId)
            fd.append('single_recommendation_id', singleId)

            const result = await api.getHospitalDetail(fd)
            setDetailModal(result)
        } catch (e) {
            console.error(e)
            showToast(e.message || 'Failed to load details', 'error')
        } finally {
            setLoadingDetailId(null)
        }
    }

    return (
        <div className={`${styles.viewInner} animate-fade-in`}>
            <div className={styles.resultsWrap} style={{ paddingBottom: '2rem' }}>
                <div className={styles.resultsTopBar}>
                    <div style={{ flex: 1 }}>
                        <h2 className={styles.pageTitle} style={{ margin: 0, fontSize: '1.5rem' }}>
                            {doctor_type}s in {location}
                        </h2>
                        <p style={{ color: 'var(--text-sec)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Top recommended medical specialists in your area</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                    {recommendations.map(rec => (
                        <div
                            key={rec.id}
                            className={styles.analysisCard}
                            style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
                            onClick={() => handleViewDetail(rec.id)}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0 }}>{rec.hospital_name}</h3>
                                <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>⭐ {rec.hospital_rating}</span>
                            </div>
                            <div style={{ fontWeight: 500, color: 'var(--text-sec)' }}>{rec.doctor_name}</div>
                            <p style={{ margin: '0.5rem 0', color: 'var(--text-sec)' }}>{rec.description}</p>

                            {loadingDetailId === rec.id && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
                                    Loading details...
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {detailModal && (
                <HospitalDetailModal
                    detailData={detailModal}
                    onClose={() => setDetailModal(null)}
                />
            )}
        </div>
    )
}

function HospitalDetailModal({ detailData, onClose }) {
    const { hospital_name, doctor_name, detail } = detailData
    const desc = detail.detailed_description || {}

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '85vh',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Detailed Information</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-sec)' }}>×</button>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{hospital_name}</h2>
                        <h3 style={{ margin: 0, color: 'var(--text)' }}>{doctor_name}</h3>
                    </div>

                    {typeof desc === 'string' ? (
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-sec)' }}>{desc}</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {desc.location && (
                                <div><strong style={{ display: 'block', marginBottom: '0.2rem' }}>📍 Location</strong> <span style={{ color: 'var(--text-sec)', lineHeight: 1.5 }}>{desc.location}</span></div>
                            )}
                            {desc.doctor_background && (
                                <div><strong style={{ display: 'block', marginBottom: '0.2rem' }}>👨‍⚕️ Doctor Background</strong> <span style={{ color: 'var(--text-sec)', lineHeight: 1.5 }}>{desc.doctor_background}</span></div>
                            )}
                            {desc.hospital_facilities && (
                                <div><strong style={{ display: 'block', marginBottom: '0.2rem' }}>🏥 Facilities</strong> <span style={{ color: 'var(--text-sec)', lineHeight: 1.5 }}>{desc.hospital_facilities}</span></div>
                            )}
                            {desc.hospital_reputation && (
                                <div><strong style={{ display: 'block', marginBottom: '0.2rem' }}>⭐ Reputation</strong> <span style={{ color: 'var(--text-sec)', lineHeight: 1.5 }}>{desc.hospital_reputation}</span></div>
                            )}
                            {desc.visit_expectations && (
                                <div><strong style={{ display: 'block', marginBottom: '0.2rem' }}>📅 What to Expect</strong> <span style={{ color: 'var(--text-sec)', lineHeight: 1.5 }}>{desc.visit_expectations}</span></div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg)', flexShrink: 0 }}>
                    <button className={styles.btnPrimary} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}
