'use client'

import { useState } from 'react'
import type { PatternInputs, AreaResult } from '@/types/lantern'


interface Props {
  patternInputs: PatternInputs
}

export default function AreaCalculator({ patternInputs }: Props) {
  const [result, setResult] = useState<AreaResult | null>(null)

  function calcArea() {
    const { a, b, hb, hm, ht, n } = patternInputs
    const q = n / 2
    const H = hb + hm + ht

    const arect = q * a * H
    const akite = q * (b * hm + 0.5 * b * ht + 0.5 * b * hb)
    const atop  = q * (0.5 * a * 8)          // triangle height ~8
    const atail = q * (a * 32 + 0.5 * a * 4) // L=32, tau=4
    const aglue = 1 * H
    const anet  = arect + akite + atop + atail + aglue

    setResult({ arect, akite, atop, atail, aglue, anet, q })
  }

  return (
    <section id="calc-area">
      <h2><span className="icon">📄</span>คำนวณพื้นที่กระดาษ</h2>
      <p>คำนวณพื้นที่กระดาษที่ต้องใช้ต่อ 1 โคม (ใช้ค่าจากรูปคลี่ด้านบน)</p>

      <button className="btn btn-gold" onClick={calcArea}>คำนวณพื้นที่ A_net</button>

      <div className="result-box">
        {result ? (
          <>
            <div className="result-row">
              <span>แผงสี่เหลี่ยม ({result.q} แผง)</span>
              <strong>{result.arect.toFixed(2)} ตร.ซม.</strong>
            </div>
            <div className="result-row">
              <span>แผงว่าว ({result.q} แผง)</span>
              <strong>{result.akite.toFixed(2)} ตร.ซม.</strong>
            </div>
            <div className="result-row">
              <span>สามเหลี่ยมบน ({result.q} ชิ้น)</span>
              <strong>{result.atop.toFixed(2)} ตร.ซม.</strong>
            </div>
            <div className="result-row">
              <span>หางล่าง ({result.q} ชิ้น)</span>
              <strong>{result.atail.toFixed(2)} ตร.ซม.</strong>
            </div>
            <div className="result-row">
              <span>แถบกาว</span>
              <strong>{result.aglue.toFixed(2)} ตร.ซม.</strong>
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, paddingTop: 12, borderTop: '2px solid var(--gold)' }}>
              <span className="big-number">{result.anet.toFixed(2)}</span>
              <span className="unit"> ตร.ซม. ต่อโคม 1 ใบ</span>
            </div>
          </>
        ) : (
          <p style={{ color: '#999', fontSize: 14 }}>กดปุ่มเพื่อคำนวณ (ใช้ค่าจากช่องรูปคลี่ด้านบน)</p>
        )}
      </div>
    </section>
  )
}