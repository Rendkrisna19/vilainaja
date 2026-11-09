import { facilities } from '../../data/site'
import { useReveal } from '../../hooks/useReveal'
import styles from './Facilities.module.css'

export default function Facilities() {
  const ref = useReveal()

  return (
    <section id="fasilitas" className="container">
      <div
        ref={ref}
        className={`reveal ${styles.panel}`}
        style={{ '--bg': `url(${facilities.image})` }}
      >
        <div className={styles.copy}>
          <h2 className={styles.title}>
            {facilities.titleTop}
            <em>{facilities.titleItalic}</em>
          </h2>
          <p className={styles.text}>{facilities.text}</p>

          <ul className={styles.list}>
            {facilities.items.map((f) => (
              <li key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>

          <a href="#kontak" className={styles.btn}>Tanya fasilitas</a>
        </div>
      </div>
    </section>
  )
}
