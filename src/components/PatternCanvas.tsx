'use client'

import { useRef, useEffect, useState } from 'react'
import LanternViewer3D from './LanternViewer3D'
import jsPDF from 'jspdf'

interface InputsState {
  a: number
  b: number
  hb: number
  hm: number
  ht: number
  hspike: number // 1. เพิ่มตัวแปรสำหรับยอดแหลม
  n: number
  ltail: number
}

const DEFAULT: InputsState = { a: 6.5, b: 7, hb: 6.5, hm: 8.5, ht: 6.5, hspike: 3.25, n: 8, ltail: 30 }

// ─────────────────────────────────────────────────────────────────────────────
// คำนวณ kite_width จากสูตรเดียวกับ 3D code
// ─────────────────────────────────────────────────────────────────────────────
function computeKiteWidth(theta: number, inputs: InputsState): number {
  const { a, hb, ht, n } = inputs
  const baseAngleDeg = (180 - theta) / 2
  const baseThetaRad = (baseAngleDeg * Math.PI) / 180

  const Ht_total = hb + inputs.hm + ht
  const sc = 14 / (Ht_total || 1) // ป้องกันหาร 0

  const A    = a  * sc
  const H_b  = hb * sc
  const H_t  = ht * sc

  const max_fold = Math.min(H_t, H_b)
  const delta_R  = max_fold * Math.cos(baseThetaRad)

  const numPairs   = Math.max(1, Math.round(n / 2))
  const sliceAngle = (2 * Math.PI) / numPairs

  const R_end      = A / (2 * Math.sin(sliceAngle / 2))
  const R_mid      = R_end + delta_R
  const delta_blue = 2 * Math.asin(Math.min(1, A / (2 * R_mid)))
  const gap_angle  = sliceAngle - delta_blue

  // kite_width ใน cm (แปลงกลับจาก 3D units)
  return (2 * R_mid * Math.sin(gap_angle / 2)) / sc
}

