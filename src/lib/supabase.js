import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mdfzrqehdhvvhrqvinpo.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_L4n6vcDAs6Q2ujgsZqCKTw_mNRBX0pA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function uploadImage(dataUri) {
  const [meta, base64] = dataUri.split(',')
  const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const ext = mimeType.split('/')[1] || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  const file = new File([bytes], filename, { type: mimeType })

  const { error } = await supabase.storage
    .from('video-images')
    .upload(filename, file, { contentType: mimeType, upsert: false })

  if (error) throw new Error(`Upload image: ${error.message}`)

  const { data } = supabase.storage.from('video-images').getPublicUrl(filename)
  return data.publicUrl
}
