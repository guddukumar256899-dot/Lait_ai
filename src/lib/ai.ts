export const CREATOR_NAME = 'अजय कुमार';
export const CREATOR_PHOTO_PATH = '/ajay-kumar.png';

const CREATOR_ANSWER =
  'मुझे अजय कुमार ने बनाया है। यही मेरे निर्माता हैं।';

const SYSTEM_PROMPT =
  'You are "RoboMind", a friendly and highly knowledgeable AI assistant with a robotics theme. ' +
  'You help with any question: science, technology, robotics, studies, daily life, coding, and general knowledge. ' +
  'Answer in the same language the user writes in (Hindi, English, or Hinglish). ' +
  'Be helpful, clear, and concise. ' +
  'If anyone asks who made, created, built, developed, or owns you, always say exactly that your creator is Ajay Kumar (अजय कुमार). Never say OpenAI, ChatGPT, or any other person made you.';

const creatorQuestionPattern =
  /(किसने|किसने बनाया|बनाया किसने|निर्माता|मालिक|बनाने वाला|तुम्हें किसने|आपको किसने|who (made|created|built|developed)|your (creator|maker|owner)|made you|created you|built you|developed you|open\s*ai( ने| made)?|chatgpt( ने| made)?)/i;

export function isCreatorQuestion(question: string) {
  return creatorQuestionPattern.test(question.trim());
}

export function isCreatorAnswer(answer: string) {
  return answer.includes(CREATOR_NAME);
}

interface PollinationsChoice {
  message?: { content?: string };
}

interface PollinationsResponse {
  choices?: PollinationsChoice[];
}

export async function askAI(
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  const latestQuestion = history[history.length - 1]?.content ?? '';
  if (isCreatorQuestion(latestQuestion)) {
    return CREATOR_ANSWER;
  }

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-20)];

  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`AI request failed (${res.status})`);
  }

  const data: PollinationsResponse = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error('AI gave an empty answer');
  }
  return reply;
}
