'use client'

import React from 'react'
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'


const formulas = [
  { 
    title: 'ความสูงรวมของโคมล้านนา', 
    latex: 'H = \\sum_{i=0}^{m-1} h_i' 
  },
  { 
    title: 'สมการสำหรับรูป n เหลี่ยมปกติ', 
    latex: 'R = \\frac{s}{2 \\sin\\left(\\frac{\\pi}{n}\\right)}' 
  },
  { 
    title: 'สมการพื้นที่หน้าตัดของรูป n เหลี่ยมปกติ', 
    latex: 'A(R) = KR^2 \\quad \\text{เมื่อ} \\quad K = \\frac{n}{2} \\sin\\left(\\frac{2\\pi}{n}\\right)' 
  },
  { 
    title: 'สูตรการหาปริมาตรโคมตอนกาง (ผลรวมปริมาตรทุกชั้น)', 
    latex: 'V_{\\text{open}} = \\sum_{i=0}^{m-1} \\frac{h_i}{3} \\left( A(R_i) + A(R_{i+1}) + \\sqrt{A(R_i)A(R_{i+1})} \\right)' 
  },
  { 
    title: 'พื้นที่รูปคลี่ทั้งหมด', 
    latex: 'A_{\\text{net}} = A_{\\text{rect}} + A_{\\text{kite}} + A_{\\text{top}} + A_{\\text{tail}} + A_{\\text{glue}}' 
  },
]

export default function FormulasSection() {
  return (
    <section id="formulas" className="my-8">
      <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <span className="icon">📐</span>สูตรสำคัญ
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {formulas.map((item) => (
          <div key={item.title} style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #0284c7',
            padding: '20px', 
            borderRadius: '8px' 
          }}>
            <h3 style={{ fontSize: '1.05rem', margin: '0 0 16px 0', color: '#334155' }}>
              {item.title}
            </h3>
            
            <div style={{ overflowX: 'auto', padding: '8px 0' }}>
              <BlockMath math={item.latex} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}