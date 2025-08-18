import { generateTemplateResponse, sanitizeUserInput, extractMessageTopics, validateUserInput } from './ai-context';

// Configuration for AI service
const AI_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  maxTokens: 500,
  temperature: 0.7,
  model: 'gemini-2.0-flash',
} as const;



// Error types for better error handling
export enum AIServiceError {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface AIServiceResponse {
  success: boolean;
  response?: string;
  error?: {
    type: AIServiceError;
    message: string;
    retryable: boolean;
  };
  fallbackUsed?: boolean;
  responseTime?: number;
}

/**
 * Enhanced rate limiting implementation with adaptive limits
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 10; // Max requests per minute
  private readonly windowMs = 60 * 1000; // 1 minute window
  private failureCount = 0;
  private lastFailureTime = 0;

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Apply temporary rate limiting after failures
    if (this.failureCount > 3 && now - this.lastFailureTime < 30000) {
      return false;
    }

    // Remove requests older than the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  recordSuccess(): void {
    // Reset failure count on successful request
    if (this.failureCount > 0) {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  getTimeUntilReset(): number {
    const now = Date.now();
    
    // Check if we're in failure cooldown
    if (this.failureCount > 3 && now - this.lastFailureTime < 30000) {
      return 30000 - (now - this.lastFailureTime);
    }

    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (now - oldestRequest));
  }
}

/**
 * Network status detection utility
 */
class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private connectionSpeed: 'fast' | 'slow' | 'offline' = 'fast';
  private lastSpeedTest = 0;

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.connectionSpeed = 'fast';
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.connectionSpeed = 'offline';
      });
    }
  }

  async checkConnectionSpeed(): Promise<'fast' | 'slow' | 'offline'> {
    if (!this.isOnline) return 'offline';
    
    // Only test speed every 30 seconds to avoid excessive requests
    const now = Date.now();
    if (now - this.lastSpeedTest < 30000) {
      return this.connectionSpeed;
    }

    try {
      const startTime = Date.now();
      // Use a small asset for speed test
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      const endTime = Date.now();
      
      if (response.ok) {
        const responseTime = endTime - startTime;
        this.connectionSpeed = responseTime > 2000 ? 'slow' : 'fast';
        this.lastSpeedTest = now;
      }
    } catch (error) {
      this.connectionSpeed = 'slow';
    }

    return this.connectionSpeed;
  }

  getNetworkStatus(): 'online' | 'offline' | 'slow' {
    if (!this.isOnline) return 'offline';
    return this.connectionSpeed === 'slow' ? 'slow' : 'online';
  }
}

const rateLimiter = new RateLimiter();
const networkMonitor = NetworkMonitor.getInstance();

/**
 * Enhanced input validation with comprehensive security checks
 */
function validateInput(message: string): { valid: boolean; error?: string } {
  const validation = validateUserInput(message);
  
  return {
    valid: validation.isValid,
    error: validation.error
  };
}

/**
 * Creates a timeout promise for API calls
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
}

/**
 * Calls the Gemini API via our Next.js API route
 */
async function callGeminiAPI(message: string): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      } else if (response.status === 500) {
        throw new Error(errorData.error || 'AI service temporarily unavailable');
      } else {
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    
    if (!data.success || !data.response) {
      throw new Error('Invalid response from AI service');
    }

    return data.response;
  } catch (error) {
    console.error('Gemini API call error:', error);
    
    if (error instanceof Error) {
      // Re-throw known errors
      if (error.message.includes('Rate limit') || 
          error.message.includes('API key') || 
          error.message.includes('quota')) {
        throw error;
      }
      
      // Handle network errors
      if (error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection');
      }
    }
    
    throw new Error('AI service temporarily unavailable');
  }
}

/**
 * Main AI service function that calls Gemini API via our API route
 */
async function callAIService(userMessage: string): Promise<string> {
  return await callGeminiAPI(userMessage);
}



