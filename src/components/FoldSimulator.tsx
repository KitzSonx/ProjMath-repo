'use client'

import styles from './FoldSimulator.module.css'

interface Props {
  vOpen: number
  theta: number
  onThetaChange: (theta: number) => void
  sinT: number
  vTheta: number
  vrr: number
}

const TABLE_ROWS = [
  { theta: 90, sin: '1.000', v: '4,386.02', vrr: '0%' },
  { theta: 75, sin: '0.966', v: '3,952.78', vrr: '9.9%' },
  { theta: 60, sin: '0.866', v: '2,848.81', vrr: '35.0%' },
  { theta: 45, sin: '0.707', v: '1,550.69', vrr: '64.6%' },
  { theta: 30, sin: '0.500', v: '548.25',   vrr: '87.5%' },
]

export default function FoldSimulator({ vOpen, theta, onThetaChange, sinT, vTheta, vrr }: Props) {
  const gaugeDeg = vrr * 3.6  // 0–100% → 0–360deg

  return (
    <section id="calc-fold">
      <h2><span className="icon">🔄</span>จำลองการพับ–กาง</h2>
      <p>เลื่อนแถบเพื่อเปลี่ยนมุมกาง θ แล้วดูปริมาตรและอัตราการลดที่เปลี่ยนไป</p>

      <div className={styles.sliderGroup}>
        <label className={styles.sliderLabel}>
          มุมกาง θ <span>{theta}°</span>
        </label>
        <input
          type="range"
          min={5}
          max={90}
          value={theta}
          onChange={(e) => onThetaChange(parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.gaugeContainer}>
        <div
          className={styles.gauge}
          style={{ background: `conic-gradient(var(--maroon) ${gaugeDeg}deg, var(--cream-dark) ${gaugeDeg}deg)` }}
        >
          <div className={styles.gaugeInner}>
            <span className={styles.gaugePct}>{vrr.toFixed(0)}%</span>
            <span className={styles.gaugeLbl}>ลดปริมาตร</span>
          </div>
        </div>

        <div className={styles.gaugeInfo}>
          <p>🏮 V_open = <strong>{vOpen.toLocaleString('en', { maximumFractionDigits: 2 })}</strong> ลบ.ซม.³</p>
          <p>📐 V(θ)  = <strong>{vTheta.toLocaleString('en', { maximumFractionDigits: 2 })}</strong> ลบ.ซม.³</p>
          <p>📉 VRR  = <strong>{vrr.toFixed(1)}%</strong></p>
          <p>📏 sin θ = <strong>{sinT.toFixed(3)}</strong></p>
        </div>
      </div>

      <table className="data-table" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>θ (องศา)</th>
            <th>sin θ</th>
            <th>V(θ) ลบ.ซม.³</th>
            <th>VRR</th>
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row) => (
            <tr key={row.theta}>
              <td>{row.theta}</td>
              <td>{row.sin}</td>
              <td>{row.v}</td>
              <td>{row.vrr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}