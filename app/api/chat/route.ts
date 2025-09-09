// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge runtime for better streaming performance

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // New backend (FastAPI) configuration
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    // Forward messages to the new backend streaming endpoint
    const requestBody = {
      messages,
    };

    const response = await fetch(`${BACKEND_API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Unknown error');
      console.error('Backend API Error:', errorData);
      return NextResponse.json(
        { error: `Backend API failed: ${errorData || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const encoder = new TextEncoder(); // Define encoder here
    
    // Stream Dify's response directly to the frontend
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
          controller.error('Failed to get reader from Dify response.');
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Signal end of message when stream ends
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'message_end' })}\n\n`));
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process each line as a potential JSON object from Dify's stream
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete last line in buffer

          for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines
            if (line.startsWith('event: ping')) continue;
            if (line.startsWith('event: end')) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'message_end' })}\n\n`));
              continue;
            }
            if (!line.startsWith('data: ')) continue; // Ignore other SSE fields

            try {
              const jsonStr = line.substring(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);
              
              // Handle structured content (charts, etc.)
              if (data.event === 'structured_content' || data.type === 'structured_content') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              }
              // Map OpenAI-style SSE delta chunks to the frontend's expected format
              // Expected from backend: { choices: [{ delta: { content: string } }] }
              else if (Array.isArray(data?.choices)) {
                const text = data.choices.map((c: { delta?: { content?: string } }) => c?.delta?.content || '').join('');
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'text_chunk', text })}\n\n`));
                }
              }
            } catch (jsonError) {
              console.error('Failed to parse backend stream JSON:', jsonError, 'Line:', line);
            }
          }
        }
        controller.close();
      },
    });
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8', // SSE format
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}