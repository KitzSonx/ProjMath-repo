import styles from './Navbar.module.css'

const navLinks = [
  { href: '#about', label: 'เกี่ยวกับ' },
  { href: '#formulas', label: 'สูตร' },
  { href: '#calc-volume', label: 'คำนวณปริมาตร' },
  { href: '#pattern', label: 'รูปคลี่' },
  { href: '#calc-fold', label: 'พับ–กาง' },
  { href: '#calc-area', label: 'พื้นที่กระดาษ' },
  { href: '#desmos', label: 'Desmos' },
]

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      {navLinks.map((link) => (
        <a key={link.href} href={link.href} className={styles.link}>
          {link.label}
        </a>
      ))}
    </nav>
  )
}