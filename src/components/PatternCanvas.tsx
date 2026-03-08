'use client'

import { useRef, useEffect, useState } from 'react'
import type { PatternInputs } from '@/types/lantern'

const DEFAULT: PatternInputs = { a: 6.5, b: 7, hb: 6.5, hm: 8.5, ht: 6.5, n: 8 }

export default function PatternCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inputs, setInputs] = useState<PatternInputs>(DEFAULT)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setInputs((prev) => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }))
  }

  function drawPattern() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight

    const { a, b, hb, hm, ht, n } = inputs
    const q = n / 2
    const Ht = hb + hm + ht
    const P = a + b
    const totalW = q * P + 2
    const totalH = Ht + 10
    const scaleX = (W - 40) / totalW
    const scaleY = (H - 40) / totalH
    const sc = Math.min(scaleX, scaleY)
    const ox = 20 + ((W - 40) - totalW * sc) / 2
    const oy = 20 + ((H - 40) - totalH * sc) / 2 + 5 * sc

    const tx = (x: number) => ox + x * sc
    const ty = (y: number) => oy + (Ht - y) * sc

    ctx.clearRect(0, 0, W, H)
    ctx.lineWidth = 1

    for (let j = 0; j < q; j++) {
      const d = j * P

      // Rectangle panel (blue)
      ctx.strokeStyle = '#2563EB'
      ctx.fillStyle = 'rgba(37,99,235,0.06)'
      ctx.beginPath()
      ctx.moveTo(tx(d), ty(0))
      ctx.lineTo(tx(d + a), ty(0))
      ctx.lineTo(tx(d + a), ty(Ht))
      ctx.lineTo(tx(d), ty(Ht))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Kite panel (red)
      ctx.strokeStyle = '#DC2626'
      ctx.fillStyle = 'rgba(220,38,38,0.06)'
      const cx = d + a + b / 2
      ctx.beginPath()
      ctx.moveTo(tx(d + a), ty(hb))
      ctx.lineTo(tx(d + a), ty(hb + hm))
      ctx.lineTo(tx(cx), ty(Ht))
      ctx.lineTo(tx(d + a + b), ty(hb + hm))
      ctx.lineTo(tx(d + a + b), ty(hb))
      ctx.lineTo(tx(cx), ty(0))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Fold lines (dashed green)
      ctx.strokeStyle = '#16A34A'
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(tx(d), ty(hb))
      ctx.lineTo(tx(d + a), ty(hb))
      ctx.moveTo(tx(d), ty(hb + hm))
      ctx.lineTo(tx(d + a), ty(hb + hm))
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Legend
    ctx.fillStyle = '#6B1D2A'
    ctx.font = `11px 'Noto Sans Thai'`
    ctx.textAlign = 'center'
    ctx.fillText('■ สี่เหลี่ยม', W * 0.25, H - 8)
    ctx.fillStyle = '#DC2626'
    ctx.fillText('◆ ว่าว', W * 0.5, H - 8)
    ctx.fillStyle = '#16A34A'
    ctx.fillText('--- เส้นพับ', W * 0.75, H - 8)
  }

  // วาดใหม่เมื่อ inputs เปลี่ยน หรือ window resize
  useEffect(() => {
    drawPattern()
  }, [inputs])

  useEffect(() => {
    const handleResize = () => drawPattern()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [inputs])

  return (
    <section id="pattern">
      <h2><span className="icon">✂️</span>รูปคลี่โคม (Pattern)</h2>
      <p>แสดงรูปคลี่ของโคม n-เหลี่ยม ปรับค่าแล้วกดวาดใหม่</p>

      <div className="calc-grid">
        <div className="calc-field">
          <label>a (กว้างแผงสี่เหลี่ยม)</label>
          <input type="number" name="a" value={inputs.a} step={0.5} onChange={handleChange} />
        </div>
        <div className="calc-field">
          <label>b (กว้างแผงว่าว)</label>
          <input type="number" name="b" value={inputs.b} step={0.5} onChange={handleChange} />
        </div>
        <div className="calc-field">
          <label>h_b (สูงช่วงล่าง)</label>
          <input type="number" name="hb" value={inputs.hb} step={0.5} onChange={handleChange} />
        </div>
        <div className="calc-field">
          <label>h_m (สูงช่วงกลาง)</label>
          <input type="number" name="hm" value={inputs.hm} step={0.5} onChange={handleChange} />
        </div>
        <div className="calc-field">
          <label>h_t (สูงช่วงบน)</label>
          <input type="number" name="ht" value={inputs.ht} step={0.5} onChange={handleChange} />
        </div>
        <div className="calc-field">
          <label>จำนวนด้าน n</label>
          <select name="n" value={inputs.n} onChange={handleChange}>
            <option value={6}>6</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={12}>12</option>
          </select>
        </div>
      </div>

      <button className="btn btn-gold" onClick={drawPattern}>วาดรูปคลี่</button>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 300,
          border: '1.5px solid var(--cream-dark)',
          borderRadius: 8,
          background: 'var(--white)',
          display: 'block',
          marginTop: 16,
        }}
      />
    </section>
  )
}