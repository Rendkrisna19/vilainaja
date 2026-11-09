import { useId, useState } from 'react'
import { faq } from '../../data/site'
import { useReveal } from '../../hooks/useReveal'
import styles from './Faq.module.css'

function Item({ item, open, onToggle, id }) {
  return (
    <div className={`${styles.item} ${open ? styles.open : ''}`}>
      <h3>
        <button className={styles.q} onClick={onToggle} aria-expanded={open} aria-controls={`${id}-a`} id={`${id}-q`}>
          <span>{item.q}</span>
          <span className={styles.plus} aria-hidden="true"><i /><i /></span>
        </button>
      </h3>
      {/* grid-template-rows 0fr→1fr: animasi tinggi tanpa JavaScript */}
      <div className={styles.panel} id={`${id}-a`} role="region" aria-labelledby={`${id}-q`}>
        <div><p>{item.a}</p></div>
      </div>
    </div>
  )
}

export default function Faq() {
  const ref = useReveal()
  const uid = useId()
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className={`container ${styles.section}`}>
      <div ref={ref} className={`reveal ${styles.grid}`}>
        <div className={styles.intro}>
          <span className={styles.label}>{faq.label}</span>
          <h2 className={styles.title}>
            {faq.titleTop} <em>{faq.titleItalic}</em>
          </h2>
          <p className={styles.text}>{faq.text}</p>
          <a href="#kontak" className={styles.link}>Tanya langsung ↓</a>
        </div>

        <div className={styles.list}>
          {faq.items.map((item, i) => (
            <Item
              key={item.q}
              id={`${uid}-${i}`}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
