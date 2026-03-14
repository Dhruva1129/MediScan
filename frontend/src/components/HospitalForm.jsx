import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import appStyles from '../pages/AppLayout.module.css'
import styles from './HospitalForm.module.css'

export function HospitalForm({ user, initialData, onComplete, onBack, showToast }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        location: initialData?.location || '',
        doctor_type: initialData?.doctor_type || ''
    })

    useEffect(() => {
        if (initialData?.location || initialData?.doctor_type) {
            setFormData({
                location: initialData.location || '',
                doctor_type: initialData.doctor_type || ''
            })
        }
    }, [initialData])

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.location || !formData.doctor_type) {
            showToast('Please fill all fields', 'error')
            return
        }

        setLoading(true)
        try {
            const fd = new FormData()
            fd.append('location', formData.location)
            fd.append('doctor_type', formData.doctor_type)
            fd.append('user_id', user.id)

            const result = await api.getHospitalRecommendations(fd)
            onComplete(result)
            showToast('Found recommendations', 'success')
        } catch (e) {
            console.error(e)
            showToast(e.message || 'Failed to find hospitals', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`${appStyles.viewInner} animate-fade-in`}>
            {loading && (
                <div className={appStyles.loadingOverlay}>
                    <div className={appStyles.spinner} />
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>Searching for hospitals...</div>
                </div>
            )}

            <div className={`${styles.container} ${styles.animateIn}`}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>🏥</div>
                    <div className={styles.headerText}>
                        <h2 className={styles.title}>Find Hospitals & Specialists</h2>
                        <p className={styles.subtitle}>Enter a location and the type of doctor you are looking for.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Location</label>
                            <input
                                className={styles.input}
                                type="text"
                                name="location"
                                placeholder="E.g. New York, or ZIP code"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Specialist Type</label>
                            <input
                                className={styles.input}
                                type="text"
                                name="doctor_type"
                                placeholder="E.g. Cardiologist"
                                value={formData.doctor_type}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                        {!loading && <span style={{ fontSize: '1.2rem' }}>→</span>}
                    </button>
                </form>
            </div>
        </div>
    )
}
