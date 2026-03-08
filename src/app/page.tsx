'use client'

import { useState } from 'react'
import type { PatternInputs } from '@/types/lantern'
import { useLanternState } from '@/hooks/useLanternState'

import Hero            from '@/components/Hero'
import Navbar          from '@/components/Navbar'
import AboutSection    from '@/components/AboutSection'
import FormulasSection from '@/components/FormulasSection'
import VolumeCalculator from '@/components/VolumeCalculator'
import FoldSimulator   from '@/components/FoldSimulator'
import PatternCanvas   from '@/components/PatternCanvas'
import AreaCalculator  from '@/components/AreaCalculator'
import DesmosSection   from '@/components/DesmosSection'
import Footer          from '@/components/Footer'
import PatternControls from '@/components/PatternControls' // 👈 Import เข้ามาใหม่

const DEFAULT_PATTERN: PatternInputs = { a: 6.5, b: 7, hb: 6.5, hm: 8.5, ht: 6.5, n: 8 }

export default function Home() {
  const { vOpen, theta, setTheta, updateVOpen, sinT, vTheta, vrr } = useLanternState()

  // 👈 เพิ่ม setPatternInputs เพื่อให้แผงควบคุมอัปเดตค่าได้
  const [patternInputs, setPatternInputs] = useState<PatternInputs>(DEFAULT_PATTERN)

  return (
    <>
      <Hero />
      <Navbar />
      <div className="container">
        <AboutSection />
        <FormulasSection />

        <VolumeCalculator onVolumeCalculated={updateVOpen} />

        <PatternCanvas />
        
        <FoldSimulator
          vOpen={vOpen}
          theta={theta}
          onThetaChange={setTheta}
          sinT={sinT}
          vTheta={vTheta}
          vrr={vrr}
          patternInputs={patternInputs} 
        />

        <AreaCalculator patternInputs={patternInputs} />

        <DesmosSection />
      </div>
      <Footer />
    </>
  )
}