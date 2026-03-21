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
import PatternControls from '@/components/PatternControls'

// 1. 👈 เพิ่ม hspike และ ltail ในค่าเริ่มต้น (Default) เพื่อไม่ให้เกิด Error ตอนโหลดครั้งแรก
const DEFAULT_PATTERN: PatternInputs = { 
  a: 6.5, b: 7, hb: 6.5, hm: 8.5, ht: 6.5, n: 8,
  hspike: 3.25, ltail: 30 
}

export default function Home() {
  const { vOpen, theta, setTheta, updateVOpen, sinT, vTheta, vrr } = useLanternState()

  const [patternInputs, setPatternInputs] = useState<PatternInputs>(DEFAULT_PATTERN)

  return (
    <>
      <Hero />
      <Navbar />
      <div className="container">
        <AboutSection />
        <FormulasSection />

        <VolumeCalculator onVolumeCalculated={updateVOpen} />

        {/* 2. 👈 จ่าย patternInputs และ setPatternInputs เข้าไปให้ PatternCanvas (หรือ PatternControls ขึ้นอยู่กับว่าคุณเอาฟอร์มกรอกตัวเลขไว้ที่ไหน) */}
        <PatternCanvas 
          inputs={patternInputs} 
          onChange={setPatternInputs} 
        />
        
        {/* หากฟอร์มกรอกตัวเลขของคุณอยู่ที่ PatternControls ให้เปิดใช้คอมโพเนนต์นี้แทน/คู่กัน แล้วส่ง Props ไปแบบเดียวกันครับ:
        <PatternControls 
          inputs={patternInputs} 
          onChange={setPatternInputs} 
        /> 
        */}
        
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