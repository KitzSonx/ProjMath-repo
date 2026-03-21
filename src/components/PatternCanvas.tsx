'use client'

import { useRef, useEffect, useState } from 'react'
import LanternViewer3D from './LanternViewer3D'
import jsPDF from 'jspdf'
import type { PatternInputs } from '@/types/lantern'

// ─────────────────────────────────────────────────────────────────────────────
// ฟังก์ชันกลางสำหรับวาด Pattern (ใช้ร่วมกันทั้งจอมอนิเตอร์ และ PDF)
// ─────────────────────────────────────────────────────────────────────────────
function renderPatternShapes(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  tx: (x: number) => number,
  ty: (y: number) => number,
  inputs: PatternInputs,
  lwScale: number = 1
) {
  const { a, b, hb, hm, ht, hspike, n, ltail } = inputs // 👈 ดึง b มาใช้ตรงๆ
  const q        = Math.round(n / 2)
  const Ht       = hb + hm + ht          
  const kiteW    = b                    // 👈 ใช้ค่ากว้างว่าว (b) จาก Slider แทนการคำนวณ
  const halfKite = kiteW / 2              
  const h_spike  = hspike
  const l_tail   = ltail
  const l_tail_tip = l_tail * 0.15
  const cellW  = a + kiteW

  function drawGlueTab(x1: number, y1: number, x2: number, y2: number, outward = 1) {
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
    ctx.lineWidth   = 0.7 * lwScale
    ctx.beginPath()
    ctx.moveTo(tx(ax), ty(ay))
    ctx.lineTo(tx(p1x), ty(p1y))
    ctx.lineTo(tx(p2x), ty(p2y))
    ctx.lineTo(tx(bx), ty(by))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.strokeStyle = '#16A34A'
    ctx.lineWidth   = 0.7 * lwScale
    ctx.setLineDash([3 * lwScale, 2 * lwScale])
    ctx.beginPath()
    ctx.moveTo(tx(ax), ty(ay))
    ctx.lineTo(tx(bx), ty(by))
    ctx.stroke()
    ctx.setLineDash([])
  }

  for (let j = 0; j < q; j++) {
    const xL  = j * cellW          
    const xR  = xL + a             
    const kL   = xR                
    const kCx  = xR + halfKite   
    const kR   = xR + kiteW      

    // 1. แผงน้ำเงิน
    ctx.strokeStyle = '#2563EB'
    ctx.fillStyle   = 'rgba(37,99,235,0.07)'
    ctx.lineWidth   = 1 * lwScale
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

    // 2. เส้นพับแนวนอน
    ctx.strokeStyle = '#16A34A'
    ctx.lineWidth   = 0.8 * lwScale
    ctx.setLineDash([4 * lwScale, 3 * lwScale])
    ctx.beginPath()
    ctx.moveTo(tx(xL), ty(hb));       ctx.lineTo(tx(xR), ty(hb))
    ctx.moveTo(tx(xL), ty(hb + hm)); ctx.lineTo(tx(xR), ty(hb + hm))
    ctx.stroke()
    ctx.setLineDash([])

    // 3. แผงแดง (ว่าว)
    ctx.strokeStyle = '#DC2626'
    ctx.fillStyle   = 'rgba(220,38,38,0.07)'
    ctx.lineWidth   = 1 * lwScale
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

    // 4. แถบกาว
    drawGlueTab(kCx, 0,      kL, hb,        1)  
    drawGlueTab(kL,  hb+hm,  kCx, Ht,       1)  
    drawGlueTab(kCx, 0,      kR, hb,       -1)
    if (j === q - 1) drawGlueTab(kR,  hb,     kR, hb + hm,  -1)
    drawGlueTab(kR,  hb+hm,  kCx, Ht,      -1)
  }
}

interface Props {
  inputs: PatternInputs;
  onChange: (newInputs: PatternInputs) => void;
}

