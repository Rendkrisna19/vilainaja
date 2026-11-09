import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import s from './RoomGallery.module.css'

/** Galeri foto kamar: foto utama besar, thumbnail di bawah, dan lightbox fullscreen. */
export default function RoomGallery({ images = [], fallback, alt }) {
  const list = images.length ? images : fallback ? [{ url: fallback, thumb_url: fallback }] : []
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const current = list[index]

  const step = (d) => setIndex((i) => (i + d + list.length) % list.length)

  useEffect(() => {
    if (!zoom) return
    const key = (e) => {
      if (e.key === 'Escape') setZoom(false)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', key)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, list.length])

  if (!current) return <div className={s.empty} />

  return (
    <div className={s.wrap}>
      <div className={s.main}>
        <img src={current.url} alt={alt} key={current.url} />
        <button className={s.expand} onClick={() => setZoom(true)} aria-label="Perbesar foto">
          <Expand size={16} />
        </button>
        {list.length > 1 && (
          <>
            <button className={`${s.arrow} ${s.prev}`} onClick={() => step(-1)} aria-label="Foto sebelumnya"><ChevronLeft size={18} /></button>
            <button className={`${s.arrow} ${s.next}`} onClick={() => step(1)} aria-label="Foto berikutnya"><ChevronRight size={18} /></button>
            <span className={s.count}>{index + 1} / {list.length}</span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <ul className={s.thumbs}>
          {list.map((img, i) => (
            <li key={img.url}>
              <button className={i === index ? s.on : ''} onClick={() => setIndex(i)} aria-label={`Foto ${i + 1}`} aria-current={i === index}>
                <img src={img.thumb_url || img.url} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {zoom && (
        <div className={s.lightbox} onClick={() => setZoom(false)} role="dialog" aria-modal="true">
          <img src={current.url} alt={alt} onClick={(e) => e.stopPropagation()} />
          <button className={s.close} onClick={() => setZoom(false)} aria-label="Tutup"><X size={20} /></button>
          {list.length > 1 && (
            <>
              <button className={`${s.lbArrow} ${s.lbPrev}`} onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Sebelumnya"><ChevronLeft size={22} /></button>
              <button className={`${s.lbArrow} ${s.lbNext}`} onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Berikutnya"><ChevronRight size={22} /></button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
