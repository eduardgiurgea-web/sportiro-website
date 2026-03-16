import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface HeroIntroProps {
  onComplete: () => void;
}

const HeroIntro = ({ onComplete }: HeroIntroProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoIconRef = useRef<HTMLImageElement>(null);
  const lettersContainerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const [taglineText, setTaglineText] = useState('');

  const TARGET_TAGLINE = 'Print Your Brand';
  const DECODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  useEffect(() => {
    // Preload critical hero images to avoid layout popping and "no internet" look
    const criticalImages = [
      '/backgroundnew.png',
      '/hero-bg.jpg',
      '/Gemini_Generated_Image_mmd0gmmd0gmmd0gm.png',
      '/Gemini_Generated_Image_j1e0yej1e0yej1e0.png'
    ];
    let loadedImagesCount = 0;
    let imagesDone = false;
    let animDone = false;

    // A fast fallback timeout in case images fail or take too long (e.g., 5 seconds)
    let fallbackTimeout: ReturnType<typeof setTimeout>;


    const checkCompletion = () => {
      if (animDone && imagesDone && overlayRef.current) {
        spinAnim.kill();
        onComplete();
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
        });
      }
    };

    criticalImages.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loadedImagesCount++;
        if (loadedImagesCount === criticalImages.length && !imagesDone) {
          imagesDone = true;
          clearTimeout(fallbackTimeout);
          checkCompletion();
        }
      };
      img.onerror = () => {
        loadedImagesCount++;
        if (loadedImagesCount === criticalImages.length && !imagesDone) {
          imagesDone = true;
          clearTimeout(fallbackTimeout);
          checkCompletion();
        }
      };
      img.src = src;
    });

    fallbackTimeout = setTimeout(() => {
      if (!imagesDone) {
        imagesDone = true;
        checkCompletion();
      }
    }, 6000);

    // Continuous spin — starts immediately, runs throughout
    const spinAnim = gsap.to(logoIconRef.current, {
      rotation: 360,
      duration: 2.5,
      repeat: -1,
      ease: 'none',
    });

    const tl = gsap.timeline({
      onComplete: () => {
        animDone = true;
        checkCompletion();
      },
    });

    // Phase 1: S logo icon fades in and scales up
    tl.fromTo(
      logoIconRef.current,
      { scale: 0.3, opacity: 0, filter: 'blur(20px)' },
      { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }
    );

    // Phase 2: Letters assemble from behind the S
    const letters = lettersContainerRef.current?.querySelectorAll('.intro-letter');
    if (letters) {
      const letterArray = Array.from(letters);

      tl.set(lettersContainerRef.current, { opacity: 1 }, '+=0.2');

      letterArray.forEach((letter, i) => {
        tl.fromTo(
          letter,
          {
            x: -20 * (i + 1),
            opacity: 0,
            scale: 0.8,
            filter: 'blur(4px)',
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.5,
            ease: 'back.out(1.2)',
          },
          `-=0.4`
        );
      });

      // S logo shrinks slightly to sit as part of the lockup
      tl.to(
        logoIconRef.current,
        {
          scale: 0.6,
          duration: 0.8,
          ease: 'power3.inOut',
        },
        '-=1.0'
      );
    }

    // Phase 3: Tagline decode animation
    tl.call(
      () => {
        let iteration = 0;
        const maxIterations = TARGET_TAGLINE.length * 4;

        const interval = setInterval(() => {
          setTaglineText(
            TARGET_TAGLINE.split('')
              .map((char, index) => {
                if (char === ' ') return ' ';
                if (index < iteration / 4) return TARGET_TAGLINE[index];
                return DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
              })
              .join('')
          );

          iteration += 1;

          if (iteration >= maxIterations) {
            clearInterval(interval);
            setTaglineText(TARGET_TAGLINE);
          }
        }, 35);
      },
      [],
      '+=0.1'
    );

    tl.fromTo(
      taglineRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '<'
    );

    // Wait for the decode animation to fully complete (15 chars * 4 iterations * 35ms ≈ 2.1s)
    // plus a brief pause so the user can read the final text
    tl.to({}, { duration: 2.5 });

    return () => {
      clearTimeout(fallbackTimeout);
      spinAnim.kill();
      tl.kill();
    };
  }, []);

  const BRAND_LETTERS = 'SPORTIRO'.split('');

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'var(--warm-cream)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,113,227,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative flex items-center justify-center">
        {/* Spinning S logo */}
        <div className="relative z-10 flex-shrink-0">
          <img
            ref={logoIconRef}
            src="/Slogo2-removebg-preview.png"
            alt="Sportiro"
            className="w-40 h-40 md:w-56 md:h-56 object-contain"
            style={{ opacity: 0 }}
          />
        </div>

        {/* SPORTIRO letters + tagline */}
        <div className="flex flex-col justify-center -ml-4 md:-ml-8" style={{ marginTop: '0.5rem' }}>
          <div
            ref={lettersContainerRef}
            className="flex items-center"
            style={{ opacity: 0 }}
          >
            {BRAND_LETTERS.map((letter, i) => (
              <span
                key={i}
                className="intro-letter inline-block text-[2.5rem] md:text-[4rem] lg:text-[5.5rem] font-bold tracking-tight"
                style={{
                  color: '#0a1f5c',
                  fontFamily: 'var(--font-sans)',
                  opacity: 0,
                }}
              >
                {letter}
              </span>
            ))}
          </div>

          <div
            ref={taglineRef}
            className="pl-1 md:pl-2 mt-0 md:-mt-2"
            style={{ opacity: 0 }}
          >
            <span
              className="text-sm md:text-xl lg:text-2xl"
              style={{
                color: 'var(--sportiro-blue)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: '0.05em',
              }}
            >
              {taglineText || '\u00A0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroIntro;
