import { useState, useRef, useEffect } from 'react';
import { X, Phone } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface CallbackModalProps {
  open: boolean;
  onClose: () => void;
}

const WEBHOOK_URL = import.meta.env.VITE_CALLBACK_WEBHOOK_URL as string | undefined;

type State = 'idle' | 'loading' | 'success' | 'error';

/** Normalise Italian phone to E.164 best-effort (e.g. 333 123 4567 → +39333123...) */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('39') && digits.length >= 11) return `+${digits}`;
  if (digits.startsWith('0') && digits.length >= 9) return `+39${digits.slice(1)}`;
  if (digits.length >= 9) return `+39${digits}`;
  return `+${digits}`;
}

export default function CallbackModal({ open, onClose }: CallbackModalProps) {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<State>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPhone('');
      setState('idle');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || state === 'loading') return;

    setState('loading');

    if (!WEBHOOK_URL) {
      // Demo mode — simulate success
      setTimeout(() => setState('success'), 800);
      return;
    }

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalisePhone(phone) }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setState('success');
    } catch {
      setState('error');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: '#fff' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#fff3e0' }}
              >
                <Phone className="w-5 h-5" style={{ color: '#F77F00' }} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg leading-tight">La Richiamiamo Subito</h2>
                <p className="text-gray-500 text-sm mt-0.5">Risponderemo entro 20 secondi</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {state === 'success' ? (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#e8f5e9' }}
              >
                <span className="text-2xl">✅</span>
              </div>
              <p className="font-semibold text-gray-900 text-base">La stiamo chiamando!</p>
              <p className="text-gray-500 text-sm mt-1">Risponda tra pochi secondi. Benvenuto in Sportiro!</p>
              <button
                onClick={onClose}
                className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
              >
                Chiudi
              </button>
            </div>
          ) : state === 'error' ? (
            <div className="text-center py-4">
              <p className="font-semibold text-gray-900 text-base">Si è verificato un errore</p>
              <p className="text-gray-500 text-sm mt-1">
                La preghiamo di chiamarci direttamente al{' '}
                <a href="tel:035925012" className="font-semibold" style={{ color: '#F77F00' }}>
                  035 925012
                </a>
              </p>
              <button
                onClick={() => setState('idle')}
                className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#F77F00' }}
              >
                Riprova
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-gray-600 text-sm mb-4">
                Inserisca il Suo numero e la richiamiamo istantaneamente — senza attese.
              </p>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Numero di telefono
              </label>
              <input
                ref={inputRef}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 333 123 4567"
                required
                disabled={state === 'loading'}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors disabled:opacity-50"
                style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}
              />
              <button
                type="submit"
                disabled={state === 'loading' || !phone.trim()}
                className="mt-4 w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#F77F00' }}
              >
                {state === 'loading' ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Chiamata in corso…
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Chiama Ora
                  </>
                )}
              </button>
              <p className="text-center text-gray-400 text-xs mt-3">
                Oppure scriva su{' '}
                <a
                  href="https://wa.me/393387703318"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium"
                  style={{ color: '#25D366' }}
                >
                  WhatsApp
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
