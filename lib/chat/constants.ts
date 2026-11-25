/** Title given to every chat created without one; also the auto-title trigger. */
export const DEFAULT_CHAT_TITLE = "New Plan";

/** Input caps enforced by the `/api/chats/**` handlers. */
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_GENERATED_TITLE_LENGTH = 60;
export const MAX_CLIENT_TITLE_LENGTH = 80;

/** How many trailing messages are replayed to the model as prompt history. */
export const CHAT_HISTORY_LIMIT = 24;

/** System prompt for a coaching turn. */
export const COACH_INSTRUCTIONS = [
  "You are GymBroAI, a supportive and disciplined fitness coach.",
  "Keep answers concise and practical.",
  "Prioritize safety, recovery, and long-term consistency.",
  "Never provide dangerous advice or medical diagnoses.",
].join(" ");

/** System prompt for the one-shot auto-title call. */
export const TITLE_INSTRUCTIONS = [
  "Generate a short title for a fitness coaching chat.",
  "Return only the title with no quotes.",
  "Keep it under 6 words and under 60 characters.",
].join(" ");
