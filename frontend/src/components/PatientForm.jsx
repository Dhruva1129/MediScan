import { useState } from 'react'
import { api } from '../utils/api'
import appStyles from '../pages/AppLayout.module.css'
import styles from './PatientForm.module.css'

export function PatientForm({ user, onComplete, onBack, showToast }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        state: '',
        city: '',
        suffering_problems: '',
        how_many_days: ''
    })

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.age || !formData.suffering_problems) {
            showToast('Please fill in required fields', 'error')
            return
        }

        setLoading(true)
        try {
            const fd = new FormData()
            Object.entries(formData).forEach(([k, v]) => fd.append(k, v))
            fd.append('user_id', user.id)

            const result = await api.analyzePatientCondition(fd)
            onComplete(result)
            showToast('Analysis complete', 'success')
        } catch (e) {
            console.error(e)
            showToast(e.message || 'Failed to analyze', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`${appStyles.viewInner} animate-fade-in`}>
            {loading && (
                <div className={appStyles.loadingOverlay}>
                    <div className={appStyles.spinner} />
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>Analyzing patient condition...</div>
                </div>
            )}

            <div className={`${styles.container} ${styles.animateIn}`}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>🩺</div>
                    <div className={styles.headerText}>
                        <h2 className={styles.title}>Patient Condition Analysis</h2>
                        <p className={styles.subtitle}>Enter the patient's symptoms and general details to receive a clinical analysis and a personalized specialist recommendation.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Patient Name</label>
                            <input className={styles.input} type="text" name="name" placeholder="E.g. John Doe" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Age</label>
                            <input className={styles.input} type="number" name="age" placeholder="E.g. 45" value={formData.age} onChange={handleChange} required min="0" max="150" />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Gender</label>
                            <select className={`${styles.input} ${styles.select}`} name="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Duration of Symptoms</label>
                            <input className={styles.input} type="text" name="how_many_days" placeholder="E.g. 5 days or 2 weeks" value={formData.how_many_days} onChange={handleChange} required />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>City</label>
                            <input className={styles.input} type="text" name="city" placeholder="E.g. New York" value={formData.city} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>State / Province</label>
                            <input className={styles.input} type="text" name="state" placeholder="E.g. NY" value={formData.state} onChange={handleChange} required />
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Detailed Symptoms</label>
                            <textarea
                                className={`${styles.input} ${styles.textarea}`}
                                name="suffering_problems"
                                placeholder="Describe all current symptoms, pain levels, and any relevant medical history..."
                                value={formData.suffering_problems}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Analyzing...' : 'Generate Clinical Analysis'}
                        {!loading && <span style={{ fontSize: '1.2rem' }}>→</span>}
                    </button>
                </form>
            </div>
        </div>
    )
}
