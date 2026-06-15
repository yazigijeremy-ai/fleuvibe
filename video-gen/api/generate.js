export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.REPLICATE_API_KEY
  if (!key) return res.status(500).json({ error: 'REPLICATE_API_KEY manquante' })

  const { model, input } = req.body || {}
  if (!model || !input?.prompt) {
    return res.status(400).json({ error: 'Paramètres manquants (model, input.prompt)' })
  }

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
      return res.status(response.status).json({ error: prediction.detail || 'Replicate error' })
    }

    res.json({ id: prediction.id, status: prediction.status, output: prediction.output })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
