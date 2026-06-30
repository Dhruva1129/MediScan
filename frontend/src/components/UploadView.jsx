import { useState, useRef } from 'react'
import { api } from '../utils/api'
import styles from '../pages/AppLayout.module.css'

export function UploadView({ user, onAnalysisComplete, showToast }) {
    const [file, setFile] = useState(null)
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const [uploadSessionId, setUploadSessionId] = useState(null)
    const [pdfText, setPdfText] = useState(null)
    const [stepIdx, setStepIdx] = useState(-1)
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef()

    const STEPS = ['Reading document', 'Generating summary', 'Analyzing risks', 'Planning next steps']

    const isPdf = (f) => f && (f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf')

    const pickFile = (f) => {
        if (!f) return
        setFile(f)
        // Reset upload state when a new file is picked
        setUploaded(false)
        setUploadSessionId(null)
        setPdfText(null)
    }

    const removeFile = () => {
        setFile(null)
        setUploaded(false)
        setUploadSessionId(null)
        setPdfText(null)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f) pickFile(f)
    }

    // Step 1: Upload PDF to extract text statelessly (very fast)
    const handleUpload = async () => {
        if (!file) { showToast('Please select a file first', 'error'); return }
        setUploading(true)
        try {
            const data = await api.uploadReport(file, user.id)
            setUploadSessionId(data.session_id)
            setPdfText(data.pdf_text)
            setUploaded(true)
            showToast('Report uploaded successfully!', 'success')
        } catch (err) {
            showToast('Upload failed: ' + err.message, 'error')
        } finally {
            setUploading(false)
        }
    }

    // Step 2: Analyze the uploaded PDF (sends text back to LLM)
    const handleAnalyzePdf = async () => {
        if (!uploadSessionId || !pdfText) { showToast('Please upload a report first', 'error'); return }
        setLoading(true)
        setStepIdx(0)

        const timer = setInterval(() => {
            setStepIdx(prev => (prev < STEPS.length - 1 ? prev + 1 : prev))
        }, 3000)

        try {
            const data = await api.analyzeReport(pdfText, prompt, user.id, uploadSessionId)
            clearInterval(timer)
            setStepIdx(STEPS.length)
            setFile(null)
            setPrompt('')
            setUploaded(false)
            setUploadSessionId(null)
            setPdfText(null)
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

    // Single-step flow for images (non-PDF)
    const handleAnalyzeImage = async () => {
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
                                    <div className={styles.fileSize}>
                                        {fmtBytes(file.size)}
                                        {uploaded && <span style={{ color: '#2a7a6f', marginLeft: '8px', fontWeight: 600 }}>✓ Uploaded</span>}
                                    </div>
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

                        {isPdf(file) ? (
                            /* Two-step flow for PDFs */
                            !uploaded ? (
                                <button className={styles.analyzeBtn} onClick={handleUpload} disabled={!file || uploading}>
                                    {uploading ? '⏳ Uploading...' : '📤 Upload Report'}
                                </button>
                            ) : (
                                <button className={styles.analyzeBtn} onClick={handleAnalyzePdf}>
                                    🔍 Analyze Report
                                </button>
                            )
                        ) : (
                            /* Single-step flow for images */
                            <button className={styles.analyzeBtn} onClick={handleAnalyzeImage} disabled={!file}>
                                🔍 Analyze Report
                            </button>
                        )}
                    </>
                ) : (
                    <div className={styles.progressCard}>
                        <div className={styles.spinner} />
                        <div className={styles.progressTitle}>Analyzing your report...</div>
                        <div className={styles.progressSub}>This usually takes 10–20 seconds</div>
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

