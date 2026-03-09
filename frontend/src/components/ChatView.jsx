import { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api'
import { renderMd } from '../utils/renderMd'
import styles from '../pages/AppLayout.module.css'

export function ChatView({ user, summaries, initialSummaryId }) {
    const [selectedId, setSelectedId] = useState(initialSummaryId || '')
    const [sessionId, setSessionId] = useState(() => crypto.randomUUID())
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! Select a report above and ask me anything about it — I\'ll use the full context of your analysis to answer clearly.' }
    ])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [dropOpen, setDropOpen] = useState(false)
    const msgsEnd = useRef()
    const dropRef = useRef()

    const loadHistory = async (id) => {
        if (!id) {
            setMessages([{ role: 'ai', text: 'Hello! Select a report above and ask me anything about it.' }])
            return
        }

        try {
            const followups = await api.getFollowups(id)
            if (followups.length > 0) {
                // Pick the latest session_id
                const latestSessionId = followups[followups.length - 1].session_id
                if (latestSessionId) {
                    setSessionId(latestSessionId)
                    const sessionMessages = followups.filter(f => f.session_id === latestSessionId)
                    const msgs = [{ role: 'ai', text: 'Welcome back! We are continuing your previous conversation.' }]
                    for (let f of sessionMessages) {
                        const time = f.created_at ? new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                        msgs.push({ role: 'user', text: f.user_text, time })
                        msgs.push({ role: 'ai', text: f.followup_response, time })
                    }
                    setMessages(msgs)
                    return
                }
            }
        } catch (e) { console.error('Failed to load history', e) }

        // Fallback if no history
        setSessionId(crypto.randomUUID())
        setMessages([{ role: 'ai', text: 'Report selected! Ask me anything about this analysis.' }])
    }

    useEffect(() => {
        if (initialSummaryId) {
            setSelectedId(String(initialSummaryId))
            loadHistory(String(initialSummaryId))
        }
    }, [initialSummaryId])

    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        msgsEnd.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSelect = (id) => {
        setSelectedId(id)
        loadHistory(id)
    }

    const startNewChat = () => {
        if (!selectedId) return
        setSessionId(crypto.randomUUID())
        setMessages([{ role: 'ai', text: 'Started a new discussion! Ask me anything about this report.' }])
    }

    const send = async () => {
        const text = input.trim()
        if (!text || !selectedId || sending) return
        setInput('')
        setSending(true)

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setMessages(m => [...m, { role: 'user', text, time }])

        try {
            const res = await api.followup(selectedId, text, user.id, sessionId)
            setMessages(m => [...m, { role: 'ai', text: res.groq_response, time }])
        } catch {
            setMessages(m => [...m, { role: 'ai', text: 'Sorry, something went wrong. Please try again.', error: true }])
        } finally {
            setSending(false)
        }
    }

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    }

    const initials = user?.username?.slice(0, 2).toUpperCase() || '?'

    return (
        <div className={styles.chatOuter}>
            <div className={styles.chatSelectBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <span className={styles.chatSelectLabel}>📋 Report:</span>
                    <div className={styles.customDropWrap} ref={dropRef}>
                        <button
                            className={`${styles.customDropTrigger} ${dropOpen ? styles.customDropOpen : ''}`}
                            onClick={() => setDropOpen(o => !o)}
                            type="button"
                        >
                            <span className={styles.customDropValue}>
                                {selectedId
                                    ? renderMd(summaries.find(s => String(s.id) === String(selectedId))?.title || `Report #${selectedId}`)
                                    : '— select a report —'}
                            </span>
                            <svg className={`${styles.customDropChevron} ${dropOpen ? styles.chevronUp : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                        {dropOpen && (
                            <div className={styles.customDropMenu}>
                                <div
                                    className={`${styles.customDropItem} ${!selectedId ? styles.customDropItemActive : ''}`}
                                    onClick={() => { handleSelect(''); setDropOpen(false) }}
                                >
                                    — select a report —
                                </div>
                                {[...summaries].reverse().map(s => (
                                    <div
                                        key={s.id}
                                        className={`${styles.customDropItem} ${String(selectedId) === String(s.id) ? styles.customDropItemActive : ''}`}
                                        onClick={() => { handleSelect(String(s.id)); setDropOpen(false) }}
                                    >
                                        {renderMd((s.title || `Report #${s.id}`).slice(0, 60))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {selectedId && (
                    <button className={styles.newChatBtn} onClick={startNewChat} title="Start a new chat session for this report">
                        ➕ New Chat
                    </button>
                )}
            </div>

            <div className={styles.chatMessages}>
                {messages.map((m, i) => (
                    <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.msgUser : styles.msgAi} animate-fade-in`}>
                        <div className={`${styles.msgAvatar} ${m.role === 'user' ? styles.avatarUser : styles.avatarAi}`}>
                            {m.role === 'user' ? initials : 'M'}
                        </div>
                        <div className={styles.msgBody}>
                            <div className={`${styles.msgBubble} ${m.error ? styles.msgError : ''}`}>
                                {renderMd(m.text)}
                            </div>
                            {m.time && <div className={styles.msgTime}>{m.time}</div>}
                        </div>
                    </div>
                ))}
                {sending && (
                    <div className={`${styles.message} ${styles.msgAi}`}>
                        <div className={`${styles.msgAvatar} ${styles.avatarAi}`}>M</div>
                        <div className={styles.typingIndicator}>
                            {[0, 150, 300].map((d, i) => (
                                <div key={i} className={styles.typingDot} style={{ animationDelay: `${d}ms` }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={msgsEnd} />
            </div>

            <div className={styles.chatInputArea}>
                <textarea
                    className={styles.chatInput}
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask anything about your report…"
                    disabled={sending}
                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
                />
                <button className={styles.sendBtn} onClick={send} disabled={sending || !input.trim() || !selectedId}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22,2 15,22 11,13 2,9" />
                    </svg>
                </button>
            </div>
        </div >
    )
}
