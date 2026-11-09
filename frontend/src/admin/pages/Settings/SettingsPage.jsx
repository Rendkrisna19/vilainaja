import { useState } from 'react'
import { Save } from 'lucide-react'
import { useSaveSettings, useSettings } from '../../api/resources'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { Input, Textarea } from '../../components/ui/Field'
import s from './SettingsPage.module.css'

// Definisi form: tambah kolom baru cukup di sini.
const SECTIONS = [
  {
    title: 'Umum',
    description: 'Identitas yang tampil di website.',
    fields: [
      { key: 'site_name', label: 'Nama situs', required: true },
      { key: 'tagline', label: 'Tagline' },
      { key: 'description', label: 'Deskripsi singkat', type: 'textarea', full: true },
    ],
  },
  {
    title: 'Kontak',
    description: 'Dipakai di footer dan tombol hubungi.',
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Telepon' },
      { key: 'whatsapp', label: 'WhatsApp', hint: 'Format internasional tanpa +, contoh: 6281234567890' },
      { key: 'address', label: 'Alamat', type: 'textarea', full: true },
    ],
  },
  {
    title: 'Operasional',
    description: 'Jam standar kedatangan dan kepulangan tamu.',
    fields: [
      { key: 'check_in_time', label: 'Jam check-in', type: 'time', required: true },
      { key: 'check_out_time', label: 'Jam check-out', type: 'time', required: true },
    ],
  },
  {
    title: 'Media sosial',
    description: 'Tautan lengkap, diawali https://',
    fields: [
      { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
      { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…' },
      { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@…' },
    ],
  },
]

function SectionSkeleton({ fields }) {
  return (
    <div className={s.grid}>
      {fields.map((f) => (
        <div key={f.key} className={f.full ? s.full : undefined} style={{ display: 'grid', gap: 8 }}>
          <Skeleton width={90} height={12} />
          <Skeleton height={f.type === 'textarea' ? 88 : 42} radius={12} />
        </div>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const { data, isLoading, isError, error } = useSettings()
  const save = useSaveSettings()
  const [draft, setDraft] = useState({})
  const [errors, setErrors] = useState({})

  const values = { ...data, ...draft }
  const dirty = Object.keys(draft).length > 0

  const change = (key) => (e) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      await save.mutateAsync(values)
      setDraft({})
      setErrors({})
    } catch (err) {
      setErrors(err.errors || {})
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Pengaturan"
        accent="situs"
        description="Informasi dasar hotel yang dipakai di website dan notifikasi."
        actions={
          <>
            {dirty && <Button variant="outline" onClick={() => { setDraft({}); setErrors({}) }} disabled={save.isPending}>Batalkan</Button>}
            <Button type="submit" icon={Save} loading={save.isPending} disabled={!dirty || isLoading}>
              Simpan perubahan
            </Button>
          </>
        }
      />

      {isError && <p className={s.error}>Gagal memuat pengaturan: {error.message}</p>}

      <div className={s.sections}>
        {SECTIONS.map((sec) => (
          <Card key={sec.title} title={sec.title}>
            <p className={s.desc}>{sec.description}</p>
            {isLoading ? (
              <SectionSkeleton fields={sec.fields} />
            ) : (
              <div className={s.grid}>
                {sec.fields.map((f) => {
                  const Comp = f.type === 'textarea' ? Textarea : Input
                  return (
                    <Comp
                      key={f.key}
                      className={f.full ? s.full : undefined}
                      label={f.label}
                      type={f.type === 'textarea' ? undefined : f.type}
                      required={f.required}
                      hint={f.hint}
                      placeholder={f.placeholder}
                      value={values[f.key] ?? ''}
                      onChange={change(f.key)}
                      error={errors[f.key]}
                    />
                  )
                })}
              </div>
            )}
          </Card>
        ))}
      </div>
    </form>
  )
}
