import styles from './Hero.module.css'

export default function Hero() {
  return (
    <div className={styles.hero}>
      <img 
          src="/logo.png"
          alt="Lanna Lantern Icon"
          className={styles.lanternImg} 
        />
      <h1 className={styles.title}>โคมล้านนาพับเก็บได้</h1>
      <p className={styles.subtitle}>
        การประยุกต์ความสัมพันธ์ทางคณิตศาสตร์ในการสร้างแบบจำลองรูปคลี่โคมล้านนาแบบพับได้
        <br />
        ด้วยเรขาคณิตรูปหลายเหลี่ยมปกติและฟังก์ชันตรีโกณมิติ
      </p>
      <p className={styles.engTitle}>
        Applying Mathematical Relationships to Model the Net Pattern of Foldable Lanna Lanterns
        <br />
        Using Regular Polygon Geometry and Trigonometric Functions
      </p>
    </div>
  )
}