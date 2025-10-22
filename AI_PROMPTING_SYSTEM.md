# AI Prompting System - Enhanced Architecture

## Overview

The AI chat system now uses **dynamic, context-aware prompting** with user memory, conversation analysis, and few-shot learning to deliver personalized, high-quality bill negotiation assistance.

---

## Architecture Components

### 1. **User Profile Service** (`userProfileService.ts`)

Stores and retrieves user-specific context to personalize AI responses.

#### User Profile Schema
```typescript
{
  userId: string
  communicationStyle: 'formal' | 'friendly' | 'assertive'
  financialSituation: 'tight' | 'moderate' | 'flexible'
  hasInsurance: boolean
  insuranceProvider?: string
  successfulStrategies: string[]
  totalBillsNegotiated: number
  totalAmountSaved: number
  averageReductionRate: number
  commonProviders: string[]
  preferredPaymentTerms?: string
}
```

#### Key Features
- **Automatic Profile Creation**: First-time users get default profile
- **Negotiation Tracking**: Records successful strategies and outcomes
- **Bill Context Storage**: Maintains history of uploaded bills and results

---

### 2. **Prompt Builder** (`promptBuilder.ts`)

Dynamically constructs system prompts based on user context and conversation state.

#### Dynamic Prompt Components

**Base Prompt**
- Core role definition
- Primary objectives
- General guidance

**Communication Style Adaptation**
```typescript
formal → "Use formal, professional language with proper business etiquette"
friendly → "Use warm, approachable language while maintaining professionalism"
assertive → "Use confident, direct language that emphasizes the user's rights"
```

**Financial Context Injection**
```typescript
tight → "Prioritize payment plans, hardship programs, and charity care"
moderate → "Focus on fair pricing and reasonable payment terms"
flexible → "Focus on billing errors and overcharges"
```

**Insurance Awareness**
- Considers coverage status
- Mentions specific provider if known
- Adjusts advice for in/out-of-network scenarios

**Past Success Integration**
- References previously successful strategies
- Builds user confidence
- Provides continuity across conversations

**Track Record Display**
- Shows negotiation history
- Highlights savings achieved
- Reinforces user capability

---

### 3. **Few-Shot Learning**

Provides high-quality examples to guide AI responses.

#### When Applied
- **First 3 messages** of a conversation
- Ensures consistent message formatting
- Demonstrates professional tone and structure

#### Example Template
```
User: "Can you help me write a message to negotiate my $5,000 hospital bill?"

AI: Provides professionally formatted message with:
- Clear subject line
- Formal greeting
- Itemized requests
- Professional closing
- Actionable tips for sending
```

---

### 4. **Conversation Summarization**

Manages context window for long conversations (>15 messages).

#### What Gets Summarized
- Main topics discussed (itemized statements, payment plans, etc.)
- Key bill details mentioned
- Negotiation stage
- Total message count

#### Benefits
- Prevents token limit issues
- Maintains conversation continuity
- Reduces API costs
- Keeps AI focused on current needs

---

### 5. **Bill Metadata Extraction**

Automatically extracts key information from conversation.

#### Extracted Data
- **Provider Name**: Hospital, clinic, or medical facility
- **Bill Amount**: Dollar amounts mentioned
- **Insurance Status**: Whether insurance is involved

#### Usage
- Informs prompt context
- Stored for future reference
- Helps track negotiation outcomes

---

## Message Quality Improvements

### Before Enhancement
```
❌ Generic, one-size-fits-all responses
❌ No memory of user preferences
❌ No learning from past successes
❌ Static system prompt
❌ No conversation context management
❌ Limited message formatting guidance
```

### After Enhancement
```
✅ Personalized based on user profile
✅ Adapts to communication style preference
✅ References past successful strategies
✅ Dynamic prompts with rich context
✅ Automatic conversation summarization
✅ Few-shot examples for quality
✅ Bill metadata extraction
✅ Financial situation awareness
```

---

## How It Works: Request Flow

```
1. User sends message
   ↓
2. Frontend passes: messages + billFileName + userId
   ↓
3. API Route:
   - Fetches user profile from Firestore
   - Extracts bill metadata from conversation
   - Builds dynamic system prompt with context
   - Adds few-shot examples (if early conversation)
   - Adds conversation summary (if long conversation)
   ↓
4. Sends to GPT-5 with enriched context
   ↓
5. Returns personalized, high-quality response
```

---

## Example: Prompt Transformation

### Generic Prompt (Before)
```
You are an expert AI assistant helping people negotiate medical bills.
Provide clear advice and draft professional messages.
```

