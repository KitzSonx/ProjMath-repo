const formulas = [
  { title: 'ค่าคงที่พื้นที่หน้าตัด', formula: 'K = (n/2) × sin(2π/n)' },
  { title: 'พื้นที่หน้าตัด n-เหลี่ยมปกติ', formula: 'A(R) = K × R²' },
  { title: 'ปริมาตรทรงตัดยอด (1 ชั้น)', formula: 'V = (h/3) × (A₁ + A₂ + √(A₁ × A₂))' },
  { title: 'ปริมาตรตามมุมกาง θ', formula: 'V(θ) = V_open × sin³θ' },
  { title: 'อัตราการลดปริมาตร', formula: 'VRR(θ) = 1 − sin³θ' },
]

export default function FormulasSection() {
  return (
    <section id="formulas">
      <h2><span className="icon">📐</span>สูตรสำคัญ</h2>
      {formulas.map((item) => (
        <div key={item.title}>
          <h3>{item.title}</h3>
          <div className="formula-box">{item.formula}</div>
        </div>
      ))}
    </section>
  )
}