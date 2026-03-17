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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload all frames
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];

    framePaths.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        // Draw first frame once it's ready
        if (i === 0 && canvasRef.current) {
          drawFrame(0);
        }
      };
      images[i] = img;
    });

    imagesRef.current = images;
  }, []);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas to fill section
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Draw image to cover the canvas (object-cover behavior)
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  };

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
        drawFrame(frameIndex);

        // 2. Text overlay phasing
        if (overlayRef.current) {
          let textOpacity = 0;
          if (p < TEXT_FADE_IN) {
            textOpacity = 0;
          } else if (p < TEXT_VISIBLE) {
            textOpacity = (p - TEXT_FADE_IN) / (TEXT_VISIBLE - TEXT_FADE_IN);
          } else if (p < TEXT_FADE_OUT) {
            textOpacity = 1;
          } else if (p < TEXT_GONE) {
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

  // Resize canvas when window resizes
  useEffect(() => {
    const handleResize = () => drawFrame(0);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        {/* Canvas for frame sequence */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
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