export default function PatternCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inputs, setInputs] = useState<InputsState>(DEFAULT)
  const [theta, setTheta]   = useState<number>(45)
  const [paperSize, setPaperSize] = useState<string>('a4')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputs(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }))
  }

  function drawPattern() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width  = canvas.offsetWidth  * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    const W  = canvas.offsetWidth
    const Hc = canvas.offsetHeight

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, Hc)

    // ─────────────────────────────────────────────────────────────────────────
    // ขนาดแผง: ใช้ค่า input โดยตรง ไม่คูณ sinT
    // ─────────────────────────────────────────────────────────────────────────
    const { a, hb, hm, ht, hspike, n, ltail } = inputs
    const q        = Math.round(n / 2)
    const Ht       = hb + hm + ht          
    const kiteW    = computeKiteWidth(theta, inputs)  
    const halfKite = kiteW / 2              

    const h_spike    = hspike              // ใช้ค่าจาก Slider แล้ว
    const l_tail     = ltail
    const l_tail_tip = l_tail * 0.15

    // ── layout: หนึ่ง cell = แผงน้ำเงิน (a) + แผงแดง (kiteW) ──
    const cellW  = a + kiteW
    
    // 2. คำนวณ Bounding Box เพื่อให้รูปจัดกึ่งกลางและไม่หลุดขอบเสมอ
    const minX = 0
    const maxX = cellW * q
    const minY = -(l_tail + l_tail_tip) // จุดต่ำสุดคือปลายหาง
    const maxY = Ht + h_spike           // จุดสูงสุดคือยอดแหลม
    
    const totalW = maxX - minX
    const totalH = maxY - minY

    const scX = (W  - 40) / (totalW || 1)
    const scY = (Hc - 40) / (totalH || 1)
    const sc  = Math.min(scX, scY)

    // origin: คำนวณจัดให้อยู่กึ่งกลางเป๊ะๆ ตามความสูง/กว้างที่แท้จริง
    const ox = 20 + ((W  - 40) - totalW * sc) / 2
    const oy = 20 + ((Hc - 40) - totalH * sc) / 2 + maxY * sc

    const tx = (x: number) => ox + x * sc
    const ty = (y: number) => oy - y * sc  // y+ = ขึ้น

    // ── drawGlueTab ────────────────────────────────────────────────────────
    function drawGlueTab(x1: number, y1: number, x2: number, y2: number, outward = 1) {
      if (!ctx) return
      const dx = x2 - x1, dy = y2 - y1
      const len = Math.hypot(dx, dy)
      if (len < 0.01) return

      const s = 0.2, e = 0.8
      const ax = x1 + dx * s, ay = y1 + dy * s
      const bx = x1 + dx * e, by = y1 + dy * e
      const adx = bx - ax, ady = by - ay
      const alen = Math.hypot(adx, ady)
      if (alen < 0.001) return

      const nx = (-dy / len) * outward
      const ny = ( dx / len) * outward
      
      const tw = 0.5
      const shrink = tw * 0.6 

      const p1x = ax + nx * tw + (adx / alen) * shrink
      const p1y = ay + ny * tw + (ady / alen) * shrink
      const p2x = bx + nx * tw + (adx / alen) * -shrink
      const p2y = by + ny * tw + (ady / alen) * -shrink

      ctx.fillStyle   = 'rgba(234,179,8,0.25)'
      ctx.strokeStyle = '#CA8A04'
      ctx.lineWidth   = 0.7
      ctx.beginPath()
      ctx.moveTo(tx(ax), ty(ay))
      ctx.lineTo(tx(p1x), ty(p1y))
      ctx.lineTo(tx(p2x), ty(p2y))
      ctx.lineTo(tx(bx), ty(by))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.strokeStyle = '#16A34A'
      ctx.lineWidth   = 0.7
      ctx.setLineDash([3, 2])
      ctx.beginPath()
      ctx.moveTo(tx(ax), ty(ay))
      ctx.lineTo(tx(bx), ty(by))
      ctx.stroke()
      ctx.setLineDash([])
    }

    // ── วาด q คู่ ──────────────────────────────────────────────────────────
    for (let j = 0; j < q; j++) {
      const xL  = j * cellW          
      const xR  = xL + a             

      const kL   = xR              
      const kCx  = xR + halfKite   
      const kR   = xR + kiteW      

      // ─────────────────────────────────────────────────────────────────────
      // แผงน้ำเงิน
      // ─────────────────────────────────────────────────────────────────────
      ctx.strokeStyle = '#2563EB'
      ctx.fillStyle   = 'rgba(37,99,235,0.07)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(tx(xL), ty(0))
      ctx.lineTo(tx(xL), ty(-l_tail))
      ctx.lineTo(tx(xL + a/2), ty(-(l_tail + l_tail_tip)))   
      ctx.lineTo(tx(xR), ty(-l_tail))
      ctx.lineTo(tx(xR), ty(0))
      ctx.lineTo(tx(xR), ty(Ht))
      ctx.lineTo(tx(xL + a/2), ty(Ht + h_spike))             
      ctx.lineTo(tx(xL), ty(Ht))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // เส้นพับแนวนอน
      ctx.strokeStyle = '#16A34A'
      ctx.lineWidth   = 0.8
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(tx(xL), ty(hb));       ctx.lineTo(tx(xR), ty(hb))
      ctx.moveTo(tx(xL), ty(hb + hm)); ctx.lineTo(tx(xR), ty(hb + hm))
      ctx.stroke()
      ctx.setLineDash([])

      // ─────────────────────────────────────────────────────────────────────
      // แผงแดง (ว่าว)
      // ─────────────────────────────────────────────────────────────────────
      ctx.strokeStyle = '#DC2626'
      ctx.fillStyle   = 'rgba(220,38,38,0.07)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(tx(kCx), ty(0))        
      ctx.lineTo(tx(kL),  ty(hb))       
      ctx.lineTo(tx(kL),  ty(hb + hm)) 
      ctx.lineTo(tx(kCx), ty(Ht))       
      ctx.lineTo(tx(kR),  ty(hb + hm)) 
      ctx.lineTo(tx(kR),  ty(hb))       
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // ─────────────────────────────────────────────────────────────────────
      // แถบกาวบนขอบว่าว
      // ─────────────────────────────────────────────────────────────────────
      drawGlueTab(kCx, 0,      kL, hb,        1)  
      drawGlueTab(kL,  hb+hm,  kCx, Ht,       1)  

      drawGlueTab(kCx, 0,      kR, hb,       -1)
      if (j === q - 1) {
        drawGlueTab(kR,  hb,     kR, hb + hm,  -1)
      }
      drawGlueTab(kR,  hb+hm,  kCx, Ht,      -1)
    }

    // ── Legend ──────────────────────────────────────────────────────────────
    ctx.font = `11px 'Noto Sans Thai', sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = '#2563EB'; ctx.fillText('■ ชิ้นส่วนหลัก', W * 0.15, Hc - 8)
    ctx.fillStyle = '#DC2626'; ctx.fillText('◆ ว่าว',          W * 0.35, Hc - 8)
    ctx.fillStyle = '#16A34A'; ctx.fillText('--- เส้นพับ',     W * 0.55, Hc - 8)
    ctx.fillStyle = '#CA8A04'; ctx.fillText('🟨 พื้นที่ทากาว', W * 0.80, Hc - 8)
  }

  function isMobileDevice() {
    if (typeof window === 'undefined') return false
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
      || (navigator.maxTouchPoints > 1 && /macintosh/i.test(ua))
  }

  async function handleDownloadPNG() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async blob => {
      if (!blob) return
      const fileName = `lantern-pattern-n${inputs.n}.png`
      const file = new File([blob], fileName, { type: 'image/png' })
      if (isMobileDevice() && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'Lantern Pattern' }) } catch {}
      } else {
        const url = URL.createObjectURL(blob)
        const el  = document.createElement('a')
        el.href = url; el.download = fileName; el.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  }

  async function handleDownloadPDF() {
    const canvas = canvasRef.current
    if (!canvas) return
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: paperSize })
    const pW = pdf.internal.pageSize.getWidth()
    const pH = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pW) / canvas.width
    if (imgH > pH) {
      const scaledW = (canvas.width * pH) / canvas.height
      pdf.addImage(imgData, 'PNG', (pW - scaledW) / 2, 0, scaledW, pH)
    } else {
      pdf.addImage(imgData, 'PNG', 0, (pH - imgH) / 2, pW, imgH)
    }
    const fileName = `lantern-pattern-n${inputs.n}-${paperSize}.pdf`
    if (isMobileDevice() && navigator.canShare) {
      const blob = pdf.output('blob')
      const file = new File([blob], fileName, { type: 'application/pdf' })
      if (navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return } catch {}
      }
    }
    pdf.save(fileName)
  }

  useEffect(() => { drawPattern() }, [inputs, theta, paperSize])
  useEffect(() => {
    const r = () => drawPattern()
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [inputs, theta])

  return (
    <section id="pattern">
      <style dangerouslySetInnerHTML={{ __html: `
        .params-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
        @media (min-width:640px)  { .params-grid { grid-template-columns: repeat(3,1fr); } }
        @media (min-width:1024px) { .params-grid { grid-template-columns: repeat(4,1fr); } }
      `}} />

      <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:16 }}>
        <h2 style={{ margin:0 }}><span className="icon">✂️</span>จำลองและปรับแต่งโคม</h2>
        <span style={{ fontSize:'0.9rem', color:'#666' }}>(Pattern & 3D)</span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20,
                    background:'#f8fafc', padding:12, borderRadius:8, border:'1px solid #e2e8f0' }}>
        <div className="params-grid">
          {/* 3. ปรับ Range (min, max) ของตัวแปรความยาวให้รองรับ 0 - 100 cm */}
          {[
            { name:'a',      label:'กว้างหลัก (a)',     min:0,  max:100, step:0.5 },
            { name:'b',      label:'กว้างว่าว (b)',       min:0,  max:100, step:0.5 },
            { name:'hb',     label:'สูงช่วงล่าง (h_b)',  min:0,  max:100, step:0.5 },
            { name:'hm',     label:'สูงช่วงกลาง (h_m)',  min:0,  max:100, step:0.5 },
            { name:'ht',     label:'สูงช่วงบน (h_t)',    min:0,  max:100, step:0.5 },
            { name:'hspike', label:'ยอดแหลม (h_spike)', min:0,  max:100, step:0.5 }, // Slider ใหม่
            { name:'ltail',  label:'หาง (ltail)',         min:0,  max:100, step:1   },
            { name:'n',      label:'จำนวนด้าน (n)',       min:6,  max:16,  step:2   }, // จำนวนด้านคงไว้ 6-16
          ].map(f => (
            <div key={f.name}>
              <label style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:2 }}>
                <span>{f.label}</span>
                <strong>{inputs[f.name as keyof InputsState]}</strong>
              </label>
              <input type="range" name={f.name}
                min={f.min} max={f.max} step={f.step}
                value={inputs[f.name as keyof InputsState]}
                onChange={handleChange}
                style={{ width:'100%', cursor:'pointer' }} />
            </div>
          ))}
        </div>

        <div style={{ paddingTop:12, borderTop:'2px solid #cbd5e1' }}>
          <label style={{ display:'flex', justifyContent:'space-between', fontSize:'0.9rem',
                          marginBottom:6, color:'#0369a1', fontWeight:'bold' }}>
            <span>ระดับการกาง (Theta)</span>
            <span>{theta}°</span>
          </label>
          <input type="range" min={0} max={180} value={theta}
            onChange={e => setTheta(parseFloat(e.target.value))}
            style={{ width:'100%', cursor:'pointer', accentColor:'#0ea5e9' }} />
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px,1fr))', gap:20 }}>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <h3 style={{ fontSize:'1rem', margin:0 }}>📄 แผ่นคลี่ 2D</h3>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <select value={paperSize} onChange={e => setPaperSize(e.target.value)}
                style={{ padding:'4px 6px', borderRadius:4, border:'1px solid #ccc', fontSize:'0.8rem' }}>
                <option value="a5">A5</option>
                <option value="a4">A4</option>
                <option value="a3">A3</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
              <button onClick={handleDownloadPNG}
                style={{ padding:'4px 10px', background:'var(--maroon,#6b1d2a)', color:'white',
                         border:'none', borderRadius:4, cursor:'pointer', fontSize:'0.8rem', fontWeight:'bold' }}>
                📥 PNG
              </button>
              <button onClick={handleDownloadPDF}
                style={{ padding:'4px 10px', background:'#e11d48', color:'white',
                         border:'none', borderRadius:4, cursor:'pointer', fontSize:'0.8rem', fontWeight:'bold' }}>
                📄 PDF
              </button>
            </div>
          </div>
          <canvas ref={canvasRef}
            style={{ width:'100%', height:400, border:'1px solid var(--cream-dark,#e2d8c3)',
                     borderRadius:8, background:'#fff', display:'block' }} />
        </div>

        <div>
          <h3 style={{ fontSize:'1rem', marginBottom:8 }}>🏮 พรีวิว 3D</h3>
          <LanternViewer3D
            theta={theta} a={inputs.a} b={inputs.b}
            hb={inputs.hb} hm={inputs.hm} ht={inputs.ht}
            hspike={inputs.hspike} // ส่งตัวแปร hspike ไปยังคอมโพเนนต์ 3D ด้วยเผื่อนำไปใช้
            n={inputs.n} ltail={inputs.ltail} />
        </div>
      </div>
    </section>
  )
}