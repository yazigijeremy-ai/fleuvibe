import express from 'express'
import { createServer } from 'vite'

const app = express()
app.use(express.json())

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY

app.post('/api/generate', async (req, res) => {
  if (!REPLICATE_API_KEY) {
    return res.status(500).json({ error: 'REPLICATE_API_KEY manquante. Ajoutez-la dans .env' })
  }

  const { model, input } = req.body
  if (!model || !input?.prompt) {
    return res.status(400).json({ error: 'Paramètres manquants (model, input.prompt)' })
  }

  try {
    // Start prediction
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ version: model, input }),
    })

    if (!startRes.ok) {
      const err = await startRes.json()
      return res.status(startRes.status).json({ error: err.detail || 'Replicate error' })
    }

    let prediction = await startRes.json()
    const predictionId = prediction.id

    // Poll until done
    while (!['succeeded', 'failed', 'canceled'].includes(prediction.status)) {
      await new Promise(r => setTimeout(r, 2000))
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { Authorization: `Token ${REPLICATE_API_KEY}` },
      })
      prediction = await pollRes.json()
    }

    if (prediction.status !== 'succeeded') {
      return res.status(500).json({ error: prediction.error || 'Génération échouée' })
    }

    const output = prediction.output
    const url = Array.isArray(output) ? output[0] : output
    res.json({ url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`)
})
