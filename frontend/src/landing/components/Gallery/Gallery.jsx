import { gallery } from '../../data/site'
import { ArrowUpRight } from '../ui/Icons'
import { useReveal } from '../../hooks/useReveal'
import styles from './Gallery.module.css'

function GalleryCard({ item, index }) {
  const Tag = item.href ? 'a' : 'div'
  return (
    <Tag href={item.href} className={`${styles.card} ${styles[`c${index}`]}`}>
      <img src={item.src} alt={item.alt} loading="lazy" />
      {item.label && (
        <>
          <span className={styles.shade} />
          <span className={styles.caption}>{item.label}</span>
          <span className={styles.arrow}><ArrowUpRight width={14} height={14} /></span>
        </>
      )}
    </Tag>
  )
}

export default function Gallery() {
  const ref = useReveal()
  return (
    <section className="container">
      <div ref={ref} className={`reveal ${styles.row}`}>
        {gallery.map((g, i) => (
          <GalleryCard key={g.src} item={g} index={i} />
        ))}
      </div>
    </section>
  )
}
