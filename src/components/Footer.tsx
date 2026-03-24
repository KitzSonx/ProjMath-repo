import styles from './Footer.module.css'

export default function Footer() {
  const siteId = "proj-math-repo.vercel.app" 

  return (
    <footer className={styles.footer}>
      <p className={styles.footerText}>
        <img 
          src="/iconn.png" 
          alt="Lanna Lantern" 
          className={styles.footerIcon} 
        />
        โครงงานคณิตศาสตร์ — โคมล้านนาพับเก็บได้
      </p>
      
      <p>
        สร้างด้วย <span className={styles.heart}>♥</span> จากเชียงราย
      </p>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src={`https://api.visitorbadge.io/api/visitors?path=${siteId}&label=ผู้เข้าชมเว็บ&labelColor=%23333333&countColor=%236b1d2a&style=flat`}
          alt="Visitor Count" 
          style={{ borderRadius: '4px' }}
        />
      </div>
    </footer>
  )
}