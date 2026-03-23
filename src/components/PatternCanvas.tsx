'use client'

import { useRef, useEffect, useState } from 'react'
import LanternViewer3D from './LanternViewer3D'
import jsPDF from 'jspdf'
import type { PatternInputs } from '@/types/lantern'

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 ฟังก์ชันช่วยคำนวณและวาดรูปภาพแบบรักษาสเกล (Utilities) 🌟
// ─────────────────────────────────────────────────────────────────────────────

// 1. คำนวณพารามิเตอร์สำหรับวาด Aspect Fit
function getAspectFitParams(
  img: HTMLImageElement,
  targetRect: { x: number; y: number; width: number; height: number },
  paddingPercent: number = 0.1 // ระยะห่างจากขอบ (10%)
) {
  const { width: tW, height: tH, x: tX, y: tY } = targetRect;

  // 1. คำนวณพื้นที่ที่วาดได้จริงหลังหัก Padding
  const padW = tW * paddingPercent;
  const padH = tH * paddingPercent;
  const availW = tW - 2 * padW;
  const availH = tH - 2 * padH;

  if (availW <= 0 || availH <= 0) return null;

  // 2. คำนวณสเกลโดยเลือกด้านที่สั้นที่สุดของพื้นที่เป้าหมายเป็นเกณฑ์
  // เพื่อให้รูปไม่ยืดและพอดีภายใน
  const imgRatio = img.width / img.height;
  const availRatio = availW / availH;

  let drawW, drawH;
  if (availRatio > imgRatio) {
    // พื้นที่เป้าหมายกว้างกว่ารูป -> ฟิตตามความสูง
    drawH = availH;
    drawW = drawH * imgRatio;
  } else {
    // พื้นที่เป้าหมายสูงกว่ารูป -> ฟิตตามความกว้าง
    drawW = availW;
    drawH = drawW / imgRatio;
  }

  // 3. คำนวณตำแหน่ง x, y ให้อยู่ตรงกลางของ targetRect
  const finalX = tX + padW + (availW - drawW) / 2;
  const finalY = tY + padH + (availH - drawH) / 2;

  return { x: finalX, y: finalY, width: drawW, height: drawH };
}

