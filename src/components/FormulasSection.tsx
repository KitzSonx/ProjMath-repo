'use client'

import React, { useState, useEffect } from 'react'
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'

type SubFormula = {
  latex: string;
  description?: string;
}

type FormulaData = {
  title: string;
  latex: string;
  subFormulas: SubFormula[];
}

const formulas: FormulaData[] = [
  {
    title: 'สูตรการหาปริมาตรโคมล้านนา',
    latex: 'V_{\\text{open}} = V_{\\text{บน}} + V_{\\text{กลาง}} + V_{\\text{ล่าง}}',
    subFormulas: [
      {
        latex: 'V_{\\text{แยกส่วน}} = \\frac{h}{6}(A_{\\text{บน}} + 4A_{\\text{กลาง}} + A_{\\text{ล่าง}})',
        description: '(สำหรับ V_บน และ V_ล่าง)'
      },
      {
        latex: 'V_{\\text{กลาง}} = KR^2h',
        description: ''
      }
    ]
  },
  {
    title: 'สูตรการหาพื้นที่ผิวโคมล้านนาแบบแยกส่วน',
    latex: 'A_{\\text{net}} = A_{\\text{rect}} + A_{\\text{kite}} + A_{\\text{top}} + A_{\\text{tail}} + A_{\\text{glue}}',
    subFormulas: [
      {
        latex: 'A_{\\text{rect}} = q(aH_s)',
        description: 'พื้นที่แผงสี่เหลี่ยม'
      },
      {
        latex: 'A_{\\text{kite}} = q(bh_m + \\frac{1}{2}bh_t + \\frac{1}{2}bh_b)',
        description: 'พื้นที่แผงว่าว'
      },
      {
        latex: 'A_{\\text{top}} = q(\\frac{1}{2}uh_a) \\quad \\text{เมื่อ } u = a',
        description: 'พื้นที่สามเหลี่ยมบน'
      },
      {
        latex: 'A_{\\text{tail}} = q(vL + \\frac{1}{2}vt_a) \\quad \\text{เมื่อ } v = a',
        description: 'พื้นที่หางล่าง'
      },
      {
        latex: 'A_{\\text{glue}} = gH_s',
        description: 'พื้นที่แถบกาว'
      }
    ]
  }
]

export default function FormulasSection() {
  const [selectedFormula, setSelectedFormula] = useState<FormulaData | null>(null);

  const closeModal = () => {
    setSelectedFormula(null);
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedFormula) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedFormula]);

  return (
    <section id="formulas" className="my-8">
      <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span className="icon">📐</span>สูตรสำคัญ
      </h2>
      <p style={{ marginBottom: '20px', color: '#64748b', fontSize: '0.95rem' }}>คลิกที่สูตรหลักเพื่อดูสูตรย่อย</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {formulas.map((item, index) => (
          <div 
            key={index} 
            onClick={() => setSelectedFormula(item)}
            style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #0284c7',
              padding: '20px', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <h3 style={{ 
              fontSize: '1.05rem', 
              margin: '0 0 16px 0', 
              color: '#334155', 
              display: 'flex', 
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between', 
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{item.title}</span>
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#0ea5e9', 
                fontWeight: 'normal', 
                background: '#e0f2fe', 
                padding: '4px 8px', 
                borderRadius: '12px',
                whiteSpace: 'nowrap'
              }}>
                คลิกดูสูตรย่อย
              </span>
            </h3>
            
            <div style={{ overflowX: 'auto', padding: '8px 0', pointerEvents: 'none' }}>
              <BlockMath math={item.latex} />
            </div>
          </div>
        ))}
      </div>

      {/* Pop-up Modal */}
      {selectedFormula && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          backdropFilter: 'blur(4px)',
          overscrollBehavior: 'contain'
        }} onClick={closeModal}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            animation: 'modalFadeIn 0.3s ease-out forwards',
            overscrollBehavior: 'contain'
          }} onClick={(e) => e.stopPropagation()}>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}} />
            
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0, color: 'var(--maroon)', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px', paddingRight: '20px' }}>
              {selectedFormula.title}
            </h3>
            
            <div style={{ 
              marginBottom: '24px', 
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '8px', 
              border: '1px dashed #cbd5e1',
              overflowX: 'auto',
              maxWidth: '100%'
            }}>
              <BlockMath math={selectedFormula.latex} />
            </div>

            <h4 style={{ color: '#334155', marginBottom: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>▶</span> สูตรย่อย:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedFormula.subFormulas.map((sub, idx) => (
                <div key={idx} style={{ 
                  background: '#f0fdf4', 
                  padding: '16px', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #10b981',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ 
                    overflowX: 'auto', 
                    maxWidth: '100%', 
                    marginBottom: sub.description ? '12px' : '0',
                    padding: '4px 0'
                  }}>
                    <BlockMath math={sub.latex} />
                  </div>
                  {sub.description && (
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#047857',
                      textAlign: 'center',
                      background: '#d1fae5',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      display: 'inline-block',
                      margin: '0 auto'
                    }}>
                      {sub.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}