'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  theta: number
  n?: number
  a?: number
  b?: number
  hb?: number
  hm?: number
  ht?: number
  ltail?: number 
}

// Helpers functions
function addQuad(group: THREE.Group, pts: THREE.Vector3[], mat: THREE.Material) {
  const [a, b, c, d] = pts
  const geo = new THREE.BufferGeometry()
  const verts = new Float32Array([
    a.x, a.y, a.z,  b.x, b.y, b.z,  c.x, c.y, c.z,
    a.x, a.y, a.z,  c.x, c.y, c.z,  d.x, d.y, d.z,
  ])
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
  geo.computeVertexNormals()
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = true
  group.add(mesh)
}

function addTri(group: THREE.Group, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, mat: THREE.Material) {
  const geo = new THREE.BufferGeometry()
  const verts = new Float32Array([
    a.x, a.y, a.z,  b.x, b.y, b.z,  c.x, c.y, c.z,
  ])
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
  geo.computeVertexNormals()
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = true
  group.add(mesh)
}

function addLine(group: THREE.Group, pts: THREE.Vector3[], mat: THREE.Material) {
  const geo = new THREE.BufferGeometry().setFromPoints(pts)
  group.add(new THREE.Line(geo, mat))
}

export default function LanternViewer3D({
  theta, n = 8, a = 6.5, b = 7, hb = 6.5, hm = 8.5, ht = 6.5, ltail = 30
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<{
    scene: THREE.Scene, lanternGroup: THREE.Group, candleLight: THREE.PointLight, materials: any
  } | null>(null)

  // 1. SETUP ENGINE (ทำงานครั้งเดียวตอนโหลด Component)
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth || 600
    const H = 400

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xFFFFFF) 

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 300)
    camera.position.set(0, 4, 45) 
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6)) 
    const topLight = new THREE.DirectionalLight(0xffffff, 1.0) 
    topLight.position.set(5, 20, 10)
    topLight.castShadow = true
    scene.add(topLight)

    const candleLight = new THREE.PointLight(0xffaa55, 0, 30) 
    scene.add(candleLight)

    const lanternGroup = new THREE.Group()
    scene.add(lanternGroup)

    const materials = {
      paperPaleRed: new THREE.MeshStandardMaterial({
        color: 0xFFB3C6, emissive: 0xE07090, emissiveIntensity: 0.3,
        roughness: 0.75, side: THREE.DoubleSide, transparent: true, opacity: 0.92,
      }),
      paperPaleBlue: new THREE.MeshStandardMaterial({
        color: 0xB3D4FF, emissive: 0x6699DD, emissiveIntensity: 0.25,
        roughness: 0.75, side: THREE.DoubleSide, transparent: true, opacity: 0.92,
      }),
      edge: new THREE.LineBasicMaterial({ color: 0xD4955A, linewidth: 2 }),
      fold: new THREE.LineBasicMaterial({ color: 0x6BBF7A, linewidth: 1.5, transparent: true, opacity: 0.6 }),
      candle: new THREE.MeshStandardMaterial({ color: 0xFFE066, emissive: 0xFFD700, emissiveIntensity: 3.5 })
    }

    engineRef.current = { scene, lanternGroup, candleLight, materials }

    let isDragging = false, prevX = 0, prevY = 0, rotY = 0, rotX = 0.15, animId: number
    let initialPinchDistance = -1

    const onDown = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length === 2) {
        isDragging = false
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        initialPinchDistance = Math.hypot(dx, dy)
        return
      }
      isDragging = true
      const pt = 'touches' in e ? e.touches[0] : (e as MouseEvent)
      prevX = pt.clientX; prevY = pt.clientY
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length === 2) {
        e.preventDefault() 
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const distance = Math.hypot(dx, dy)
        
        if (initialPinchDistance > 0) {
          const delta = initialPinchDistance - distance
          camera.position.z += delta * 0.15 
          camera.position.z = Math.max(15, Math.min(100, camera.position.z)) 
        }
        initialPinchDistance = distance
        return
      }

      if (!isDragging) return
      const pt = 'touches' in e ? e.touches[0] : (e as MouseEvent)
      rotY += (pt.clientX - prevX) * 0.008
      rotX += (pt.clientY - prevY) * 0.005
      rotX = Math.max(-0.4, Math.min(0.6, rotX)) 
      prevX = pt.clientX; prevY = pt.clientY
    }

    const onUp = () => { 
      isDragging = false 
      initialPinchDistance = -1
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault() 
      camera.position.z += e.deltaY * 0.05 
      camera.position.z = Math.max(15, Math.min(100, camera.position.z)) 
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onDown)
    dom.addEventListener('touchstart', onDown, { passive: false })
    window.addEventListener('mousemove', onMove, { passive: false })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    dom.addEventListener('wheel', onWheel, { passive: false })

    function animate() {
      animId = requestAnimationFrame(animate)
      if (!isDragging && initialPinchDistance === -1) rotY += 0.004
      
      lanternGroup.rotation.y = rotY
      lanternGroup.rotation.x = rotX

      const baseIntensity = candleLight.userData.baseIntensity || 0
      candleLight.intensity = baseIntensity * (0.95 + Math.sin(Date.now() * 0.005) * 0.05)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      
      dom.removeEventListener('mousedown', onDown)
      dom.removeEventListener('touchstart', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
      dom.removeEventListener('wheel', onWheel)

      if (mount && dom.parentNode === mount) mount.removeChild(dom)
    }
  }, [])

  // 2. UPDATE GEOMETRY (คำนวณแบบ Rigid Body ตามมุมยอด)
  useEffect(() => {
    if (!engineRef.current) return
    const { lanternGroup, materials, candleLight } = engineRef.current

    while (lanternGroup.children.length > 0) {
      const child = lanternGroup.children[0] as any
      lanternGroup.remove(child)
      if (child.geometry) child.geometry.dispose()
    }

    // 🎯 แปลงค่าจาก มุมยอด (Apex) เป็น มุมฐาน (Base Angle) ที่แกน Y
    // มุมยอด 0° -> มุมฐาน 90° | มุมยอด 90° -> มุมฐาน 45° | มุมยอด 180° -> มุมฐาน 0°
    const baseAngleDeg = (180 - theta) / 2
    const baseThetaRad = (baseAngleDeg * Math.PI) / 180
    
    // ปรับความสว่างวัสดุตามการกาง
    const baseEmissive = 0.4
    const emissiveRange = 0.4
    const sinT = Math.sin(baseThetaRad) // ใช้ baseThetaRad ในการสะท้อนแสง
    materials.paperPaleRed.emissiveIntensity = baseEmissive + emissiveRange * sinT
    materials.paperPaleBlue.emissiveIntensity = baseEmissive + emissiveRange * sinT

    const Ht_total = hb + hm + ht
    const sc = 14 / (Ht_total || 1) 

    const A = a * sc
    const H_b = hb * sc
    const H_m = hm * sc
    const H_t = ht * sc

    // 🎯 แก้บัคโครงสร้างเบี้ยว: 
    // ใช้ความยาวของด้านที่ "สั้นที่สุด" ระหว่างช่วงบนและล่าง เป็นข้อจำกัดการกาง (delta_R)
    const max_fold = Math.min(H_t, H_b)
    const delta_R = max_fold * Math.cos(baseThetaRad) 

    // พีทาโกรัสหาความสูงในแกน Y ของทั้งส่วนบนและล่าง
    const Y_t = Math.sqrt(Math.max(0.001, H_t * H_t - delta_R * delta_R))
    const Y_b = Math.sqrt(Math.max(0.001, H_b * H_b - delta_R * delta_R))
    const Y_m = H_m 

    const numPairs = Math.max(1, Math.round(n / 2)) 
    const slice_angle = (2 * Math.PI) / numPairs

    const R_end = A / (2 * Math.sin(slice_angle / 2)) 
    const R_mid = R_end + delta_R 

    const H_total = Y_b + Y_m + Y_t
    const y_bot = -H_total / 2
    const y_mid1 = y_bot + Y_b
    const y_mid2 = y_mid1 + Y_m
    const y_top = y_mid2 + Y_t

    const delta_blue = 2 * Math.asin(Math.min(1, A / (2 * R_mid)))

    for (let j = 0; j < numPairs; j++) {
      const ang_base = j * slice_angle

      const ang_L_end = ang_base - slice_angle / 2
      const ang_R_end = ang_base + slice_angle / 2

      const ang_L_mid = ang_base - delta_blue / 2
      const ang_R_mid = ang_base + delta_blue / 2

      const b_bot_L = new THREE.Vector3(R_end * Math.cos(ang_L_end), y_bot, R_end * Math.sin(ang_L_end))
      const b_bot_R = new THREE.Vector3(R_end * Math.cos(ang_R_end), y_bot, R_end * Math.sin(ang_R_end))

      const b_m1_L = new THREE.Vector3(R_mid * Math.cos(ang_L_mid), y_mid1, R_mid * Math.sin(ang_L_mid))
      const b_m1_R = new THREE.Vector3(R_mid * Math.cos(ang_R_mid), y_mid1, R_mid * Math.sin(ang_R_mid))

      const b_m2_L = new THREE.Vector3(R_mid * Math.cos(ang_L_mid), y_mid2, R_mid * Math.sin(ang_L_mid))
      const b_m2_R = new THREE.Vector3(R_mid * Math.cos(ang_R_mid), y_mid2, R_mid * Math.sin(ang_R_mid))

      const b_top_L = new THREE.Vector3(R_end * Math.cos(ang_L_end), y_top, R_end * Math.sin(ang_L_end))
      const b_top_R = new THREE.Vector3(R_end * Math.cos(ang_R_end), y_top, R_end * Math.sin(ang_R_end))

      addQuad(lanternGroup, [b_bot_L, b_bot_R, b_m1_R, b_m1_L], materials.paperPaleBlue) 
      addQuad(lanternGroup, [b_m1_L, b_m1_R, b_m2_R, b_m2_L], materials.paperPaleBlue) 
      addQuad(lanternGroup, [b_m2_L, b_m2_R, b_top_R, b_top_L], materials.paperPaleBlue) 

      const ang_base_next = (j + 1) * slice_angle
      const ang_L_mid_next = ang_base_next - delta_blue / 2

      const b_next_m1_L = new THREE.Vector3(R_mid * Math.cos(ang_L_mid_next), y_mid1, R_mid * Math.sin(ang_L_mid_next))
      const b_next_m2_L = new THREE.Vector3(R_mid * Math.cos(ang_L_mid_next), y_mid2, R_mid * Math.sin(ang_L_mid_next))

      addTri(lanternGroup, b_bot_R, b_next_m1_L, b_m1_R, materials.paperPaleRed)
      addQuad(lanternGroup, [b_m1_R, b_next_m1_L, b_next_m2_L, b_m2_R], materials.paperPaleRed)
      addTri(lanternGroup, b_m2_R, b_next_m2_L, b_top_R, materials.paperPaleRed)

      const h_spike_ref = 9 
      const H_spike = h_spike_ref * sc 
      const R_spike_tip = R_end * 0.6 
      const spikeTip = new THREE.Vector3(R_spike_tip * Math.cos(ang_base), y_top + H_spike, R_spike_tip * Math.sin(ang_base))
      addTri(lanternGroup, b_top_L, spikeTip, b_top_R, materials.paperPaleBlue)
      addLine(lanternGroup, [b_top_L, spikeTip, b_top_R], materials.edge)

      const L_tail = ltail * sc 
      const tip_prop = 0.15 
      const t_botL_vert = new THREE.Vector3(b_bot_L.x, y_bot - L_tail, b_bot_L.z)
      const t_botR_vert = new THREE.Vector3(b_bot_R.x, y_bot - L_tail, b_bot_R.z)
      const decorativeTip = new THREE.Vector3(
        b_bot_L.clone().lerp(b_bot_R, 0.5).x, 
        y_bot - L_tail - L_tail * tip_prop, 
        b_bot_L.clone().lerp(b_bot_R, 0.5).z
      )

      addQuad(lanternGroup, [b_bot_L, b_bot_R, t_botR_vert, t_botL_vert], materials.paperPaleBlue)
      addTri(lanternGroup, t_botL_vert, decorativeTip, t_botR_vert, materials.paperPaleBlue)
      addLine(lanternGroup, [b_bot_L, t_botL_vert, decorativeTip, t_botR_vert, b_bot_R], materials.edge)

      addLine(lanternGroup, [b_bot_L, b_m1_L, b_m2_L, b_top_L], materials.edge)
      addLine(lanternGroup, [b_bot_R, b_m1_R, b_m2_R, b_top_R], materials.edge)
      addLine(lanternGroup, [b_bot_L, b_bot_R], materials.edge)
      addLine(lanternGroup, [b_top_L, b_top_R], materials.edge)

      addLine(lanternGroup, [b_m1_L, b_m1_R], materials.fold)
      addLine(lanternGroup, [b_m2_L, b_m2_R], materials.fold)
      addLine(lanternGroup, [b_bot_R, b_next_m1_L], materials.fold)
      addLine(lanternGroup, [b_m1_R, b_next_m1_L], materials.fold)
      addLine(lanternGroup, [b_m2_R, b_next_m2_L], materials.fold)
      addLine(lanternGroup, [b_top_R, b_next_m2_L], materials.fold)
    }

    const candleY = y_bot + Y_b + Y_m / 2
    const candleGeo = new THREE.SphereGeometry(0.22, 10, 10)
    const candle = new THREE.Mesh(candleGeo, materials.candle)
    candle.position.set(0, candleY, 0)
    lanternGroup.add(candle)

    candleLight.position.set(0, candleY, 0)
    candleLight.userData.baseIntensity = 8.0 
    candleLight.distance = 25

  }, [theta, n, a, b, hb, hm, ht, ltail]) 

  return (
    <div style={{ position: 'relative', marginTop: 16 }}>
      <div
        ref={mountRef}
        style={{
          width: '100%', height: 400, borderRadius: 12, overflow: 'hidden',
          background: '#FFFFFF', cursor: 'grab', userSelect: 'none',
        }}
      />
    </div>
  )
}