import { useState, useCallback } from 'react'
import type { VolumeResult, FoldState } from '@/types/lantern'

export function useLanternState() {
  const [vOpen, setVOpen] = useState<number>(4386.02)
  const [theta, setTheta] = useState<number>(90)
  const [volumeResult, setVolumeResult] = useState<VolumeResult | null>(null)

  const foldState: FoldState = { theta, vOpen }

  const updateVOpen = useCallback((v: number) => {
    setVOpen(v)
  }, [])

  const thetaRad = theta * (Math.PI / 180)
  const sinT = Math.sin(thetaRad)
  const vTheta = vOpen * Math.pow(sinT, 3)
  const vrr = (1 - Math.pow(sinT, 3)) * 100

  return {
    vOpen,
    theta,
    setTheta,
    updateVOpen,
    volumeResult,
    setVolumeResult,
    foldState,
    sinT,
    vTheta,
    vrr,
  }
}