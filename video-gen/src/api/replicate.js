const MODELS = {
  'ltx-video': 'lightricks/ltx-video',
  'cogvideox-5b': 'lucataco/cogvideox-5b',
  'wan-t2v': 'wavespeedai/wan-2.1-t2v-480p',
}

const ASPECT_RATIO_MAP = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '1:1':  { width: 768, height: 768 },
  '4:3':  { width: 1024, height: 768 },
  '3:4':  { width: 768, height: 1024 },
  '21:9': { width: 1280, height: 544 },
}

function buildInput(params) {
  const dims = ASPECT_RATIO_MAP[params.aspect_ratio] || { width: 1280, height: 720 }
  const base = {
    prompt: params.prompt,
    num_frames: Math.round(params.duration * params.fps),
    fps: params.fps,
    width: dims.width,
    height: dims.height,
  }
  if (params.negative_prompt) base.negative_prompt = params.negative_prompt
  if (params.seed) base.seed = params.seed
  return base
}

export async function generateVideo(params) {
  const modelId = MODELS[params.model] || MODELS['ltx-video']
  const input = buildInput(params)

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelId, input }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Erreur serveur' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.url
}
