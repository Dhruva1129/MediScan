import styles from './Toast.module.css'

export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`${styles.toast} ${styles[toast.type]} ${styles.show}`} key={toast.id}>
      {toast.type === 'success' && <span className={styles.icon}>✓</span>}
      {toast.type === 'error' && <span className={styles.icon}>✕</span>}
      {toast.message}
    </div>
  )
}
