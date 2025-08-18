# AI Context Preparation System

This module provides a comprehensive system for preparing AI context from portfolio data to enable roleplay conversations in the AI chat component.

## Overview

The AI Context Preparation System transforms the portfolio DATA into structured context that can be used to generate contextual AI responses. It includes interfaces, context preparation functions, prompt formatting, template responses, input sanitization, and topic extraction.

## Components

### 1. AIContext Interface

Defines the structure for AI context data:

```typescript
interface AIContext {
  name: string;
  role: string;
  location: string;
  experience: string;
  skills: string[];
  projects: ProjectContext[];
  education: EducationContext[];
  contact: ContactContext;
  personality: string;
  summary: string;
}
```

### 2. Core Functions

#### `prepareAIContext(): AIContext`

Transforms portfolio DATA into structured AI context.

**Features:**
- Converts projects with technologies, status, and links
- Formats education with institution, degree, and period
- Prepares contact information including social links
- Includes personality traits and professional background

**Usage:**
```typescript
import { prepareAIContext } from '@/lib/ai-context';

const context = prepareAIContext();
console.log(context.name); // "Fazlul Karim Choudhury"
console.log(context.skills); // ["React.js", "Next.js", ...]
```

#### `formatAIPrompt(userMessage: string): string`

Creates comprehensive system prompts for AI services.

**Features:**
- Includes complete background information
- Provides conversation instructions
- Maintains roleplay character consistency
- Formats user message for AI processing

**Usage:**
```typescript
import { formatAIPrompt } from '@/lib/ai-context';

const prompt = formatAIPrompt("Tell me about your experience");
// Returns formatted system prompt with context and instructions
```

#### `generateTemplateResponse(userMessage: string): string`

Provides template-based responses for common questions.

**Supported Question Types:**
- Skills and technology questions
- Project and work questions
- Experience and background questions
- Contact and availability questions
- Education questions
- AI/ML specific questions
- General/default responses

**Usage:**
```typescript
import { generateTemplateResponse } from '@/lib/ai-context';

const response = generateTemplateResponse("What are your skills?");
// Returns contextual response about skills and technologies
```

#### `sanitizeUserInput(input: string): string`

Sanitizes user input for security and safety.

**Security Features:**
- Removes HTML tags (`<`, `>`)
- Removes JavaScript protocols (`javascript:`)
- Removes event handlers (`onclick=`, etc.)
- Enforces 500 character limit
- Trims whitespace

**Usage:**
```typescript
import { sanitizeUserInput } from '@/lib/ai-context';

const safe = sanitizeUserInput("Hello <script>alert('test')</script>");
// Returns: "Hello alert('test')"
```

#### `extractMessageTopics(message: string): string[]`

Extracts relevant topics from user messages for better context matching.

**Topic Categories:**
- `skill:SkillName` - Specific skill mentions
- `project:ProjectName` - Specific project mentions
- `category:TopicType` - General topic categories (experience, education, etc.)

**Usage:**
```typescript
import { extractMessageTopics } from '@/lib/ai-context';

const topics = extractMessageTopics("Do you know React.js and TypeScript?");
// Returns: ["skill:React.js", "skill:Typescript", "category:skills"]
```

## Integration with AI Chat Component

The system is integrated into the AI chat component's `handleSendMessage` function:

```typescript
// Sanitize user input
const sanitizedMessage = sanitizeUserInput(message.trim());

// Generate contextual response
const aiResponse = generateTemplateResponse(sanitizedMessage);
```

## Data Flow

1. **Portfolio Data** → `prepareAIContext()` → **Structured Context**
2. **User Message** → `sanitizeUserInput()` → **Safe Input**
3. **Safe Input** → `generateTemplateResponse()` → **AI Response**
4. **Context + Message** → `formatAIPrompt()` → **System Prompt** (for future AI service integration)

## Security Considerations

- **Input Sanitization**: All user input is sanitized to prevent XSS attacks
- **Character Limits**: Input is limited to 500 characters
- **Content Filtering**: Removes potentially harmful JavaScript and HTML
- **Safe Defaults**: Provides fallback responses when context is unavailable

## Performance Features

- **Template Responses**: Fast responses without external API calls
- **Efficient Context**: Minimal data transformation overhead
- **Cached Context**: Context preparation can be cached for better performance
- **Topic Extraction**: Optimized pattern matching for relevant content

## Future Enhancements

The system is designed to support:
- Integration with external AI services (OpenAI, etc.)
- Dynamic context updates based on portfolio changes
- Advanced topic modeling and response generation
- Multi-language support for international visitors
- Analytics and conversation insights

## Requirements Satisfied

This implementation satisfies the following requirements:

- **4.1**: AI generates responses that roleplay as the portfolio owner
- **4.2**: AI references information from portfolio data
- **4.3**: AI references skills listed in the portfolio
- **4.4**: AI references projects shown on the portfolio
- **7.1**: AI uses portfolio data as context for accurate information
- **7.2**: AI provides responses that reflect actual skill level

## Testing

The system includes comprehensive error handling and validation:
- Type safety with TypeScript interfaces
- Input validation and sanitization
- Graceful fallbacks for edge cases
- Consistent response formatting

## Usage Examples

### Basic Context Preparation
```typescript
const context = prepareAIContext();
console.log(`Hello! I'm ${context.name}, a ${context.role} from ${context.location}.`);
```

### Question Handling
```typescript
const questions = [
  "What technologies do you use?",
  "Tell me about your projects",
  "How can I contact you?"
];

questions.forEach(question => {
  const response = generateTemplateResponse(question);
  console.log(`Q: ${question}`);
  console.log(`A: ${response}\n`);
});
```

### Security Testing
```typescript
const maliciousInputs = [
  "<script>alert('xss')</script>",
  "javascript:alert('test')",
  "onclick=malicious()"
];

maliciousInputs.forEach(input => {
  const safe = sanitizeUserInput(input);
  console.log(`Unsafe: ${input}`);
  console.log(`Safe: ${safe}\n`);
});
```