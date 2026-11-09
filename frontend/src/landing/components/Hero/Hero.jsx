import { useEffect, useState } from 'react'
import { hero } from '../../data/site'
import Navbar from '../Navbar/Navbar'
import SearchBar from './SearchBar'
import styles from './Hero.module.css'

export default function Hero() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = hero.slides.length

  // muat semua gambar di awal supaya pergantian tidak berkedip
  useEffect(() => {
    hero.slides.forEach((s) => {
      const i = new Image()
      i.src = s.image
    })
  }, [])

  // auto-ganti; `active` ada di dependensi agar timer mulai ulang saat dipilih manual
  useEffect(() => {
    if (paused) return
    const id = setTimeout(() => setActive((a) => (a + 1) % total), hero.interval)
    return () => clearTimeout(id)
  }, [active, paused, total])

  return (
    <section className={styles.wrap}>
      <div
        className={`${styles.hero} ${paused ? styles.paused : ''}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {hero.slides.map((s, i) => (
          <img
            key={s.label}
            src={s.image}
            alt={i === active ? s.alt : ''}
            aria-hidden={i !== active}
            className={`${styles.slide} ${i === active ? styles.on : ''}`}
            fetchPriority={i === 0 ? 'high' : undefined}
          />
        ))}

        <div className={styles.copy}>
          <h1 className={styles.title}>
            {hero.titleTop}
            <em>{hero.titleItalic}</em>
          </h1>
          <p className={styles.text}>{hero.text}</p>
        </div>

        <div className={styles.dots} role="tablist" aria-label="Pilih suasana">
          {hero.slides.map((s, i) => (
            <button
              key={s.label}
              role="tab"
              aria-selected={i === active}
              className={`${styles.dot} ${i === active ? styles.dotOn : ''}`}
              onClick={() => setActive(i)}
            >
              <span>{s.label}</span>
              <i
                style={{ '--dur': `${hero.interval}ms` }}
              />
            </button>
          ))}
        </div>

        <SearchBar />
      </div>
      <Navbar />
    </section>
  )
}
