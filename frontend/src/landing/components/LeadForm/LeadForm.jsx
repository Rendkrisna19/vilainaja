import { useState } from 'react'
import { CheckCircle2, Mail, MessageCircle, Phone } from 'lucide-react'
import { footer, leadForm } from '../../data/site'
import { useReveal } from '../../hooks/useReveal'
import { api } from '../../../customer/api/client'
import { useCustomerAuth } from '../../../customer/context/CustomerAuthContext'
import styles from './LeadForm.module.css'

const EMPTY = { name: '', phone: '', email: '', message: '', website: '' }

function Field({ label, error, children, full }) {
  return (
    <label className={`${styles.field} ${full ? styles.full : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small>{Array.isArray(error) ? error[0] : error}</small>}
    </label>
  )
}

export default function LeadForm() {
  const ref = useReveal()
  const { user } = useCustomerAuth()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [message, setMessage] = useState('')

  // Pelanggan yang sudah login: isi otomatis data yang kosong.
  const value = (k) => form[k] || (k === 'name' ? user?.name : k === 'phone' ? user?.phone : k === 'email' ? user?.email : '') || ''
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return // cegah klik ganda
    setStatus('sending')
    setErrors({})
    try {
      const res = await api('/public/leads', {
        method: 'POST',
        body: { name: value('name'), phone: value('phone'), email: value('email') || null, message: form.message, website: form.website },
      })
      setMessage(res.message)
      setForm(EMPTY)
      setStatus('done')
    } catch (err) {
      setErrors(err.errors || {})
      setMessage(err.errors ? 'Periksa kembali data yang diisi.' : err.message)
      setStatus('error')
    }
  }

  return (
    <section id="kontak" className={`container ${styles.section}`}>
      <div ref={ref} className={`reveal ${styles.grid}`}>
        <div className={styles.intro}>
          <span className={styles.label}>{leadForm.label}</span>
          <h2 className={styles.title}>
            {leadForm.titleTop} <em>{leadForm.titleItalic}</em>
          </h2>
          <p className={styles.text}>{leadForm.text}</p>

          <ul className={styles.contacts}>
            <li><Phone size={18} /><a href={`tel:${footer.phone.replace(/[^+\d]/g, '')}`}>{footer.phone}</a></li>
            <li><Mail size={18} /><a href={`mailto:${footer.email}`}>{footer.email}</a></li>
            <li><MessageCircle size={18} /><span>{footer.hours}</span></li>
          </ul>
        </div>

        {status === 'done' ? (
          <div className={`${styles.card} ${styles.done}`} role="status">
            <CheckCircle2 size={34} />
            <h3>Pesan terkirim</h3>
            <p>{message}</p>
            <button className={styles.again} onClick={() => setStatus('idle')}>Kirim pesan lain</button>
          </div>
        ) : (
          <form className={styles.card} onSubmit={submit} noValidate>
            <div className={styles.fields}>
              <Field label="Nama lengkap" error={errors.name}>
                <input value={value('name')} onChange={set('name')} placeholder="Nama Anda" autoComplete="name" maxLength={120} required />
              </Field>
              <Field label="Nomor WhatsApp" error={errors.phone}>
                <input value={value('phone')} onChange={set('phone')} placeholder="0812 3456 7890" type="tel" inputMode="tel" autoComplete="tel" required />
              </Field>
              <Field label="Email (opsional)" error={errors.email} full>
                <input value={value('email')} onChange={set('email')} placeholder="nama@email.com" type="email" autoComplete="email" />
              </Field>
              <Field label="Pesan" error={errors.message} full>
                <textarea value={form.message} onChange={set('message')} placeholder="Contoh: Kami berempat ingin menginap 3 malam akhir bulan ini…" rows={5} maxLength={1000} required />
              </Field>

              {/* Honeypot: disembunyikan dari manusia; bot yang mengisinya akan ditolak server. */}
              <input className={styles.trap} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} />
            </div>

            {status === 'error' && <p className={styles.error} role="alert">{message}</p>}

            <button className={styles.submit} type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Mengirim…' : 'Kirim pesan'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
