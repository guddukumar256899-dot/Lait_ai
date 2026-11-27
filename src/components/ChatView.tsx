import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { CREATOR_PHOTO_PATH, isCreatorAnswer } from '@/lib/ai';
import type { ChatMessage } from '@/lib/supabase';

interface ChatViewProps {
  messages: ChatMessage[];
  loading: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatView({ messages, loading }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 && !loading && (
        <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-100">मैं RoboMind हूँ</h2>
          <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
            मुझसे कुछ भी पूछें — टाइप करके या माइक दबाकर बोलकर। मैं हिंदी और इंग्लिश दोनों समझता हूँ।
          </p>
        </div>
      )}

      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                isUser
                  ? 'bg-slate-700 border-slate-600'
                  : 'bg-gradient-to-br from-cyan-600 to-slate-800 border-cyan-500/40 shadow-md shadow-cyan-500/20'
              }`}
            >
              {isUser ? (
                <User className="w-4 h-4 text-slate-200" />
              ) : (
                <Bot className="w-4 h-4 text-cyan-400" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                isUser
                  ? 'bg-cyan-600/90 text-white rounded-tr-sm'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-100 rounded-tl-sm'
              }`}
            >
              {msg.content}
              {!isUser && isCreatorAnswer(msg.content) && (
                <div className="mt-3 overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900/80">
                  <img
                    src={CREATOR_PHOTO_PATH}
                    alt="अजय कुमार"
                    className="block max-h-72 w-full object-cover object-top"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="px-3 py-2 text-xs font-medium text-cyan-200">अजय कुमार — निर्माता</div>
                </div>
              )}
              <div
                className={`text-[10px] mt-1 ${isUser ? 'text-cyan-200/70' : 'text-slate-500'}`}
              >
                {formatTime(msg.created_at)}
              </div>
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-slate-800 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
