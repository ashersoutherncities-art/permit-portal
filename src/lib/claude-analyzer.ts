import Anthropic from '@anthropic-ai/sdk'

const client = new (Anthropic as any)()

export async function analyzePermitSubmission(submissionData: {
  permit_type: string
  property_address?: string
  contractor_info?: any
  scope_of_work?: string
  contract_signed?: boolean
  payment_received?: boolean
  documents?: string[]
}) {
  const prompt = `Analyze this construction permit submission and identify any missing required information.

Permit Type: ${submissionData.permit_type}
Property Address: ${submissionData.property_address || 'Not provided'}
Contractor Info: ${JSON.stringify(submissionData.contractor_info) || 'Not provided'}
Scope of Work: ${submissionData.scope_of_work || 'Not provided'}
Contract Signed: ${submissionData.contract_signed ? 'Yes' : 'No'}
Payment Received: ${submissionData.payment_received ? 'Yes' : 'No'}
Documents Uploaded: ${submissionData.documents?.join(', ') || 'None'}

Based on typical construction permit requirements, identify:
1. Missing documents or information
2. Incomplete contractor details
3. Missing scope specifications
4. Outstanding administrative items (contract, payment)

Return as JSON with keys: missing_items (array), confidence_score (0-1), recommendations (array)`

  try {
    const response = await (client as any).messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text)
      } catch {
        return {
          missing_items: ['Unable to parse AI response'],
          confidence_score: 0.5,
          recommendations: [],
        }
      }
    }
  } catch (error) {
    console.error('Claude API Error:', error)
    return {
      missing_items: ['Error analyzing submission'],
      confidence_score: 0,
      recommendations: [],
    }
  }
}
