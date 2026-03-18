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
  n: number
  ltail: number
}

const DEFAULT: InputsState = { a: 6.5, b: 7, hb: 6.5, hm: 8.5, ht: 6.5, n: 8, ltail: 30 }

export default function PatternCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inputs, setInputs] = useState<InputsState>(DEFAULT)
  const [theta, setTheta] = useState<number>(45)
  const [paperSize, setPaperSize] = useState<string>('a4')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    const sinT = Math.sin((theta * Math.PI) / 180)
    
    const a = inputs.a * sinT
    const b = inputs.b * sinT
    
    const { hb, hm, ht, n, ltail } = inputs
    const q = n / 2
    const Ht = hb + hm + ht
    const P = a + b
    
    const h_spike = 9
    const l_tail = ltail
    const l_tail_tip = l_tail * 0.15 

    const max_y = Ht + h_spike
    const min_y = -(l_tail + l_tail_tip)

    const totalW = q * P + 6 
    const totalH = (max_y - min_y) + 15 

    const scaleX = (W - 40) / totalW
    const scaleY = (H - 40) / totalH
    const sc = Math.min(scaleX, scaleY)

    const ox = 20 + ((W - 40) - totalW * sc) / 2
    const oy = 20 + ((H - 40) - totalH * sc) / 2

    const tx = (x: number) => ox + x * sc
    const ty = (y: number) => oy + (max_y - y) * sc

    ctx.lineWidth = 1

    function drawGlueTab(x1: number, y1: number, x2: number, y2: number) {
      if (!ctx) return

      const dx = x2 - x1
      const dy = y2 - y1
      const len = Math.hypot(dx, dy)
      
      const tabRatio = 0.7 
      const startOffset = (1 - tabRatio) / 2
      const endOffset = 1 - startOffset
      
      const newX1 = x1 + dx * startOffset
      const newY1 = y1 + dy * startOffset
      const newX2 = x1 + dx * endOffset
      const newY2 = y1 + dy * endOffset
      
      const newDx = newX2 - newX1
      const newDy = newY2 - newY1

      const nx = -dy / len 
      const ny = dx / len
      
      const tabW = 1.5 
      const shrink = tabW * 1 

      const px1 = newX1 + nx * tabW + (newDx / len) * shrink
      const py1 = newY1 + ny * tabW + (newDy / len) * shrink
      const px2 = newX2 + nx * tabW - (newDx / len) * shrink
      const py2 = newY2 + ny * tabW - (newDy / len) * shrink

      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)' 
      ctx.strokeStyle = '#CA8A04'
      ctx.beginPath()
      ctx.moveTo(tx(newX1), ty(newY1))
      ctx.lineTo(tx(px1), ty(py1))
      ctx.lineTo(tx(px2), ty(py2))
      ctx.lineTo(tx(newX2), ty(newY2))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.strokeStyle = '#16A34A'
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(tx(newX1), ty(newY1))
      ctx.lineTo(tx(newX2), ty(newY2))
      ctx.stroke()
      ctx.setLineDash([])
    }

    for (let j = 0; j < q; j++) {
      const d = j * P
      const cx = d + a + b / 2

      drawGlueTab(d + a, hb + hm, cx, Ht)
      drawGlueTab(cx, Ht, d + a + b, hb + hm)
      drawGlueTab(cx, 0, d + a, hb)
      drawGlueTab(d + a + b, hb, cx, 0)

      if (j === q - 1) {
        drawGlueTab(d + a + b, hb + hm, d + a + b, hb)
      }

      ctx.strokeStyle = '#2563EB'
      ctx.fillStyle = 'rgba(37,99,235,0.06)'
      ctx.beginPath()
      ctx.moveTo(tx(d), ty(Ht))
      ctx.lineTo(tx(d + a / 2), ty(Ht + h_spike))
      ctx.lineTo(tx(d + a), ty(Ht))
      ctx.lineTo(tx(d + a), ty(0))
      ctx.lineTo(tx(d + a), ty(-l_tail))
      ctx.lineTo(tx(d + a / 2), ty(min_y))
      ctx.lineTo(tx(d), ty(-l_tail))
      ctx.lineTo(tx(d), ty(0))
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.strokeStyle = '#DC2626'
      ctx.fillStyle = 'rgba(220,38,38,0.06)'
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

      ctx.strokeStyle = '#16A34A'
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(tx(d), ty(hb))
      ctx.lineTo(tx(d + a), ty(hb))
      ctx.moveTo(tx(d), ty(hb + hm))
      ctx.lineTo(tx(d + a), ty(hb + hm))
      ctx.moveTo(tx(d), ty(Ht))
      ctx.lineTo(tx(d + a), ty(Ht))
      ctx.moveTo(tx(d), ty(0))
      ctx.lineTo(tx(d + a), ty(0))
      ctx.stroke()
      ctx.setLineDash([])
    }

    ctx.fillStyle = '#6B1D2A'
    ctx.font = `11px 'Noto Sans Thai'`
    ctx.textAlign = 'center'
    ctx.fillText('■ ชิ้นส่วนหลัก', W * 0.15, H - 8)
    ctx.fillStyle = '#DC2626'
    ctx.fillText('◆ ว่าว', W * 0.35, H - 8)
    ctx.fillStyle = '#16A34A'
    ctx.fillText('--- เส้นพับ', W * 0.55, H - 8)
    ctx.fillStyle = '#CA8A04'
    ctx.fillText('🟨 พื้นที่ทากาว', W * 0.8, H - 8)
  }

  function isMobileDevice() {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileString = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isMacMobile = navigator.maxTouchPoints > 1 && /macintosh/i.test(userAgent);
    return isMobileString || isMacMobile;
  }

  async function handleDownloadPNG() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const fileName = `lantern-pattern-n${inputs.n}.png`
      const file = new File([blob], fileName, { type: 'image/png' })
      const isMobile = isMobileDevice()
      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'Lantern Pattern' }) } catch (err) { }
      } else {
        const imageURL = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = imageURL; link.download = fileName; link.click()
        URL.revokeObjectURL(imageURL)
      }
    }, 'image/png')
  }

  async function handleDownloadPDF() {
    const canvas = canvasRef.current
    if (!canvas) return
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: paperSize })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    if (pdfHeight > pdf.internal.pageSize.getHeight()) {
      const scaledHeight = pdf.internal.pageSize.getHeight()
      const scaledWidth = (canvas.width * scaledHeight) / canvas.height
      const xOffset = (pdfWidth - scaledWidth) / 2
      pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight)
    } else {
      const yOffset = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2
      pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight)
    }
    const fileName = `lantern-pattern-n${inputs.n}-${paperSize}.pdf`
    const isMobile = isMobileDevice()
    if (isMobile && navigator.canShare) {
      const pdfBlob = pdf.output('blob')
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' })
      if (navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return } catch (err) { }
      }
    }
    pdf.save(fileName)
  }

  useEffect(() => {
    drawPattern()
  }, [inputs, theta, paperSize])

  useEffect(() => {
    const handleResize = () => drawPattern()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [inputs, theta])

  return (
    <section id="pattern">
      {/* 🎯 สไตล์พิเศษเพื่อบังคับให้ Slider แบ่งครึ่ง 2 ฝั่งบนมือถือ */}
      <style dangerouslySetInnerHTML={{ __html: `
        .params-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .params-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .params-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}><span className="icon">✂️</span>จำลองและปรับแต่งโคม</h2>
        <span style={{ fontSize: '0.9rem', color: '#666' }}>(Pattern & 3D)</span>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        marginBottom: '20px',
        background: '#f8fafc',
        padding: '12px', // ลด padding ลงนิดหน่อยให้ประหยัดพื้นที่ยิ่งขึ้น
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* 🎯 นำคลาส params-grid มาใช้ เพื่อให้เป็น 2 คอลัมน์บนมือถือ */}
        <div className="params-grid">
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
              <span>กว้างหลัก (a)</span> <strong>{inputs.a}</strong>
            </label>
            <input type="range" name="a" min="2" max="15" step="0.5" value={inputs.a} onChange={handleChange} style={{ width: '100%', cursor: 'pointer' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
              <span>กว้างว่าว (b)</span> <strong>{inputs.b}</strong>
            </label>
            <input type="range" name="b" min="2" max="15" step="0.5" value={inputs.b} onChange={handleChange} style={{ width: '100%', cursor: 'pointer' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
              <span>สูงช่วงล่าง (h_b)</span> <strong>{inputs.hb}</strong>
            </label>
            <input type="range" name="hb" min="2" max="15" step="0.5" value={inputs.hb} onChange={handleChange} style={{ width: '100%', cursor: 'pointer' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
              <span>สูงช่วงกลาง (h_m)</span> <strong>{inputs.hm}</strong>
            </label>
            <input type="range" name="hm" min="2" max="15" step="0.5" value={inputs.hm} onChange={handleChange} style={{ width: '100%', cursor: 'pointer' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
              <span>สูงช่วงบน (h_t)</span> <strong>{inputs.ht}</strong>
            </label>
            <input type="range" name="ht" min="2" max="15" step="0.5" value={inputs.ht} onChange={handleChange} style={{ width: '100%', cursor: 'pointer' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px', color: '#b45309' }}>
              <span>หาง (ltail)</span> <strong>{inputs.ltail}</strong>
            </label>
            <input type="range" name="ltail" min="5" max="60" step="1" value={inputs.ltail} onChange={handleChange} style={{ width: '100%', cursor: 'pointer', accentColor: '#d97706' }} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
              <span>จำนวนด้าน (n)</span> <strong>{inputs.n}</strong>
            </label>
            <input type="range" name="n" min="6" max="16" step="2" value={inputs.n} onChange={handleChange} style={{ width: '100%', cursor: 'pointer' }} />
          </div>
        </div>

        {/* 🎯 Slider ระดับการกาง (Theta) แยกอยู่ล่างสุด และกางเต็ม 100% */}
        <div style={{ paddingTop: '12px', borderTop: '2px solid #cbd5e1' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px', color: '#0369a1', fontWeight: 'bold' }}>
            <span>ระดับการกาง (Theta)</span> <span>{theta}°</span>
          </label>
          <input 
            type="range" 
            min="5" 
            max="90" 
            value={theta} 
            onChange={(e) => setTheta(parseFloat(e.target.value))} 
            style={{ width: '100%', cursor: 'pointer', accentColor: '#0ea5e9' }} 
          />
        </div>

      </div>

      {/* พื้นที่แสดงผล 2D และ 3D */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main, #333)' }}>📄 แผ่นคลี่ 2D</h3>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.8rem' }}>
                <option value="a5">A5</option><option value="a4">A4</option><option value="a3">A3</option><option value="letter">Letter</option><option value="legal">Legal</option>
              </select>
              <button onClick={handleDownloadPNG} style={{ padding: '4px 10px', backgroundColor: 'var(--maroon, #6b1d2a)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>📥 PNG</button>
              <button onClick={handleDownloadPDF} style={{ padding: '4px 10px', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>📄 PDF</button>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ width: '100%', height: 400, border: '1px solid var(--cream-dark, #e2d8c3)', borderRadius: 8, background: 'var(--white, #fff)', display: 'block' }} />
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--text-main, #333)' }}>🏮 พรีวิว 3D</h3>
          <LanternViewer3D 
            theta={theta} 
            a={inputs.a} 
            b={inputs.b} 
            hb={inputs.hb} 
            hm={inputs.hm} 
            ht={inputs.ht} 
            n={inputs.n} 
            ltail={inputs.ltail}
          />
        </div>
      </div>
    </section>
  )
}