import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Upload, Search, Eye, Printer, Truck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { num: 1, Icon: Upload,  label: 'Ci invii il logo',          desc: 'Carica la tua grafica o il tuo logo' },
  { num: 2, Icon: Search,  label: 'Scegliamo per te',          desc: 'Ti guidiamo nella scelta del materiale' },
  { num: 3, Icon: Eye,     label: 'Ti mostriamo',              desc: 'Anteprima digitale prima della produzione' },
  { num: 4, Icon: Printer, label: 'Stampa',                    desc: 'Produzione con tecnologie avanzate' },
  { num: 5, Icon: Truck,   label: 'Consegna in tutta Italia',  desc: 'Spedizione rapida e tracciata' },
];

const ProcessMap = () => {
  const sectionRef       = useRef<HTMLDivElement>(null);
  const lineRefs         = useRef<(HTMLDivElement | null)[]>([]);
  const circleRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const mobCircleRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const mobLabelRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const mobLineRefs      = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial states
      circleRefs.current.forEach(el => {
        if (el) gsap.set(el, { scale: 0, opacity: 0 });
      });
      labelRefs.current.forEach(el => {
        if (el) gsap.set(el, { opacity: 0, y: 20 });
      });
      lineRefs.current.forEach(el => {
        if (el) gsap.set(el, { scaleX: 0, transformOrigin: 'left center' });
      });

      // Step 1 circle appears first, before any lines
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          end: 'bottom 75%',
          scrub: false,
        },
      });

      STEPS.forEach((_, i) => {
        const circle = circleRefs.current[i];
        const label  = labelRefs.current[i];
        const line   = lineRefs.current[i]; // line AFTER circle i

        // Circle pops in
        if (circle) {
          tl.to(circle, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' }, i === 0 ? 0 : undefined);
        }
        // Label rises up
        if (label) {
          tl.to(label, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '<0.1');
        }
        // Line to next step grows
        if (line) {
          tl.to(line, { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }, '<0.15');
        }
      });
    }, sectionRef);

    // Mobile animation — same staggered reveal, vertical direction
    const mobCtx = gsap.context(() => {
      mobCircleRefs.current.forEach(el => {
        if (el) gsap.set(el, { scale: 0, opacity: 0 });
      });
      mobLabelRefs.current.forEach(el => {
        if (el) gsap.set(el, { opacity: 0, x: 20 });
      });
      mobLineRefs.current.forEach(el => {
        if (el) gsap.set(el, { scaleY: 0, transformOrigin: 'top center' });
      });

      const mobTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          end: 'bottom 75%',
          scrub: false,
        },
      });

      STEPS.forEach((_, i) => {
        const circle = mobCircleRefs.current[i];
        const label  = mobLabelRefs.current[i];
        const line   = mobLineRefs.current[i];

        if (circle) {
          mobTl.to(circle, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' }, i === 0 ? 0 : undefined);
        }
        if (label) {
          mobTl.to(label, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, '<0.1');
        }
        if (line) {
          mobTl.to(line, { scaleY: 1, duration: 0.4, ease: 'power2.inOut' }, '<0.15');
        }
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      mobCtx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative w-full py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: '#61CE70' }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Come Funziona
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold"
            style={{ color: '#FFFFFF', fontFamily: 'var(--font-sans)' }}
          >
            Dal concept alla consegna
          </h2>
          <p
            className="mt-4 text-base md:text-lg max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            5 semplici passi per trasformare la tua idea in realtà.
          </p>
        </div>

        {/* Desktop map */}
        <div className="hidden md:flex items-start justify-between relative">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-start flex-1">
              {/* Step */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 120 }}>
                {/* Circle */}
                <div
                  ref={el => { circleRefs.current[i] = el; }}
                  className="relative flex flex-col items-center justify-center rounded-full border-4 shadow-xl"
                  style={{
                    width: 96,
                    height: 96,
                    backgroundColor: '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.6)',
                  }}
                >
                  <step.Icon
                    className="w-8 h-8 mb-0.5"
                    style={{ color: '#61CE70' }}
                    strokeWidth={2}
                  />
                  <span
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-black flex items-center justify-center"
                    style={{ backgroundColor: '#0a1f5c', color: '#FFFFFF' }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Label block */}
                <div
                  ref={el => { labelRefs.current[i] = el; }}
                  className="mt-4 text-center"
                >
                  <p className="text-sm font-bold leading-tight" style={{ color: '#FFFFFF' }}>
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Connector line to next step */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 flex items-center" style={{ marginTop: 46, paddingLeft: 8, paddingRight: 8 }}>
                  <div
                    ref={el => { lineRefs.current[i] = el; }}
                    className="w-full"
                    style={{
                      height: 3,
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      borderRadius: 2,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile vertical layout */}
        <div className="flex md:hidden flex-col gap-0">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-stretch gap-4">
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 64 }}>
                <div
                  ref={el => { mobCircleRefs.current[i] = el; }}
                  className="relative flex items-center justify-center rounded-full border-4 shadow-lg flex-shrink-0"
                  style={{ width: 64, height: 64, backgroundColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.6)' }}
                >
                  <step.Icon className="w-6 h-6" style={{ color: '#61CE70' }} strokeWidth={2} />
                  <span
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                    style={{ backgroundColor: '#0a1f5c', color: '#FFFFFF' }}
                  >
                    {step.num}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    ref={el => { mobLineRefs.current[i] = el; }}
                    className="flex-1 my-2"
                    style={{ width: 3, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2, minHeight: 32 }}
                  />
                )}
              </div>
              <div
                ref={el => { mobLabelRefs.current[i] = el; }}
                className="pb-8 pt-2"
              >
                <p className="font-bold text-sm" style={{ color: '#FFFFFF' }}>{step.label}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessMap;
