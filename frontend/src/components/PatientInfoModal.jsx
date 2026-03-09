import { useState, useEffect, useRef } from 'react'
import styles from '../pages/AppLayout.module.css'

export function PatientInfoModal({ onClose, onSubmit, loading }) {
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [weight, setWeight] = useState('')
    const [gender, setGender] = useState('')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const canSubmit = name.trim() && age && gender && !loading

    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
    ]

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>📊 Patient Details</span>
                    <button className={styles.modalClose} onClick={onClose}>✕</button>
                </div>
                <p className={styles.modalDesc}>Enter patient information to generate personalised visual charts from the report.</p>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Name *</label>
                        <input className={styles.formInput} value={name} onChange={e => setName(e.target.value)} placeholder="Patient name" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Age *</label>
                        <input className={styles.formInput} type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Years" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Weight (kg)</label>
                        <input className={styles.formInput} type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="kg" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Gender *</label>
                        <div className={styles.customSelectContainer} ref={dropdownRef}>
                            <div
                                className={`${styles.formSelect} ${styles.customSelectValue} ${dropdownOpen ? styles.dropdownOpen : ''}`}
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                {gender || <span className={styles.placeholder}>Select</span>}
                            </div>
                            {dropdownOpen && (
                                <div className={styles.customSelectDropdown}>
                                    {genderOptions.map(opt => (
                                        <div
                                            key={opt.value}
                                            className={`${styles.customSelectOption} ${gender === opt.value ? styles.selected : ''}`}
                                            onClick={() => {
                                                setGender(opt.value)
                                                setDropdownOpen(false)
                                            }}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.modalActions}>
                    <button className={styles.modalCancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className={styles.modalTranslateBtn}
                        disabled={!canSubmit}
                        onClick={() => onSubmit({ name: name.trim(), age: +age, weight: +weight || 0, gender })}
                    >
                        {loading && <span className={styles.btnSpinner} />}
                        {loading ? 'Generating…' : '📊 Generate Charts'}
                    </button>
                </div>
            </div>
        </div>
    )
}
