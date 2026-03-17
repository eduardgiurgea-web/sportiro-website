import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Video timeline breakpoints (as fraction of scroll progress) ──
// Tune these if the text appears too early/late relative to the video
const TEXT_FADE_IN  = 0.20; // polo faces screen → text starts appearing
const TEXT_VISIBLE  = 0.25; // text fully visible
const TEXT_FADE_OUT = 0.50; // polo starts pulling → text disappears
const TEXT_GONE     = 0.55; // text fully gone
const EXPLODE_START = 0.70; // section starts "exploding away"
const EXPLODE_END   = 0.95; // section fully gone, next section revealed

const ScrollVideo = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let st: ScrollTrigger | null = null;

    const setupScrollTrigger = () => {
      if (st) return;

      st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=150%',
        scrub: 0.3,
        pin: true,
        onUpdate: (self) => {
          const p = self.progress;

          // 1. Drive video playback
          if (video.duration) {
            video.currentTime = p * video.duration;
          }

          // 2. Text overlay: fade in → visible → fade out
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
            } else {
              textOpacity = 0;
            }
            overlayRef.current.style.opacity = String(textOpacity);
          }

          // 3. "Explode away" — scale up + fade out the whole content
          if (contentRef.current) {
            if (p < EXPLODE_START) {
              contentRef.current.style.transform = 'scale(1)';
              contentRef.current.style.opacity = '1';
            } else {
              const explodeProgress = (p - EXPLODE_START) / (EXPLODE_END - EXPLODE_START);
              const clamped = Math.min(1, Math.max(0, explodeProgress));
              const scale = 1 + clamped * 1.5;         // zoom from 1× → 2.5×
              const opacity = 1 - clamped;               // fade to 0
              contentRef.current.style.transform = `scale(${scale})`;
              contentRef.current.style.opacity = String(opacity);
            }
          }
        },
      });
    };

    // Force mobile browsers to load the video
    const forceLoad = () => {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.then(() => {
          video.pause();
          video.currentTime = 0;
          setupScrollTrigger();
        }).catch(() => {
          video.currentTime = 0;
          setupScrollTrigger();
        });
      } else {
        video.pause();
        video.currentTime = 0;
        setupScrollTrigger();
      }
    };

    if (video.readyState >= 2) {
      setupScrollTrigger();
    } else {
      video.addEventListener('loadeddata', () => setupScrollTrigger(), { once: true });
      forceLoad();
    }

    return () => {
      st?.kill();
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100svh] overflow-hidden"
      style={{ backgroundColor: '#000' }}
    >
      {/* Inner wrapper — this is what "explodes away" */}
      <div
        ref={contentRef}
        className="absolute inset-0"
        style={{ transformOrigin: 'center center', willChange: 'transform, opacity' }}
      >
        {/* Scroll-driven video background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/T_shirt_Exploding_Into_Fabric_Strings.mp4"
          muted
          playsInline
          // @ts-expect-error — webkit attribute for iOS
          webkit-playsinline=""
          preload="auto"
        />

        {/* Text overlay — appears when polo faces screen, disappears before explosion */}
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
