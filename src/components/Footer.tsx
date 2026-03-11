import styles from './Footer.module.css'

export default function Footer() {
  // ใช้แค่ชื่อโดเมน หรือ ID โปรเจกต์ที่ไม่ซ้ำใคร ไม่ต้องใส่ https:// แล้วครับ
  const siteId = "proj-math-repo.vercel.app" 

  return (
    <footer className={styles.footer}>
      <p>🏮 โครงงานคณิตศาสตร์ — โคมล้านนาพับเก็บได้จากกระดาษใยสับปะรด</p>
      <p>
        สร้างด้วย <span className={styles.heart}>♥</span> จากเชียงราย
      </p>

      {/* 👇 ส่วนตัวนับจำนวนผู้เข้าชม (Visitor Counter) 👇 */}
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <img 
          // เปลี่ยนสีได้ตรง labelColor (สีพื้นหลังตัวอักษร) และ countColor (สีพื้นหลังตัวเลข)
          // รหัสสี %23 คือเครื่องหมาย # (เช่น %236b1d2a คือ #6b1d2a)
          src={`https://api.visitorbadge.io/api/visitors?path=${siteId}&label=ผู้เข้าชมเว็บ&labelColor=%23333333&countColor=%236b1d2a&style=flat`}
          alt="Visitor Count" 
          style={{ borderRadius: '4px' }}
        />
      </div>
    </footer>
  )
}