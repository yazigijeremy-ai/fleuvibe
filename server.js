import express from 'express'
import 'dotenv/config'

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

const KEY = process.env.REPLICATE_API_KEY

function requireKey(res) {
  if (!KEY) {
    res.status(500).json({ error: 'REPLICATE_API_KEY manquante. Créez un fichier .env' })
    return false
  }
  return true
}

app.post('/api/generate', async (req, res) => {
  if (!requireKey(res)) return
  const { model, input } = req.body || {}
  if (!model || !input?.prompt) return res.status(400).json({ error: 'Paramètres manquants' })

  try {
    const r = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: { Authorization: `Token ${KEY}`, 'Content-Type': 'application/json', Prefer: 'wait=5' },
      body: JSON.stringify({ input }),
    })
    const data = await r.json()
    if (!r.ok) return res.status(r.status).json({ error: data.detail || 'Replicate error' })
    res.json({ id: data.id, status: data.status, output: data.output })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/predict/:id', async (req, res) => {
  if (!requireKey(res)) return
  try {
    const r = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
      headers: { Authorization: `Token ${KEY}` },
    })
    const data = await r.json()
    if (!r.ok) return res.status(r.status).json({ error: data.detail || 'Replicate error' })
    const output = data.output
    res.json({ id: data.id, status: data.status, output, url: Array.isArray(output) ? output[0] : output, error: data.error, logs: data.logs })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✓ API locale sur http://localhost:${PORT}`))
