import styles from './Hero.module.css'

export default function Hero() {
  return (
    <div className={styles.hero}>
      <span className={styles.lanternIcon}>🏮</span>
      <h1 className={styles.title}>โคมล้านนาพับเก็บได้</h1>
      <p className={styles.subtitle}>
        การสร้างแบบจำลองเชิงคณิตศาสตร์ของโคมล้านนาแบบพับเก็บได้จากกระดาษใยสับปะรด
        <br />
        ด้วยเรขาคณิตรูปหลายเหลี่ยมปกติและฟังก์ชันตรีโกณมิติ
      </p>
      <p className={styles.engTitle}>
        Mathematical Modeling of Foldable Lanna Lanterns from Pineapple Fiber Paper
        <br />
        Using Regular Polygon Geometry and Trigonometric Functions
      </p>
    </div>
  )
}