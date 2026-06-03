'use client'

import dynamic from 'next/dynamic'
import styles from './FoldSimulator.module.css'
import type { PatternInputs } from '@/types/lantern'

// โหลด 3D Viewer แบบ Dynamic เพื่อป้องกันปัญหา Window is not defined บน SSR
const LanternViewer3D = dynamic(() => import('./LanternViewer3D'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: 380, borderRadius: 12,
      background: '#1a0a05', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: '#c8943e', fontSize: 14, marginTop: 16,
    }}>
      🏮 กำลังโหลด 3D...
    </div>
  ),
})

interface Props {
  vOpen: number
  theta: number
  onThetaChange: (theta: number) => void
  sinT: number
  vTheta: number
  vrr: number
  patternInputs: PatternInputs
}

// TABLE_ROWS จะถูกคำนวณแบบ Dynamic ด้านในคอมโพเนนต์ตามค่า vOpen เพื่อความถูกต้องเมื่อปริมาตรเปลี่ยนไป

export default function FoldSimulator({ vOpen, theta, onThetaChange, sinT, vTheta, vrr, patternInputs }: Props) {
  const gaugeDeg = vrr * 3.6

  const angles = [90, 75, 60, 45, 30, 15, 0]
  const dynamicRows = angles.map((ang) => {
    const rad = ang * (Math.PI / 180)
    const sinVal = Math.sin(rad)
    const vVal = vOpen * Math.pow(sinVal, 3)
    const vrrVal = (1 - Math.pow(sinVal, 3)) * 100
    return {
      theta: ang,
      sin: sinVal.toFixed(3),
      v: vVal.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      vrr: `${vrrVal.toFixed(1)}%`
    }
  })

  return (
    <section id="calc-fold">
      <h2><span className="icon">🔄</span>จำลองการพับ–กาง</h2>
      <p>เลื่อนแถบเพื่อเปลี่ยนมุมกาง θ แล้วดูโคม 3D และปริมาตรที่เปลี่ยนไปแบบ real-time</p>

      <div className={styles.sliderGroup}>
        <label className={styles.sliderLabel}>
          มุมกาง θ <span>{theta}°</span>
        </label>
        <input
          type="range"
          min={0}
          max={90}
          step={1}
          value={theta}
          onChange={(e) => onThetaChange(parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>

      {/* 👈 จ่ายค่า Props ทั้งหมดที่ได้จากแผงควบคุมเข้าไปให้ LanternViewer3D */}
      <LanternViewer3D
        theta={theta}
        n={patternInputs.n}
        a={patternInputs.a}
        b={patternInputs.b}
        hb={patternInputs.hb}
        hm={patternInputs.hm}
        ht={patternInputs.ht}
        hspike={patternInputs.hspike}
        ltail={patternInputs.ltail}
      />

      <div className={styles.gaugeContainer} style={{ marginTop: 20 }}>
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
          {dynamicRows.map((row) => (
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