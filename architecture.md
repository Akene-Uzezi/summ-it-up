# Architecture Documentation

## Overview

Summ-It-Up is a client-side web application that integrates with a backend summarization service to provide text summarization capabilities. The architecture prioritizes simplicity, responsiveness, and a modern user experience.

## High-Level Architecture

```

                    Client (Browser)                      
                                                         
   
     Next.js 16 (App Router)                         
                                                     
    
     React 19 Client Components                    
     - State Management (useState)                  
     - Form Handling                               
     - Async Operations                            
    
                                                     
    
     UI Component Layer                            
     - shadcn/ui Components                        
     - Custom Styled Components                    
     - Animations (framer-motion)                  
    
                                                     
    
     Tailwind CSS + Custom Theme                   
     - OKLCH Color Space                          
     - Dark/Light Support                          
    
   
                                                         
   HTTPS (JSON)                                       
                                                         
   
     Backend API (External)                          
     POST /summarize                                 
     - Input: { input: string }                     
     - Output: { summary: string }                   
   

```

## Application Layers

### 1. Presentation Layer

The presentation layer is built entirely with React components in the `app/` and `components/` directories.

#### App Router Structure
- **`app/layout.tsx`**: Root layout with metadata and global font definitions
- **`app/page.tsx`**: Main application page (client component)
- **`app/globals.css`**: Global CSS with Tailwind and theme definitions

#### Component Hierarchy

```
Home (Page Component)
├── Header Section (conditional rendering)
├── Error Card (conditional)
├── Loading Skeleton (conditional)
├── Summary Card (conditional)
└── Input Form Card
    ├── Textarea (auto-resizing)
    └── Submit Button
```

### 2. Component Layer

Reusable UI components located in `components/ui/`:

#### Button Component (`button.tsx`)
- **Purpose**: Interactive button with multiple visual variants
- **Technology**: `class-variance-authority` for type-safe variant management
- **Variants**: default, outline, secondary, ghost, destructive, link
- **Sizes**: xs, sm, default, lg, icon (with sub-variants)
- **Features**:
  - Data attributes for styling (`data-variant`, `data-size`)
  - Focus-visible states for accessibility
  - Disabled state handling
  - Slot support for composition

#### Card Component (`card.tsx`)
- **Purpose**: Container component with consistent styling
- **Composable Parts**: Header, Title, Description, Content, Footer, Action
- **Size Variants**: default, sm
- **Features**:
  - Responsive padding and gaps
  - Border and background styling
  - Size-based conditional styling

#### Textarea Component (`textarea.tsx`)
- **Purpose**: Text input with auto-resizing capability
- **Key Features**:
  - Dynamic height adjustment based on content
  - Configurable min/max rows
  - Smooth transitions
  - Overflow management (scroll when max reached)
- **Implementation**:
  - Uses `scrollHeight` for accurate content measurement
  - Accounts for padding and line-height
  - useEffect for initial sizing and value changes
  - useCallback for performance optimization

#### Skeleton Component (`skeleton.tsx`)
- **Purpose**: Loading state placeholder
- **Features**:
  - Animated pulse effect
  - Reusable for any content type
  - Simple, lightweight implementation

### 3. Utility Layer

#### `lib/utils.ts`
- **`cn()` function**: Combines `clsx` and `tailwind-merge` for conditional class management
- **Purpose**: Type-safe className concatenation with deduplication

### 4. State Management

The application uses React's built-in state management:

#### State Variables (in `page.tsx`)
- **`inputValue`** (string): Current textarea content
- **`loading`** (boolean): API request in progress
- **`summary`** (string | null): Generated summary result
- **`error`** (string | null): Error message from API

#### State Transitions

```
Idle (no summary, not loading)
    ↓ [submit]
Loading (show skeleton, disable input)
    ↓ [API response]
    → Success → Display Summary
    → Error → Show Error Message (3s timeout)
    ↓ [dismiss/retry]
    → Idle
```

## Data Flow

### 1. User Input

1. User types/pastes into the Textarea component
2. `onChange` handler updates `inputValue` state
3. Auto-resizing adjusts textarea height (if enabled)

### 2. Form Submission

