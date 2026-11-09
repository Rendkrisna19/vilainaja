import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fallbackRooms } from '../../data/site'
import { usePublicRooms } from '../../../customer/api/hooks'
import { ArrowLeft, ArrowRight } from '../ui/Icons'
import { useReveal } from '../../hooks/useReveal'
import RoomCard from './RoomCard'
import styles from './Rooms.module.css'

const SPEED = 38 // px per detik — kecepatan geser otomatis
const RESUME_AFTER = 1800 // ms setelah interaksi terakhir sebelum jalan sendiri lagi
const SETS = [0, 1, 2] // [klon][asli][klon] → putaran tanpa ujung

const fmtDay = (iso) => new Date(iso + 'T00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

export default function Rooms() {
  const revealRef = useReveal()
  const trackRef = useRef(null)
  const [sp] = useSearchParams()

  const params = {
    check_in: sp.get('check_in') || undefined,
    check_out: sp.get('check_out') || undefined,
    guests: sp.get('guests') || undefined,
  }
  const type = sp.get('type')

  // Ketersediaan diperbarui otomatis tiap 10 dtk (kamar yang baru dipesan orang lain langsung "Penuh").
  const { data, isError } = usePublicRooms(params)

  const rooms = useMemo(() => {
    const src = data?.data ?? (isError ? fallbackRooms : null)
    if (!src) return null
    return type ? src.filter((r) => r.name === type) : src
  }, [data, isError, type])

  const meta = data?.meta
  const query = useMemo(() => {
    const q = new URLSearchParams()
    if (params.check_in) q.set('check_in', params.check_in)
    if (params.check_out) q.set('check_out', params.check_out)
    if (params.guests) q.set('guests', params.guests)
    const s = q.toString()
    return s ? `?${s}` : ''
  }, [params.check_in, params.check_out, params.guests])

  const n = rooms?.length ?? 0

  /* ---------------- gerak otomatis ---------------- */
  const st = useRef({ pos: 0, hover: false, dragging: false, visible: true, resumeAt: 0, needSync: false, moved: false })

  const getStep = () => {
    const cards = trackRef.current?.querySelectorAll('article')
    return cards && cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0
  }

  const interact = useCallback(() => {
    st.current.resumeAt = performance.now() + RESUME_AFTER
    st.current.needSync = true
  }, [])

  // Posisi awal: awal set tengah.
  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el || !n) return
    const place = () => {
      const step = getStep()
      if (step) {
        st.current.pos = step * n
        el.scrollLeft = step * n
      }
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [n])

  useEffect(() => {
    const el = trackRef.current
    if (!el || n < 2) return
    const s = st.current

    const io = new IntersectionObserver(([e]) => (s.visible = e.isIntersecting), { threshold: 0.05 })
    io.observe(el)

    let raf = 0
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min(now - last, 64) / 1000
      last = now
      const step = getStep()
      const setW = step * n

      // Geser otomatis selalu aktif (diminta pemilik situs); berhenti sementara saat kursor di atasnya atau saat digeser manual.
      if (setW && s.visible && !s.hover && !s.dragging && now >= s.resumeAt) {
        if (s.needSync) {
          // pengguna baru selesai menggeser sendiri → lanjut dari posisi terakhir (dinormalkan ke set tengah)
          s.pos = el.scrollLeft
          if (s.pos < setW) s.pos += setW
          else if (s.pos >= setW * 2) s.pos -= setW
          s.needSync = false
        }
        s.pos += SPEED * dt
        if (s.pos >= setW * 2) s.pos -= setW
        el.scrollLeft = s.pos
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [n])

  const normalize = () => {
    const el = trackRef.current
    const setW = getStep() * n
    if (!el || !setW) return
    if (el.scrollLeft < setW) el.scrollLeft += setW
    else if (el.scrollLeft >= setW * 2) el.scrollLeft -= setW
  }

  const by = (dir) => {
    const el = trackRef.current
    const step = getStep()
    if (!el || !step) return
    interact()
    normalize()
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  /* drag dengan mouse; sentuhan memakai scroll native */
  const drag = useRef({ x: 0, left: 0 })
  const onDown = (e) => {
    interact()
    if (e.pointerType !== 'mouse') return
    normalize()
    st.current.dragging = true
    st.current.moved = false
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft }
  }
  const onMove = (e) => {
    if (!st.current.dragging) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 5) st.current.moved = true
    trackRef.current.scrollLeft = drag.current.left - dx
  }
  const onUp = () => {
    if (!st.current.dragging) return
    st.current.dragging = false
    interact()
    setTimeout(normalize, 150)
  }

  const label = meta ? `${fmtDay(meta.check_in)} – ${fmtDay(meta.check_out)} · ${meta.nights} malam` : null

  return (
    <section id="kamar" className={styles.section}>
      <div ref={revealRef} className={`container reveal ${styles.head}`}>
        <div>
          <span className={styles.label}>Tipe Kamar</span>
          <h2 className={styles.title}>
            Pilih ruang yang <em>paling pas</em> untuk Anda
          </h2>
          {label && (
            <p className={styles.live}>
              <i /> Ketersediaan {label} · diperbarui otomatis
            </p>
          )}
        </div>
        <div className={styles.controls}>
          <button onClick={() => by(-1)} aria-label="Kamar sebelumnya"><ArrowLeft /></button>
          <button onClick={() => by(1)} aria-label="Kamar berikutnya"><ArrowRight /></button>
        </div>
      </div>

      {rooms && rooms.length === 0 ? (
        <p className={`container ${styles.empty}`}>Tidak ada kamar dengan tipe tersebut. Hapus filter untuk melihat semua kamar.</p>
      ) : (
        <div
          ref={trackRef}
          className={styles.track}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onMouseEnter={() => (st.current.hover = true)}
          onMouseLeave={() => (st.current.hover = false)}
          onWheel={interact}
          onTouchStart={interact}
          onClickCapture={(e) => {
            // klik setelah drag bukan klik sungguhan
            if (st.current.moved) {
              e.preventDefault()
              e.stopPropagation()
              st.current.moved = false
            }
          }}
          role="region"
          aria-label="Daftar tipe kamar"
        >
          {rooms
            ? SETS.map((set) => rooms.map((r) => <RoomCard key={`${set}-${r.id}`} room={r} clone={set !== 1} query={query} />))
            : Array.from({ length: 4 }, (_, i) => <div key={i} className={styles.skeleton} aria-hidden="true" />)}
        </div>
      )}
    </section>
  )
}
