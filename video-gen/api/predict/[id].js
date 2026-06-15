export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.REPLICATE_API_KEY
  if (!key) return res.status(500).json({ error: 'REPLICATE_API_KEY manquante' })

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id manquant' })

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Token ${key}` },
    })
    const prediction = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: prediction.detail || 'Replicate error' })
    }

    const output = prediction.output
    res.json({
      id: prediction.id,
      status: prediction.status,
      output,
      url: Array.isArray(output) ? output[0] : output,
      error: prediction.error,
      logs: prediction.logs,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
