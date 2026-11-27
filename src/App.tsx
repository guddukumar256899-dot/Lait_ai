import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Mic, MicOff, Send, Square, Trash2 } from 'lucide-react';
import ChatView from '@/components/ChatView';
import { useSpeech } from '@/hooks/useSpeech';
import { askAI } from '@/lib/ai';
import { supabase, type ChatMessage } from '@/lib/supabase';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef<string | null>(null);

  const handleFinal = useCallback((text: string) => {
    pendingRef.current = text;
    setInput(text);
  }, []);

  const { listening, interim, supported, toggle } = useSpeech(handleFinal);

  useEffect(() => {
    supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) {
          setError('पुराने संदेश लोड नहीं हो सके।');
        } else if (data) {
          setMessages(data as ChatMessage[]);
        }
        setHistoryLoading(false);
      });
  }, []);

  const ask = useCallback(
    async (question: string) => {
      if (!question.trim() || loading) return;

      setError(null);
      setInput('');
      pendingRef.current = null;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: question,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const historyForAI = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const answer = await askAI(historyForAI);
        const botMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: answer,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        supabase
          .from('chat_messages')
          .insert([{ role: 'user', content: question }])
          .then(() =>
            supabase.from('chat_messages').insert([{ role: 'assistant', content: answer }]),
          );
      } catch {
        setError('जवाब नहीं मिल सका। कृपया दोबारा कोशिश करें।');
        supabase.from('chat_messages').insert([{ role: 'user', content: question }]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = pendingRef.current ?? input;
    void ask(text);
  };

  const clearChat = async () => {
    setMessages([]);
    const { error: err } = await supabase.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err) setError('चैट साफ़ नहीं हो सकी।');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-slate-800 border border-cyan-400/40 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Bot className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 tracking-tight">RoboMind AI</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ऑनलाइन — कुछ भी पूछें
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            disabled={messages.length === 0}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
            title="चैट साफ़ करें"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
        {historyLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Bot className="w-8 h-8 text-cyan-500 animate-pulse" />
          </div>
        ) : (
          <ChatView messages={messages} loading={loading} />
        )}

        {error && (
          <div className="mx-4 mb-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {listening && interim && (
          <div className="mx-4 mb-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-sm">
            सुन रहा हूँ: {interim}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900/70 backdrop-blur">
          <div className="flex items-center gap-2 bg-slate-800 rounded-full pl-5 pr-2 py-2 border border-slate-700 focus-within:border-cyan-500/50 transition-colors">
            <input
              type="text"
              value={listening && interim ? interim : input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? 'सुन रहा हूँ...' : 'अपना सवाल लिखें या बोलें...'}
              className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-slate-500"
            />
            {supported && (
              <button
                type="button"
                onClick={toggle}
                className={`p-2.5 rounded-full transition-all ${
                  listening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title={listening ? 'सुनना बंद करें' : 'बोलकर पूछें'}
              >
                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            <button
              type="submit"
              disabled={loading || (!input.trim() && !pendingRef.current)}
              className="p-2.5 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="भेजें"
            >
              {loading ? <Square className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
