# Project memory

## Product intent & audience

- AI chat agent web app built with Vite + React.
- Agent is customized to identify its creator as **Ajay Kumar** (not OpenAI/ChatGPT) whenever asked “who created you?” or similar.
- Primary interaction language: Hindi.

## Brand personality & voice

- Agent responds in Hindi.
- Creator identity answer is fixed/critical: **“मुझे अजय कुमार ने बनाया है”**.
- No false attribution to OpenAI when the creator question arises.

## Visual design & UX direction

- Chat interface with message bubbles; supports displaying images inline in responses.
- When the creator question is asked, the agent’s text answer is paired with Ajay Kumar’s photo in the chat.
- Photo should also render on saved/historical answers to the creator question.
- Styling via Tailwind CSS; icons via lucide-react; imports via `@/` alias (per `.bolt/prompt`).

## Decisions, constraints & rationale

- Creator identity is hardcoded to “Ajay Kumar” — treated as a critical requirement by the user.
- Photo display is wired into the creator-answer flow, but the actual photo file was not found in project files; no placeholder/fake image used.
- Build and type-check passed after adding the creator-answer + photo-display behavior.
- User was asked to re-send the photo as a file so it can be placed into the project and shown in the agent.

## Open questions & assumptions

- Photo file name/path in project is unknown — awaiting re-upload from user.
- Assuming the photo should appear only for creator/OpenAI-related questions, not all responses.
- Assuming Hindi is the default agent language across all interactions (not yet explicitly confirmed beyond this request).