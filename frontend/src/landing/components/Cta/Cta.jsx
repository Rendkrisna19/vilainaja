import { cta } from '../../data/site'
import { ArrowUpRight } from '../ui/Icons'
import { useReveal } from '../../hooks/useReveal'
import styles from './Cta.module.css'

export default function Cta() {
  const ref = useReveal()

  return (
    <section className={`container ${styles.section}`}>
      <div ref={ref} className={`reveal ${styles.card}`}>
        <img src={cta.image} alt="Kolam renang resort dikelilingi pepohonan tropis" loading="lazy" />
        <div className={styles.content}>
          <h2 className={styles.title}>
            {cta.titleTop} <em>{cta.titleItalic}</em>
          </h2>
          <p>{cta.text}</p>
          <a href={cta.href} target="_blank" rel="noreferrer" className={styles.btn}>
            {cta.button}
            <ArrowUpRight width={16} height={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
