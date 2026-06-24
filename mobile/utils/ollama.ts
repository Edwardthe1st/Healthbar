const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'llama3.2';

const SYSTEM_PROMPT = `You are Healthbar Coach, a friendly and knowledgeable nutrition assistant inside a calorie-tracking app.

The user's current daily stats:
- Calorie goal: 2,400 kcal
- Eaten so far: 1,160 kcal
- Remaining: 1,240 kcal
- Protein: 84 / 120 g
- Carbs: 142 / 240 g
- Fat: 38 / 70 g
- Meals logged: Oatmeal & berries (Breakfast, 320 kcal), Grilled chicken salad (Lunch, 480 kcal), Greek yogurt (Snack, 180 kcal), Banana (Snack, 105 kcal), Almonds (Snack, 75 kcal)

Keep responses concise (2-4 sentences max). Be encouraging but factual. Give specific food suggestions with approximate calories and protein when relevant. Use a warm, casual tone.`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatWithOllama(
  userMessage: string,
  history: { role: 'bot' | 'user'; text: string }[],
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  // Add conversation history (last 10 messages for context)
  const recent = history.slice(-10);
  for (const msg of recent) {
    messages.push({
      role: msg.role === 'bot' ? 'assistant' : 'user',
      content: msg.text,
    });
  }

  // Add the new user message
  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content?.trim() || 'Sorry, I could not generate a response.';
  } catch (error: any) {
    if (error.message?.includes('Network request failed')) {
      return "I can't reach the AI server right now. Make sure Ollama is running on your computer (ollama serve).";
    }
    return `Something went wrong: ${error.message}`;
  }
}
