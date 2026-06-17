const MODELS = {
  'ltx-video': 'lightricks/ltx-video',
  'cogvideox-5b': 'lucataco/cogvideox-5b',
  'wan-t2v': 'wavespeedai/wan-2.1-t2v-480p',
  'wan-i2v': 'wavespeedai/wan-2.1-i2v-480p',
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
  const input = {
    prompt: params.prompt || '',
    num_frames: Math.round(params.duration * params.fps),
    fps: params.fps,
    width: dims.width,
    height: dims.height,
  }
  if (params.image) input.image = params.image
  if (params.negative_prompt) input.negative_prompt = params.negative_prompt
  if (params.seed) input.seed = params.seed
  return input
}

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export async function startGeneration(params) {
  const data = await apiFetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: MODELS[params.model] || MODELS['ltx-video'],
      input: buildInput(params),
    }),
  })
  return data.id
}

export async function pollPrediction(id) {
  return apiFetch(`/api/predict/${id}`)
}

export async function generateVideo(params, onStatus) {
  const id = await startGeneration(params)
  let prediction
  do {
    await new Promise(r => setTimeout(r, 2500))
    prediction = await pollPrediction(id)
    onStatus?.(prediction.status, prediction.logs)
  } while (!['succeeded', 'failed', 'canceled'].includes(prediction.status))

  if (prediction.status !== 'succeeded') throw new Error(prediction.error || 'Génération échouée')
  const output = prediction.output
  return Array.isArray(output) ? output[0] : output
}
