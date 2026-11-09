import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { roomTypeOptions } from '../../data/site'
import { Calendar, Users, Bed } from '../ui/Icons'
import DatePicker, { toISO, addDays } from '../ui/DatePicker'
import Select from '../ui/Select'
import styles from './SearchBar.module.css'

const guestOptions = [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} tamu` }))
const typeOptions = roomTypeOptions.map((t) => ({ value: t, label: t }))

export default function SearchBar() {
  const today = toISO(new Date())
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [type, setType] = useState(roomTypeOptions[0])

  const changeCheckIn = (v) => {
    setCheckIn(v)
    if (checkOut && checkOut <= v) setCheckOut('')
  }

  const [, setSearchParams] = useSearchParams()

  // Pencarian disimpan di URL; section Kamar membacanya untuk menampilkan ketersediaan tanggal tersebut.
  const onSubmit = (e) => {
    e.preventDefault()
    const params = { check_in: checkIn, guests }
    if (checkOut) params.check_out = checkOut
    if (type !== roomTypeOptions[0]) params.type = type
    setSearchParams(params, { replace: true, preventScrollReset: true })
    document.getElementById('kamar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <form className={styles.bar} onSubmit={onSubmit} aria-label="Cari kamar">
      <DatePicker
        icon={<Calendar />}
        label="Check-in"
        value={checkIn}
        min={today}
        onChange={changeCheckIn}
      />
      <DatePicker
        icon={<Calendar />}
        label="Check-out"
        value={checkOut}
        min={addDays(checkIn, 1)}
        placeholder="Pilih tanggal"
        onChange={setCheckOut}
      />
      <Select icon={<Users />} label="Jumlah tamu" value={guests} options={guestOptions} onChange={setGuests} />
      <Select icon={<Bed />} label="Tipe kamar" value={type} options={typeOptions} onChange={setType} align="right" />
      <button type="submit" className={styles.submit}>Cari kamar</button>
    </form>
  )
}
