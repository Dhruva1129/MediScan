import { useState, useRef } from 'react'
import { api } from '../utils/api'
import styles from '../pages/AppLayout.module.css'

export function UploadView({ user, onAnalysisComplete, showToast }) {
    const [file, setFile] = useState(null)
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [stepIdx, setStepIdx] = useState(-1)
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef()

    const STEPS = ['Reading document', 'Generating summary', 'Analyzing risks', 'Planning next steps']

    const pickFile = (f) => {
        if (!f) return
        setFile(f)
    }

    const removeFile = () => setFile(null)

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f) pickFile(f)
    }

    const handleAnalyze = async () => {
        if (!file) { showToast('Please select a file first', 'error'); return }
        setLoading(true)
        setStepIdx(0)

        const timer = setInterval(() => {
            setStepIdx(prev => (prev < STEPS.length - 1 ? prev + 1 : prev))
        }, 7000)

        try {
            const data = await api.analyzeImage(file, prompt, user.id)
            clearInterval(timer)
            setStepIdx(STEPS.length)
            setFile(null)
            setPrompt('')
            showToast('Analysis complete!', 'success')
            onAnalysisComplete(data)
        } catch (err) {
            clearInterval(timer)
            showToast('Analysis failed: ' + err.message, 'error')
        } finally {
            setLoading(false)
            setStepIdx(-1)
        }
    }

    const fmtBytes = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'

    return (
        <div className={`${styles.viewInner} animate-fade-in`}>
            <div className={styles.uploadWrap}>
                <h2 className={styles.viewHeading}>Analyze a Report</h2>
                <p className={styles.viewSub}>Upload a medical document and our AI will extract, summarize, and analyze it.</p>

                {!loading ? (
                    <>
                        {!file ? (
                            <div
                                className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''}`}
                                onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input type="file" ref={fileInputRef} accept="image/*,.pdf" style={{ display: 'none' }}
                                    onChange={e => e.target.files[0] && pickFile(e.target.files[0])} />
                                <div className={styles.dropIcon}>⬆️</div>
                                <div className={styles.dropTitle}>Drop your medical report here</div>
                                <div className={styles.dropSub}>or click to browse — PDF, JPG, PNG, TIFF supported</div>
                            </div>
                        ) : (
                            <div className={styles.filePreview}>
                                <div className={styles.filePreviewIcon}>📄</div>
                                <div className={styles.filePreviewInfo}>
                                    <div className={styles.fileName}>{file.name}</div>
                                    <div className={styles.fileSize}>{fmtBytes(file.size)}</div>
                                </div>
                                <button className={styles.removeFile} onClick={removeFile}>✕</button>
                            </div>
                        )}

                        <textarea
                            className={styles.promptArea}
                            rows={3}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Optional: Add context (e.g. 'I'm 45 years old, what should I watch for?')"
                        />

                        <button className={styles.analyzeBtn} onClick={handleAnalyze} disabled={!file}>
                            🔍 Analyze Report
                        </button>
                    </>
                ) : (
                    <div className={styles.progressCard}>
                        <div className={styles.spinner} />
                        <div className={styles.progressTitle}>Analyzing your report...</div>
                        <div className={styles.progressSub}>This usually takes 20–40 seconds</div>
                        <div className={styles.stepsList}>
                            {STEPS.map((s, i) => (
                                <div key={i} className={`${styles.stepRow} ${i < stepIdx ? styles.stepDone : ''} ${i === stepIdx ? styles.stepLoading : ''}`}>
                                    <div className={styles.stepBadge}>
                                        {i < stepIdx ? '✓' : i + 1}
                                    </div>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
