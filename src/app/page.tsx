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

// Default pattern inputs ใช้ร่วมกันระหว่าง PatternCanvas และ AreaCalculator
const DEFAULT_PATTERN: PatternInputs = { a: 6.5, b: 7, hb: 6.5, hm: 8.5, ht: 6.5, n: 8 }

export default function Home() {
  const { vOpen, theta, setTheta, updateVOpen, sinT, vTheta, vrr } = useLanternState()

  // patternInputs อยู่ที่ page level เพื่อแชร์ให้ AreaCalculator อ่านได้
  const [patternInputs] = useState<PatternInputs>(DEFAULT_PATTERN)

  return (
    <>
      <Hero />
      <Navbar />
      <div className="container">
        <AboutSection />
        <FormulasSection />

        {/* VolumeCalculator → เมื่อคำนวณแล้ว ส่ง V ไปอัพเดต vOpen ใน hook */}
        <VolumeCalculator onVolumeCalculated={updateVOpen} />

        {/* FoldSimulator → รับ vOpen และ theta จาก hook */}
        <FoldSimulator
          vOpen={vOpen}
          theta={theta}
          onThetaChange={setTheta}
          sinT={sinT}
          vTheta={vTheta}
          vrr={vrr}
        />

        <PatternCanvas />

        {/* AreaCalculator → รับ patternInputs เพื่อใช้ค่าเดียวกับ PatternCanvas */}
        <AreaCalculator patternInputs={patternInputs} />

        <DesmosSection />
      </div>
      <Footer />
    </>
  )
}