'use client'

import { useState } from 'react'
import type { VolumeInputs, VolumeResult } from '@/types/lantern'

interface Props {
  onVolumeCalculated: (v: number) => void
}

const DEFAULT_INPUTS: VolumeInputs = { n: 8, s: 6.5, h0: 6.5, h1: 8.5, h2: 6.5 }

export default function VolumeCalculator({ onVolumeCalculated }: Props) {
  const [inputs, setInputs] = useState<VolumeInputs>(DEFAULT_INPUTS)
  const [result, setResult] = useState<VolumeResult | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setInputs((prev) => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }))
  }

  function calcVolume() {
    const { n, s, h0, h1, h2 } = inputs
    const R = s / (2 * Math.sin(Math.PI / n))
    const K = (n / 2) * Math.sin((2 * Math.PI) / n)
    const A = K * R * R
    const H = h0 + h1 + h2
    const V = A * H

    const res: VolumeResult = { n, R, K, A, H, V }
    setResult(res)
    onVolumeCalculated(V)  // ← ส่งค่า V ไปให้ FoldSimulator ใช้ต่อ
  }

  return (
    <section id="calc-volume">
      <h2><span className="icon">📦</span>คำนวณปริมาตรโคม</h2>
      <p>ใส่ค่าตัวแปรของโคมเพื่อคำนวณปริมาตรตอนกางเต็มที่</p>

      <div className="calc-grid">
        <div className="calc-field">
          <label>จำนวนด้าน (n)</label>
          <select name="n" value={inputs.n} onChange={handleChange}>
            <option value={6}>6 (หกเหลี่ยม)</option>
            <option value={8}>8 (แปดเหลี่ยม)</option>
            <option value={10}>10 (สิบเหลี่ยม)</option>
            <option value={12}>12 (สิบสองเหลี่ยม)</option>
          </select>
        </div>
        <div className="calc-field">
          <label>ความยาวด้าน s (ซม.)</label>
          <input type="number" name="s" value={inputs.s} step={0.1} onChange={handleChange} />
        </div>
        <div className="calc-field">
          <label>ความสูงชั้น 1 h₀ (ซม.)</label>
          <input type="number" name="h0" value={inputs.h0} step={0.1} onChange={handleChange} />
        </div>
        <div className="calc-field">
          <label>ความสูงชั้น 2 h₁ (ซม.)</label>
          <input type="number" name="h1" value={inputs.h1} step={0.1} onChange={handleChange} />
        </div>
        <div className="calc-field">
          <label>ความสูงชั้น 3 h₂ (ซม.)</label>
          <input type="number" name="h2" value={inputs.h2} step={0.1} onChange={handleChange} />
        </div>
      </div>

      <button className="btn" onClick={calcVolume}>คำนวณปริมาตร</button>

      <div className="result-box">
        {result ? (
          <>
            <div className="result-row"><span>จำนวนด้าน n</span><strong>{result.n}</strong></div>
            <div className="result-row"><span>รัศมี R</span><strong>{result.R.toFixed(2)} ซม.</strong></div>
            <div className="result-row"><span>ค่าคงที่ K</span><strong>{result.K.toFixed(4)}</strong></div>
            <div className="result-row"><span>พื้นที่หน้าตัด A(R)</span><strong>{result.A.toFixed(2)} ตร.ซม.</strong></div>
            <div className="result-row"><span>ความสูงรวม H</span><strong>{result.H.toFixed(2)} ซม.</strong></div>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span className="big-number">{result.V.toFixed(2)}</span>
              <span className="unit"> ลบ.ซม.³</span>
            </div>
          </>
        ) : (
          <p style={{ color: '#999', fontSize: 14 }}>กดปุ่มเพื่อคำนวณ</p>
        )}
      </div>
    </section>
  )
}