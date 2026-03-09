import { useState, useEffect, useRef } from 'react'
import styles from '../pages/AppLayout.module.css'

export const LANGUAGES = [
    'Hindi', 'Spanish', 'French', 'Arabic', 'Bengali', 'Portuguese',
    'Russian', 'Urdu', 'German', 'Japanese', 'Korean', 'Tamil',
    'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi',
    'Turkish', 'Italian', 'Dutch', 'Polish', 'Vietnamese', 'Thai',
]

export function TranslateModal({ onClose, onTranslate, loading }) {
    const [lang, setLang] = useState('')
    const [dropOpen, setDropOpen] = useState(false)
    const dropRef = useRef()

    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className={styles.modalBackdrop} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={styles.modalCard}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>🌐 Translate Report</div>
                    <button className={styles.modalClose} onClick={onClose}>✕</button>
                </div>
                <p className={styles.modalDesc}>
                    Select a language to translate all sections of this report.
                </p>
                <div className={styles.customDropWrap} ref={dropRef} style={{ marginBottom: '1.25rem' }}>
                    <button
                        className={`${styles.customDropTrigger} ${dropOpen ? styles.customDropOpen : ''}`}
                        onClick={() => setDropOpen(o => !o)}
                        type="button"
                    >
                        <span className={styles.customDropValue}>{lang || '— select a language —'}</span>
                        <svg className={`${styles.customDropChevron} ${dropOpen ? styles.chevronUp : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                    {dropOpen && (
                        <div className={styles.customDropMenu}>
                            {LANGUAGES.map(l => (
                                <div
                                    key={l}
                                    className={`${styles.customDropItem} ${lang === l ? styles.customDropItemActive : ''}`}
                                    onClick={() => { setLang(l); setDropOpen(false) }}
                                >
                                    {l}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.modalActions}>
                    <button className={styles.modalCancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className={styles.modalTranslateBtn}
                        onClick={() => lang && onTranslate(lang)}
                        disabled={!lang || loading}
                    >
                        {loading ? <><span className={styles.btnSpinner} /> Translating…</> : '🌐 Translate'}
                    </button>
                </div>
            </div>
        </div>
    )
}
