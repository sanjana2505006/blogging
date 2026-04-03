import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateGeminiSummary(title: string, body: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GEMINI_API_KEY')
  }

  const genAI = new GoogleGenerativeAI(apiKey)

  const prompt = [
    'You are summarizing a blog post.',
    'Write a concise summary of about 200 words.',
    'Requirements:',
    '- 180-220 words',
    '- Plain text only (no markdown), no bullet lists',
    '- Capture the main ideas and key points',
    '',
    `Title: ${title}`,
    `Body: ${body}`
  ].join('\n')

  const modelCandidates = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash'
  ]

  let lastError: unknown = null
  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      if (text) return text
    } catch (error) {
      lastError = error
    }
  }

  throw new Error(`All Gemini model attempts failed: ${String((lastError as any)?.message ?? lastError)}`)
}

