import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Frame sequence ──
const FRAME_START = 15;
const FRAME_END = 40;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1; // 26 frames

const framePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const num = String(FRAME_START + i).padStart(3, '0');
  return `/jpg/ezgif-frame-${num}.jpg`;
});

// ── Timeline breakpoints (fraction of scroll progress) ──
const TEXT_FADE_IN  = 0.20;
const TEXT_VISIBLE  = 0.25;
const TEXT_FADE_OUT = 0.50;
const TEXT_GONE     = 0.55;
const EXPLODE_START = 0.70;
const EXPLODE_END   = 0.95;

const ScrollVideo = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload all frames into browser cache
  useEffect(() => {
    framePaths.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // ScrollTrigger setup
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=150%',
      scrub: 0.3,
      pin: true,
      onUpdate: (self) => {
        const p = self.progress;

        // 1. Pick frame from progress
        const frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(p * TOTAL_FRAMES)
        );
        if (imgRef.current && frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          imgRef.current.src = framePaths[frameIndex];
        }

        // 2. Text overlay phasing
        if (overlayRef.current) {
          let textOpacity = 0;
          if (p >= TEXT_FADE_IN && p < TEXT_VISIBLE) {
            textOpacity = (p - TEXT_FADE_IN) / (TEXT_VISIBLE - TEXT_FADE_IN);
          } else if (p >= TEXT_VISIBLE && p < TEXT_FADE_OUT) {
            textOpacity = 1;
          } else if (p >= TEXT_FADE_OUT && p < TEXT_GONE) {
            textOpacity = 1 - (p - TEXT_FADE_OUT) / (TEXT_GONE - TEXT_FADE_OUT);
          }
          overlayRef.current.style.opacity = String(textOpacity);
        }

        // 3. Explode away
        if (contentRef.current) {
          if (p < EXPLODE_START) {
            contentRef.current.style.transform = 'scale(1)';
            contentRef.current.style.opacity = '1';
          } else {
            const ep = Math.min(1, (p - EXPLODE_START) / (EXPLODE_END - EXPLODE_START));
            contentRef.current.style.transform = `scale(${1 + ep * 1.5})`;
            contentRef.current.style.opacity = String(1 - ep);
          }
        }
      },
    });

    return () => st.kill();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100svh] overflow-hidden"
      style={{ backgroundColor: '#000' }}
    >
      {/* Inner wrapper — explodes away */}
      <div
        ref={contentRef}
        className="absolute inset-0"
        style={{ transformOrigin: 'center center', willChange: 'transform, opacity' }}
      >
        {/* Frame image — swapped on scroll */}
        <img
          ref={imgRef}
          src={framePaths[0]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Text overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 flex items-center justify-center px-6"
          style={{ opacity: 0 }}
        >
          <div
            className="text-center px-8 py-10 md:px-16 md:py-14 rounded-2xl max-w-2xl"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)' }}
          >
            <h2
              className="text-2xl md:text-4xl lg:text-5xl leading-snug font-light"
              style={{ color: '#1a1a1a' }}
            >
              Personalizza le tue{' '}
              <br className="hidden md:block" />
              divise da lavoro, crea{' '}
              <br />
              <span className="font-black">un'immagine</span>{' '}
              <br className="md:hidden" />
              <span className="font-black">PROFESSIONALE</span>{' '}
              <br className="hidden md:block" />
              adesso!
            </h2>
            <p
              className="mt-6 text-sm md:text-base leading-relaxed max-w-lg mx-auto"
              style={{ color: '#555' }}
            >
              Una gamma enorme di articoli. Tutto quello che puoi immaginare, noi lo trasformiamo in prodotto finito.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollVideo;
