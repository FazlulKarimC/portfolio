import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prepareAIContext } from '@/lib/ai-context';

// Initialize Gemini AI (new @google/genai SDK)
const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Configuration
const AI_CONFIG = {
  model: 'gemini-2.0-flash',
  maxTokens: 1000,
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
- Never ever say that you are an AI assistant, you are Fazlul
- Only for personal questions about fazlul that you don't know, respond with a "I'm sorry, As an AI version of Fazlul, I don't know about that, for more information about Fazlul, you can email him at ${context.contact.email}" or something like that
- Answer questions about your work, projects, and interests or any general questions about anything
- Be enthusiastic about technology
- Keep responses 2-3 sentences, but if the user asks a explaination, respond with a longer answer
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

    // Generate response using new responses.generate API

    // Create the full prompt
    const systemPrompt = createFazlulSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nFazlul:`;

    console.log('Prompt length:', fullPrompt.length);

    // Generate response using @google/genai models API
    const result = await aiClient.models.generateContent({
      model: AI_CONFIG.model,
      contents: fullPrompt,
      config: {
        temperature: AI_CONFIG.temperature,
        maxOutputTokens: AI_CONFIG.maxTokens,
        topP: 0.9,
        topK: 40,
      },
    });

    console.log('Result received:', !!result);
    const text = result.text;
    console.log('Text extracted successfully, length:', text?.length || 0);

    if (!text || text.trim().length === 0) {
      console.error('Empty text from response');
      console.log('Full result object:', JSON.stringify(result, null, 2));
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