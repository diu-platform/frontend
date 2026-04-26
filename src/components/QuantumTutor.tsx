import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string }

const DAILY_LIMIT = 999; // TODO: restore to 5
const SK = 'qt_usage';
const HISTORY_KEY = 'qt_history';
const MAX_STORED_MSGS = 100;

function loadHistory(): Message[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch { return []; }
}

function saveHistory(msgs: Message[]) {
  const trimmed = msgs.slice(-MAX_STORED_MSGS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

function getUsed(): number {
  try {
    const s = JSON.parse(localStorage.getItem(SK) ?? '{}');
    return s.date === new Date().toDateString() ? (s.count ?? 0) : 0;
  } catch { return 0; }
}

function bumpUsed(n: number) {
  localStorage.setItem(SK, JSON.stringify({ date: new Date().toDateString(), count: n + 1 }));
}

interface QuantumTutorProps {
  experiment?: string;
  simulationContext?: string;
}

export function QuantumTutor({ experiment, simulationContext }: QuantumTutorProps) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgsRaw] = useState<Message[]>(loadHistory);
  const setMsgs = (next: Message[]) => { saveHistory(next); setMsgsRaw(next); };
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(getUsed);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const canSend = used < DAILY_LIMIT && !!input.trim() && !busy;

  const send = async () => {
    if (!canSend) return;
    const msg: Message = { role: 'user', content: input.trim() };
    const history = [...msgs, msg];
    setMsgs(history);
    setInput('');
    setBusy(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg.content, history: msgs, experiment, sim_context: simulationContext }),
      });
      const d = await r.json();
      setMsgs([...history, { role: 'assistant', content: d.reply ?? 'Нет ответа.' }]);
      bumpUsed(used);
      setUsed(used + 1);
    } catch {
      setMsgs([...history, { role: 'assistant', content: 'Сервер недоступен. Попробуй позже.' }]);
    }
    setBusy(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const panel: React.CSSProperties = {
    position: 'fixed', bottom: 88, right: 24, zIndex: 1000, width: 380, height: 520,
    borderRadius: 12,
    background: 'rgba(10, 8, 20, 0.08)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(107, 70, 193, 0.2)',
    display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(107,70,193,0.1)',
    fontFamily: 'system-ui, sans-serif',
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Quantum AI Tutor"
        className="qt-fab"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6B46C1, #38bdf8)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#0a0814', fontWeight: 700 }}>Q</span>
      </button>

      {open && (
        <div style={panel}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(107,70,193,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#38bdf8', fontWeight: 700 }}>⚛ Quantum</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#6B46C1' }}>AI Tutor</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: used >= DAILY_LIMIT ? '#f87171' : '#38bdf8' }}>
                {used} / {DAILY_LIMIT} сегодня
              </span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B46C1', display: 'flex', padding: 0 }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.length === 0 && (
              <p style={{ color: 'rgba(167,139,250,0.9)', fontSize: 13, textAlign: 'center', marginTop: 48, lineHeight: 1.6 }}>
                Привет! Я Quantum — AI-тьютор DIU OS.<br />
                Спроси о квантовой физике или текущей симуляции.
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '8px 12px', borderRadius: 8, fontSize: 13, lineHeight: 1.6,
                  background: m.role === 'user' ? 'rgba(107,70,193,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(107,70,193,0.22)' : 'rgba(255,255,255,0.06)'}`,
                  color: '#f1f5f9', whiteSpace: 'pre-wrap',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: 12 }}>
                <Loader2 size={14} className="qt-spin" />
                <span style={{ fontFamily: "'Space Mono', monospace" }}>thinking...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(107,70,193,0.3)', display: 'flex', gap: 8 }}>
            {used >= DAILY_LIMIT
              ? <p style={{ color: '#f87171', fontSize: 12, fontFamily: "'Space Mono', monospace", margin: 0 }}>
                  Лимит {DAILY_LIMIT} запросов на сегодня исчерпан.
                </p>
              : <>
                  <input
                    value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                    placeholder="Спроси о квантовой физике..." disabled={busy}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(107,70,193,0.4)',
                      borderRadius: 6, padding: '7px 12px', color: '#f1f5f9',
                      fontSize: 13, outline: 'none',
                    }}
                  />
                  <button onClick={send} disabled={!canSend} style={{
                    background: canSend ? '#38bdf8' : '#1e1030', border: 'none', borderRadius: 6,
                    padding: '0 12px', cursor: canSend ? 'pointer' : 'not-allowed',
                    color: canSend ? '#0a0814' : '#6B46C1', display: 'flex', alignItems: 'center',
                  }}>
                    <Send size={16} />
                  </button>
                </>
            }
          </div>
        </div>
      )}

      <style>{`
        .qt-fab { animation: qtPulse 2s ease-in-out infinite; transition: transform 0.15s; }
        .qt-fab:hover { animation: none; transform: scale(1.1); }
        @keyframes qtPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(56,189,248,0.6); }
          50% { box-shadow: 0 0 0 10px rgba(56,189,248,0); }
        }
        .qt-spin { animation: qtSpin 1s linear infinite; }
        @keyframes qtSpin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
