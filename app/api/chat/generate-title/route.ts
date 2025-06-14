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

    // Extract the first user message or use a default query
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || 
                           "Please generate a conversation title";

    // Get conversation context (last 3 messages)
    const conversationContext = messages
      .slice(-3)
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    // Call Dify API with properly formatted inputs
    const response = await fetch(process.env.DIFY_TITLE_BOT_URL!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_TITLE_BOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          query: String(firstUserMessage), // Ensure string type
          context: String(conversationContext) // Ensure string type
        },
        response_mode: 'blocking',
        user: 'system-title-generator',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Dify API Error:", {
        status: response.status,
        url: process.env.DIFY_API_URL,
        error: error
      });
      throw new Error(`Dify API error: ${error}`);
    }

    const { answer } = await response.json();
    const title = answer.trim();

    return NextResponse.json({ title });

  } catch (error) {
    console.error("Title generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 }
    );
  }
}