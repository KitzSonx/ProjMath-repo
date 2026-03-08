import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>🏮 โครงงานคณิตศาสตร์ — โคมล้านนาพับเก็บได้จากกระดาษใยสับปะรด</p>
      <p>
        สร้างด้วย <span className={styles.heart}>♥</span> จากเชียงราย
      </p>
    </footer>
  )
}