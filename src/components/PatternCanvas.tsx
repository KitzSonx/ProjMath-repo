'use client'

import { useRef, useEffect, useState } from 'react'
import type { PatternInputs } from '@/types/lantern'
import LanternViewer3D from './LanternViewer3D'
import jsPDF from 'jspdf'

const DEFAULT: PatternInputs = { a: 6.5, b: 7, hb: 6.5, hm: 8.5, ht: 6.5, n: 8 }

export default function PatternCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inputs, setInputs] = useState<PatternInputs>(DEFAULT)
  const [theta, setTheta] = useState<number>(90)

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

    // พื้นหลังสีขาวสำหรับ ปริ้น/ดาวน์โหลด
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    const { a, b, hb, hm, ht, n } = inputs
    const q = n / 2
    const Ht = hb + hm + ht
    const P = a + b
    
    // ค่าความสูงของส่วนหัวและส่วนหาง (อิงตาม 3D)
    const h_spike = 9
    const l_tail = 22
    const l_tail_tip = l_tail * 0.15 

    const max_y = Ht + h_spike
    const min_y = -(l_tail + l_tail_tip)

    const totalW = q * P + 2
    const totalH = (max_y - min_y) + 15 

    const scaleX = (W - 40) / totalW
    const scaleY = (H - 40) / totalH
    const sc = Math.min(scaleX, scaleY)

    const ox = 20 + ((W - 40) - totalW * sc) / 2
    const oy = 20 + ((H - 40) - totalH * sc) / 2

    const tx = (x: number) => ox + x * sc
    const ty = (y: number) => oy + (max_y - y) * sc

    ctx.lineWidth = 1

    for (let j = 0; j < q; j++) {
      const d = j * P

      // 1. Rectangle panel (Blue) + Crown Spikes + Hanging Tails
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

      // 2. Kite panel (Red)
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

      // 3. Fold lines (dashed green)
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

    // Legend
    ctx.fillStyle = '#6B1D2A'
    ctx.font = `11px 'Noto Sans Thai'`
    ctx.textAlign = 'center'
    ctx.fillText('■ ชิ้นส่วนหลัก+หาง', W * 0.25, H - 8)
    ctx.fillStyle = '#DC2626'
    ctx.fillText('◆ ว่าว', W * 0.5, H - 8)
    ctx.fillStyle = '#16A34A'
    ctx.fillText('--- เส้นพับ', W * 0.75, H - 8)
  }

  // ฟังก์ชันเช็กว่าเป็นมือถือ/แท็บเล็ตหรือไม่
  function isMobileDevice() {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    // ตรวจจับ iOS, Android และอุปกรณ์พกพาอื่นๆ
    const isMobileString = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    // ตรวจจับ iPad รุ่นใหม่ที่หลอกตัวตนว่าเป็น Mac
    const isMacMobile = navigator.maxTouchPoints > 1 && /macintosh/i.test(userAgent);
    return isMobileString || isMacMobile;
  }

  // ฟังก์ชันดาวน์โหลด PNG
  async function handleDownloadPNG() {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return
      const fileName = `lantern-pattern-n${inputs.n}.png`
      const file = new File([blob], fileName, { type: 'image/png' })
      const isMobile = isMobileDevice()

      // ถ้าเป็นมือถือ/แท็บเล็ต และรองรับ Share ให้ใช้ Share
      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Lantern Pattern',
            text: 'แบบแปลนรูปคลี่โคมล้านนา'
          })
        } catch (error) {
          console.log('Share cancelled', error)
        }
      } else {
        // ถ้าเป็นคอมพิวเตอร์ (PC/Mac) ให้โหลดตรงๆ ทันที
        const imageURL = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = imageURL
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(imageURL)
      }
    }, 'image/png')
  }

  // ฟังก์ชันดาวน์โหลด PDF
  async function handleDownloadPDF() {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

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

    const fileName = `lantern-pattern-n${inputs.n}.pdf`
    const isMobile = isMobileDevice()

    if (isMobile && navigator.canShare) {
      const pdfBlob = pdf.output('blob')
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' })
      
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Lantern Pattern PDF'
          })
          return; // ออกจากฟังก์ชันถ้าแชร์สำเร็จ
        } catch (error) {
          console.log('Share cancelled', error)
        }
      }
    }
    
    // ถ้าไม่ใช่ชุดมือถือ หรือ Share ไม่สำเร็จ/ไม่รองรับ ให้เซฟไฟล์ตรงๆ ทันที
    pdf.save(fileName)
  }

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
      <h2><span className="icon">✂️</span>จำลองและปรับแต่งโคม (Pattern & 3D)</h2>
      <p>ปรับสัดส่วนเพื่อดูรูปคลี่และโมเดล 3D แบบเรียลไทม์</p>

      {/* แผงควบคุมพารามิเตอร์ */}
      <div className="calc-grid" style={{ marginBottom: '24px' }}>
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
          <label>จำนวนด้าน (n)</label>
          <select name="n" value={inputs.n} onChange={handleChange}>
            <option value={6}>6</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={12}>12</option>
          </select>
        </div>
      </div>

      {/* แถบเลื่อนสำหรับการกางโคม 3D */}
      <div style={{ marginBottom: '24px', background: 'var(--cream-light, #fdfbf7)', padding: '16px', borderRadius: '8px' }}>
        <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
          <span>ระดับการกางของโคม (Theta)</span>
          <span>{theta}°</span>
        </label>
        <input 
          type="range" 
          min="5" 
          max="90" 
          value={theta} 
          onChange={(e) => setTheta(parseFloat(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      {/* พื้นที่แสดงผล 2D และ 3D */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '24px' 
      }}>
        {/* ฝั่งซ้าย: รูปคลี่ 2D */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main, #333)' }}>
              📄 แผ่นคลี่ 2D
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleDownloadPNG}
                style={{
                  padding: '6px 12px', backgroundColor: 'var(--maroon, #6b1d2a)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'
                }}
              >
                📥 PNG
              </button>
              <button 
                onClick={handleDownloadPDF}
                style={{
                  padding: '6px 12px', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'
                }}
              >
                📄 PDF
              </button>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 400,
              border: '1.5px solid var(--cream-dark, #e2d8c3)',
              borderRadius: 12,
              background: 'var(--white, #fff)',
              display: 'block',
            }}
          />
        </div>

        {/* ฝั่งขวา: โมเดล 3D */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-main, #333)' }}>
            🏮 พรีวิว 3D (ซูมและลากเมาส์เพื่อหมุน)
          </h3>
          <div style={{ marginTop: '-16px' }}>
            <LanternViewer3D 
              theta={theta} 
              a={inputs.a} 
              b={inputs.b} 
              hb={inputs.hb} 
              hm={inputs.hm} 
              ht={inputs.ht} 
              n={inputs.n} 
            />
          </div>
        </div>
      </div>
    </section>
  )
}