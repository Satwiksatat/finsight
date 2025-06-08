// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge runtime for better streaming performance

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Dify API Configuration
    // IMPORTANT: Replace with your actual Dify App ID and API Key
    const DIFY_APP_ID = process.env.DIFY_APP_ID;
    const DIFY_API_KEY = process.env.DIFY_API_KEY; // Typically for server-side/API access

    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { error: 'Dify App ID or API Key not configured in environment variables.' },
        { status: 500 }
      );
    }

    // Prepare message history for Dify
    // Dify expects a specific format, typically with 'user' and 'assistant' roles.
    // The last message in the array is usually the current user input.
    const DifyMessages = messages.map((msg: any) => ({
      query: msg.content, // Dify often uses 'query' for user messages
      // You might need to map 'role' if Dify expects it explicitly for history
      // e.g., role: msg.role === 'user' ? 'user' : 'assistant'
    }));

    // Extract the latest user query for the Dify 'inputs' field.
    // Assuming the last message in `messages` array is the current user input.
    const latestUserQuery = messages[messages.length - 1]?.content;

    if (!latestUserQuery) {
      return NextResponse.json({ error: 'No user query found in messages.' }, { status: 400 });
    }

    const response = await fetch('http://localhost:80/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: {}, // Additional input variables if your Dify app requires them
        query: latestUserQuery,
        response_mode: 'streaming',
        user: 'user_frontend_id', // Unique user ID for Dify, can be sessionId or actual user ID
        // conversation_id: 'your_conversation_id', // Uncomment and manage if you want Dify to track conversations
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Dify API Error:', errorData);
      return NextResponse.json(
        { error: `Dify API failed: ${errorData.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    // Stream Dify's response directly to the frontend
    // Dify's streaming format is typically SSE (Server-Sent Events) or line-delimited JSON.
    // We need to parse this stream to extract the content.
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
            console.log("Dify stream finished.");
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process each line as a potential JSON object from Dify's stream
          // Dify's stream format: data: { ...json... }\n
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete last line in buffer

          for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines
            if (!line.startsWith('data: ')) {
              console.warn('Unexpected line in Dify stream:', line);
              continue;
            }

            try {
              const jsonStr = line.substring(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);

              // Dify stream event types: message, chunk, end
              if (data.event === 'message') {
                // This is the final message, or a message containing full structured output
                // You might need to adjust this based on how your Dify app is configured
                // to send back structured data (e.g., text, JSON, tool outputs).
                // For now, we'll assume it's primarily text, or JSON if your Dify app returns it.
                if (data.answer) {
                  controller.enqueue(encoder.encode(data.answer));
                } else if (data.message) { // Sometimes full message object might be under 'message'
                  // If Dify sends structured JSON directly (e.g., for charts/images)
                  // You'd need to stringify and enqueue the entire object
                  controller.enqueue(encoder.encode(JSON.stringify(data.message)));
                }

              } else if (data.event === 'agent_message' && data.answer) {
                  // Dify's agent_message event often carries the text chunks
                  controller.enqueue(encoder.encode(data.answer));
              } else if (data.event === 'text_chunk' && data.text) {
                // This is for incremental text updates
                controller.enqueue(encoder.encode(data.text));
              } else if (data.event === 'end') {
                // Stream has ended, no more data
                break;
              } else if (data.event === 'retriever_result') {
                // Handle retriever results if you want to show them on frontend
                // For now, we'll just log
                console.log('Retriever Result:', data);
              } else if (data.event === 'agent_thought') {
                 // Handle agent thoughts if you want to show them on frontend
                console.log('Agent Thought:', data);
              } else if (data.event === 'error') {
                 console.error('Dify Stream Error Event:', data.error);
                 controller.error(new Error(data.error));
                 break;
              }
              // Add more event types as needed based on your Dify application's output
            } catch (jsonError) {
              console.error('Failed to parse Dify stream JSON:', jsonError, 'Line:', line);
              // Handle malformed JSON if necessary
            }
          }
        }
        controller.close();
      },
    });

    const encoder = new TextEncoder(); // Define encoder here
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8', // We're streaming chunks of text/JSON strings
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
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