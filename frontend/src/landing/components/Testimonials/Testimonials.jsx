import { testimonials } from '../../data/site'
import { Star } from '../ui/Icons'
import { useReveal } from '../../hooks/useReveal'
import styles from './Testimonials.module.css'

function Stars() {
  return (
    <div className={styles.stars} role="img" aria-label="Rating 5 dari 5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} width={15} height={15} />
      ))}
    </div>
  )
}

function Quote({ item }) {
  return (
    <figure className={`${styles.card} ${item.featured ? styles.featured : ''}`}>
      <Stars />
      <blockquote>{item.quote}</blockquote>
      <figcaption>
        <span className={styles.avatar} aria-hidden="true">
          {item.name.split(' ').map((w) => w[0]).join('')}
        </span>
        <span>
          <strong>{item.name}</strong>
          <small>{item.meta}</small>
        </span>
      </figcaption>
    </figure>
  )
}

export default function Testimonials() {
  const ref = useReveal()

  return (
    <section className={`container ${styles.section}`}>
      <div ref={ref} className="reveal">
        <div className={styles.head}>
          <div>
            <span className={styles.label}>{testimonials.label}</span>
            <h2 className={styles.title}>
              {testimonials.titleTop} <em>{testimonials.titleItalic}</em>
            </h2>
          </div>
          <p className={styles.score}>
            <strong>{testimonials.rating}</strong>
            <span>dari 5 · {testimonials.count} ulasan</span>
          </p>
        </div>

        <div className={styles.grid}>
          {testimonials.items.map((t) => (
            <Quote key={t.name} item={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
