import styles from './Footer.module.css'

export default function Footer() {
  // ใส่ URL เว็บไซต์จริงของคุณตรงนี้ (ถ้ายังไม่มี โฮสต์ ให้ตั้งชื่อโปรเจกต์ภาษาอังกฤษติดกันไปก่อนครับ)
  const siteUrl = "https://proj-math-repo.vercel.app/" 

  return (
    <footer className={styles.footer}>
      <p>🏮 โครงงานคณิตศาสตร์ — โคมล้านนาพับเก็บได้จากกระดาษใยสับปะรด</p>
      <p>
        สร้างด้วย <span className={styles.heart}>♥</span> จากเชียงราย
      </p>

      {/* 👇 ส่วนตัวนับจำนวนผู้เข้าชม (Visitor Counter) 👇 */}
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <img 
          // เปลี่ยนสีได้ตรง title_bg (สีพื้นหลังตัวอักษร) และ count_bg (สีพื้นหลังตัวเลข)
          src={`https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=${siteUrl}&title=ผู้เข้าชมเว็บ&title_bg=%23333333&count_bg=%236b1d2a&icon=&icon_color=%23E7E7E7&edge_flat=false`}
          alt="Visitor Count" 
          style={{ borderRadius: '4px' }}
        />
      </div>
    </footer>
  )
}