import styles from '../pages/AppLayout.module.css'

export function GraphicsView({ chartData, patientInfo, onBack }) {
    const d = chartData
    if (!d) return null

    const scoreColor = d.health_score >= 70 ? '#2a7a6f' : d.health_score >= 40 ? '#c8893a' : '#c0444a'
    const riskColors = { low: '#2a7a6f', moderate: '#c8893a', high: '#c0444a' }
    const statusColors = { normal: '#2a7a6f', warning: '#c8893a', critical: '#c0444a' }

    // SVG gauge
    const radius = 70, circumference = 2 * Math.PI * radius
    const offset = circumference - (d.health_score / 100) * circumference

    // Donut
    const donutR = 55, donutC = 2 * Math.PI * donutR
    let donutOffset = 0

    return (
        <div className={`${styles.viewInner} animate-fade-in`}>
            <div className={styles.gfxWrap}>
                <div className={styles.gfxHeader}>
                    <button className={styles.backBtn} onClick={onBack}>← Back to Results</button>
                    <h2 className={styles.gfxTitle}>📊 Visual Health Report</h2>
                    <p className={styles.gfxSubtitle}>
                        {patientInfo?.name} · {patientInfo?.age}y · {patientInfo?.gender}
                        {patientInfo?.weight ? ` · ${patientInfo.weight}kg` : ''}
                    </p>
                </div>

                {/* ── Top cards: score + risk ── */}
                <div className={styles.gfxTopRow}>
                    <div className={`${styles.gfxCard} ${styles.gfxScoreCard}`}>
                        <div className={styles.gaugeWrap}>
                            <svg width="160" height="160" viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r={radius} fill="none" stroke="#e8e5df" strokeWidth="10" />
                                <circle
                                    cx="80" cy="80" r={radius} fill="none"
                                    stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
                                    strokeDasharray={circumference} strokeDashoffset={offset}
                                    transform="rotate(-90 80 80)"
                                    className={styles.gaugeAnim}
                                />
                            </svg>
                            <div className={styles.gaugeLabel}>
                                <span className={styles.gaugeNum} style={{ color: scoreColor }}>{d.health_score}</span>
                                <span className={styles.gaugeText}>/ 100</span>
                            </div>
                        </div>
                        <div className={styles.gfxCardTitle}>Health Score</div>
                    </div>

                    <div className={`${styles.gfxCard} ${styles.gfxRiskCard}`}>
                        <div className={styles.riskBadge} style={{ background: riskColors[d.risk_level] || '#c8893a' }}>
                            {d.risk_level?.toUpperCase()}
                        </div>
                        <div className={styles.gfxCardTitle}>Risk Level</div>
                        <p className={styles.gfxPatientSummary}>{d.patient_summary}</p>
                    </div>
                </div>

                {/* ── Category bars ── */}
                <div className={styles.gfxCard} style={{ animationDelay: '0.15s' }}>
                    <div className={styles.gfxCardTitle}>Category Breakdown</div>
                    <div className={styles.barChart}>
                        {(d.categories || []).map((c, i) => (
                            <div key={i} className={styles.barRow}>
                                <span className={styles.barLabel}>{c.name}</span>
                                <div className={styles.barTrack}>
                                    <div
                                        className={styles.barFill}
                                        style={{
                                            width: `${c.score}%`,
                                            background: statusColors[c.status] || '#2a7a6f',
                                            animationDelay: `${0.2 + i * 0.08}s`,
                                        }}
                                    />
                                </div>
                                <span className={styles.barValue}>{c.score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Donut + Metrics ── */}
                <div className={styles.gfxMidRow}>
                    <div className={`${styles.gfxCard} ${styles.gfxDonutCard}`} style={{ animationDelay: '0.25s' }}>
                        <div className={styles.gfxCardTitle}>Risk Breakdown</div>
                        <svg width="140" height="140" viewBox="0 0 140 140" className={styles.donutSvg}>
                            {(d.risk_breakdown || []).map((seg, i) => {
                                const segLen = (seg.value / 100) * donutC
                                const dash = `${segLen} ${donutC - segLen}`
                                const thisOffset = donutOffset
                                donutOffset += segLen
                                return (
                                    <circle
                                        key={i} cx="70" cy="70" r={donutR} fill="none"
                                        stroke={seg.color || '#ccc'} strokeWidth="18"
                                        strokeDasharray={dash} strokeDashoffset={-thisOffset}
                                        transform="rotate(-90 70 70)"
                                        className={styles.donutSegAnim}
                                        style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                                    />
                                )
                            })}
                        </svg>
                        <div className={styles.donutLegend}>
                            {(d.risk_breakdown || []).map((seg, i) => (
                                <div key={i} className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ background: seg.color }} />
                                    <span>{seg.label} ({seg.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${styles.gfxCard} ${styles.gfxMetricsCard}`} style={{ animationDelay: '0.3s' }}>
                        <div className={styles.gfxCardTitle}>Key Metrics</div>
                        <div className={styles.metricsGrid}>
                            {(d.metrics || []).map((m, i) => (
                                <div key={i} className={styles.metricItem} style={{ animationDelay: `${0.35 + i * 0.06}s` }}>
                                    <div className={styles.metricHeader}>
                                        <span className={styles.metricName}>{m.name}</span>
                                        <span className={styles.metricBadge} style={{ background: statusColors[m.status] || '#2a7a6f' }}>
                                            {m.status}
                                        </span>
                                    </div>
                                    <div className={styles.metricValue}>{m.value} <small>{m.unit}</small></div>
                                    <div className={styles.metricRange}>Normal: {m.normal_range}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Recommendations ── */}
                <div className={styles.gfxCard} style={{ animationDelay: '0.4s' }}>
                    <div className={styles.gfxCardTitle}>💡 Recommendations</div>
                    <ul className={styles.recList}>
                        {(d.recommendations || []).map((r, i) => (
                            <li key={i} className={styles.recItem} style={{ animationDelay: `${0.45 + i * 0.06}s` }}>{r}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
