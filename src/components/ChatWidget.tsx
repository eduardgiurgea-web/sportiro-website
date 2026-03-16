import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: 'chat' | 'questionnaire';
}

const CHAT_WEBHOOK_URL = import.meta.env.VITE_CHAT_WEBHOOK_URL as string | undefined;
const QUESTIONNAIRE_WEBHOOK_URL = import.meta.env.VITE_QUESTIONNAIRE_WEBHOOK_URL as string | undefined;

// ── Questionnaire definition ──────────────────────────────────────────────────
const QUESTIONS = [
  'Buongiorno! Sono Sofia di Sportiro. 😊 Per quale tipo di attività cerca prodotti personalizzati? (es. azienda, associazione sportiva, evento, scuola…)',
  'Ottimo! Che tipo di prodotto Le interessa? (es. divise da lavoro, magliette evento, gadget aziendali, kit sportivo…)',
  'Per quante persone o unità, all\'incirca?',
  'Ha una data di consegna in mente? (es. entro fine mese, tra 2 mesi…)',
  'Ha un budget di riferimento? (es. fino a €500 / €500–1.000 / oltre €1.000)',
  'Come si chiama e quale azienda o associazione rappresenta?',
  'Quasi fatto! 🎉 Qual è il Suo numero di telefono o email? Le invieremo il preventivo personalizzato entro 24 ore.',
];

const ANSWER_KEYS = [
  'tipoAttivita',
  'tipoProdotto',
  'quantita',
  'dataConsegna',
  'budget',
  'nomeCliente',
  'contattoCliente',
];

// ── Chat mode initial message ─────────────────────────────────────────────────
const CHAT_INITIAL: Message = {
  role: 'assistant',
  content: 'Ciao! Sono Sofia di Sportiro. Come posso essere d\'aiuto? 😊',
};

export default function ChatWidget({ open, onOpenChange, mode }: ChatWidgetProps) {
  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([CHAT_INITIAL]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  // ── Questionnaire state ─────────────────────────────────────────────────────
  const [qStep, setQStep] = useState(0);
  const [qMessages, setQMessages] = useState<Message[]>([
    { role: 'assistant', content: QUESTIONS[0] },
  ]);
  const [qAnswers, setQAnswers] = useState<Record<string, string>>({});
  const [qDone, setQDone] = useState(false);
  const [qTyping, setQTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when panel opens
  useEffect(() => {
    if (open && mode === 'questionnaire') {
      setQStep(0);
      setQMessages([{ role: 'assistant', content: QUESTIONS[0] }]);
      setQAnswers({});
      setQDone(false);
      setQTyping(false);
    }
    if (open && mode === 'chat') {
      setMessages([CHAT_INITIAL]);
      setChatId(null);
    }
  }, [open, mode]);

  // Auto-scroll
  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, qMessages, qTyping, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // ── Questionnaire send ──────────────────────────────────────────────────────
  const sendQuestionnaire = () => {
    const text = input.trim();
    if (!text || qDone || qTyping) return;

    const key = ANSWER_KEYS[qStep];
    const updatedAnswers = { ...qAnswers, [key]: text };
    setQAnswers(updatedAnswers);

    const withUserMsg: Message[] = [...qMessages, { role: 'user', content: text }];
    setQMessages(withUserMsg);
    setInput('');
    setQTyping(true);

    const nextStep = qStep + 1;

    setTimeout(() => {
      setQTyping(false);

      if (nextStep < QUESTIONS.length) {
        setQStep(nextStep);
        setQMessages([...withUserMsg, { role: 'assistant', content: QUESTIONS[nextStep] }]);
      } else {
        const name = updatedAnswers['nomeCliente'] || 'Cliente';
        const finalMsg = `Grazie ${name}! 🙏 Un nostro collaboratore La contatterà personalmente entro 24 ore. Nel frattempo può chiamarci al 035 925012 o scriverci su WhatsApp al +39 338 7703318.`;
        setQMessages([...withUserMsg, { role: 'assistant', content: finalMsg }]);
        setQDone(true);
        // Fire-and-forget — submit lead to n8n WF5
        if (QUESTIONNAIRE_WEBHOOK_URL) {
          fetch(QUESTIONNAIRE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tipoAttivita: updatedAnswers['tipoAttivita'] || '',
              tipoProdotto: updatedAnswers['tipoProdotto'] || '',
              quantita: updatedAnswers['quantita'] || '',
              scadenza: updatedAnswers['dataConsegna'] || '',
              budget: updatedAnswers['budget'] || '',
              nomeCliente: updatedAnswers['nomeCliente'] || '',
              contatto: updatedAnswers['contattoCliente'] || '',
              fonte: 'questionnaire-web',
            }),
          }).catch(() => {}); // silent fail — never block the UI
        }
      }
    }, 1500);
  };

  // ── Chat send ───────────────────────────────────────────────────────────────
  const sendChat = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    if (!CHAT_WEBHOOK_URL) {
      // Demo mode — show typing indicator for 1.5s then fallback message
      setTimeout(() => {
        setMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content:
              'Il servizio chat non è ancora attivo. La preghiamo di contattarci al 035 925012 o via WhatsApp al +39 338 7703318.',
          },
        ]);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, messages: updatedMessages, chatId }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.chatId) setChatId(data.chatId);
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: data.reply || 'Mi scuso, si è verificato un errore. La prego di riprovare.' },
      ]);
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Mi scuso, si è verificato un problema tecnico. La prego di contattarci al 035 925012.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => (mode === 'questionnaire' ? sendQuestionnaire() : sendChat());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeMessages = mode === 'questionnaire' ? qMessages : messages;
  const isInputDisabled = mode === 'questionnaire' ? (qDone || qTyping) : loading;
  const showTyping = (mode === 'questionnaire' && qTyping) || (mode === 'chat' && loading);
  const headerTitle = mode === 'questionnaire' ? 'Richiedi Consulenza Gratuita' : 'Sofia · Sportiro';

  return (
    <div
      className="fixed bottom-44 right-6 z-[99] flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
      style={{
        width: 'min(360px, calc(100vw - 3rem))',
        height: open ? '500px' : '0px',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        background: '#fff',
        border: '1px solid rgba(0,113,227,0.15)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ backgroundColor: '#0071e3' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          S
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-none truncate">{headerTitle}</p>
          <p className="text-blue-100 text-[11px] mt-0.5">
            {mode === 'questionnaire' ? 'Preventivo in 2 minuti' : 'Risponde in pochi secondi'}
          </p>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="shrink-0 text-white/70 hover:text-white transition-colors"
          aria-label="Chiudi chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ background: '#f9fafb' }}>
        {activeMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === 'user'
                  ? { backgroundColor: '#0071e3', color: '#fff', borderBottomRightRadius: '4px' }
                  : { backgroundColor: '#fff', color: '#1a1a1a', border: '1px solid #e5e7eb', borderBottomLeftRadius: '4px' }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {showTyping && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-2"
              style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderBottomLeftRadius: '4px' }}
            >
              <Spinner className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs text-gray-400">Sofia sta scrivendo…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-3 border-t"
        style={{ borderColor: '#e5e7eb', background: '#fff' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={qDone ? 'Grazie per il contatto!' : 'Scrivi un messaggio…'}
          disabled={isInputDisabled}
          className="flex-1 text-sm px-3 py-2 rounded-xl border outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}
        />
        <button
          onClick={handleSend}
          disabled={isInputDisabled || !input.trim()}
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#0071e3', color: '#fff' }}
          aria-label="Invia messaggio"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
