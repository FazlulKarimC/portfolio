import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { prepareAIContext } from '@/lib/ai-context';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Configuration
const AI_CONFIG = {
  model: 'gemini-2.0-flash-exp', // Using stable version
  maxTokens: 500,
  temperature: 0.7,
} as const;

/**
 * Creates a focused system prompt for Fazlul's roleplay
 */
function createFazlulSystemPrompt(): string {
  const context = prepareAIContext();

  return `You are Fazlul Karim Choudhury, a full-stack developer from ${context.location}. You work at ADP as a Member Technical since October 2023. Respond in first person as yourself, being professional yet friendly.

ABOUT YOU:
- Full-stack developer with React, Next.js, TypeScript, Node.js, Spring Boot
- Work at ADP developing employee management systems for 5000+ employees
- Built projects: PaperSight AI (PDF summarizer), Sleek (e-commerce), QuickPay (payment platform)
- B.Tech Computer Science from NEHU (2019-2023)
- Passionate about AI/ML and modern web development
- Email: ${context.contact.email}

RESPONSE STYLE:
- Speak as Fazlul in first person
- Be enthusiastic about technology
- Keep responses 2-3 sentences
- Reference specific projects when relevant
- Be helpful and encouraging

Example: "Hi! I'm Fazlul, a full-stack developer at ADP. I love building web applications with React and integrating AI solutions like in my PaperSight project."`;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('Processing message:', message.substring(0, 50) + '...');

    // Create the model with configuration
    const model = genAI.getGenerativeModel({
      model: AI_CONFIG.model,
      generationConfig: {
        temperature: AI_CONFIG.temperature,
        maxOutputTokens: AI_CONFIG.maxTokens,
        topP: 0.9,
        topK: 40,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    // Create the full prompt
    const systemPrompt = createFazlulSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nFazlul:`;

    console.log('Prompt length:', fullPrompt.length);

    // Generate response
    const result = await model.generateContent(fullPrompt);

    console.log('Result received:', !!result);
    console.log('Response object:', !!result.response);

    const response = result.response;

    // Check if response was blocked
    if (!response) {
      console.error('No response object received');
      throw new Error('No response received from Gemini API');
    }

    // Check for safety ratings or blocking
    if (response.promptFeedback?.blockReason) {
      console.error('Prompt was blocked:', response.promptFeedback.blockReason);
      throw new Error(`Prompt was blocked: ${response.promptFeedback.blockReason}`);
    }

    let text;
    try {
      text = response.text();
      console.log('Text extracted successfully, length:', text?.length || 0);
    } catch (textError) {
      console.error('Error extracting text:', textError);
      console.log('Response candidates:', response.candidates);
      throw new Error('Failed to extract text from response');
    }

    if (!text || text.trim().length === 0) {
      console.error('Empty text from response');
      console.log('Full response object:', JSON.stringify(response, null, 2));
      throw new Error('Empty response from Gemini API');
    }

    console.log('Successful response generated');
    return NextResponse.json({
      response: text.trim(),
      success: true
    });

  } catch (error) {
    console.error('Gemini API error:', error);

    // Handle specific API errors
    let errorMessage = 'AI service temporarily unavailable';
    let statusCode = 500;

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      if (error.message.includes('API_KEY') || error.message.includes('API key')) {
        errorMessage = 'Invalid API key configuration';
        statusCode = 500;
      } else if (error.message.includes('RATE_LIMIT') || error.message.includes('quota')) {
        errorMessage = 'Rate limit exceeded';
        statusCode = 429;
      } else if (error.message.includes('QUOTA')) {
        errorMessage = 'API quota exceeded';
        statusCode = 429;
      } else if (error.message.includes('blocked')) {
        errorMessage = 'Content was blocked by safety filters';
        statusCode = 400;
      }
    }

    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: statusCode }
    );
  }
}