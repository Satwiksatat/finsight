export function generateChatTitle(text: string): string {
  const sanitized = text.replace(/\s+/g, ' ').trim();
  const words = sanitized.split(' ');
  const slice = words.slice(0, 5).join(' ');
  return slice.charAt(0).toUpperCase() + slice.slice(1);
}
