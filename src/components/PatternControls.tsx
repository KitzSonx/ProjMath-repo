'use client'

import type { PatternInputs } from '@/types/lantern'

interface Props {
  inputs: PatternInputs
  onChange: (newInputs: PatternInputs) => void
}

export default function PatternControls({ inputs, onChange }: Props) {
  const handleChange = (field: keyof PatternInputs, value: number) => {
    onChange({ ...inputs, [field]: value })
  }

  return (
    <section className="container" style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', marginTop: '32px', color: '#333' }}>
      <h3 style={{ marginTop: 0, borderBottom: '2px solid #ddd', paddingBottom: '8px' }}>
        ⚙️ ปรับขนาดรูปคลี่ (2D Net)
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '16px' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>จำนวนแผง (n-เหลี่ยม): {inputs.n}</label>
          <input type="range" min="4" max="16" step="2" value={inputs.n} onChange={e => handleChange('n', Number(e.target.value))} style={{ width: '100%' }} />
        </div>
        
        <div>
          <label>กว้างแผงสี่เหลี่ยม (a): {inputs.a}</label>
          <input type="range" min="2" max="15" step="0.5" value={inputs.a} onChange={e => handleChange('a', Number(e.target.value))} style={{ width: '100%' }} />
        </div>
        
        <div>
          <label>กว้างแผงว่าว (b): {inputs.b}</label>
          <input type="range" min="2" max="15" step="0.5" value={inputs.b} onChange={e => handleChange('b', Number(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div>
          <label>สูงช่วงบน/หลังคา (ht): {inputs.ht}</label>
          <input type="range" min="0" max="15" step="0.5" value={inputs.ht} onChange={e => handleChange('ht', Number(e.target.value))} style={{ width: '100%' }} />
        </div>
        
        <div>
          <label>สูงช่วงกลาง (hm): {inputs.hm}</label>
          <input type="range" min="1" max="20" step="0.5" value={inputs.hm} onChange={e => handleChange('hm', Number(e.target.value))} style={{ width: '100%' }} />
        </div>
        
        <div>
          <label>สูงช่วงล่าง/ฐาน (hb): {inputs.hb}</label>
          <input type="range" min="0" max="15" step="0.5" value={inputs.hb} onChange={e => handleChange('hb', Number(e.target.value))} style={{ width: '100%' }} />
        </div>
      </div>
    </section>
  )
}