// utils/difyChatNaming.ts
import type { ChatMessage, LLMContent } from "@/lib/types";

// (No changes needed for getMessageTextContent or defaultChatTitle)
function getMessageTextContent(message: ChatMessage): string {
    return message.content
        .filter((content): content is Extract<LLMContent, { type: 'text' }> => content.type === 'text')
        .map(textContent => textContent.content)
        .join('\n');
}

function defaultChatTitle(messages: ChatMessage[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return "New Chat";
    const textContent = getMessageTextContent(firstUserMessage);
    if (!textContent) return "New Chat";
    const words = textContent.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3).slice(0, 4);
    return words.length > 1 ? words.join(" ") + "..." : "New Chat";
}


export async function generateChatTitle(
    messages: ChatMessage[]
): Promise<string> {
    // 1. ✨ GUARD CLAUSE: Only run if there's a user message AND an assistant response.
    // This prevents running on the very first message and ensures context exists.
    if (messages.length < 2) {
        return defaultChatTitle(messages);
    }

    const context = messages
        .slice(0, 3) // Takes up to the first 3 messages
        .map(m => `${m.role}: ${getMessageTextContent(m)}`)
        .join('\n');

    const DIFY_APP_ID = process.env.DIFY_APP_ID;
    const TITLEGEN_API_KEY = process.env.TITLEGEN_API_KEY;

    // 2. ✨ VALIDATION: Re-enable the environment variable check.
    // This is critical for server-side code.
    if (!TITLEGEN_API_KEY) {
        console.error('Dify App ID or API Key not configured in environment variables.');
        return defaultChatTitle(messages); // Fallback gracefully
    }

    const prompt = `Generate an extremely concise title (3-5 words maximum) summarizing this conversation. Focus on the main topic or question. Return ONLY the title text with no additional formatting, quotes, or labels.

Conversation Context:
${context}

Title:`;

    try {
        const response = await fetch("http://192.168.29.46:80/v1/completion-messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TITLEGEN_API_KEY}`
            },
            body: JSON.stringify({
                inputs: {},
                query: prompt,
                response_mode: "blocking",
                user: "system-title-generator", // Use a distinct user ID
                app_id: DIFY_APP_ID
            })
        });

        // 3. ✨ IMPROVED ERROR LOGGING: Log the actual response body on failure.
        if (!response.ok) {
            const errorBody = await response.json().catch(() => response.text());
            console.error(`Dify API error: ${response.status}`, errorBody);
            // Throw an error to be caught by the catch block
            throw new Error(`Dify API request failed with status ${response.status}`);
        }

        const data = await response.json();
        let title = data.answer.trim().replace(/^["']|["']$/g, '');

        if (!title || title.length > 50) { // Increased max length slightly
            return defaultChatTitle(messages);
        }

        return title;
    } catch (error) {
        // The error is now more descriptive thanks to the block above
        console.error("Failed to generate chat title:", error);
        return defaultChatTitle(messages); // Fallback to default on any error
    }
}