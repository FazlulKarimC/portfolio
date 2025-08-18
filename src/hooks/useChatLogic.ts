import { useState, useEffect } from 'react';
import { ChatState, ChatMessage } from '@/types/chat';
import { validateUserInput, generateTemplateResponse } from '@/lib/ai-context';
import { generateAIResponse, getErrorMessage, isRetryableError, AIServiceResponse } from '@/lib/ai-service';

// Utility functions for message management

/**
 * Generates a unique message ID
 * @param sender - The sender type ('user' | 'ai')
 * @returns A unique string ID
 */
function generateMessageId(sender: 'user' | 'ai'): string {
    return `${sender}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Validates a chat message object
 * @param message - The message to validate
 * @returns True if the message is valid
 */
function isValidMessage(message: ChatMessage): boolean {
    return !!(
        message.id &&
        message.content &&
        message.sender &&
        message.timestamp &&
        ['user', 'ai'].includes(message.sender)
    );
}

/**
 * Creates a new chat message with proper defaults
 * @param content - The message content
 * @param sender - The sender type
 * @returns A complete ChatMessage object
 */
function createMessage(content: string, sender: 'user' | 'ai'): ChatMessage {
    return {
        id: generateMessageId(sender),
        content: content.trim(),
        sender,
        timestamp: new Date(),
    };
}

interface UseChatLogicProps {
    defaultExpanded?: boolean;
}

export function useChatLogic({ defaultExpanded = false }: UseChatLogicProps = {}) {
    const [chatState, setChatState] = useState<ChatState>({
        isExpanded: defaultExpanded,
        messages: [],
        currentInput: "",
        isLoading: false,
        error: undefined,
        canRetry: false,
        lastFailedMessage: undefined,
        retryCount: 0,
        networkStatus: 'online',
    });

    /**
     * Dedicated function to add messages to the chat state
     * Handles proper message creation, validation, and state updates
     * @param content - The message content
     * @param sender - The sender type ('user' | 'ai')
     * @returns The created message object
     */
    const addMessage = (content: string, sender: 'user' | 'ai'): ChatMessage => {
        const newMessage = createMessage(content, sender);

        // Validate the message before adding
        if (!isValidMessage(newMessage)) {
            console.error('Invalid message created:', newMessage);
            throw new Error('Failed to create valid message');
        }

        setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage],
        }));

        return newMessage;
    };

    // Function to update loading state
    const setLoadingState = (isLoading: boolean) => {
        setChatState(prev => ({ ...prev, isLoading }));
    };

    // Function to clear input
    const clearInput = () => {
        setChatState(prev => ({ ...prev, currentInput: "" }));
    };

    // Function to set error state
    const setError = (error?: string, canRetry: boolean = false, lastFailedMessage?: string) => {
        setChatState(prev => ({
            ...prev,
            error,
            canRetry,
            lastFailedMessage
        }));
    };

    // Function to update network status
    const updateNetworkStatus = (status: 'online' | 'offline' | 'slow') => {
        setChatState(prev => ({ ...prev, networkStatus: status }));
    };

    // Function to handle retry attempts
    const handleRetry = async () => {
        if (!chatState.lastFailedMessage) return;
        
        // Clear error state
        setError(undefined);
        
        // Increment retry count
        setChatState(prev => ({ ...prev, retryCount: (prev.retryCount || 0) + 1 }));
        
        // Retry the failed message
        await handleSendMessage(chatState.lastFailedMessage);
    };

    const handleExpand = () => {
        setChatState(prev => ({ ...prev, isExpanded: true }));
    };

    const handleCollapse = () => {
        setChatState(prev => ({ ...prev, isExpanded: false }));
    };

    // Network status monitoring
    useEffect(() => {
        const updateOnlineStatus = () => {
            updateNetworkStatus(navigator.onLine ? 'online' : 'offline');
        };

        // Initial status
        updateOnlineStatus();

        // Listen for network changes
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    const handleInputChange = (value: string) => {
        // Clear any previous errors when user starts typing
        if (chatState.error) {
            setError(undefined);
        }

        // Prevent input beyond 500 characters
        if (value.length <= 500) {
            setChatState(prev => ({ ...prev, currentInput: value }));
        }
    };

    const handleSendMessage = async (message: string) => {
        // Prevent sending if already loading or message is empty
        if (chatState.isLoading || !message.trim()) {
            return;
        }

        // Check network status before sending
        if (chatState.networkStatus === 'offline') {
            setError("You appear to be offline. Please check your internet connection and try again.", true, message.trim());
            return;
        }

        try {
            // Clear any previous errors
            setError(undefined);

            // Enhanced input validation
            const validation = validateUserInput(message.trim());
            if (!validation.isValid) {
                setError(validation.error, false);
                return;
            }

            const sanitizedMessage = validation.sanitized!;

            // Add user message using the dedicated addMessage function
            addMessage(sanitizedMessage, 'user');

            // Clear input and set loading state
            clearInput();
            setLoadingState(true);

            // Generate AI response with retry count
            const aiServiceResponse: AIServiceResponse = await generateAIResponse(
                sanitizedMessage, 
                chatState.retryCount || 0
            );

            if (aiServiceResponse.success && aiServiceResponse.response) {
                // Add successful AI response
                addMessage(aiServiceResponse.response, 'ai');

                // Reset retry count on success
                setChatState(prev => ({ ...prev, retryCount: 0 }));

                // Log performance metrics for monitoring
                if (aiServiceResponse.responseTime) {
                    console.log(`AI response generated in ${aiServiceResponse.responseTime}ms`, {
                        fallbackUsed: aiServiceResponse.fallbackUsed,
                        messageLength: sanitizedMessage.length,
                        retryCount: chatState.retryCount || 0,
                        networkStatus: chatState.networkStatus,
                    });
                }
            } else {
                // Handle AI service error
                const errorMessage = aiServiceResponse.error
                    ? getErrorMessage(aiServiceResponse.error)
                    : "I'm having trouble responding right now. Please try again in a moment.";

                // For retryable errors, set up retry state
                if (aiServiceResponse.error && isRetryableError(aiServiceResponse.error)) {
                    setError(errorMessage, true, sanitizedMessage);
                } else {
                    // For non-retryable errors, add error message as AI response
                    addMessage(errorMessage, 'ai');
                    setError(undefined);
                }

                console.warn('AI service error:', {
                    error: aiServiceResponse.error,
                    retryCount: chatState.retryCount || 0,
                    networkStatus: chatState.networkStatus,
                });
            }

            // Clear loading state
            setLoadingState(false);
        } catch (error) {
            // Handle unexpected errors
            setLoadingState(false);

            console.error('Unexpected error in handleSendMessage:', {
                error,
                message: message.substring(0, 50) + '...',
                retryCount: chatState.retryCount || 0,
                networkStatus: chatState.networkStatus,
            });

            // Try to provide a fallback response even in error cases
            try {
                const fallbackResponse = generateTemplateResponse(message.trim());
                addMessage(fallbackResponse, 'ai');
                setError(undefined);
            } catch (fallbackError) {
                // If even fallback fails, show error message with retry option
                const errorMessage = "I apologize, but I'm having trouble responding right now. Please try again in a moment, or feel free to contact me directly at fazlul0127@gmail.com.";
                setError(errorMessage, true, message.trim());
            }
        }
    };

    return {
        chatState,
        handlers: {
            handleExpand,
            handleCollapse,
            handleInputChange,
            handleSendMessage,
            handleRetry,
        }
    };
}