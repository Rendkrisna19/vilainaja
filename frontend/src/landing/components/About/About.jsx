import { about } from '../../data/site'
import { useReveal } from '../../hooks/useReveal'
import styles from './About.module.css'

export default function About() {
  const ref = useReveal()

  return (
    <section id="tentang" className={`container ${styles.about}`}>
      <div ref={ref} className={`reveal ${styles.grid}`}>
        <span className={styles.label}>{about.label}</span>
        <div>
          <p className={styles.statement}>
            {about.parts.map((p, i) =>
              typeof p === 'string' ? p : <em key={i}>{p.em}</em>,
            )}
          </p>
          <dl className={styles.stats}>
            {about.stats.map((s) => (
              <div key={s.label}>
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
