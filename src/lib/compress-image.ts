/**
 * Kompresuje i smanjuje sliku pre otpremanja — koristi Canvas API u browseru,
 * bez potrebe za bilo kakvom dodatnom bibliotekom.
 *
 * - Smanjuje širinu na max maxWidth (podrazumevano 1600px — dovoljno za Google
 *   Discover format 16:9 preko 1200px, sa malo rezerve)
 * - Konvertuje u WebP (mnogo manji fajl od JPEG-a pri istom kvalitetu)
 * - Ako browser iz nekog razloga ne podrži WebP enkodiranje, vraća originalni fajl
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<File> {
  // Ne kompresujemo GIF-ove (izgubili bismo animaciju) — šalju se kao originali
  if (file.type === 'image/gif') return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality)
    )

    if (!blob) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], newName, { type: 'image/webp' })
  } catch {
    // Ako kompresija iz bilo kog razloga ne uspe, otpremi original umesto da blokiramo novinara
    return file
  }
}
