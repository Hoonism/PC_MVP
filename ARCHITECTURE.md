# Project Architecture

**Project**: BillReduce AI  
**Framework**: Next.js 14 (App Router)  
**Language**: TypeScript  
**Last Updated**: November 3, 2025

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Architectural Patterns](#architectural-patterns)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [API Design](#api-design)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)

---

## Overview

BillReduce AI is a full-stack web application that helps users:
1. Negotiate medical bills using AI
2. Create pregnancy journey storybooks

### Tech Stack

```
Frontend:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
├── TailwindCSS
└── Zustand (State Management)

Backend:
├── Next.js API Routes
├── Firebase (Auth & Database)
├── Google Gemini API (AI)
└── FAL AI (Image Generation)

Infrastructure:
├── Vercel (Hosting)
├── Firebase Storage (Files)
└── Web Vitals (Monitoring)
```

---

## Directory Structure

```
PC_BillReduce/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (routes)/             # Route groups
│   │   ├── api/                  # API routes
│   │   ├── chat/                 # Chat feature
│   │   ├── storybook/            # Storybook feature
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   │
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base UI components
│   │   ├── features/             # Feature-specific components
│   │   └── __tests__/            # Component tests
│   │
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx       # Auth context
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Auth hook
│   │   └── useNetworkStatus.ts   # Network hook
│   │
│   ├── lib/                      # Core utilities
│   │   ├── firebase.ts           # Firebase config
│   │   ├── apiClient.ts          # HTTP client
│   │   ├── monitoring.ts         # Observability
│   │   ├── imageOptimization.ts  # Image utils
│   │   └── rateLimit.ts          # Rate limiting
│   │
│   ├── middleware/               # Middleware functions
│   │   └── rateLimitMiddleware.ts
│   │
│   ├── services/                 # Business logic
│   │   ├── chatService.ts        # Chat operations
│   │   ├── chatApiService.ts     # Chat API client
│   │   └── storybookService.ts   # Storybook operations
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── chatStore.ts          # Chat state
│   │   ├── uiStore.ts            # UI state
│   │   ├── notificationStore.ts  # Notifications
│   │   ├── index.ts              # Store exports
│   │   └── __tests__/            # Store tests
│   │
│   └── types/                    # TypeScript types
│       ├── api.ts                # API types
│       └── index.ts              # Common types
│
├── public/                       # Static assets
│   ├── images/
│   └── fonts/
│
├── e2e/                          # E2E tests (Playwright)
│   ├── home.spec.ts
│   └── chat.spec.ts
│
├── jest.config.js                # Jest configuration
├── jest.setup.js                 # Jest setup
├── playwright.config.ts          # Playwright config
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
└── tsconfig.json                 # TypeScript config
```

---

## Architectural Patterns

### 1. Feature-Based Organization

Each major feature has its own directory:

```
src/app/
├── chat/              # Chat feature
│   ├── page.tsx       # Chat UI
│   └── components/    # Chat-specific components
│
└── storybook/         # Storybook feature
    ├── page.tsx
    └── components/
```

### 2. Separation of Concerns

**Layers:**

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Components, Pages, UI)          │
├─────────────────────────────────────┤
│         Business Logic Layer        │
│    (Services, Hooks, Stores)        │
├─────────────────────────────────────┤
│         Data Access Layer           │
│    (API Client, Firebase, DB)       │
├─────────────────────────────────────┤
│         Infrastructure Layer        │
│  (Monitoring, Rate Limiting, etc)   │
└─────────────────────────────────────┘
```

### 3. Component Hierarchy

```
Layout Components (app/layout.tsx)
└── Page Components (app/*/page.tsx)
    └── Feature Components (components/features/*)
        └── UI Components (components/ui/*)
```

### 4. State Management Architecture

```
┌──────────────────────────────────┐
│     React Components             │
│  (Subscribe to stores)           │
└────────────┬─────────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│     Zustand Stores               │
│  - chatStore                     │
│  - uiStore                       │
│  - notificationStore             │
└────────────┬─────────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│     Services                     │
│  (Business Logic)                │
└────────────┬─────────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│     API Client / Firebase        │
│  (Data Layer)                    │
└──────────────────────────────────┘
```

---

## Data Flow

### Request Flow

```
User Action
    ↓
Component Event Handler
    ↓
Store Action (if needed)
    ↓
Service Function
    ↓
API Client (with retry & rate limit)
    ↓
Next.js API Route (with middleware)
    ↓
External API / Database
    ↓
Response Processing
    ↓
Store Update
    ↓
Component Re-render
    ↓
User Sees Result
```

### Example: Sending a Chat Message

```typescript
// 1. User types message and clicks send
<button onClick={handleSend}>Send</button>

// 2. Event handler in component
const handleSend = async () => {
  const { addMessage, setIsLoading } = useChatStore()
  
  // 3. Update store (optimistic update)
  addMessage(userMessage)
  setIsLoading(true)
  
  // 4. Call service
  try {
    const response = await sendChatMessage({
      messages,
      userId: user?.uid
    })
    
    // 5. Update store with response
    addMessage(aiMessage)
  } catch (error) {
    // Error handling with monitoring
    trackError(error)
    notifyError('Failed to send message')
  } finally {
    setIsLoading(false)
  }
}

// Service layer
export async function sendChatMessage(request: ChatRequest) {
  // 6. API call with type safety & retry
  return await apiClient.post('/chat', request, ChatResponseSchema)
}

// API Route (with rate limiting)
export const POST = withRateLimit(async (req) => {
  // 7. Business logic
  const result = await geminiAPI.generateContent(...)
  return NextResponse.json({ message: result })
})
```

---

## State Management

### Zustand Stores

**Why Zustand?**
- Minimal boilerplate
- Better performance than Context API
- DevTools support
- Persistence built-in
- Easy testing

**Store Structure:**

```typescript
// stores/chatStore.ts
interface ChatStore {
  // State
  messages: Message[]
  isLoading: boolean
  
  // Actions
  addMessage: (msg: Message) => void
  setIsLoading: (loading: boolean) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg]
  })),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
```

**Usage:**

```typescript
// In component
const { messages, addMessage } = useChatStore()

// Selective subscription (performance)
const messages = useChatStore((state) => state.messages)
```

---

## API Design

### REST API Conventions

```
Method  | Path                | Purpose
--------|---------------------|---------------------------
GET     | /api/chats          | List user's chats
GET     | /api/chats/:id      | Get specific chat
POST    | /api/chats          | Create new chat
PUT     | /api/chats/:id      | Update chat
DELETE  | /api/chats/:id      | Delete chat
POST    | /api/chat           | Send chat message (AI)
POST    | /api/storybook      | Generate storybook
```

### API Route Structure

```typescript
// src/app/api/[resource]/route.ts
import { withRateLimit } from '@/middleware/rateLimitMiddleware'

async function handler(request: NextRequest) {
  // 1. Validate request
  const validated = RequestSchema.parse(await request.json())
  
  // 2. Check authentication
  const user = await getAuthUser(request)
  if (!user) return unauthorized()
  
  // 3. Business logic
  const result = await performOperation(validated)
  
  // 4. Return response
  return NextResponse.json(result)
}

// 5. Apply middleware
export const POST = withRateLimit(handler)
```

### Type-Safe APIs with Zod

```typescript
// Define schema
const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
  userId: z.string().optional(),
})

// Validate in API route
const request = ChatRequestSchema.parse(body)

// Validate response
const response = ChatResponseSchema.parse(data)
```

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /E2E\          Few (Critical paths)
      /─────\
     /       \
    /Integration\     Some (Component + Store)
   /───────────\
  /             \
 /   Unit Tests  \   Many (Utilities, Stores)
/─────────────────\
```

### Test Organization

```
Component Tests:    src/components/__tests__/
Store Tests:        src/stores/__tests__/
Utility Tests:      src/lib/__tests__/
E2E Tests:          e2e/
```

### Testing Tools

- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright
- **Coverage**: Jest (70%+ threshold)

---

## Security Considerations

### 1. Authentication

- Firebase Authentication
- Server-side session validation
- Protected routes with middleware

### 2. API Security

- Rate limiting on all endpoints
- Input validation with Zod
- CORS configuration
- API key rotation

### 3. Data Security

- Firebase Security Rules
- Encrypted sensitive data
- HTTPS only
- No sensitive data in logs

### 4. XSS Prevention

- React escapes by default
- Sanitize user input
- CSP headers
- No dangerouslySetInnerHTML

---

## Performance Optimizations

### 1. Code Splitting

```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />
})
```

### 2. Image Optimization

- Next.js Image component
- WebP/AVIF formats
- Lazy loading
- Responsive images
- CDN integration

### 3. Caching Strategy

```
Static Assets:   CDN + Browser Cache (1 year)
API Responses:   No cache (real-time data)
Images:          CDN + Browser Cache (7 days)
```

### 4. Bundle Size

- Code splitting by route
- Tree shaking
- Dynamic imports
- Remove unused dependencies

---

## Monitoring & Observability

### Metrics Tracked

1. **Performance**
   - Web Vitals (LCP, FID, CLS)
   - API response times
   - Page load times

2. **Errors**
   - Client-side errors
   - API errors
   - Auth failures

3. **Analytics**
   - Page views
   - User actions
   - Conversion funnels

### Tools

- Custom monitoring (`src/lib/monitoring.ts`)
- Ready for Sentry/DataDog integration
- Web Vitals tracking
- Console logging in development

---

## Deployment

### Vercel Deployment

```bash
# Development
vercel dev

# Preview
vercel

# Production
vercel --prod
```

### Environment Variables

```bash
# Required
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
GEMINI_API_KEY=
FAL_API_KEY=

# Optional
NEXT_PUBLIC_CDN_URL=
NEXT_PUBLIC_ENV=production
```

### CI/CD Pipeline

```yaml
# Automated workflow
1. Code pushed to main
2. Run tests (npm run test:ci)
3. Run linter (npm run lint)
4. Build app (npm run build)
5. Run E2E tests (npm run test:e2e)
6. Deploy to Vercel
```

---

## Best Practices

### Code Style

1. **TypeScript First** - No `any` types
2. **Functional Components** - Use hooks
3. **Small Functions** - Single responsibility
4. **DRY Principle** - Reuse code
5. **Comments** - Explain why, not what

### Component Guidelines

```typescript
// ✅ Good
function ChatMessage({ message, onDelete }: Props) {
  // Clear props, single responsibility
}

// ❌ Bad
function Component({ a, b, c, d, e, f, data }: any) {
  // Too many props, no types
}
```

### State Management

```typescript
// ✅ Good - Zustand store
const messages = useChatStore((state) => state.messages)

// ❌ Bad - Prop drilling
<Parent>
  <Child messages={messages}>
    <GrandChild messages={messages} />
  </Child>
</Parent>
```

### Error Handling

```typescript
// ✅ Good
try {
  await riskyOperation()
} catch (error) {
  trackError(error, { context: 'user_action' })
  notifyError('Operation failed. Please try again.')
}

// ❌ Bad
try {
  await riskyOperation()
} catch (error) {
  console.log(error) // Silent failure
}
```

---

## Future Improvements

### Short-term
- [ ] Add request deduplication
- [ ] Implement response caching
- [ ] Add API versioning
- [ ] Improve error boundaries

### Long-term
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Server-side rendering optimization
- [ ] Progressive Web App (PWA)

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Maintained by**: BillReduce AI Team  
**Last Review**: November 3, 2025
