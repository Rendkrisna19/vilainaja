import { Link } from 'react-router-dom'
import { formatRupiah } from '../../data/site'
import { Ruler, Users, Bed, ArrowUpRight } from '../ui/Icons'
import styles from './RoomCard.module.css'

function Availability({ room }) {
  if (room.units_left == null) return null // data cadangan: ketersediaan tidak diketahui

  if (room.units_left < 1) return <span className={`${styles.avail} ${styles.full}`}><i />Penuh</span>
  if (room.units_left <= 2) return <span className={`${styles.avail} ${styles.few}`}><i />Sisa {room.units_left} unit</span>
  return <span className={`${styles.avail} ${styles.ok}`}><i />Tersedia</span>
}

export default function RoomCard({ room, clone = false, query = '' }) {
  const soldOut = room.units_left != null && room.units_left < 1

  return (
    <article className={`${styles.card} ${soldOut ? styles.soldOut : ''}`} aria-hidden={clone || undefined}>
      <div className={styles.media}>
        <img src={room.image_url} alt={`Interior ${room.name}`} loading="lazy" draggable="false" />
        {room.tag && <span className={styles.tag}>{room.tag}</span>}
        <Availability room={room} />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{room.name}</h3>
        <p className={styles.note}>{room.description}</p>

        <ul className={styles.specs}>
          <li><Ruler width={15} height={15} />{room.size} m²</li>
          <li><Users width={15} height={15} />{room.capacity} tamu</li>
          <li><Bed width={15} height={15} />{room.bed}</li>
        </ul>

        <div className={styles.foot}>
          <p className={styles.price}>
            <strong>{formatRupiah(room.price)}</strong>
            <span> / malam</span>
          </p>

          {soldOut ? (
            <span className={styles.disabled} aria-label={`${room.name} penuh`}>Penuh</span>
          ) : (
            <Link
              to={`/booking/${room.slug}${query}`}
              className={styles.cta}
              tabIndex={clone ? -1 : undefined}
              aria-label={`Pesan ${room.name}`}
              draggable="false"
            >
              Pesan <ArrowUpRight width={16} height={16} />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
