import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { renderMd } from '../utils/renderMd'
import { TranslateModal } from './TranslateModal'
import { PatientInfoModal } from './PatientInfoModal'
import styles from '../pages/AppLayout.module.css'

export function ResultsView({ summaryId, onBack, onChat, onGraphics, onGraphicsDashboard, user }) {
    const [tab, setTab] = useState('summary')
    const [data, setData] = useState({ summary: null, risk: null, next: null, doctor: null })
    const [loading, setLoading] = useState(true)
    const [showTranslateModal, setShowTranslateModal] = useState(false)
    const [translating, setTranslating] = useState(false)
    const [translated, setTranslated] = useState(null)
    const [translatedLang, setTranslatedLang] = useState('')
    const [showPatientModal, setShowPatientModal] = useState(false)
    const [generatingGraphics, setGeneratingGraphics] = useState(false)
    const [checkingGraphics, setCheckingGraphics] = useState(false)

    const handleViewGraphics = async () => {
        setCheckingGraphics(true)
        console.log("Checking graphics for summaryId:", summaryId, "userId:", user?.id)
        try {
            const reports = await api.getGraphicsBySummary(summaryId, user.id)
            console.log("Reports received:", reports)
            if (reports && reports.length > 0) {
                onGraphicsDashboard(reports)
            } else {
                setShowPatientModal(true)
            }
        } catch (err) {
            alert("Error checking graphics: " + err.message)
            setShowPatientModal(true)
        } finally {
            setCheckingGraphics(false)
        }
    }

    useEffect(() => {
        if (!summaryId) return
        setLoading(true)
        setData({ summary: null, risk: null, next: null, doctor: null })
        setTranslated(null)
        setTranslatedLang('')
        Promise.all([
            api.getSummaryResponse(summaryId),
            api.getRiskResponse(summaryId),
            api.getNextStepResponse(summaryId),
            api.getAskDoctorResponse(summaryId),
        ]).then(([s, r, n, d]) => {
            setData({
                summary: s.summary_response,
                risk: r.risk_response,
                next: n.next_step_response,
                doctor: d.ask_docter_response,
            })
        }).finally(() => setLoading(false))
    }, [summaryId])

    const handleTranslate = async (language) => {
        setTranslating(true)
        try {
            const res = await api.translateSummary(summaryId, user.id, language)
            setTranslated({
                summary: res.summary_response,
                risk: res.risk_response,
                next: res.next_step_response,
                doctor: res.ask_docter_response,
            })
            setTranslatedLang(language)
            setShowTranslateModal(false)
        } catch (e) {
            alert('Translation failed: ' + e.message)
        } finally {
            setTranslating(false)
        }
    }

    const downloadPdf = () => {
        const src = translated || data
        const langNote = translatedLang ? ` (${translatedLang})` : ''
        const { jsPDF } = window.jspdf || {}

        // Dynamically import jsPDF (bundled with html2pdf.js)
        import('jspdf').then(({ jsPDF: JPDF }) => {
            const doc = new JPDF({ unit: 'mm', format: 'a4' })
            const pageW = doc.internal.pageSize.getWidth()
            const pageH = doc.internal.pageSize.getHeight()
            const marginL = 20
            const marginR = 20
            const usableW = pageW - marginL - marginR
            let y = 20

            const checkPage = (needed = 10) => {
                if (y + needed > pageH - 20) { doc.addPage(); y = 20 }
            }

            // ── Header ──
            doc.setFillColor(42, 122, 111)
            doc.rect(marginL, y, usableW, 1, 'F')
            y += 5
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(18)
            doc.setTextColor(42, 122, 111)
            doc.text(`MediScan Analysis${langNote}`, marginL, y)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(130, 130, 130)
            const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            doc.text(`Report ID: ${summaryId}  |  ${dateStr}`, pageW - marginR, y, { align: 'right' })
            y += 4
            doc.setFillColor(42, 122, 111)
            doc.rect(marginL, y, usableW, 0.5, 'F')
            y += 10

            // ── Helper to strip **bold** markers and write text ──
            const writeText = (text) => {
                if (!text) {
                    doc.setFont('helvetica', 'italic')
                    doc.setFontSize(10)
                    doc.setTextColor(153, 153, 153)
                    doc.text('No data available.', marginL, y)
                    y += 6
                    return
                }
                doc.setFontSize(10)
                doc.setTextColor(12, 15, 26)
                // Strip bold markers for PDF (jsPDF can't do inline bold/normal mix easily)
                const clean = text.replace(/\*\*(.+?)\*\*/g, '$1')
                const lines = doc.splitTextToSize(clean, usableW)
                for (const line of lines) {
                    checkPage(5)
                    doc.setFont('helvetica', 'normal')
                    doc.text(line, marginL, y)
                    y += 5
                }
                y += 3
            }

            // ── Sections ──
            const sections = [
                { title: '1. Summary', content: src.summary },
                { title: '2. Risk Analysis', content: src.risk },
                { title: '3. Next Steps', content: src.next },
                { title: '4. Questions to Ask Your Doctor', content: src.doctor },
            ]

            for (const sec of sections) {
                checkPage(15)
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                doc.setTextColor(42, 122, 111)
                doc.text(sec.title, marginL, y)
                y += 2
                doc.setDrawColor(232, 229, 223)
                doc.line(marginL, y, pageW - marginR, y)
                y += 6
                writeText(sec.content)
                y += 4
            }

            // ── Footer ──
            checkPage(15)
            y = pageH - 15
            doc.setDrawColor(232, 229, 223)
            doc.line(marginL, y, pageW - marginR, y)
            y += 4
            doc.setFont('helvetica', 'italic')
            doc.setFontSize(8)
            doc.setTextColor(170, 170, 170)
            doc.text('This report is generated by MediScan AI and is for informational purposes only.', marginL, y)
            y += 3.5
            doc.text('It is not a substitute for professional medical advice, diagnosis, or treatment.', marginL, y)

            doc.save(`MediScan_Report_${summaryId}${langNote.replace(/[() ]/g, '_')}.pdf`)
        })
    }

    const TABS = [
        { id: 'summary', label: 'Summary' },
        { id: 'risk', label: 'Risk Analysis' },
        { id: 'next', label: 'Next Steps' },
        { id: 'doctor', label: 'Ask Doctor' },
    ]

    const display = translated || data

    return (
        <div className={`${styles.viewInner} animate-fade-in`}>
            <div className={styles.resultsWrap}>
                <div className={styles.resultsTopBar}>
                    <button className={styles.backBtn} onClick={onBack}>← New analysis</button>
                    <div className={styles.resultTabs}>
                        {TABS.map(t => (
                            <button key={t.id} className={`${styles.resultTab} ${tab === t.id ? styles.resultTabActive : ''}`}
                                onClick={() => setTab(t.id)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button className={styles.chatBtn} onClick={onChat}>💬 Chat about this</button>
                </div>

                {translated && (
                    <div className={styles.translateBanner}>
                        🌐 Showing translation in <strong>{translatedLang}</strong>
                    </div>
                )}

                <div className={styles.resultContent}>
                    {loading ? (
                        <div className={styles.loadingContent}>
                            {[60, 90, 70, 85, 60].map((w, i) => (
                                <div key={i} className="skeleton" style={{ height: 10, width: `${w}%`, marginBottom: 10 }} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.resultText}>
                            {renderMd(display[tab]) || 'No data available.'}
                        </div>
                    )}
                </div>

                {/* Floating translate controls — bottom right */}
                <div className={styles.translateFab}>
                    {translated && (
                        <button className={styles.resetTranslateBtn} onClick={() => { setTranslated(null); setTranslatedLang('') }}>
                            ↩ Original
                        </button>
                    )}
                    <button className={styles.translateBtn} onClick={() => setShowTranslateModal(true)} disabled={loading}>
                        🌐 {translated ? translatedLang : 'Translate'}
                    </button>
                    <button className={styles.translateBtn} onClick={downloadPdf} disabled={loading}>
                        ⬇ Download PDF
                    </button>
                    <button className={styles.translateBtn} onClick={handleViewGraphics} disabled={loading || checkingGraphics}>
                        {checkingGraphics ? '⏳' : '📊'} View in Graphics
                    </button>
                </div>
            </div>

            {showTranslateModal && (
                <TranslateModal
                    onClose={() => setShowTranslateModal(false)}
                    onTranslate={handleTranslate}
                    loading={translating}
                />
            )}

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