/**
 * Enhanced retry logic with exponential backoff and intelligent error handling
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = AI_CONFIG.maxRetries,
  baseDelay: number = AI_CONFIG.retryDelay,
  context?: { userMessage?: string; attempt?: number }
): Promise<T> {
  let lastError: Error;
  let actualRetries = maxRetries;

  // Adjust retry count based on network conditions
  const networkStatus = networkMonitor.getNetworkStatus();
  if (networkStatus === 'slow') {
    actualRetries = Math.min(maxRetries + 2, 5); // More retries for slow connections
  } else if (networkStatus === 'offline') {
    actualRetries = 0; // No retries when offline
  }

  for (let attempt = 0; attempt <= actualRetries; attempt++) {
    try {
      const result = await operation();
      
      // Record success for rate limiter
      rateLimiter.recordSuccess();
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Record failure for rate limiter
      rateLimiter.recordFailure();
      
      // Don't retry on the last attempt
      if (attempt === actualRetries) {
        break;
      }

      // Classify error types and determine if retry is appropriate
      const errorType = classifyError(error as Error);
      if (!shouldRetryError(errorType)) {
        break;
      }

      // Check network status before retrying
      const currentNetworkStatus = await networkMonitor.checkConnectionSpeed();
      if (currentNetworkStatus === 'offline') {
        // Network went offline, don't retry
        break;
      }

      // Calculate delay with exponential backoff and jitter
      let delay = baseDelay * Math.pow(2, attempt);
      
      // Add jitter to prevent thundering herd
      delay += Math.random() * 1000;
      
      // Increase delay for slow connections
      if (currentNetworkStatus === 'slow') {
        delay *= 1.5;
      }
      
      // Cap maximum delay at 10 seconds
      delay = Math.min(delay, 10000);

      console.log(`Retry attempt ${attempt + 1}/${actualRetries} after ${delay}ms delay. Error: ${lastError.message}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Classifies errors for better retry logic
 */
function classifyError(error: Error): AIServiceError {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return AIServiceError.NETWORK_ERROR;
  }
  
  if (message.includes('timeout')) {
    return AIServiceError.TIMEOUT_ERROR;
  }
  
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return AIServiceError.RATE_LIMIT_ERROR;
  }
  
  if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('invalid')) {
    return AIServiceError.INVALID_INPUT;
  }
  
  if (message.includes('service unavailable') || message.includes('server error')) {
    return AIServiceError.SERVICE_UNAVAILABLE;
  }
  
  return AIServiceError.API_ERROR;
}

/**
 * Determines if an error type should be retried
 */
function shouldRetryError(errorType: AIServiceError): boolean {
  switch (errorType) {
    case AIServiceError.NETWORK_ERROR:
    case AIServiceError.TIMEOUT_ERROR:
    case AIServiceError.SERVICE_UNAVAILABLE:
    case AIServiceError.API_ERROR:
      return true;
    
    case AIServiceError.RATE_LIMIT_ERROR:
    case AIServiceError.INVALID_INPUT:
      return false;
    
    default:
      return false;
  }
}

/**
 * Determines if we should use fallback response based on message content
 */
function shouldUseFallback(message: string): boolean {
  const topics = extractMessageTopics(message);
  
  // Use fallback for common topics that our template system handles well
  const fallbackTopics = [
    'category:skills',
    'category:projects', 
    'category:experience',
    'category:education',
    'category:contact',
    'category:ai'
  ];

  return topics.some(topic => fallbackTopics.includes(topic));
}

/**
 * Generates enhanced fallback responses with improved context awareness and personable tone
 */
function generateEnhancedFallback(message: string): string {
  const topics = extractMessageTopics(message);
  const templateResponse = generateTemplateResponse(message);
  
  // Add contextual enhancements based on detected topics
  if (topics.some(t => t.includes('skill:'))) {
    const skillMentioned = topics.find(t => t.startsWith('skill:'))?.split(':')[1];
    if (skillMentioned) {
      return `${templateResponse}\n\nI see you're interested in ${skillMentioned} specifically! I'd be happy to share more details about my experience with it and how I've used it in my projects.`;
    }
  }

  if (topics.some(t => t.includes('project:'))) {
    const projectMentioned = topics.find(t => t.startsWith('project:'))?.split(':')[1];
    if (projectMentioned) {
      return `${templateResponse}\n\nGreat question about ${projectMentioned}! I'm particularly proud of that project and would love to discuss the technical challenges, solutions, and what I learned from building it.`;
    }
  }

  // Add encouraging follow-up for general categories
  if (topics.some(t => t.includes('category:experience'))) {
    return `${templateResponse}\n\nI love sharing about my journey in tech! Feel free to ask about any specific aspects of my experience - whether it's about working at ADP, the challenges I've faced, or the exciting projects I've been part of.`;
  }

  if (topics.some(t => t.includes('category:ai'))) {
    return `${templateResponse}\n\nAI and machine learning are such exciting fields! I'm always eager to discuss the latest developments, share insights from my projects, or talk about how AI is transforming the way we build applications.`;
  }

  // Add a friendly closing note for unmatched topics
  if (topics.length === 0) {
    return `${templateResponse}\n\nI'm here to chat about anything related to my experience, projects, or the tech world in general. What would you like to explore together?`;
  }

  return templateResponse;
}

