/*
# Create chat_messages table (robot AI assistant chat history)

1. New Tables
- `chat_messages`
  - `id` (uuid, primary key)
  - `role` (text, not null) — "user" or "assistant"
  - `content` (text, not null) — the message text
  - `created_at` (timestamp)
2. Security
- Enable RLS on `chat_messages`.
- Grant SELECT, INSERT, DELETE to `anon` + `authenticated`.
- Allow anon + authenticated CRUD because this is a single-tenant, no-sign-in app and chat history is intentionally shared across the device.
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON chat_messages TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages
FOR DELETE TO anon, authenticated USING (true);
