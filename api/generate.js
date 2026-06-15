// VideoGen AI — démarre une prédiction Replicate
const ALLOWED_MODELS = new Set([
  'lightricks/ltx-video',
  'lucataco/cogvideox-5b',
  'wavespeedai/wan-2.1-t2v-480p',
])
const ALLOWED_FPS = new Set([16, 24, 30])
const ALLOWED_DIMS = new Set([544, 720, 768, 1024, 1280])

function validate(model, input) {
  if (!model || typeof model !== 'string') return 'Modèle manquant'
  if (!ALLOWED_MODELS.has(model)) return `Modèle non autorisé: ${model}`
  if (!input?.prompt || typeof input.prompt !== 'string') return 'Prompt manquant'
  if (input.prompt.trim().length < 3) return 'Prompt trop court'
  if (input.prompt.length > 1000) return 'Prompt trop long (max 1000 caractères)'
  if (input.fps && !ALLOWED_FPS.has(input.fps)) return 'FPS non autorisé'
  if (input.width && !ALLOWED_DIMS.has(input.width)) return 'Largeur non autorisée'
  if (input.height && !ALLOWED_DIMS.has(input.height)) return 'Hauteur non autorisée'
  if (input.num_frames && (input.num_frames < 1 || input.num_frames > 300)) return 'Nombre de frames invalide'
  return null
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.REPLICATE_API_KEY
  if (!key) return res.status(500).json({ error: 'REPLICATE_API_KEY manquante' })

  const { model, input } = req.body || {}
  const err = validate(model, input)
  if (err) return res.status(400).json({ error: err })

  try {
    const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=5',
      },
      body: JSON.stringify({ input }),
    })

    const prediction = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: prediction.detail || 'Erreur Replicate' })
    }

    res.json({ id: prediction.id, status: prediction.status, output: prediction.output })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
