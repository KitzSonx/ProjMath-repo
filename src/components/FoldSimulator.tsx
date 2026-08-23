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
  sinT?: number
  cotT?: number
  vTheta: number
  vrr: number
  patternInputs: PatternInputs
}

// TABLE_ROWS จะถูกคำนวณแบบ Dynamic ด้านในคอมโพเนนต์ตามค่า vOpen เพื่อความถูกต้องเมื่อปริมาตรเปลี่ยนไป

export default function FoldSimulator({ vOpen, theta, onThetaChange, sinT, cotT, vTheta, vrr, patternInputs }: Props) {
  const currentCot = cotT ?? (theta === 0 ? 0 : 1 / Math.tan(theta * (Math.PI / 180)))
  const displayVOpen = 2957.75
  const gaugeDeg = theta === 0 ? 0 : Math.max(0, Math.min(100, vrr)) * 3.6

  const vMid = 1734.01
  const vTopBot = 1223.74

  // 🌟 เอามุมที่ไม่จำเป็น (75 และ 15) ออกไปตามที่แจ้ง เหลือเพียง 90, 60, 45, 30, 0
  const angles = [90, 60, 45, 30, 0]
  const dynamicRows = angles.map((ang) => {
    if (ang === 0) {
      return {
        theta: 0,
        cot: 'หาค่าไม่ได้',
        v: 'หาค่าไม่ได้',
        vrr: 'หาค่าไม่ได้'
      }
    }
    const rad = ang * (Math.PI / 180)
    const cotVal = 1 / Math.tan(rad)
    const vVal = vMid + vTopBot * cotVal
    const rawVrr = (1 - vVal / displayVOpen) * 100
    const vrrVal = Math.abs(rawVrr) < 0.0001 ? 0 : rawVrr

    return {
      theta: ang,
      cot: cotVal.toFixed(3),
      v: vVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      vrr: `${vrrVal.toFixed(1)}%`
    }
  })

  const formattedVRR = Math.abs(vrr) < 0.0001 ? '0.0%' : `${vrr.toFixed(1)}%`
  const formattedGaugePct = Math.abs(vrr) < 0.0001 ? '0%' : `${vrr.toFixed(0)}%`

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
            <span className={styles.gaugePct}>{theta === 0 ? 'N/A' : formattedGaugePct}</span>
            <span className={styles.gaugeLbl}>ลดปริมาตร</span>
          </div>
        </div>

        <div className={styles.gaugeInfo}>
          <p>🏮 V_open = <strong>{displayVOpen.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> ลบ.ซม.³</p>
          <p>📐 V(θ)  = <strong>{theta === 0 ? 'หาค่าไม่ได้' : vTheta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> ลบ.ซม.³</p>
          <p>📉 VRR  = <strong>{theta === 0 ? 'หาค่าไม่ได้' : formattedVRR}</strong></p>
          <p>📏 cot θ = <strong>{theta === 0 ? 'หาค่าไม่ได้' : currentCot.toFixed(3)}</strong></p>
        </div>
      </div>

      <table className="data-table" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>θ (องศา)</th>
            <th>cot θ</th>
            <th>V(θ) ลบ.ซม.³</th>
            <th>VRR</th>
          </tr>
        </thead>
        <tbody>
          {dynamicRows.map((row) => (
            <tr key={row.theta}>
              <td>{row.theta}</td>
              <td>{row.cot}</td>
              <td>{row.v}</td>
              <td>{row.vrr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}