/**
 * Main function to generate AI responses with comprehensive error handling
 */
export async function generateAIResponse(userMessage: string, retryCount: number = 0): Promise<AIServiceResponse> {
  const startTime = Date.now();

  try {
    // Check network status first
    const networkStatus = await networkMonitor.checkConnectionSpeed();
    
    if (networkStatus === 'offline') {
      return {
        success: false,
        error: {
          type: AIServiceError.NETWORK_ERROR,
          message: 'You appear to be offline. Please check your internet connection and try again.',
          retryable: true,
        },
        responseTime: Date.now() - startTime,
      };
    }

    // Validate input using enhanced validation
    const validation = validateInput(userMessage);
    if (!validation.valid) {
      return {
        success: false,
        error: {
          type: AIServiceError.INVALID_INPUT,
          message: validation.error!,
          retryable: false,
        },
        responseTime: Date.now() - startTime,
      };
    }

    // Check rate limiting with enhanced logic
    if (!rateLimiter.canMakeRequest()) {
      const resetTime = rateLimiter.getTimeUntilReset();
      const waitTime = Math.ceil(resetTime / 1000);
      
      return {
        success: false,
        error: {
          type: AIServiceError.RATE_LIMIT_ERROR,
          message: waitTime > 60 
            ? `Please wait a moment before sending another message. I want to make sure I can give you my full attention!`
            : `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`,
          retryable: true,
        },
        responseTime: Date.now() - startTime,
      };
    }

    // Use enhanced validation and sanitization
    const inputValidation = validateUserInput(userMessage);
    
    if (!inputValidation.isValid) {
      return {
        success: false,
        error: {
          type: AIServiceError.INVALID_INPUT,
          message: inputValidation.error!,
          retryable: false,
        },
        responseTime: Date.now() - startTime,
      };
    }

    const sanitizedMessage = inputValidation.sanitized!;

    try {
      // Call Gemini API with enhanced retry logic
      const aiResponse = await Promise.race([
        withRetry(
          () => callAIService(sanitizedMessage),
          AI_CONFIG.maxRetries,
          AI_CONFIG.retryDelay,
          { userMessage: sanitizedMessage, attempt: retryCount }
        ),
        createTimeoutPromise(networkStatus === 'slow' ? AI_CONFIG.timeout * 2 : AI_CONFIG.timeout),
      ]);

      return {
        success: true,
        response: aiResponse,
        fallbackUsed: false,
        responseTime: Date.now() - startTime,
      };

    } catch (aiError) {
      // Classify the error for better handling
      const errorType = classifyError(aiError as Error);
      
      // Log error for monitoring
      console.warn('AI service error:', {
        error: aiError,
        type: errorType,
        retryCount,
        networkStatus,
        userMessage: sanitizedMessage.substring(0, 50) + '...'
      });
      
      // For retryable errors, return error info; for others, use fallback
      if (shouldRetryError(errorType) && retryCount < AI_CONFIG.maxRetries) {
        return {
          success: false,
          error: {
            type: errorType,
            message: getErrorMessage({ type: errorType, message: (aiError as Error).message, retryable: true }),
            retryable: true,
          },
          responseTime: Date.now() - startTime,
        };
      } else {
        // Use enhanced fallback for non-retryable errors or max retries reached
        const fallbackResponse = generateEnhancedFallback(sanitizedMessage);
        
        return {
          success: true,
          response: fallbackResponse,
          fallbackUsed: true,
          responseTime: Date.now() - startTime,
        };
      }
    }

  } catch (error) {
    // Unexpected error occurred
    console.error('Unexpected error in generateAIResponse:', {
      error,
      retryCount,
      userMessage: userMessage.substring(0, 50) + '...'
    });
    
    // Try to provide a basic fallback even in error cases
    try {
      const emergencyFallback = generateTemplateResponse(userMessage);
      return {
        success: true,
        response: emergencyFallback,
        fallbackUsed: true,
        responseTime: Date.now() - startTime,
      };
    } catch (fallbackError) {
      // Even fallback failed, return comprehensive error
      return {
        success: false,
        error: {
          type: AIServiceError.SERVICE_UNAVAILABLE,
          message: 'I apologize, but I\'m experiencing technical difficulties right now. Please try again in a moment, or feel free to contact me directly at fazlul0127@gmail.com for immediate assistance.',
          retryable: true,
        },
        responseTime: Date.now() - startTime,
      };
    }
  }
}

