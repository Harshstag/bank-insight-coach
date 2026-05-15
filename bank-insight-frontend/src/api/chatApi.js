const BASE_URL = "http://localhost:8080/api/chat";

/**
 * Send a user message to the chatbot and receive an AI reply.
 * @param {string} message - The user's natural language message.
 * @returns {Promise<{ reply: string, timestamp: string }>}
 */
export const sendChatMessage = async (message) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage: message, consent: true }),
  });
  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }
  return response.json();
};

/**
 * Fetch the full conversation history from the backend.
 * @returns {Promise<Array<{ role: string, content: string, timestamp: string }>>}
 */
export const getChatHistory = async () => {
  const response = await fetch(`${BASE_URL}/history`);
  if (!response.ok) {
    throw new Error(`History API error: ${response.status}`);
  }
  return response.json();
};

/**
 * Clear the conversation history on the backend (fresh session).
 * @returns {Promise<void>}
 */
export const clearChatHistory = async () => {
  const response = await fetch(`${BASE_URL}/history`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`Clear history API error: ${response.status}`);
  }
};
