'use client'

import React from 'react'
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'

export default function DesmosSection() {
  return (
    <section id="desmos">
      <h2><span className="icon">📊</span>กราฟ Desmos</h2>
      <p>กราฟจำลองโคมล้านนาใน Desmos — ปรับค่าด้วย Slider ได้แบบ Real-time</p>

      <h3>กราฟพื้นที่รูปคลี่ทั้งหมด</h3>
      
      {/* 👈 ใช้ KaTeX แสดงผลสูตรตรงนี้ */}
      <div style={{ margin: '16px 0', overflowX: 'auto' }}>
        <BlockMath math="A_{\text{net}} = A_{\text{rect}} + A_{\text{kite}} + A_{\text{top}} + A_{\text{tail}} + A_{\text{glue}}" />
      </div>

      <iframe
        className="desmos-frame"
        src="https://www.desmos.com/calculator/xzopvhc1yp"
        frameBorder={0}
        allowFullScreen
        style={{ width: '100%', height: '400px', borderRadius: '8px', border: '1px solid #ccc' }}
      />

      <h3 style={{ marginTop: '24px' }}>ลิงก์ Desmos และวิดีโอเพิ่มเติม</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <li style={{ color: 'var(--text-color, #334155)', lineHeight: 1.6 }}>
          สามารถเปิดกราฟเต็มจอได้ที่{' '}
          <a
            href="https://www.desmos.com/calculator/xzopvhc1yp"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--maroon)', fontWeight: 600, textDecoration: 'underline' }}
          >
            desmos.com/calculator
          </a>{' '}
          แล้ว copy สูตรจากหัวข้อ &quot;สูตรสำคัญ&quot; ไปวาง
        </li>
        <li style={{ color: 'var(--text-color, #334155)', lineHeight: 1.6 }}>
          <strong>วิธีการใช้งานเว็บไซต์:</strong>{' '}
          <a
            href="https://drive.google.com/drive/folders/1P4ff3QhcIz24eC3Aqxq5oSsfFaKLM-BZ"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--maroon)', fontWeight: 600, textDecoration: 'underline' }}
          >
            drive.google.com (วิธีการใช้งานเว็บไซต์)
          </a>
        </li>
        <li style={{ color: 'var(--text-color, #334155)', lineHeight: 1.6 }}>
          <strong>วิธีการจัดทรงโคมล้านนาแบบพับได้:</strong>{' '}
          <a
            href="https://drive.google.com/drive/folders/1i3IOGHnJ_lW1huQPFeXpA8EYYw4SXcpB"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--maroon)', fontWeight: 600, textDecoration: 'underline' }}
          >
            drive.google.com (วิธีจัดทรงโคมล้านนาพับเก็บได้)
          </a>
        </li>
      </ul>
    </section>
  )
}