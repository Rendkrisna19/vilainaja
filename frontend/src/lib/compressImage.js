/**
 * Mengecilkan foto di browser sebelum diunggah: maks. `maxSide` piksel di sisi terpanjang,
 * dikonversi ke WebP (fallback JPEG bila browser tidak mendukung). Mengembalikan File baru.
 */
export async function compressImage(file, { maxSide = 1600, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" bukan file gambar.`)

  const bitmap = await loadBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff' // latar putih untuk PNG transparan
  ctx.fillRect(0, 0, w, h)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  let blob = await toBlob(canvas, 'image/webp', quality)
  let ext = 'webp'
  if (!blob) {
    blob = await toBlob(canvas, 'image/jpeg', quality)
    ext = 'jpg'
  }
  if (!blob) throw new Error('Browser tidak dapat memproses gambar ini.')

  const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext
  return new File([blob], name, { type: blob.type, lastModified: Date.now() })
}

async function loadBitmap(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      /* lanjut ke cara lain */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error(`Gagal membaca "${file.name}".`))
      i.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob((b) => resolve(b && b.type === type ? b : null), type, quality))
