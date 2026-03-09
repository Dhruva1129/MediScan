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

        // Dynamically import html2pdf.js
        import('html2pdf.js').then((html2pdfModule) => {
            const html2pdf = html2pdfModule.default || html2pdfModule

            // Create an invisible container for the PDF content
            const container = document.createElement('div')
            container.style.padding = '40px'
            container.style.fontFamily = 'system-ui, -apple-system, sans-serif'
            container.style.color = '#0c0f1a'

            const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

            // Render MD helper
            const renderHtml = (text) => {
                if (!text) return '<p style="color: #999; font-style: italic;">No data available.</p>'
                return text.split('\n').map(line => {
                    const parts = line.split(/\*\*(.+?)\*\*/g)
                    const htmlLine = parts.map((part, pi) =>
                        pi % 2 === 1 ? `<strong>${part}</strong>` : part
                    ).join('')
                    return `<div style="margin-bottom: 8px; line-height: 1.5;">${htmlLine}</div>`
                }).join('')
            }

            container.innerHTML = `
                <div style="border-bottom: 2px solid #2a7a6f; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <h1 style="color: #2a7a6f; margin: 0; font-size: 24px;">MediScan Analysis${langNote}</h1>
                    <div style="color: #828282; font-size: 12px; text-align: right;">
                        Report ID: ${summaryId}<br/>
                        ${dateStr}
                    </div>
                </div>
            `

            const sections = [
                { title: '1. Summary', content: src.summary },
                { title: '2. Risk Analysis', content: src.risk },
                { title: '3. Next Steps', content: src.next },
                { title: '4. Questions to Ask Your Doctor', content: src.doctor },
            ]

            sections.forEach(sec => {
                const secDiv = document.createElement('div')
                secDiv.style.marginBottom = '20px'
                secDiv.style.pageBreakInside = 'avoid'
                secDiv.innerHTML = `
                    <h2 style="color: #2a7a6f; font-size: 18px; border-bottom: 1px solid #e8e5df; padding-bottom: 5px; margin-bottom: 10px;">${sec.title}</h2>
                    <div style="font-size: 14px;">${renderHtml(sec.content)}</div>
                `
                container.appendChild(secDiv)
            })

            // Footer
            const footer = document.createElement('div')
            footer.style.marginTop = '40px'
            footer.style.paddingTop = '10px'
            footer.style.borderTop = '1px solid #e8e5df'
            footer.style.color = '#aaa'
            footer.style.fontSize = '12px'
            footer.style.fontStyle = 'italic'
            footer.innerHTML = 'This report is generated by MediScan AI and is for informational purposes only.<br/>It is not a substitute for professional medical advice, diagnosis, or treatment.'
            container.appendChild(footer)

            const opt = {
                margin: 10,
                filename: `MediScan_Report_${summaryId}${langNote.replace(/[() ]/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }

            html2pdf().set(opt).from(container).save()
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
