import { useEffect } from 'react'
import { leads } from '../../../api/resources'
import { useForm } from '../../../hooks/useForm'
import { LEAD_SOURCE, LEAD_STATUS, toOptions } from '../../../lib/constants'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Select from '../../../components/ui/Select'
import { Input, Textarea } from '../../../components/ui/Field'
import s from './LeadFormModal.module.css'

const EMPTY = { name: '', phone: '', email: '', source: 'website', status: 'new', message: '' }
const SOURCE_OPTIONS = toOptions(LEAD_SOURCE)
const STATUS_OPTIONS = toOptions(LEAD_STATUS)

export default function LeadFormModal({ open, lead, onClose }) {
  const editing = Boolean(lead)
  const create = leads.useCreate()
  const update = leads.useUpdate()
  const saving = create.isPending || update.isPending
  const { values, setValues, errors, setErrors, set, bind } = useForm(EMPTY)

  useEffect(() => {
    if (!open) return
    setErrors({})
    setValues(lead ? { ...EMPTY, ...lead, phone: lead.phone ?? '', email: lead.email ?? '', message: lead.message ?? '' } : EMPTY)
  }, [open, lead, setValues, setErrors])

  const submit = async (e) => {
    e.preventDefault()
    const body = { ...values, phone: values.phone || null, email: values.email || null, message: values.message || null }
    try {
      if (editing) await update.mutateAsync({ id: lead.id, ...body })
      else await create.mutateAsync(body)
      onClose()
    } catch (err) {
      setErrors(err.errors || {})
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={editing ? 'Ubah lead' : 'Tambah lead'}
      description="Catat calon tamu yang menghubungi Anda."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button type="submit" form="lead-form" loading={saving}>{editing ? 'Simpan perubahan' : 'Tambah lead'}</Button>
        </>
      }
    >
      <form id="lead-form" onSubmit={submit} className={s.form} noValidate>
        <Input className={s.full} label="Nama" required placeholder="Nama calon tamu" {...bind('name')} />
        <Input label="Nomor telepon" placeholder="0813…" inputMode="tel" {...bind('phone')} />
        <Input label="Email" type="email" placeholder="nama@email.com" {...bind('email')} />
        <Select label="Sumber" required options={SOURCE_OPTIONS} value={values.source} onChange={set('source')} error={errors.source} />
        <Select label="Status" required options={STATUS_OPTIONS} value={values.status} onChange={set('status')} error={errors.status} />
        <Textarea className={s.full} label="Pesan / kebutuhan" placeholder="Apa yang ditanyakan atau dibutuhkan?" {...bind('message')} />
      </form>
    </Modal>
  )
}
