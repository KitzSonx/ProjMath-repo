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

      <h3 style={{ marginTop: '24px' }}>ลิงก์ Desmos เพิ่มเติม</h3>
      <p>
        สามารถเปิดกราฟเต็มจอได้ที่{' '}
        <a
          href="https://www.desmos.com/calculator/xzopvhc1yp"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--maroon)', fontWeight: 600 }}
        >
          desmos.com/calculator
        </a>{' '}
        แล้ว copy สูตรจากหัวข้อ &quot;สูตรสำคัญ&quot; ไปวาง
      </p>
    </section>
  )
}