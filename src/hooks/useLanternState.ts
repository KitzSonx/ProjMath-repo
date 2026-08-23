import { useState, useCallback } from 'react'
import type { VolumeResult, FoldState } from '@/types/lantern'

export function useLanternState() {
  const [vOpen, setVOpen] = useState<number>(2957.75)
  const [theta, setTheta] = useState<number>(45)
  const [volumeResult, setVolumeResult] = useState<VolumeResult | null>(null)

  const foldState: FoldState = { theta, vOpen: 2957.75 }

  const updateVOpen = useCallback((v: number) => {
    setVOpen(v)
  }, [])

  // 🌟 สูตรตรงตามลายมือเล่มล่าสุด:
  // V(θ) = 1,734.01 + 1,223.74 * cot(θ)
  // V_open = V(45°) = 2,957.75
  const vMid = 1734.01
  const vTopBot = 1223.74
  const exactVOpen = 2957.75

  let cotT = 0
  let vTheta = 0
  let vrr = 0
  let isValid = true

  if (theta === 0) {
    isValid = false
  } else {
    const thetaRad = theta * (Math.PI / 180)
    cotT = 1 / Math.tan(thetaRad)
    vTheta = vMid + vTopBot * cotT
    const rawVrr = (1 - vTheta / exactVOpen) * 100
    vrr = Math.abs(rawVrr) < 0.0001 ? 0 : rawVrr
  }

  return {
    vOpen: exactVOpen,
    theta,
    setTheta,
    updateVOpen,
    volumeResult,
    setVolumeResult,
    foldState,
    cotT,
    sinT: cotT, // alias
    vTheta,
    vrr,
    isValid,
    vMid,
    vTopBot,
  }
}