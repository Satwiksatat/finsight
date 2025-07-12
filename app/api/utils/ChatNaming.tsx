// api/utils/ChatNaming.ts
import type { ChatMessage, LLMContent } from "@/lib/types";

/* ---------- helpers ---------- */
function getMessageTextContent(message: ChatMessage): string {
  return message.content
    .filter(
      (c): c is Extract<LLMContent, { type: "text" }> => c.type === "text"
    )
    .map(c => c.content)
    .join("\n");
}

function defaultChatTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find(m => m.role === "user");
  if (!firstUser) return "New Chat";
  const text = getMessageTextContent(firstUser).trim();
  if (!text) return "New Chat";

  const words = text
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 6);

  return words.length > 1 ? words.join(" ") + "…" : "New Chat";
}

/* ---------- main function ---------- */
export async function generateChatTitle(
  messages: ChatMessage[]
): Promise<string> {
  // 1. Guard clause: need at least user + assistant
  if (messages.length < 2) return defaultChatTitle(messages);

  // 2. Build a tiny context
  const context = messages
    .slice(0, 3)
    .map(m => `${m.role}: ${getMessageTextContent(m)}`)
    .join("\n");

  // 3. Load config
  const DIFY_API_URL = process.env.DIFY_API_URL || "http://172.16.3.123:80";
  const DIFY_API_KEY = process.env.DIFY_API_KEY;

  if (!DIFY_API_KEY) {
    console.error(
      "Missing DIFY_API_KEY in environment variables."
    );
    return defaultChatTitle(messages);
  }

  // 4. Craft prompt
  const prompt = `Generate an extremely concise title (3-5 words maximum) summarizing this conversation. Focus on the main topic or question. Return ONLY the title text with no additional formatting, quotes, or labels.

Conversation Context:
${context}

Title:`;

  try {
    const res = await fetch(`${DIFY_API_URL}/v1/chat-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: { query: prompt },
        response_mode: "blocking",
        user: "system-title-generator",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => res.statusText);
      console.error(`Dify API error (${res.status}):`, err);
      throw new Error(`Dify API failed: ${res.status}`);
    }

    const { answer } = await res.json();
    const title = answer.trim().replace(/^["']|["']$/g, "");

    return title && title.length <= 50
      ? title.charAt(0).toUpperCase() + title.slice(1)
      : defaultChatTitle(messages);
  } catch (e: any) {
    console.error("Failed to generate chat title:", e);
    return defaultChatTitle(messages);
  }
}