### Personalized Prompt (After)
```
You are an expert AI assistant helping people negotiate medical bills.
[...base instructions...]

**Communication Style**: Use warm, approachable language while 
maintaining professionalism.

**Financial Context**: The user has limited financial resources. 
Prioritize payment plans, hardship programs, and charity care options.

**Insurance**: The user has insurance with Blue Cross. Consider 
insurance coverage, EOBs, and out-of-network charges in your advice.

**Past Successes**: This user has had success with: requesting 
itemized statements, negotiating payment plans. Consider these 
approaches when relevant.

**Track Record**: This user has successfully negotiated 3 bill(s), 
saving an average of 35%. Build on this confidence.

**Current Bill**: The user has uploaded: hospital_bill_march_2024.pdf
```

---

## User Settings Interface

New `/settings` page allows users to configure:

### Communication Style
- **Formal**: Professional business language
- **Friendly**: Warm and approachable
- **Assertive**: Direct and confident

### Financial Situation
- **Limited Resources**: Focus on hardship programs
- **Moderate Flexibility**: Balance affordability and fairness
- **Financially Stable**: Focus on accuracy and fair pricing

### Insurance Information
- Insurance status (yes/no)
- Provider name (optional)

### Payment Preferences
- Preferred payment terms
- Custom notes

### Stats Dashboard
- Total bills negotiated
- Total amount saved
- Average reduction rate

---

## API Parameters

### Request Format
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "billFileName": "medical_bill.pdf",
  "userId": "firebase_user_id"
}
```

### Response Format
```json
{
  "message": "AI response text",
  "success": true
}
```

---

## Fine-Tuning Opportunities

### Current Implementation
- ✅ Dynamic prompting with user context
- ✅ Few-shot learning examples
- ✅ Conversation summarization
- ✅ Bill metadata extraction

### Future Fine-Tuning Options

#### 1. **Custom Model Training**
- Train on successful negotiation examples
- Learn from user feedback (thumbs up/down)
- Optimize for bill reduction outcomes

#### 2. **Template Library**
- Build database of successful messages
- Categorize by provider type, bill amount, situation
- Retrieve most relevant templates dynamically

#### 3. **Outcome-Based Learning**
- Track which AI suggestions led to success
- A/B test different prompting strategies
- Continuously improve based on results

#### 4. **Provider-Specific Knowledge**
- Learn negotiation patterns per provider
- Identify provider-specific policies
- Tailor advice based on provider history

#### 5. **Sentiment Analysis**
- Detect user stress/frustration levels
- Adjust tone and empathy accordingly
- Provide emotional support when needed

---

## Performance Metrics

### Token Efficiency
- **Base prompt**: ~150 tokens
- **With user context**: ~250 tokens (+100)
- **With few-shot examples**: ~500 tokens (+250)
- **With summarization**: ~300 tokens (+50)

### Quality Improvements
- More consistent message formatting
- Better alignment with user preferences
- Reduced need for clarification
- Higher user satisfaction

---

## Best Practices

### For Users
1. **Complete Settings**: Fill out preferences for best results
2. **Provide Context**: Mention bill amounts, providers, insurance
3. **Update Profile**: Record successful negotiations
4. **Be Specific**: Clear questions get better answers

### For Developers
1. **Monitor Token Usage**: Track costs per conversation
2. **Collect Feedback**: Implement rating system
3. **Analyze Outcomes**: Track negotiation success rates
4. **Iterate Prompts**: Continuously improve based on data
5. **Test Edge Cases**: Handle missing profile data gracefully

---

## Security & Privacy

### Data Protection
- User profiles stored in Firestore with proper auth
- No sensitive bill data stored (only metadata)
- API key secured server-side
- User data isolated by userId

### Privacy Considerations
- Users control what information they provide
- Optional fields for sensitive data
- Can delete profile anytime
- No sharing of user data across accounts

---

## Testing the System

### Test Scenarios

**1. New User (No Profile)**
- Should get default friendly tone
- Should still provide quality advice
- Should prompt to complete settings

**2. Configured User**
- Should reflect communication style
- Should reference financial situation
- Should mention insurance if applicable

**3. Returning User with History**
- Should reference past successes
- Should show track record
- Should build on previous strategies

**4. Long Conversation**
- Should summarize after 15+ messages
- Should maintain context
- Should avoid repetition

---

## Troubleshooting

### Issue: AI responses seem generic
**Solution**: Ensure user is signed in and has completed settings

### Issue: AI doesn't remember preferences
**Solution**: Check that userId is being passed to API

### Issue: Responses too long/short
**Solution**: Adjust max_tokens parameter in route.ts

### Issue: Context not maintained in long chats
**Solution**: Verify summarization is working (check logs)

---

## Summary

The enhanced AI prompting system delivers **personalized, context-aware, high-quality** bill negotiation assistance through:

1. **User Memory**: Stores preferences, history, and successful strategies
2. **Dynamic Prompting**: Adapts system prompt based on user context
3. **Few-Shot Learning**: Provides quality examples for consistency
4. **Conversation Management**: Summarizes long chats for efficiency
5. **Metadata Extraction**: Automatically captures bill details
6. **Settings UI**: Allows users to customize their experience

This creates a **learning system** that improves with each interaction and provides increasingly personalized assistance over time.
