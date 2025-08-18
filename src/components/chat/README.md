# Chat Components

This directory contains modular chat components for the AI Chat feature.

## Components

### `ChatContainer.tsx`
The main container component that holds the expanded chat interface. Includes:
- Chat header with network status indicators
- Error display area
- Messages area (scrollable)
- Input area

### `ChatMessages.tsx`
Handles the display of chat messages with:
- Auto-scrolling to latest messages
- Message rendering (user/AI messages)
- Loading indicators
- Empty state display
- Proper scrollable area with fixed height

### `ChatInput.tsx`
Input component with:
- Character count validation
- Network status awareness
- Loading states
- Send button with proper disabled states

### `ErrorDisplay.tsx`
Error display component with:
- Network status icons
- Retry functionality
- User-friendly error messages

### `ChatTrigger.tsx`
Collapsed state trigger component that expands the chat.

## Key Features

### Scrolling
- The chat messages area is properly scrollable with a fixed height
- Auto-scrolls to the latest message when new messages arrive
- Uses `ScrollArea` component for consistent scrolling behavior

### User Experience
- **Auto-focus**: Input field automatically focuses when chat expands
- **Profile Image**: Uses actual profile image from DATA instead of initials
- **Optimized Height**: Increased height (480px/520px) for better readability of long responses
- **Smooth Animations**: Framer Motion animations for better UX

### Modular Architecture
- Each component has a single responsibility
- Business logic is separated into `useChatLogic` hook
- Easy to test and maintain individual components

### Responsive Design
- All components are responsive and work on mobile/desktop
- Proper spacing and sizing for different screen sizes

## Usage

```tsx
import { ChatContainer, ChatTrigger } from '@/components/chat';
import { useChatLogic } from '@/hooks/useChatLogic';

function MyChat() {
  const { chatState, handlers } = useChatLogic();
  
  return chatState.isExpanded ? (
    <ChatContainer
      chatState={chatState}
      onCollapse={handlers.handleCollapse}
      onInputChange={handlers.handleInputChange}
      onSendMessage={handlers.handleSendMessage}
      onRetry={handlers.handleRetry}
    />
  ) : (
    <ChatTrigger onExpand={handlers.handleExpand} />
  );
}
```