const ALLOWED_MODELS = new Set([
  'lightricks/ltx-video',
  'lucataco/cogvideox-5b',
  'wavespeedai/wan-2.1-t2v-480p',
  'wavespeedai/wan-2.1-i2v-480p',
])

const ALLOWED_FPS = new Set([16, 24, 30])
const ALLOWED_DIMS = new Set([544, 720, 768, 1024, 1280])
const MAX_PROMPT_LENGTH = 1000
const MAX_FRAMES = 900 // 30s at 30fps

const I2V_MODELS = new Set(['wavespeedai/wan-2.1-i2v-480p'])
const MAX_IMAGE_SIZE = 8 * 1024 * 1024 // 8MB in base64

function validate(model, input) {
  if (!model || typeof model !== 'string') return 'Modèle manquant'
  if (!ALLOWED_MODELS.has(model)) return `Modèle non autorisé: ${model}`
  const isI2V = I2V_MODELS.has(model)
  if (isI2V) {
    if (!input?.image || typeof input.image !== 'string') return 'Image manquante pour ce modèle'
    if (!input.image.startsWith('data:image/') && !input.image.startsWith('https://')) return 'Format d\'image invalide'
    if (input.image.startsWith('data:image/') && input.image.length > MAX_IMAGE_SIZE) return 'Image trop volumineuse (max 6MB)'
  } else {
    if (!input?.prompt || typeof input.prompt !== 'string') return 'Prompt manquant'
    if (input.prompt.trim().length < 3) return 'Prompt trop court (min 3 caractères)'
  }
  if (input?.prompt && input.prompt.length > MAX_PROMPT_LENGTH) return `Prompt trop long (max ${MAX_PROMPT_LENGTH} caractères)`
  // i2v models don't send fps/width/height — skip those validations
  if (!isI2V) {
    if (input.fps && !ALLOWED_FPS.has(input.fps)) return 'FPS non autorisé'
    if (input.width && !ALLOWED_DIMS.has(input.width)) return 'Largeur non autorisée'
    if (input.height && !ALLOWED_DIMS.has(input.height)) return 'Hauteur non autorisée'
  }
  if (input.num_frames && (input.num_frames < 1 || input.num_frames > MAX_FRAMES)) return `Nombre de frames invalide (max ${MAX_FRAMES})`
  if (input.seed !== undefined && input.seed !== null) {
    const seed = Number(input.seed)
    if (!Number.isInteger(seed) || seed < 0) return 'Seed invalide'
  }
  return null
}

async function uploadImageToReplicate(dataUri, key) {
  const [meta, base64] = dataUri.split(',')
  const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const buffer = Buffer.from(base64, 'base64')

  const r = await fetch('https://api.replicate.com/v1/files', {
    method: 'POST',
    headers: {
      Authorization: `Token ${key}`,
      'Content-Type': mimeType,
      'Content-Length': String(buffer.length),
    },
    body: buffer,
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.detail || 'Échec upload image vers Replicate')
  return data.urls?.get || data.url
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.REPLICATE_API_KEY
  if (!key) return res.status(500).json({ error: 'REPLICATE_API_KEY manquante' })

  const { model, input } = req.body || {}
  const validationError = validate(model, input)
  if (validationError) return res.status(400).json({ error: validationError })

  const headers = {
    Authorization: `Token ${key}`,
    'Content-Type': 'application/json',
  }

  try {
    // Upload image to Replicate CDN if data URI (i2v mode)
    if (input.image?.startsWith('data:image/')) {
      input.image = await uploadImageToReplicate(input.image, key)
    }

    // Fetch latest version SHA for this model
    const modelRes = await fetch(`https://api.replicate.com/v1/models/${model}`, { headers })
    const modelData = await modelRes.json()
    const version = modelData.latest_version?.id

    let prediction
    if (version) {
      const r = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: { ...headers, Prefer: 'wait=5' },
        body: JSON.stringify({ version, input }),
      })
      prediction = await r.json()
      if (!r.ok) return res.status(r.status).json({ error: prediction.detail || 'Erreur Replicate' })
    } else {
      const r = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'wait=5' },
        body: JSON.stringify({ input }),
      })
      prediction = await r.json()
      if (!r.ok) return res.status(r.status).json({ error: prediction.detail || 'Erreur Replicate' })
    }

    res.json({ id: prediction.id, status: prediction.status, output: prediction.output })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