```typescript
handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  
  // API Request
  fetch(`${backendUrl}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: inputValue })
  })
  .then(response => response.json())
  .then(data => setSummary(data.summary))
  .catch(error => setError(error.message))
  .finally(() => setLoading(false))
}
```

### 3. API Integration

**Endpoint**: `POST /summarize`

**Request**:
```json
{
  "input": "Text or URL to summarize"
}
```

**Response** (Success):
```json
{
  "summary": "Generated summary text"
}
```

**Response** (Error):
```json
{
  "message": "Error description"
}
```

**Error Handling**:
- Non-OK responses trigger error state
- Errors auto-dismiss after 3 seconds (setTimeout)
- Console logging for debugging
- Loading state always reset in finally block

## Styling Architecture

### CSS Architecture

```
Global CSS (globals.css)
├── Tailwind CSS Import
├── tw-animate-css Import
├── shadcn Tailwind Config
├── Custom Variant Definition (dark mode)
├── Theme Token Definitions (OKLCH colors)
└── Base Layer
    ├── Border/Outline Utilities
    └── Body/HTML Styling
```

### Design Tokens

All colors use **OKLCH** color space for perceptual uniformity:

| Token | Light Mode | Dark Mode | Purpose |
|-------|-----------|-----------|---------|
| `--background` | `oklch(0.205 0 0)` | `oklch(0.145 0 0)` | Page background |
| `--foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Primary text |
| `--card` | `oklch(0.25 0 0)` | `oklch(0.205 0 0)` | Card backgrounds |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Primary actions |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover states |
| `--border` | `oklch(0.3 0 0)` | `oklch(1 0 0 / 10%)` | Borders |

### Component Styling Pattern

1. **Base Styles**: Tailwind utility classes
2. **Variants**: Data attributes (`data-variant`, `data-size`)
3. **Conditional**: `cn()` helper for dynamic classes
4. **Responsive**: Mobile-first breakpoints

## Build and Deployment

### Build Pipeline

```
npm run build
  ↓
Next.js Compilation
  ├── TypeScript Type Checking
  ├── Tree Shaking
  ├── Code Splitting
  └── Static Optimization
      ↓
  .next/ directory (output)
```

### Configuration Files

#### `tsconfig.json`
- **Target**: ES2017
- **JSX**: React JSX (automatic)
- **Module**: ESNext with bundler resolution
- **Features**: Incremental compilation, isolated modules
- **Paths**: `@/*` alias for `./`

#### `next.config.ts`
- Minimal configuration (extensible)
- Next.js 16 defaults

### Scripts

- **`npm run dev`**: Development server with hot reload
- **`npm run build`**: Production build with optimization
- **`npm run start`**: Production server
- **`npm run lint`**: ESLint code linting

## Performance Considerations

### Optimizations Implemented

1. **Client-Side Rendering**: Minimal server overhead
2. **Code Splitting**: Automatic by Next.js
3. **Lazy Loading**: Components load on demand
4. **Memoization**: `useCallback` for expensive operations
5. **Efficient Re-renders**: Minimal state updates

### Potential Improvements

1. **Caching**: Implement SWR/React Query for API responses
2. **Debouncing**: Add debounce to textarea auto-resize
3. **Virtualization**: For long summaries
4. **SSR**: Server-side rendering for initial page load
5. **Streaming**: Progressive summary display for long content

## Security Considerations

### Current Implementation

- Input is sent directly to backend (no sanitization)
- No authentication/authorization
- Environment variables exposed to client (NEXT_PUBLIC_ prefix)

### Recommended Enhancements

1. **Input Validation**: Sanitize and validate user input
2. **Rate Limiting**: Prevent API abuse
3. **Authentication**: User accounts and API keys
4. **CORS**: Restrict API access to known origins
5. **HTTPS**: Enforce encrypted connections
6. **Error Handling**: Mask internal errors from users

## Scalability

### Current Limitations

- Single-page application (limited to client resources)
- No persistence (no local storage/database)
- Direct API coupling

### Scaling Strategies

1. **Backend**: Microservices architecture for summarization
2. **Caching**: Redis for frequent requests
3. **Queue**: Message queue for long-running summaries
4. **CDN**: Static asset delivery
5. **Load Balancing**: Multiple backend instances
6. **Database**: Store summaries and user history

## Testing Strategy

### Current State

- No formal testing framework configured
- Manual testing required

### Recommended Approach

1. **Unit Tests**: Jest + React Testing Library
2. **Component Tests**: Test UI interactions
3. **Integration Tests**: API call flows
4. **E2E Tests**: Playwright/Cypress for user journeys
5. **Type Tests**: TypeScript compilation checks

## Future Enhancements

### Short-term
- [ ] Add loading skeletons for better UX
- [ ] Implement error boundary components
- [ ] Add toast notifications
- [ ] Input validation and feedback

### Long-term
- [ ] User authentication
- [ ] Summary history/local storage
- [ ] Multiple summary formats
- [ ] Compare summaries
- [ ] Export functionality
- [ ] Browser extension
- [ ] Mobile application