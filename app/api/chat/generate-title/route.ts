// app/api/chat/generate-title/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    // Dify API Configuration
    const DIFY_API_URL = process.env.DIFY_API_URL || 'http://172.16.3.123:80';
    const DIFY_APP_ID = process.env.DIFY_APP_ID;
    const DIFY_API_KEY = process.env.DIFY_API_KEY;
    const DIFY_TITLE_BOT_API_KEY = process.env.DIFY_TITLE_BOT_API_KEY;

    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { error: 'Dify API Key not configured in environment variables.' },
        { status: 500 }
      );
    }

    if (!DIFY_APP_ID) {
      return NextResponse.json(
        { error: 'Dify App ID not configured in environment variables.' },
        { status: 500 }
      );
    }

    // Extract the first user message or use a default query
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || 
                           "Please generate a conversation title";

    // Ensure the message content is a string
    const queryText = typeof firstUserMessage === 'string' ? firstUserMessage : 
                     (Array.isArray(firstUserMessage) ? firstUserMessage.join(' ') : 
                     String(firstUserMessage));

    // Call Dify Title Generation API
    const response = await fetch(`${DIFY_API_URL}/v1/completion-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_TITLE_BOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: { query: queryText },
        app_id: DIFY_APP_ID,
        user: 'user_frontend_id'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Dify API Error:", {
        status: response.status,
        url: DIFY_API_URL,
        error: error
      });
      throw new Error(`Dify API error: ${error}`);
    }

    const responseData = await response.json();
    
    if (!responseData.answer) {
      console.error("No answer in Dify response:", responseData);
      return NextResponse.json(
        { error: "No title returned from Dify API" },
        { status: 500 }
      );
    }

    // Extract the title from the answer
    const title = responseData.answer.trim();
    return NextResponse.json({ title });

  } catch (error) {
    console.error("Title generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 }
    );
  }
}