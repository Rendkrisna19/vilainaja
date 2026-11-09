import { useCallback, useState } from 'react'

/** State form sederhana: nilai, error dari server, dan helper `bind` untuk komponen Field. */
export function useForm(initial) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})

  const set = useCallback((key) => (value) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }, [])

  // untuk <Input>/<Textarea> (event) — Select dan Toggle memakai `set(key)` langsung
  const bind = (key) => ({
    value: values[key] ?? '',
    onChange: (e) => set(key)(e.target.value),
    error: errors[key],
  })

  return { values, setValues, errors, setErrors, set, bind }
}
