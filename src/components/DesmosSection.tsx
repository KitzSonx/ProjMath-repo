export default function DesmosSection() {
  return (
    <section id="desmos">
      <h2><span className="icon">📊</span>กราฟ Desmos</h2>
      <p>กราฟจำลองโคมล้านนาใน Desmos — ปรับค่าด้วย Slider ได้แบบ Real-time</p>

      <h3>กราฟ VRR(θ) = 1 − sin³θ</h3>
      <iframe
        className="desmos-frame"
        src="https://www.desmos.com/calculator/qsxkntrhps"
        frameBorder={0}
        allowFullScreen
      />

      <h3>ลิงก์ Desmos เพิ่มเติม</h3>
      <p>
        สามารถเปิดกราฟเต็มจอได้ที่{' '}
        <a
          href="https://www.desmos.com/calculator"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--maroon)', fontWeight: 600 }}
        >
          desmos.com/calculator
        </a>{' '}
        แล้ว copy สูตรจากหัวข้อ &quot;สูตรสำคัญ&quot; ไปวาง
      </p>
    </section>
  )
}