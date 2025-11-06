import { UserProfile } from './userProfileService'

interface PromptContext {
  userProfile?: UserProfile | null
  billFileName?: string
  conversationLength?: number
  hasInsurance?: boolean
}

/**
 * Build dynamic system prompt based on user context
 */
export function buildSystemPrompt(context: PromptContext = {}): string {
  const { userProfile, billFileName, conversationLength = 0 } = context

  // Base prompt
  let prompt = `You are an expert AI assistant helping people negotiate and reduce their medical bills. Your role is to:

1. Analyze medical bills and identify opportunities for reduction
2. Provide clear, professional advice on negotiation strategies
3. Draft professional messages that users can send to healthcare providers
4. Be empathetic and supportive while being practical

When a user uploads a bill, guide them through:
- Requesting itemized statements
- Identifying billing errors
- Negotiating payment plans
- Writing professional correspondence`

  // Add communication style preference
  if (userProfile?.communicationStyle) {
    const styleGuide = {
      formal: 'Use formal, professional language with proper business etiquette.',
      friendly: 'Use warm, approachable language while maintaining professionalism.',
      assertive: 'Use confident, direct language that emphasizes the user\'s rights.',
    }
    prompt += `\n\n**Communication Style**: ${styleGuide[userProfile.communicationStyle]}`
  }

  // Add financial context
  if (userProfile?.financialSituation) {
    const financialGuide = {
      tight: 'The user has limited financial resources. Prioritize payment plans, hardship programs, and charity care options.',
      moderate: 'The user has some financial flexibility. Focus on fair pricing and reasonable payment terms.',
      flexible: 'The user can manage payments but wants fair pricing. Focus on billing errors and overcharges.',
    }
    prompt += `\n\n**Financial Context**: ${financialGuide[userProfile.financialSituation]}`
  }

  // Add insurance context
  if (userProfile?.hasInsurance) {
    prompt += `\n\n**Insurance**: The user has insurance${
      userProfile.insuranceProvider ? ` with ${userProfile.insuranceProvider}` : ''
    }. Consider insurance coverage, EOBs, and out-of-network charges in your advice.`
  }

  // Add successful strategies from past
  if (userProfile?.successfulStrategies && userProfile.successfulStrategies.length > 0) {
    prompt += `\n\n**Past Successes**: This user has had success with: ${userProfile.successfulStrategies.join(', ')}. Consider these approaches when relevant.`
  }

  // Add negotiation track record
  if (userProfile && userProfile.totalBillsNegotiated && userProfile.totalBillsNegotiated > 0) {
    const avgRate = userProfile.averageReductionRate || 0
    prompt += `\n\n**Track Record**: This user has successfully negotiated ${userProfile.totalBillsNegotiated} bill(s), saving an average of ${Math.round(avgRate)}%. Build on this confidence.`
  }

  // Add bill context
  if (billFileName) {
    prompt += `\n\n**Current Bill**: The user has uploaded: ${billFileName}`
  }

  // Add conversation length guidance
  if (conversationLength > 10) {
    prompt += `\n\n**Note**: This is an extended conversation. Stay focused on actionable next steps and avoid repeating previous advice.`
  }

  // Add closing guidance
  prompt += `\n\nKeep responses concise, actionable, and friendly. When drafting messages, use professional formatting with clear subject lines.`

  return prompt
}

/**
 * Build few-shot examples for better message quality
 */
export function getFewShotExamples(): Array<{ role: string; content: string }> {
  return [
    {
      role: 'user',
      content: 'Can you help me write a message to negotiate my $5,000 hospital bill?',
    },
    {
      role: 'assistant',
      content: `I'll help you draft a professional negotiation message. Here's a template:

**Subject: Request for Bill Review and Payment Arrangement - Account #[Your Account Number]**

Dear Billing Department,

I am writing regarding the bill dated [Date] for services rendered on [Service Date], totaling $5,000. I am committed to resolving this balance but would like to discuss the following:

1. **Itemized Statement**: Could you please provide a detailed, itemized breakdown of all charges?
2. **Billing Review**: I would like to ensure all charges are accurate and that insurance was properly applied.
3. **Financial Assistance**: I would like to inquire about any financial assistance programs, payment plans, or discounts available for prompt payment.

I am prepared to work with you to resolve this matter promptly. Please contact me at [Your Phone] or [Your Email] to discuss options.

Thank you for your attention to this matter.

Sincerely,
[Your Name]
[Account Number]

---

**Tips for sending:**
- Send via certified mail or patient portal
- Keep a copy for your records
- Follow up in 7-10 business days if no response`,
    },
  ]
}

/**
 * Summarize conversation for context window management
 */
export function summarizeConversation(messages: Array<{ role: string; content: string }>): string {
  if (messages.length <= 5) {
    return '' // No need to summarize short conversations
  }

  // Extract key information
  // Previously computed but unused filters removed to satisfy TS noUnusedLocals

  let summary = 'Previous conversation summary:\n'
  
  // Identify main topics
  const topics = new Set<string>()
  messages.forEach((msg) => {
    if (msg.content.toLowerCase().includes('itemized')) topics.add('itemized statement')
    if (msg.content.toLowerCase().includes('payment plan')) topics.add('payment plan')
    if (msg.content.toLowerCase().includes('insurance')) topics.add('insurance issues')
    if (msg.content.toLowerCase().includes('error')) topics.add('billing errors')
    if (msg.content.toLowerCase().includes('discount')) topics.add('discounts')
  })

  if (topics.size > 0) {
    summary += `Topics discussed: ${Array.from(topics).join(', ')}\n`
  }

  summary += `Total messages: ${messages.length}\n`

  return summary
}

/**
 * Extract bill metadata from conversation
 */
export function extractBillMetadata(messages: Array<{ role: string; content: string }>): {
  provider?: string
  amount?: number
  hasInsurance?: boolean
} {
  const metadata: { provider?: string; amount?: number; hasInsurance?: boolean } = {}

  const allText = messages.map((m) => m.content).join(' ')

  // Extract dollar amounts
  const amountMatch = allText.match(/\$[\d,]+(?:\.\d{2})?/)
  if (amountMatch) {
    metadata.amount = parseFloat(amountMatch[0].replace(/[$,]/g, ''))
  }

  // Check for insurance mentions
  if (allText.toLowerCase().includes('insurance') || allText.toLowerCase().includes('eob')) {
    metadata.hasInsurance = true
  }

  // Extract provider names (common patterns)
  const providerPatterns = [
    /(?:from|at|with)\s+([A-Z][a-z]+\s+(?:Hospital|Medical|Clinic|Health|Center))/,
    /(?:provider|facility):\s*([A-Z][a-z\s]+)/,
  ]

  for (const pattern of providerPatterns) {
    const match = allText.match(pattern)
    const captured = match?.[1]?.trim()
    if (captured) {
      metadata.provider = captured
      break
    }
  }

  return metadata
}
