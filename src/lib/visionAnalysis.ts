// Claude Vision API - Property Photo Analysis
// Analyzes uploaded property photos to generate recommended scope + budget adjustments

import Anthropic from '@anthropic-ai/sdk'

export interface PhotoInput {
  base64: string
  mimeType: string
  category: 'existing' | 'damage' | 'reference'
  fileName: string
}

export interface VisionAnalysis {
  overallCondition: 'good' | 'fair' | 'poor' | 'major_work_needed'
  conditionScore: number
  identifiedIssues: Array<{
    category: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
  }>
  recommendedScopeItems: Array<{
    item: string
    priority: 'required' | 'recommended' | 'optional'
    estimatedCostRange: string
  }>
  safetyFlags: string[]
  riskFactors: string[]
  scopeDescription: string
  budgetMultiplier: number
  summary: string
  costBreakdown?: Array<{
    trade: string
    description: string
    lowEstimate: number
    highEstimate: number
    priority: 'required' | 'recommended' | 'optional'
  }>
}

const ANALYSIS_PROMPT = `You are a professional construction estimator and property inspector for Southern Cities Enterprises in Charlotte, NC.

Analyze the provided property photos and return a detailed assessment. The photos are categorized as:
- "existing": Current property condition photos
- "damage": Specific damage or issue photos  
- "reference": Reference/inspiration photos for desired outcome

Based on what you see, provide a full assessment including overall condition, identified issues, recommended scope, safety flags, risk factors, scope description, budget multiplier (0.8-1.5), and a cost breakdown by trade using 2024 Charlotte, NC contractor rates.

Return ONLY valid JSON matching this exact structure:
{
  "overallCondition": "fair",
  "conditionScore": 5,
  "identifiedIssues": [{"category": "roofing", "severity": "high", "description": "..."}],
  "recommendedScopeItems": [{"item": "...", "priority": "required", "estimatedCostRange": "$X - $Y"}],
  "safetyFlags": ["..."],
  "riskFactors": ["..."],
  "scopeDescription": "...",
  "budgetMultiplier": 1.2,
  "summary": "Brief overall assessment",
  "costBreakdown": [
    {
      "trade": "Roofing",
      "description": "Full shingle replacement, underlayment, flashing",
      "lowEstimate": 8500,
      "highEstimate": 14000,
      "priority": "required"
    }
  ]
}`

export async function analyzePhotos(photos: PhotoInput[]): Promise<VisionAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  // Use the same pattern as claude-analyzer.ts for SDK version compat
  const client = new (Anthropic as any)({ apiKey })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = []

  const byCategory = {
    existing: [] as PhotoInput[],
    damage: [] as PhotoInput[],
    reference: [] as PhotoInput[],
  }
  photos.forEach(p => {
    if (byCategory[p.category]) byCategory[p.category].push(p)
  })

  // Cap at 3 photos per category (9 total max) to stay under rate limits
  const MAX_PER_CATEGORY = 3

  for (const [category, categoryPhotos] of Object.entries(byCategory)) {
    if (categoryPhotos.length === 0) continue
    const selected = categoryPhotos.slice(0, MAX_PER_CATEGORY)
    content.push({ type: 'text', text: `\n--- ${category.toUpperCase()} PHOTOS (${selected.length} of ${categoryPhotos.length}) ---` })

    for (const photo of selected) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: photo.mimeType as any,
          data: photo.base64,
        },
      })
      content.push({ type: 'text', text: `File: ${photo.fileName} (${category})` })
    }
  }

  content.push({ type: 'text', text: '\nPlease analyze all photos above and provide your assessment as JSON.' })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content }],
    system: ANALYSIS_PROMPT,
  })

  const textContent = response.content.find((c: any) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude Vision')
  }

  let jsonStr: string = textContent.text.trim()
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) jsonStr = jsonMatch[1].trim()

  const analysis: VisionAnalysis = JSON.parse(jsonStr)
  analysis.budgetMultiplier = Math.max(0.8, Math.min(1.5, analysis.budgetMultiplier))

  return analysis
}