// 2. วาดรูปภาพแบบ Aspect Fit ลงบน Context
function drawAspectFitImage(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  img: HTMLImageElement | null,
  targetRect: { x: number; y: number; width: number; height: number },
  paddingPercent: number = 0.1,
  globalAlpha: number = 0.8
) {
  if (!img || !img.complete || img.width === 0) return;

  const params = getAspectFitParams(img, targetRect, paddingPercent);
  if (!params) return;

  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; 
  ctx.globalAlpha = globalAlpha;
  ctx.drawImage(img, params.x, params.y, params.width, params.height);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// ฟังก์ชันกลางสำหรับวาด Pattern (ใช้ร่วมกันทั้งจอมอนิเตอร์ และ PDF)
// ─────────────────────────────────────────────────────────────────────────────
function renderPatternShapes(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  tx: (x: number) => number,
  ty: (y: number) => number,
  inputs: PatternInputs,
  lwScale: number = 1,
  patternImg: HTMLImageElement | null = null
) {
  const { a, b, hb, hm, ht, hspike, n, ltail } = inputs
  const q        = Math.round(n / 2)
  const Ht       = hb + hm + ht          
  const kiteW    = b
  const halfKite = kiteW / 2              
  const h_spike  = hspike
  const l_tail   = ltail
  const l_tail_tip = l_tail * 0.15
  const cellW  = a + kiteW

  // [ปรับแก้สเกล Papercraft]
  // คำนวณความยาวขอบเฉียงจริง (True Length) ตามทฤษฎีบทพีทาโกรัส
  const true_Lb = Math.sqrt(Math.pow(halfKite, 2) + Math.pow(hb, 2));
  const true_Lt = Math.sqrt(Math.pow(halfKite, 2) + Math.pow(ht, 2));

  // ปรับพิกัด Y ของแผงสีน้ำเงินให้ยืดออก เพื่อให้ขอบแนวตั้งยาวเท่ากับขอบเฉียงของสีแดง
  const blue_y0 = hb - true_Lb;        // จุดล่างสุดของตัวโคมสีน้ำเงิน
  const blue_y1 = hb;                  // รอยพับล่าง
  const blue_y2 = hb + hm;             // รอยพับบน
  const blue_y3 = hb + hm + true_Lt;   // จุดบนสุดของตัวโคมสีน้ำเงิน

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

    // ─────────────────────────────────────────────────────────────────────────
    // 1. วาดแผงน้ำเงิน
    // ─────────────────────────────────────────────────────────────────────────
    ctx.strokeStyle = '#2563EB'
    ctx.fillStyle   = 'rgba(37,99,235,0.07)'
    ctx.lineWidth   = 1 * lwScale
    ctx.beginPath()
    ctx.moveTo(tx(xL), ty(blue_y0))
    ctx.lineTo(tx(xL), ty(blue_y0 - l_tail))
    ctx.lineTo(tx(xL + a/2), ty(blue_y0 - (l_tail + l_tail_tip)))   
    ctx.lineTo(tx(xR), ty(blue_y0 - l_tail))
    ctx.lineTo(tx(xR), ty(blue_y0))
    ctx.lineTo(tx(xR), ty(blue_y3))
    ctx.lineTo(tx(xL + a/2), ty(blue_y3 + h_spike))            
    ctx.lineTo(tx(xL), ty(blue_y3))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 🌟 1.1 วาดรูปภาพบนแผงสีน้ำเงิน
    if (patternImg) {
      ctx.save();
      // Clip: ป้องกันลายล้นขอบเฉียงของแผงน้ำเงิน
      ctx.beginPath()
      ctx.moveTo(tx(xL), ty(blue_y0))
      ctx.lineTo(tx(xR), ty(blue_y0))
      ctx.lineTo(tx(xR), ty(blue_y3))
      ctx.lineTo(tx(xL), ty(blue_y3))
      ctx.closePath()
      ctx.clip(); 

      // -- แบ่ง 5 ส่วนและวาด --
      // กว้างของแผง (หน่วยอินพุต)
      const bW = a;
      // พิกัด X, Y ด้านซ้ายล่างของสี่เหลี่ยมเป้าหมาย (หน่วยอินพุต)
      const bX = xL;

      // ก. ส่วนบน (ระหว่าง blue_y2 ถึง blue_y3)
      const topRectInput = {
        x: bX,
        y: blue_y2, 
        width: bW,
        height: blue_y3 - blue_y2
      };
      // แปลงเป็นพิกัดหน้าจอ (Canvas Coordinates)
      const topRectScreen = {
        x: tx(topRectInput.x),
        y: ty(topRectInput.y + topRectInput.height), // ty() กลับด้าน Y
        width: topRectInput.width * (tx(cellW)-tx(0))/cellW, // คำนวณความกว้างหน้าจอจริง
        height: (ty(topRectInput.y) - ty(topRectInput.y + topRectInput.height))
      };
      // แก้ไขการคำนวณความกว้างหน้าจอให้ถูกต้องตามสเกล sc
      // เราใช้ tx(xR) - tx(xL) จะแม่นยำกว่า
      topRectScreen.width = tx(xR) - tx(xL);

      drawAspectFitImage(ctx, patternImg, topRectScreen, 0.1, 0.8);

      // ข. ส่วนล่าง (ระหว่าง blue_y0 ถึง blue_y1)
      const botRectInput = {
        x: bX,
        y: blue_y0,
        width: bW,
        height: blue_y1 - blue_y0
      };
      const botRectScreen = {
        x: tx(botRectInput.x),
        y: ty(botRectInput.y + botRectInput.height),
        width: tx(xR) - tx(xL),
        height: (ty(botRectInput.y) - ty(botRectInput.y + botRectInput.height))
      };
      drawAspectFitImage(ctx, patternImg, botRectScreen, 0.1, 0.8);
      
      ctx.restore();
    }

    // 2. เส้นพับแนวนอน
    ctx.strokeStyle = '#16A34A'
    ctx.lineWidth   = 0.8 * lwScale
    ctx.setLineDash([4 * lwScale, 3 * lwScale])
    ctx.beginPath()
    ctx.moveTo(tx(xL), ty(blue_y0)); ctx.lineTo(tx(xR), ty(blue_y0)) // พับฐานล่างสุด
    ctx.moveTo(tx(xL), ty(blue_y1)); ctx.lineTo(tx(xR), ty(blue_y1)) // พับช่วงล่าง
    ctx.moveTo(tx(xL), ty(blue_y2)); ctx.lineTo(tx(xR), ty(blue_y2)) // พับช่วงบน
    ctx.moveTo(tx(xL), ty(blue_y3)); ctx.lineTo(tx(xR), ty(blue_y3)) // พับยอดบนสุด
    ctx.stroke()
    ctx.setLineDash([])

    // ─────────────────────────────────────────────────────────────────────────
    // 3. วาดแผงแดง (ว่าว)
    // ─────────────────────────────────────────────────────────────────────────
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

    // 🌟 3.1 วาดรูปภาพบนแผงสีแดง (ส่วนกลาง)
    if (patternImg) {
      ctx.save();
      // Clip: ป้องกันลายล้นขอบเฉียงรูปว่าว
      ctx.beginPath()
      ctx.moveTo(tx(kCx), ty(0))        
      ctx.lineTo(tx(kL),  ty(hb))       
      ctx.lineTo(tx(kL),  ty(hb + hm)) 
      ctx.lineTo(tx(kCx), ty(Ht))       
      ctx.lineTo(tx(kR),  ty(hb + hm)) 
      ctx.lineTo(tx(kR),  ty(hb)) 
      ctx.closePath();
      ctx.clip();

      // แบ่ง 3 ส่วน: ส่วนกลางคือสี่เหลี่ยม kL, kR ระหว่าง y=hb ถึง y=hb+hm
      const kiteRectInput = {
        x: kL,
        y: hb,
        width: kiteW,
        height: hm
      };
      const kiteRectScreen = {
        x: tx(kiteRectInput.x),
        y: ty(kiteRectInput.y + kiteRectInput.height),
        width: tx(kR) - tx(kL),
        height: (ty(kiteRectInput.y) - ty(kiteRectInput.y + kiteRectInput.height))
      };
      // วาดรูปส่วนกลางแผงแดง
      drawAspectFitImage(ctx, patternImg, kiteRectScreen, 0.1, 0.8);

      ctx.restore();
    }

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
  const [patternImg, setPatternImg] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/thai-pattern.svg' // ตรวจสอบว่าไฟล์อยู่ใน public/thai-pattern.svg
    img.onload = () => {
      setPatternImg(img)
    }
  }, [])

  useEffect(() => {
    if (patternImg) drawPattern()
  }, [patternImg])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value)
    
    if (e.target.name === 'a' || e.target.name === 'b') {
      onChange({ ...inputs, a: val, b: val })
    } else {
      onChange({ ...inputs, [e.target.name]: val })
    }
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

    const { a, b, hb, hm, ht, hspike, n, ltail } = inputs
    const q        = Math.round(n / 2)
    const kiteW    = b  
    const h_spike  = hspike              
    const l_tail   = ltail
    const l_tail_tip = l_tail * 0.15
    const cellW  = a + kiteW
    
    // อัปเดตกรอบ Bounding Box ให้รองรับแผงสีน้ำเงินที่ยืดขึ้น/ลง
    const true_Lb = Math.sqrt(Math.pow(b/2, 2) + Math.pow(hb, 2));
    const true_Lt = Math.sqrt(Math.pow(b/2, 2) + Math.pow(ht, 2));
    const blue_y0 = hb - true_Lb;
    const blue_y3 = hb + hm + true_Lt;

    const minX = 0
    const maxX = cellW * q
    const minY = blue_y0 - (l_tail + l_tail_tip) 
    const maxY = blue_y3 + h_spike          
    const totalW = maxX - minX
    const totalH = maxY - minY

    const scX = (W  - 40) / (totalW || 1)
    const scY = (Hc - 40) / (totalH || 1)
    const sc  = Math.min(scX, scY)

    const ox = 20 + ((W  - 40) - totalW * sc) / 2
    const oy = 20 + ((Hc - 40) - totalH * sc) / 2 + maxY * sc

    const tx = (x: number) => ox + x * sc
    const ty = (y: number) => oy - y * sc  

    renderPatternShapes(ctx, tx, ty, inputs, 1, patternImg)

    // Legend
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
    const { a, b, hb, hm, ht, hspike, n, ltail } = inputs
    const q = Math.round(n / 2)
    const kiteW = b 
    const l_tail_tip = ltail * 0.15
    const cellW = a + kiteW

    const true_Lb = Math.sqrt(Math.pow(b/2, 2) + Math.pow(hb, 2));
    const true_Lt = Math.sqrt(Math.pow(b/2, 2) + Math.pow(ht, 2));
    const blue_y0 = hb - true_Lb;
    const blue_y3 = hb + hm + true_Lt;

    const minX = 0
    const maxX = cellW * q
    const minY = blue_y0 - (ltail + l_tail_tip)
    const maxY = blue_y3 + hspike
    
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
    renderPatternShapes(offCtx, tx, ty, inputs, lwScale, patternImg)

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
            { name:'ltail',  label:'หาง (ltail)',        min:0, max:50, step:0.1 },
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
          <LanternViewer3D
            a={inputs.a} b={inputs.b}
            hb={inputs.hb} hm={inputs.hm} ht={inputs.ht}
            hspike={inputs.hspike} 
            n={inputs.n} ltail={inputs.ltail} />
        </div>
      </div>
    </section>
  )
}