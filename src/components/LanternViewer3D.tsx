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
  theta, n = 8, a = 6.5, b = 7, hb = 6.5, hm = 8.5, ht = 6.5,
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
    scene.background = new THREE.Color(0x120608)
    scene.fog = new THREE.FogExp2(0x120608, 0.015)

    // ตั้งค่ากล้องเริ่มต้น
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 300)
    camera.position.set(0, 4, 45) // ขยับกล้องออกเพื่อให้เห็นทั้งหัวและหางตอนซูมออก
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0xffe0b0, 0.3))
    const topLight = new THREE.DirectionalLight(0xfff0d0, 0.5)
    topLight.position.set(3, 15, 8)
    topLight.castShadow = true
    scene.add(topLight)

    const candleLight = new THREE.PointLight(0xff9922, 0, 25)
    scene.add(candleLight)

    const lanternGroup = new THREE.Group()
    scene.add(lanternGroup)

    const materials = {
      paper: new THREE.MeshStandardMaterial({
        color: 0xfff0c0, emissive: 0xd0a040, roughness: 0.82, side: THREE.DoubleSide, transparent: true,
      }),
      edge: new THREE.LineBasicMaterial({ color: 0xc8943e }), 
      fold: new THREE.LineBasicMaterial({ color: 0x4a8a3a, transparent: true, opacity: 0.4 }),
      candle: new THREE.MeshStandardMaterial({ color: 0xffee88, emissive: 0xffcc33, emissiveIntensity: 4 })
    }

    engineRef.current = { scene, lanternGroup, candleLight, materials }

    // --- ระบบควบคุมมุมกล้องและการซูม ---
    let isDragging = false, prevX = 0, prevY = 0, rotY = 0, rotX = 0.15, animId: number
    let initialPinchDistance = -1

    const onDown = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length === 2) {
        // กรณีใช้ 2 นิ้วแตะ (เตรียมซูม)
        isDragging = false
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        initialPinchDistance = Math.hypot(dx, dy)
        return
      }
      // กรณีใช้ 1 นิ้ว หรือคลิกเมาส์ (เตรียมหมุน)
      isDragging = true
      const pt = 'touches' in e ? e.touches[0] : (e as MouseEvent)
      prevX = pt.clientX; prevY = pt.clientY
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      // จัดการการจีบนิ้วซูม (Pinch-to-zoom) สำหรับมือถือ
      if ('touches' in e && e.touches.length === 2) {
        e.preventDefault() // ป้องกันจอเลื่อน
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const distance = Math.hypot(dx, dy)
        
        if (initialPinchDistance > 0) {
          const delta = initialPinchDistance - distance
          camera.position.z += delta * 0.15 // ความเร็วในการซูมมือถือ
          camera.position.z = Math.max(15, Math.min(100, camera.position.z)) // จำกัดระยะซูม
        }
        initialPinchDistance = distance
        return
      }

      // จัดการการหมุน
      if (!isDragging) return
      const pt = 'touches' in e ? e.touches[0] : (e as MouseEvent)
      rotY += (pt.clientX - prevX) * 0.008
      rotX += (pt.clientY - prevY) * 0.005
      rotX = Math.max(-0.4, Math.min(0.6, rotX)) // จำกัดมุมก้มเงย
      prevX = pt.clientX; prevY = pt.clientY
    }

    const onUp = () => { 
      isDragging = false 
      initialPinchDistance = -1
    }

    // จัดการการซูมด้วยลูกกลิ้งเมาส์
    const onWheel = (e: WheelEvent) => {
      e.preventDefault() // ป้องกันหน้าเว็บเลื่อนขึ้นลง
      camera.position.z += e.deltaY * 0.05 // ความเร็วในการซูมเมาส์
      camera.position.z = Math.max(15, Math.min(100, camera.position.z)) // ล็อกระยะใกล้-ไกลสุด
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
      // ถ้าไม่ได้จับหมุน ให้โมเดลหมุนรอบตัวเองเบาๆ
      if (!isDragging && initialPinchDistance === -1) rotY += 0.004
      
      lanternGroup.rotation.y = rotY
      lanternGroup.rotation.x = rotX

      const baseIntensity = candleLight.userData.baseIntensity || 0
      candleLight.intensity = baseIntensity * (0.9 + Math.sin(Date.now() * 0.004) * 0.1)
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

  // 2. UPDATE GEOMETRY (ทำงานเมื่อ Props/Slider ขยับ)
  useEffect(() => {
    if (!engineRef.current) return
    const { lanternGroup, materials, candleLight } = engineRef.current

    while (lanternGroup.children.length > 0) {
      const child = lanternGroup.children[0] as any
      lanternGroup.remove(child)
      if (child.geometry) child.geometry.dispose()
    }

    const thetaRad = (theta * Math.PI) / 180
    const sinT = Math.sin(thetaRad)

    materials.paper.opacity = 0.75 + 0.2 * sinT
    materials.paper.emissiveIntensity = 0.15 + 0.4 * sinT

    const Ht_total = hb + hm + ht
    const sc = 14 / (Ht_total || 1) // สเกล 3D

    const A = a * sc, B = b * sc
    const Hb = hb * sc, Hm = hm * sc, Ht2 = ht * sc
    
    const H_total = Hb + Hm + Ht2
    const y_bot = -H_total / 2
    const y_mid1 = y_bot + Hb
    const y_mid2 = y_bot + Hb + Hm
    const y_top = y_bot + H_total

    const slice_angle = (2 * Math.PI) / n
    const delta_blue = (A / (A + B)) * slice_angle

    const R_end_max = A / (2 * Math.sin(slice_angle / 2)) 
    const R_mid_max = B === 0 ? R_end_max : B / (2 * Math.sin(((B) / (A + B)) * slice_angle / 2)) 

    const R_end = R_end_max * sinT
    const R_mid = R_mid_max * sinT

    for (let j = 0; j < n; j++) {
      const ang_base = j * slice_angle

      const ang_L_end = ang_base - slice_angle / 2
      const ang_R_end = ang_base + slice_angle / 2

      const ang_L_mid = ang_base - delta_blue / 2
      const ang_R_mid = ang_base + delta_blue / 2

      // ---- 1. วาดแผงสีน้ำเงิน ----
      const b_bot_L = new THREE.Vector3(R_end * Math.cos(ang_L_end), y_bot, R_end * Math.sin(ang_L_end))
      const b_bot_R = new THREE.Vector3(R_end * Math.cos(ang_R_end), y_bot, R_end * Math.sin(ang_R_end))

      const b_m1_L = new THREE.Vector3(R_mid * Math.cos(ang_L_mid), y_mid1, R_mid * Math.sin(ang_L_mid))
      const b_m1_R = new THREE.Vector3(R_mid * Math.cos(ang_R_mid), y_mid1, R_mid * Math.sin(ang_R_mid))

      const b_m2_L = new THREE.Vector3(R_mid * Math.cos(ang_L_mid), y_mid2, R_mid * Math.sin(ang_L_mid))
      const b_m2_R = new THREE.Vector3(R_mid * Math.cos(ang_R_mid), y_mid2, R_mid * Math.sin(ang_R_mid))

      const b_top_L = new THREE.Vector3(R_end * Math.cos(ang_L_end), y_top, R_end * Math.sin(ang_L_end))
      const b_top_R = new THREE.Vector3(R_end * Math.cos(ang_R_end), y_top, R_end * Math.sin(ang_R_end))

      addQuad(lanternGroup, [b_bot_L, b_bot_R, b_m1_R, b_m1_L], materials.paper) 
      addQuad(lanternGroup, [b_m1_L, b_m1_R, b_m2_R, b_m2_L], materials.paper) 
      addQuad(lanternGroup, [b_m2_L, b_m2_R, b_top_R, b_top_L], materials.paper) 

      // ---- 2. วาดแผงสีแดง (ประกอบตรงๆ) ----
      const ang_base_next = (j + 1) * slice_angle
      const ang_L_mid_next = ang_base_next - delta_blue / 2

      const b_next_m1_L = new THREE.Vector3(R_mid * Math.cos(ang_L_mid_next), y_mid1, R_mid * Math.sin(ang_L_mid_next))
      const b_next_m2_L = new THREE.Vector3(R_mid * Math.cos(ang_L_mid_next), y_mid2, R_mid * Math.sin(ang_L_mid_next))

      addTri(lanternGroup, b_bot_R, b_next_m1_L, b_m1_R, materials.paper)
      addQuad(lanternGroup, [b_m1_R, b_next_m1_L, b_next_m2_L, b_m2_R], materials.paper)
      addTri(lanternGroup, b_m2_R, b_next_m2_L, b_top_R, materials.paper)

      // 🌟 ---- 3. เพิ่มยอดสามเหลี่ยม (Crown Spikes) ที่ใหญ่และเรียวขึ้น ----
      const h_spike_ref = 9; // เพิ่มความสูงจากเดิม 3 เป็น 11 ให้ดูเด่นและเรียวขึ้นมาก
      const H_spike = h_spike_ref * sc; 
      // รวบปลายยอดเข้าหากึ่งกลาง (0.6 คือเอนเข้า 40%) เพื่อให้ทรงดูเพรียวขึ้น
      const R_spike_tip = R_end * 0.6; 
      
      const spikeTip = new THREE.Vector3(
        R_spike_tip * Math.cos(ang_base), 
        y_top + H_spike, 
        R_spike_tip * Math.sin(ang_base)
      );
      
      addTri(lanternGroup, b_top_L, spikeTip, b_top_R, materials.paper);
      addLine(lanternGroup, [b_top_L, spikeTip, b_top_R], materials.edge);

      // 🌟 ---- 4. วาดหาง (Hanging Tails) ----
      const l_tail_ref = 22; 
      const L_tail = l_tail_ref * sc; 
      const tip_prop = 0.15; 
      
      const t_botL_vert = new THREE.Vector3(b_bot_L.x, y_bot - L_tail, b_bot_L.z);
      const t_botR_vert = new THREE.Vector3(b_bot_R.x, y_bot - L_tail, b_bot_R.z);
      const decorativeTip = new THREE.Vector3(
        b_bot_L.clone().lerp(b_bot_R, 0.5).x, 
        y_bot - L_tail - L_tail * tip_prop, 
        b_bot_L.clone().lerp(b_bot_R, 0.5).z
      );

      addQuad(lanternGroup, [b_bot_L, b_bot_R, t_botR_vert, t_botL_vert], materials.paper);
      addTri(lanternGroup, t_botL_vert, decorativeTip, t_botR_vert, materials.paper);
      addLine(lanternGroup, [b_bot_L, t_botL_vert, decorativeTip, t_botR_vert, b_bot_R], materials.edge);

      // ---- 5. วาดเส้นขอบ (Lines) ตัวโคมหลัก ----
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

    const candleY = y_bot + Hb + Hm / 2
    const candleGeo = new THREE.SphereGeometry(0.22, 10, 10)
    const candle = new THREE.Mesh(candleGeo, materials.candle)
    candle.position.set(0, candleY, 0)
    lanternGroup.add(candle)

    candleLight.position.set(0, candleY, 0)
    candleLight.userData.baseIntensity = 2.5 * sinT * sinT
    candleLight.distance = 20 * sinT + 5

  }, [theta, n, a, b, hb, hm, ht])

  return (
    <div style={{ position: 'relative', marginTop: 16 }}>
      <div
        ref={mountRef}
        style={{
          width: '100%', height: 400, borderRadius: 12, overflow: 'hidden',
          background: '#120608', cursor: 'grab', userSelect: 'none',
        }}
      />
    </div>
  )
}