/**
 * Health check function to test Gemini API availability
 */
export async function checkAIServiceHealth(): Promise<{
  available: boolean;
  responseTime?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await Promise.race([
      callAIService("Hello"),
      createTimeoutPromise(10000), // 10 second timeout for health check
    ]);
    
    return {
      available: true,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      available: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Enhanced user-friendly error messages with personable tone and actionable guidance
 */
export function getErrorMessage(error: AIServiceResponse['error']): string {
  if (!error) return 'I apologize, but something unexpected happened. Please try again!';

  switch (error.type) {
    case AIServiceError.NETWORK_ERROR:
      return 'It looks like there\'s a network connection issue. Please check your internet connection and try again - I\'ll be here waiting! If the problem persists, feel free to reach out to me directly at fazlul0127@gmail.com.';
    
    case AIServiceError.API_ERROR:
      return 'I\'m having some technical difficulties at the moment. Please give me a moment and try again - I promise I\'ll do my best to help! If this keeps happening, don\'t hesitate to contact me directly.';
    
    case AIServiceError.TIMEOUT_ERROR:
      return 'That took longer than expected! This might be due to a slow connection. Please try again, maybe with a shorter message, and I\'ll respond more quickly. You can also reach me at fazlul0127@gmail.com if you prefer.';
    
    case AIServiceError.RATE_LIMIT_ERROR:
      return error.message; // Rate limit messages are already user-friendly
    
    case AIServiceError.INVALID_INPUT:
      // Make input validation errors more friendly
      if (error.message.includes('harmful content')) {
        return 'I noticed your message might contain some special characters that I can\'t process. Could you try rephrasing your question? I\'m here to help!';
      }
      if (error.message.includes('too short')) {
        return 'Your message seems a bit short. Could you add a few more details so I can better understand what you\'d like to know?';
      }
      if (error.message.includes('too long')) {
        return 'Your message is quite long! Could you try breaking it into a shorter question? I\'d love to help, but I work best with concise messages.';
      }
      return 'I had trouble understanding your message. Could you try rephrasing it? I\'m here to help with any questions about my experience, projects, or skills!';
    
    case AIServiceError.SERVICE_UNAVAILABLE:
      return 'I\'m temporarily having trouble with my AI responses, but I can still help! Feel free to try again in a moment, or reach out to me directly at fazlul0127@gmail.com if you\'d like to continue our conversation right away.';
    
    default:
      return 'Oops! Something unexpected happened on my end. Please try again in a moment, or feel free to contact me directly at fazlul0127@gmail.com if the issue persists. I\'m always happy to chat!';
  }
}

/**
 * Utility function to determine if an error is retryable
 */
export function isRetryableError(error: AIServiceResponse['error']): boolean {
  return error?.retryable ?? false;
}

/**
 * Configuration for AI service integration
 */
export const AI_SERVICE_CONFIG = {
  provider: 'gemini', // Using Google Gemini 2.0 Flash
  model: AI_CONFIG.model,
  fallbackEnabled: true,
  rateLimitEnabled: true,
  retryEnabled: true,
  timeoutMs: AI_CONFIG.timeout,
  maxRetries: AI_CONFIG.maxRetries,
  maxTokens: AI_CONFIG.maxTokens,
  temperature: AI_CONFIG.temperature,
} as const;