export default function PatternCanvas({ inputs, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [paperSize, setPaperSize] = useState<string>('a4')
  const [unit, setUnit] = useState<string>('cm')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...inputs, [e.target.name]: parseFloat(e.target.value) })
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

    const { a, b, hb, hm, ht, hspike, n, ltail } = inputs // 👈 ดึง b มาใช้
    const q        = Math.round(n / 2)
    const Ht       = hb + hm + ht          
    const kiteW    = b  // 👈 ใช้ค่า b
    const h_spike  = hspike              
    const l_tail   = ltail
    const l_tail_tip = l_tail * 0.15
    const cellW  = a + kiteW
    
    const minX = 0
    const maxX = cellW * q
    const minY = -(l_tail + l_tail_tip) 
    const maxY = Ht + h_spike          
    const totalW = maxX - minX
    const totalH = maxY - minY

    const scX = (W  - 40) / (totalW || 1)
    const scY = (Hc - 40) / (totalH || 1)
    const sc  = Math.min(scX, scY)

    const ox = 20 + ((W  - 40) - totalW * sc) / 2
    const oy = 20 + ((Hc - 40) - totalH * sc) / 2 + maxY * sc

    const tx = (x: number) => ox + x * sc
    const ty = (y: number) => oy - y * sc  

    // เรียกใช้วาดกราฟิกบนหน้าจอ (ไม่ต้องส่ง theta แล้ว)
    renderPatternShapes(ctx, tx, ty, inputs, 1)

    // ── Legend ──
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
    const { a, b, hb, hm, ht, hspike, n, ltail } = inputs // 👈 ดึง b มาใช้
    const q = Math.round(n / 2)
    const Ht = hb + hm + ht
    const kiteW = b // 👈 ใช้ค่า b
    const l_tail_tip = ltail * 0.15
    const cellW = a + kiteW

    const minX = 0
    const maxX = cellW * q
    const minY = -(ltail + l_tail_tip)
    const maxY = Ht + hspike
    
    const totalW_units = maxX - minX
    const totalH_units = maxY - minY

    const unitScale = unit === 'inch' ? 25.4 : 10
    const patW_mm = totalW_units * unitScale
    const patH_mm = totalH_units * unitScale

    const pxPerMm = 10 
    const offCanvas = document.createElement('canvas')
    offCanvas.width = patW_mm * pxPerMm
    offCanvas.height = patH_mm * pxPerMm
    const offCtx = offCanvas.getContext('2d')
    if (!offCtx) return

    offCtx.fillStyle = '#ffffff'
    offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height)

    const sc = unitScale * pxPerMm
    const tx = (x: number) => (x - minX) * sc
    const ty = (y: number) => (maxY - y) * sc 

    const lwScale = pxPerMm * 0.15 
    renderPatternShapes(offCtx, tx, ty, inputs, lwScale)

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: paperSize })
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()

    const margin = 10 
    const printW_mm = pdfW - 2 * margin
    const printH_mm = pdfH - 2 * margin

    const cols = Math.ceil(patW_mm / printW_mm)
    const rows = Math.ceil(patH_mm / printH_mm)

    let pageNum = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (pageNum > 0) pdf.addPage()
        pageNum++

        const srcX_mm = c * printW_mm
        const srcY_mm = r * printH_mm

        const tileW_mm = Math.min(printW_mm, patW_mm - srcX_mm)
        const tileH_mm = Math.min(printH_mm, patH_mm - srcY_mm)

        const srcX_px = srcX_mm * pxPerMm
        const srcY_px = srcY_mm * pxPerMm
        const tileW_px = tileW_mm * pxPerMm
        const tileH_px = tileH_mm * pxPerMm

        const tileCanvas = document.createElement('canvas')
        tileCanvas.width = tileW_px
        tileCanvas.height = tileH_px
        const tileCtx = tileCanvas.getContext('2d')
        if (tileCtx) {
          tileCtx.fillStyle = '#ffffff'
          tileCtx.fillRect(0, 0, tileW_px, tileH_px)
          tileCtx.drawImage(offCanvas, srcX_px, srcY_px, tileW_px, tileH_px, 0, 0, tileW_px, tileH_px)

          const tileData = tileCanvas.toDataURL('image/png')
          pdf.addImage(tileData, 'PNG', margin, margin, tileW_mm, tileH_mm)

          pdf.setFontSize(8)
          pdf.setTextColor(150)
          pdf.text(`Part ${c + 1}-${r + 1} | Scale 1:1 (${unit})`, margin, margin - 2)
        }
      }
    }

    const fileName = `lantern-pattern-1to1-${unit}-${paperSize}.pdf`
    if (isMobileDevice() && navigator.canShare) {
      const blob = pdf.output('blob')
      const file = new File([blob], fileName, { type: 'application/pdf' })
      if (navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return } catch {}
      }
    }
    pdf.save(fileName)
  }

  // 👈 ลบ dependency theta ออกจาก useEffect
  useEffect(() => { drawPattern() }, [inputs, paperSize])
  useEffect(() => {
    const r = () => drawPattern()
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [inputs])

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
          {[
            { name:'a',      label:'กว้างหลัก (a)',     min:0, max:50, step:0.1 },
            { name:'b',      label:'กว้างว่าว (b)',       min:0, max:50, step:0.1 },
            { name:'hb',     label:'สูงช่วงล่าง (h_b)',  min:0, max:50, step:0.1 },
            { name:'hm',     label:'สูงช่วงกลาง (h_m)',  min:0, max:50, step:0.1 },
            { name:'ht',     label:'สูงช่วงบน (h_t)',    min:0, max:50, step:0.1 },
            { name:'hspike', label:'ยอดแหลม (h_spike)', min:0, max:50, step:0.1 },
            { name:'ltail',  label:'หาง (ltail)',         min:0, max:50, step:0.1 },
            { name:'n',      label:'จำนวนด้าน (n)',       min:6, max:16, step:2   },
          ].map(f => (
            <div key={f.name}>
              <label style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:2 }}>
                <span>{f.label}</span>
                <strong>{inputs[f.name as keyof PatternInputs]}</strong>
              </label>
              <input type="range" name={f.name}
                min={f.min} max={f.max} step={f.step}
                value={inputs[f.name as keyof PatternInputs]}
                onChange={handleChange}
                style={{ width:'100%', cursor:'pointer' }} />
            </div>
          ))}
        </div>
        
        {/* 👈 ลบส่วนปรับ Slider มุมกาง Theta ออกจากตรงนี้แล้ว */}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px,1fr))', gap:20 }}>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
            <h3 style={{ fontSize:'1rem', margin:0 }}>📄 แผ่นคลี่ 2D</h3>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              
              <select value={unit} onChange={e => setUnit(e.target.value)}
                style={{ padding:'4px 6px', borderRadius:4, border:'1px solid #ccc', fontSize:'0.8rem' }}>
                <option value="cm">ซม. (cm)</option>
                <option value="inch">นิ้ว (inch)</option>
              </select>

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
                📄 PDF (1:1)
              </button>
            </div>
          </div>
          <canvas ref={canvasRef}
            style={{ width:'100%', height:400, border:'1px solid var(--cream-dark,#e2d8c3)',
                     borderRadius:8, background:'#fff', display:'block' }} />
        </div>

        <div>
          <h3 style={{ fontSize:'1rem', marginBottom:8 }}>🏮 พรีวิว 3D (มุมกาง 90 องศา)</h3>
          {/* 👈 ล็อค theta ไว้ที่ 90 ตายตัว */}
          <LanternViewer3D
            theta={90} a={inputs.a} b={inputs.b}
            hb={inputs.hb} hm={inputs.hm} ht={inputs.ht}
            hspike={inputs.hspike} 
            n={inputs.n} ltail={inputs.ltail} />
        </div>
      </div>
    </section>
  )
}