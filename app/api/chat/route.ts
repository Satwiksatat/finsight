// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge runtime for better streaming performance

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId } = await req.json();

    // Dify API Configuration
    const DIFY_API_URL = process.env.DIFY_API_URL || 'http://172.16.3.123:80';
    const DIFY_APP_ID = process.env.DIFY_APP_ID;
    const DIFY_API_KEY = process.env.DIFY_API_KEY;

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

    // Extract the latest user query for the Dify 'inputs' field.
    const latestUserQuery = messages[messages.length - 1]?.content;

    if (!latestUserQuery) {
      return NextResponse.json({ error: 'No user query found in messages.' }, { status: 400 });
    }

    // Prepare conversation history for Dify
    const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Prepare the request body
    const requestBody: any = {
      inputs: {}, // Additional input variables if your Dify app requires them
      query: latestUserQuery,
      response_mode: 'streaming',
      user: 'user_frontend_id', // Use a consistent user ID
      app_id: DIFY_APP_ID, // Include the app ID
    };

    // Don't include conversation_id for new conversations
    // Dify will create a new conversation automatically

    const response = await fetch(`${DIFY_API_URL}/v1/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

          if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Dify API Error:', errorData);
        return NextResponse.json(
          { error: `Dify API failed: ${errorData.message || 'Unknown error'}` },
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
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process each line as a potential JSON object from Dify's stream
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete last line in buffer

          for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines
            if (line.startsWith('event: ping')) {
              continue;
            }
            if (!line.startsWith('data: ')) {
              console.warn('Unexpected line in Dify stream:', line);
              continue;
            }

            try {
              const jsonStr = line.substring(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);

              // Handle different Dify stream event types
              if (data.event === 'message' && data.answer) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'message', answer: data.answer })}\n\n`));
              } else if (data.event === 'agent_message' && data.answer) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'agent_message', answer: data.answer })}\n\n`));
              } else if (data.event === 'text_chunk' && data.text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'text_chunk', text: data.text })}\n\n`));
              } else if (data.event === 'message_end') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'message_end' })}\n\n`));
              } else if (data.event === 'message' && data.message) {
                // Handle structured content
                if (typeof data.message === 'string') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'text_chunk', text: data.message })}\n\n`));
                } else if (data.message.answer) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'text_chunk', text: data.message.answer })}\n\n`));
                } else if (data.message.llm_content) {
                  // Handle structured LLM content (charts, images, etc.)
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'structured_content',
                    content: data.message.llm_content
                  })}\n\n`));
                }
              } else if (data.event === 'conversation_created') {
                // Conversation created
              } else if (data.event === 'end') {
                break;
              } else if (data.event === 'error') {
                console.error('Dify Stream Error Event:', data.error || 'Unknown error');
                // Don't break the stream on error, just continue
              } else if (data.event === 'retriever_result' || data.event === 'agent_thought') {
                // Skip these events for now
              }
            } catch (jsonError) {
              console.error('Failed to parse Dify stream JSON:', jsonError, 'Line:', line);
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