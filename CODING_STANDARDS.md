# Coding Standards & Guidelines

**Project**: BillReduce AI  
**Last Updated**: November 3, 2025

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Guidelines](#typescript-guidelines)
3. [React Guidelines](#react-guidelines)
4. [File Organization](#file-organization)
5. [Naming Conventions](#naming-conventions)
6. [Code Documentation](#code-documentation)
7. [Testing Standards](#testing-standards)
8. [Git Workflow](#git-workflow)

---

## General Principles

### SOLID Principles

1. **Single Responsibility**: Each function/class does one thing
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Subtypes must be substitutable
4. **Interface Segregation**: Many specific interfaces > one general
5. **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)

```typescript
// ❌ Bad - Repeated code
function formatUserName(user: User) {
  return user.firstName + ' ' + user.lastName
}
function formatAuthorName(author: Author) {
  return author.firstName + ' ' + author.lastName
}

// ✅ Good - Reusable function
function formatFullName(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`
}
```

### KISS (Keep It Simple, Stupid)

```typescript
// ❌ Bad - Overly complex
const isValid = !!(user && user.email && user.email.length > 0 && user.email.includes('@'))

// ✅ Good - Simple and clear
const isValid = user?.email?.includes('@') ?? false
```

---

## TypeScript Guidelines

### 1. Always Use Types

```typescript
// ❌ Bad
function process(data: any) {
  return data.map((item: any) => item.value)
}

// ✅ Good
interface DataItem {
  value: string
  id: number
}

function process(data: DataItem[]): string[] {
  return data.map(item => item.value)
}
```

### 2. Avoid `any`

```typescript
// ❌ Bad
const result: any = await fetch('/api/data')

// ✅ Good
interface ApiResponse {
  data: string[]
  success: boolean
}

const result = await apiClient.get<ApiResponse>('/data', ApiResponseSchema)
```

### 3. Use Strict Mode

```json
// tsconfig.json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

### 4. Prefer Interfaces for Objects

```typescript
// ✅ Good
interface User {
  id: string
  name: string
  email: string
}

// ✅ Also good for unions/primitives
type Status = 'active' | 'inactive' | 'pending'
```

### 5. Use Enums Sparingly

```typescript
// ❌ Avoid - Enums add runtime code
enum Color {
  Red,
  Green,
  Blue
}

// ✅ Prefer - Zero runtime cost
type Color = 'red' | 'green' | 'blue'
```

---

## React Guidelines

### 1. Functional Components Only

```typescript
// ❌ Bad - Class components
class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>
  }
}

// ✅ Good - Functional components
function MyComponent() {
  return <div>Hello</div>
}
```

### 2. Use Proper Hooks

```typescript
// ❌ Bad - Conditional hooks
function Component({ condition }) {
  if (condition) {
    const [state, setState] = useState(0)
  }
}

// ✅ Good - Hooks at top level
function Component({ condition }) {
  const [state, setState] = useState(0)
  
  if (!condition) return null
  // ...
}
```

### 3. Destructure Props

```typescript
// ❌ Bad
function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}

// ✅ Good
function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

### 4. Use Composition

```typescript
// ❌ Bad - Prop drilling
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />
  </Child>
</Parent>

// ✅ Good - Context or Store
const data = useDataStore()
```

### 5. Memoization

```typescript
// Use useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name))
}, [data])

// Use useCallback for event handlers passed to children
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// Use memo for pure components
export const ExpensiveComponent = memo(({ data }) => {
  // ...
})
```

---

## File Organization

### File Naming

```
Components:      PascalCase.tsx        (Button.tsx)
Utilities:       camelCase.ts          (formatDate.ts)
Hooks:           use + PascalCase.ts   (useAuth.ts)
Constants:       UPPER_SNAKE_CASE.ts   (API_ENDPOINTS.ts)
Types:           PascalCase.ts         (User.ts)
```

### Directory Structure

```typescript
// ✅ Good - Co-locate related files
components/
  Button/
    Button.tsx
    Button.test.tsx
    Button.module.css
    index.ts

// ✅ Also good - Feature-based
features/
  auth/
    components/
    hooks/
    services/
    types/
```

### Import Order

```typescript
// 1. External dependencies
import React from 'react'
import { useRouter } from 'next/navigation'

// 2. Internal modules (aliased)
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'

// 3. Relative imports
import { helper } from './helper'
import styles from './Component.module.css'

// 4. Types
import type { User } from '@/types'
```

---

## Naming Conventions

### Variables

```typescript
// ✅ Good - Descriptive names
const userEmail = 'user@example.com'
const isAuthenticated = true
const totalPrice = 100

// ❌ Bad - Unclear names
const e = 'user@example.com'
const flag = true
const t = 100
```

### Functions

```typescript
// ✅ Good - Verb + noun
function getUserById(id: string): User { }
function validateEmail(email: string): boolean { }
function formatCurrency(amount: number): string { }

// ❌ Bad - Unclear purpose
function process(data: any) { }
function doIt() { }
```

### Boolean Variables

```typescript
// ✅ Good - Question format
const isLoading = true
const hasAccess = false
const canEdit = true
const shouldUpdate = false

// ❌ Bad
const loading = true
const access = false
```

### Constants

```typescript
// ✅ Good - UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const API_BASE_URL = 'https://api.example.com'
const DEFAULT_TIMEOUT = 5000

// ❌ Bad
const maxRetries = 3
```

### Event Handlers

```typescript
// ✅ Good - handle + Event
const handleClick = () => { }
const handleSubmit = () => { }
const handleInputChange = () => { }

// ❌ Bad
const onClick = () => { }
const submit = () => { }
```

---

## Code Documentation

### JSDoc Comments

```typescript
/**
 * Calculate the total price including tax
 * 
 * @param price - Base price before tax
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns Total price with tax included
 * 
 * @example
 * calculateTotal(100, 0.1) // Returns 110
 */
function calculateTotal(price: number, taxRate: number): number {
  return price * (1 + taxRate)
}
```

### Inline Comments

```typescript
// ✅ Good - Explain WHY
// Using setTimeout to debounce rapid clicks
const debouncedClick = debounce(handleClick, 300)

// ❌ Bad - Explain WHAT (code already shows this)
// Set the user variable to null
const user = null
```

### Component Documentation

```typescript
/**
 * Button component with loading state and variants
 * 
 * @component
 * @example
 * <Button variant="primary" loading={isLoading} onClick={handleClick}>
 *   Submit
 * </Button>
 */
interface ButtonProps {
  /** Button text or content */
  children: React.ReactNode
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger'
  /** Show loading spinner */
  loading?: boolean
  /** Click handler */
  onClick?: () => void
}

export function Button({ children, variant = 'primary', loading, onClick }: ButtonProps) {
  // ...
}
```

---

## Testing Standards

### Test File Naming

```
Component:  Button.test.tsx
Hook:       useAuth.test.ts
Utility:    formatDate.test.ts
E2E:        login.spec.ts
```

### Test Structure

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Reset state
  })

  describe('feature/method', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test'
      
      // Act
      const result = myFunction(input)
      
      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### Test Coverage

- **Minimum**: 70% overall
- **Critical paths**: 90%+
- **Utilities**: 80%+
- **Components**: 70%+

### What to Test

```typescript
// ✅ Test behavior
it('should show error when email is invalid', () => {
  render(<LoginForm />)
  userEvent.type(screen.getByLabelText('Email'), 'invalid')
  userEvent.click(screen.getByText('Submit'))
  expect(screen.getByText('Invalid email')).toBeInTheDocument()
})

// ❌ Don't test implementation details
it('should call setState with email', () => {
  // Testing internal state is fragile
})
```

---

## Git Workflow

### Commit Messages

Follow Conventional Commits:

```bash
# Format
<type>(<scope>): <subject>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting
refactor: Code restructure
test:     Tests
chore:    Maintenance

# Examples
feat(auth): add password reset flow
fix(chat): prevent duplicate messages
docs(readme): update setup instructions
test(stores): add chatStore tests
```

### Branch Naming

```bash
# Format
<type>/<description>

# Examples
feature/add-rate-limiting
fix/chat-scroll-bug
refactor/api-client
docs/architecture-guide
```

### PR Guidelines

1. **Title**: Clear and descriptive
2. **Description**: What, why, how
3. **Tests**: Include test results
4. **Screenshots**: For UI changes
5. **Breaking changes**: Clearly marked

---

## Error Handling

### Try-Catch

```typescript
// ✅ Good - Specific error handling
try {
  await riskyOperation()
} catch (error) {
  if (error instanceof ValidationError) {
    notifyError('Invalid input')
  } else if (error instanceof NetworkError) {
    notifyError('Connection failed')
  } else {
    trackError(error)
    notifyError('Something went wrong')
  }
}

// ❌ Bad - Silent failures
try {
  await riskyOperation()
} catch (error) {
  console.log(error)
}
```

### Error Boundaries

```typescript
// Wrap app sections with error boundaries
<ErrorBoundary fallback={<ErrorPage />}>
  <ChatPage />
</ErrorBoundary>
```

---

## Performance

### Avoid Unnecessary Re-renders

```typescript
// ✅ Good - Selective subscription
const messages = useChatStore(state => state.messages)

// ❌ Bad - Subscribe to entire store
const store = useChatStore()
```

### Lazy Loading

```typescript
// ✅ Good - Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'))

// ❌ Bad - Large initial bundle
import HeavyComponent from './HeavyComponent'
```

### Image Optimization

```typescript
// ✅ Good - Optimized images
<OptimizedImage
  src="/hero.jpg"
  width={800}
  height={600}
  alt="Hero"
/>

// ❌ Bad - Unoptimized
<img src="/hero.jpg" />
```

---

## Security

### Input Validation

```typescript
// ✅ Good - Validate with Zod
const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().positive(),
})

const user = UserSchema.parse(input)

// ❌ Bad - No validation
const user = input
```

### Sanitize Output

```typescript
// ✅ Good - React escapes automatically
<div>{userInput}</div>

// ❌ Bad - XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Environment Variables

```typescript
// ✅ Good - Never commit secrets
const apiKey = process.env.GEMINI_API_KEY

// ❌ Bad - Hardcoded secrets
const apiKey = 'sk-abc123...'
```

---

## Accessibility

### Semantic HTML

```typescript
// ✅ Good
<button onClick={handleClick}>Submit</button>
<nav><ul><li><a href="/about">About</a></li></ul></nav>

// ❌ Bad
<div onClick={handleClick}>Submit</div>
<div><div><div>About</div></div></div>
```

### ARIA Attributes

```typescript
// ✅ Good
<button
  onClick={handleDelete}
  aria-label="Delete message"
>
  <TrashIcon />
</button>

// ❌ Bad
<button onClick={handleDelete}>
  <TrashIcon />
</button>
```

### Keyboard Navigation

```typescript
// ✅ Good - Keyboard accessible
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

---

## Code Review Checklist

### Before Submitting PR

- [ ] Code follows style guide
- [ ] All tests passing
- [ ] No console.logs or debugger statements
- [ ] Types are correct (no `any`)
- [ ] Error handling in place
- [ ] Comments explain complex logic
- [ ] Performance considered
- [ ] Accessibility checked
- [ ] Security reviewed

### Reviewing Code

- [ ] Logic is sound
- [ ] Edge cases handled
- [ ] Tests are comprehensive
- [ ] No performance issues
- [ ] Follows architecture
- [ ] Documentation updated
- [ ] Breaking changes noted

---

## Quick Reference

### File Creation Checklist

Creating a new component:
- [ ] Create component file (PascalCase.tsx)
- [ ] Add PropTypes interface
- [ ] Add JSDoc comments
- [ ] Create test file
- [ ] Export from index.ts

Creating a new utility:
- [ ] Create utility file (camelCase.ts)
- [ ] Add JSDoc with examples
- [ ] Add unit tests
- [ ] Export from index.ts

Creating a new API route:
- [ ] Create route.ts
- [ ] Add request/response types
- [ ] Add validation (Zod)
- [ ] Add rate limiting
- [ ] Add error handling
- [ ] Add tests

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic HTML](https://developer.mozilla.org/en-US/docs/Glossary/Semantics)

---

**Maintained by**: BillReduce AI Team  
**Last Review**: November 3, 2025
