// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge runtime for better streaming performance

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId, user_id } = await req.json();

    // New backend (FastAPI) configuration
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    // Forward messages to the new backend streaming endpoint
    const requestBody = {
      messages,
      chatId,
      user_id,
      persist: true,
    };

    const response = await fetch(`${BACKEND_API_URL}/api/custom-chat`, {
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

    // Get JSON response from agent system
    const agentResponse = await response.json();
    const encoder = new TextEncoder();
    
    // Convert agent response to SSE format for frontend compatibility
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send the main text content as chunks
          const content = agentResponse.response || '';
          const words = content.split(' ');
          
          // Stream words to simulate typing effect
          for (let i = 0; i < words.length; i++) {
            const chunk = i === 0 ? words[i] : ' ' + words[i];
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'text_chunk', text: chunk })}\n\n`));
            // Small delay for typing effect
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // Send structured content if available (charts, citations, etc.)
          if (agentResponse.data?.chart) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              event: 'structured_content', 
              type: 'structured_content',
              skill: agentResponse.skill,
              content: agentResponse.data.chart
            })}\n\n`));
          }

          if (agentResponse.data?.citations?.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              event: 'structured_content',
              type: 'citations',
              skill: agentResponse.skill,
              content: agentResponse.data.citations
            })}\n\n`));
          }

          // Send telemetry info if available
          if (agentResponse.telemetry) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              event: 'telemetry',
              telemetry: agentResponse.telemetry
            })}\n\n`));
          }

          // Signal end of message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'message_end' })}\n\n`));
        } catch (error) {
          console.error('Error processing agent response:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            event: 'text_chunk', 
            text: 'Sorry, there was an error processing the response.' 
          })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'message_end' })}\n\n`));
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