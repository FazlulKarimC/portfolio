# Design Document

## Overview

The AI Chat Roleplay feature will be implemented as a sophisticated, expandable chat component that integrates seamlessly with the existing portfolio design. The component will be positioned above the about section and will provide visitors with an interactive way to learn about Fazlul through AI-powered conversations. The design leverages the existing shadcn/ui component system and maintains consistency with the portfolio's visual language.

## Architecture

### Component Hierarchy
```
AIChatComponent
├── ChatTrigger (collapsed state)
│   └── SearchInput (with "Ask me anything" placeholder)
├── ChatContainer (expanded state)
│   ├── ChatHeader
│   │   ├── Title
│   │   └── CollapseButton
│   ├── ChatMessages
│   │   ├── MessageList
│   │   │   ├── UserMessage[]
│   │   │   └── AIMessage[]
│   │   └── ScrollArea
│   └── ChatInput
│       ├── MessageInput
│       ├── SendButton
│       └── LoadingIndicator
```

### State Management
- **Component State**: React useState for local UI state (expanded/collapsed, messages, input value)
- **Chat History**: Maintained in component state, cleared on page refresh
- **AI Context**: Static context derived from portfolio DATA object
- **Loading States**: Managed locally for message sending and AI response waiting

### Integration Points
- **Portfolio Data**: Direct import from `@/data/resume` for AI context
- **UI Components**: Leverages existing shadcn/ui components (Card, Button, Input, ScrollArea)
- **Animation**: Uses framer-motion for smooth expand/collapse transitions
- **Styling**: Follows existing Tailwind CSS patterns and design tokens

## Components and Interfaces

### 1. AIChatComponent (Main Container)
**Purpose**: Root component that manages the overall chat state and positioning

**Props Interface**:
```typescript
interface AIChatComponentProps {
  className?: string;
  defaultExpanded?: boolean;
}
```

**Key Features**:
- Manages expanded/collapsed state
- Handles smooth transitions between states
- Integrates with BlurFade animation system
- Positioned above about section with proper spacing

### 2. ChatTrigger (Collapsed State)
**Purpose**: Displays the initial search box that triggers chat expansion

**Design Specifications**:
- Clean, minimal search input with rounded corners
- "Ask me anything" placeholder text
- Subtle hover effects and focus states
- Consistent with portfolio's input styling
- Width matches the about section container

**Styling**:
```css
- Background: bg-background with border
- Padding: px-4 py-3
- Border radius: rounded-lg
- Border: border-input
- Focus: ring-1 ring-ring
```

### 3. ChatContainer (Expanded State)
**Purpose**: Full chat interface with message history and input

**Design Specifications**:
- Card-based layout with subtle shadow
- Maximum height with scroll for message overflow
- Smooth expand animation from collapsed state
- Responsive design for mobile devices

**Dimensions**:
- Max width: matches about section (max-w-2xl)
- Max height: 400px with scroll
- Padding: p-4
- Border radius: rounded-lg

### 4. ChatMessages (Message Display)
**Purpose**: Displays conversation history with proper message styling

**Message Types**:

**User Messages**:
- Alignment: Right-aligned
- Background: bg-primary with text-primary-foreground
- Border radius: rounded-lg with rounded-br-sm
- Max width: 80% of container
- Margin: ml-auto mb-2

**AI Messages**:
- Alignment: Left-aligned
- Background: bg-muted with text-foreground
- Border radius: rounded-lg with rounded-bl-sm
- Max width: 80% of container
- Margin: mr-auto mb-2
- Avatar: Small circular avatar with "FK" initials

### 5. ChatInput (Message Input Area)
**Purpose**: Input field for typing and sending messages

**Design Specifications**:
- Sticky bottom positioning within chat container
- Input field with send button
- Character limit indicator (500 chars)
- Loading state during AI response
- Enter key submission support

## Data Models

### Message Interface
```typescript
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}
```

### Chat State Interface
```typescript
interface ChatState {
  isExpanded: boolean;
  messages: ChatMessage[];
  currentInput: string;
  isLoading: boolean;
  error?: string;
}
```

