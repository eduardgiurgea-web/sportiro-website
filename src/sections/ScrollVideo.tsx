import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollVideo = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
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
      if (st) return; // already set up

      st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=100%',
        scrub: 0.3,
        pin: true,
        onUpdate: (self) => {
          if (video.duration) {
            video.currentTime = self.progress * video.duration;
          }
          if (overlayRef.current) {
            const textOpacity = Math.min(1, self.progress / 0.15);
            overlayRef.current.style.opacity = String(textOpacity);
          }
        },
      });
    };

    // Force mobile browsers to load the video by playing + pausing
    const forceLoad = () => {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.then(() => {
          video.pause();
          video.currentTime = 0;
          setupScrollTrigger();
        }).catch(() => {
          // Autoplay blocked — set up anyway, video will load on first scroll
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
      // Also try force-loading for mobile
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

      {/* Text overlay with semi-transparent white background */}
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
    </section>
  );
};

export default ScrollVideo;
