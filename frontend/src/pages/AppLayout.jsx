import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import styles from './AppLayout.module.css'

// Extracted hook
import { useSessionState } from '../hooks/useSessionState'

// Extracted Components
import { Sidebar } from '../components/Sidebar'
import { Dashboard } from '../components/Dashboard'
import { UploadView } from '../components/UploadView'
import { ResultsView } from '../components/ResultsView'
import { ChatView } from '../components/ChatView'
import { GraphicsView } from '../components/GraphicsView'
import { GraphicsDashboard } from '../components/GraphicsDashboard'

// ── AppLayout (root) ─────────────────────────────────────────────────
export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast, showToast } = useToast()

  const [view, setView] = useSessionState('app_view', 'dashboard')
  const [viewHistory, setViewHistory] = useSessionState('app_viewHistory', [])
  const [summaries, setSummaries] = useState([])
  const [currentId, setCurrentId] = useSessionState('app_currentId', null)
  const [chatSummaryId, setChatSummaryId] = useSessionState('app_chatSummaryId', null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [graphicsData, setGraphicsData] = useSessionState('app_graphicsData', null)
  const [graphicsPatient, setGraphicsPatient] = useSessionState('app_graphicsPatient', null)
  const [graphicsDashReports, setGraphicsDashReports] = useSessionState('app_graphicsDashReports', [])

  const goTo = (v) => {
    setViewHistory(h => [...h, view])
    setView(v)
  }

  const goBack = () => {
    setViewHistory(h => {
      const prev = [...h]
      const dest = prev.pop() || 'dashboard'
      setView(dest)
      return prev
    })
  }

  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    loadSummaries()
  }, [user])

  const loadSummaries = async () => {
    try {
      const data = await api.getUserSummaries(user.id)
      setSummaries(data)
    } catch (e) { console.error(e) }
  }

  const handleSelectSummary = (id) => {
    setCurrentId(id)
    goTo('results')
  }

  const handleDeleteSummary = async (id) => {
    if (!window.confirm('Delete this report?')) return
    try {
      await api.deleteSummary(id)
      setSummaries(s => s.filter(x => x.id !== id))
      if (currentId === id) setCurrentId(null)
      showToast('Report deleted', 'success')
    } catch { showToast('Failed to delete', 'error') }
  }

  const handleAnalysisComplete = useCallback(async (data) => {
    setCurrentId(data.summary_id)
    await loadSummaries()
    goTo('results')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const PAGE_TITLES = {
    dashboard: 'Dashboard',
    upload: 'Analyze Report',
    results: 'Analysis Results',
    chat: 'Chat',
    graphics: 'Visual Report',
    'graphics-dashboard': 'Graphics History',
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        view={view}
        setView={setView}
        summaries={summaries}
        currentId={currentId}
        onSelectSummary={handleSelectSummary}
        onDeleteSummary={handleDeleteSummary}
        user={user}
        onLogout={handleLogout}
        onNewAnalysis={() => setView('upload')}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={styles.mainArea}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
              <span /><span /><span />
            </button>
            <div className={styles.pageTitle}>{PAGE_TITLES[view]}</div>
          </div>
          <div className={styles.topbarRight}>
            {viewHistory.length > 0 && (
              <button className={styles.backBtn} onClick={goBack}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
            )}
            <button className={styles.newBtn} onClick={() => goTo('upload')}>
              + New Analysis
            </button>
          </div>
        </header>

        {/* Views */}
        <div className={styles.contentArea}>
          {view === 'dashboard' && (
            <Dashboard
              summaries={summaries}
              user={user}
              setView={goTo}
              onSelectSummary={handleSelectSummary}
            />
          )}
          {view === 'upload' && (
            <UploadView
              user={user}
              onAnalysisComplete={handleAnalysisComplete}
              showToast={showToast}
            />
          )}
          {view === 'results' && currentId && (
            <ResultsView
              summaryId={currentId}
              onBack={() => goTo('upload')}
              onChat={() => { setChatSummaryId(currentId); goTo('chat') }}
              onGraphics={(chartData, patientInfo, updatedReports) => {
                setGraphicsData(chartData)
                setGraphicsPatient(patientInfo)
                if (updatedReports) setGraphicsDashReports(updatedReports)
                goTo('graphics')
              }}
              onGraphicsDashboard={(reports) => {
                setGraphicsDashReports(reports)
                goTo('graphics-dashboard')
              }}
              user={user}
            />
          )}
          {view === 'results' && !currentId && (
            <div className={styles.viewInner}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <div className={styles.emptyLabel}>No report selected</div>
                <div className={styles.emptyDesc}>Select a report from the sidebar or analyze a new one.</div>
              </div>
            </div>
          )}
          {view === 'chat' && (
            <ChatView
              user={user}
              summaries={summaries}
              initialSummaryId={chatSummaryId}
            />
          )}
          {view === 'graphics' && graphicsData && (
            <GraphicsView
              chartData={graphicsData}
              patientInfo={graphicsPatient}
              onBack={() => goTo('results')}
            />
          )}
          {view === 'graphics-dashboard' && (
            <GraphicsDashboard
              reports={graphicsDashReports}
              onSelectReport={(chartData, patientInfo) => {
                setGraphicsData(chartData)
                setGraphicsPatient(patientInfo)
                goTo('graphics')
              }}
              onGenerateNew={() => { }}
              onBack={() => goTo('results')}
              summaryId={currentId}
              user={user}
              onGraphics={(chartData, patientInfo, updatedReports) => {
                setGraphicsData(chartData)
                setGraphicsPatient(patientInfo)
                if (updatedReports) setGraphicsDashReports(updatedReports)
                goTo('graphics')
              }}
            />
          )}
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  )
}