### AI Context Interface
```typescript
interface AIContext {
  name: string;
  role: string;
  experience: string;
  skills: string[];
  projects: Project[];
  education: Education[];
  contact: ContactInfo;
  personality: string;
}
```

## AI Integration Strategy

### Context Preparation
The AI will be provided with a structured context derived from the portfolio DATA:

```typescript
const aiContext = {
  name: "Fazlul Karim Choudhury",
  role: "Full-stack Developer",
  experience: "1+ year at ADP, B.Tech in Computer Science",
  skills: DATA.skills,
  projects: DATA.projects.map(p => ({
    name: p.title,
    description: p.description,
    technologies: p.technologies
  })),
  personality: "Passionate, results-driven, keen interest in AI/ML"
};
```

### Response Generation
- **Local Processing**: Use a simple template-based system for common questions
- **AI Service Integration**: For complex queries, integrate with OpenAI API or similar
- **Fallback Responses**: Graceful handling when AI service is unavailable
- **Response Formatting**: Maintain conversational tone while staying in character

### Sample AI Prompts
```
System: You are Fazlul Karim Choudhury, a full-stack developer from Assam, India. 
Respond as if you are personally answering questions about your experience, projects, 
and skills. Be friendly, professional, and helpful. Use the provided context about 
your background, but don't just recite facts - engage conversationally.

Context: [Portfolio data will be inserted here]

User: {user_message}
Assistant: [Response as Fazlul]
```

## Error Handling

### Network Errors
- Display user-friendly error messages
- Provide retry functionality
- Fallback to contact information when AI is unavailable

### Input Validation
- Character limit enforcement (500 chars)
- Empty message prevention
- XSS protection through proper sanitization

### Rate Limiting
- Implement client-side rate limiting to prevent spam
- Show appropriate feedback when limits are reached

## Testing Strategy

### Unit Tests
- Component rendering in both collapsed and expanded states
- Message display and formatting
- Input validation and character limits
- State management and transitions

### Integration Tests
- AI context preparation from portfolio data
- Message flow from input to display
- Error handling scenarios
- Responsive behavior across devices

### User Experience Tests
- Smooth animations and transitions
- Keyboard navigation and accessibility
- Mobile responsiveness
- Performance with long conversation histories

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation support
- Focus management during state transitions
- ARIA labels and descriptions

## Performance Considerations

### Optimization Strategies
- Lazy loading of AI service integration
- Message virtualization for long conversations
- Debounced input handling
- Efficient re-rendering with React.memo

### Bundle Size
- Dynamic imports for AI service code
- Tree-shaking of unused utilities
- Minimal external dependencies

### Animation Performance
- Hardware-accelerated CSS transforms
- Reduced motion preferences support
- Smooth 60fps animations

## Security Considerations

### Input Sanitization
- XSS prevention through proper escaping
- Content filtering for inappropriate messages
- Rate limiting to prevent abuse

### AI Response Safety
- Content moderation for AI responses
- Fallback to safe responses when needed
- No sensitive information exposure

## Mobile Responsiveness

### Breakpoint Adaptations
- **Mobile (< 640px)**: Full-width chat, adjusted padding
- **Tablet (640px - 1024px)**: Responsive width with margins
- **Desktop (> 1024px)**: Fixed max-width, centered alignment

### Touch Interactions
- Larger touch targets for mobile
- Swipe gestures for chat navigation
- Optimized keyboard handling on mobile devices

## Animation and Transitions

### Expand/Collapse Animation
```css
- Duration: 300ms
- Easing: ease-in-out
- Transform: height and opacity
- Preserve scroll position during transitions
```

### Message Animations
- Fade-in for new messages
- Smooth scroll to latest message
- Loading indicators with subtle animations

### Integration with Existing Animations
- Consistent with BlurFade timing (BLUR_FADE_DELAY * 2.5)
- Respects user's motion preferences
- Maintains portfolio's animation aesthetic