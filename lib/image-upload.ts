import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = createClient()
  const webp = await imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/webp',
  })
  const path = `products/${crypto.randomUUID()}.webp`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, webp, { contentType: 'image/webp', cacheControl: '31536000' })

  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

export async function removeProductImage(url: string): Promise<void> {
  const path = url.split('/product-images/')[1]
  if (path) {
    await createClient().storage.from('product-images').remove([path])
  }
}
