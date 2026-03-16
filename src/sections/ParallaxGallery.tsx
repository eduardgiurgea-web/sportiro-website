import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import { parallaxGalleryConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const ParallaxGallery = () => {
  if (
    parallaxGalleryConfig.parallaxImagesTop.length === 0 &&
    parallaxGalleryConfig.galleryImages.length === 0 &&
    !parallaxGalleryConfig.sectionTitle
  ) {
    return null;
  }

  const sectionRef = useRef<HTMLDivElement>(null);
  const parallaxContainerRef = useRef<HTMLDivElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRefs = useRef<ScrollTrigger[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (topRowRef.current && bottomRowRef.current) {
        const st1 = ScrollTrigger.create({
          trigger: parallaxContainerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            const moveAmount = isMobile ? 150 : 250;
            if (topRowRef.current) {
              gsap.set(topRowRef.current, { x: -progress * moveAmount });
            }
            if (bottomRowRef.current) {
              gsap.set(bottomRowRef.current, { x: progress * moveAmount - 100 });
            }
          },
        });
        scrollTriggerRefs.current.push(st1);
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      scrollTriggerRefs.current.forEach(st => st.kill());
      scrollTriggerRefs.current = [];
    };
  }, [isMobile]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative w-full"
      style={{ backgroundColor: 'var(--warm-cream)' }}
    >
      {/* Parallax Strips Section */}
      <div
        ref={parallaxContainerRef}
        className="relative py-16 md:py-24 overflow-hidden"
      >
        {/* Section header */}
        <div className="px-6 md:px-12 mb-10 md:mb-16">
          <p className="section-label mb-3 md:mb-4">{parallaxGalleryConfig.sectionLabel}</p>
          <h2 
            className="font-serif text-3xl md:text-5xl lg:text-6xl"
            style={{ color: 'var(--warm-dark)' }}
          >
            {parallaxGalleryConfig.sectionTitle}
          </h2>
        </div>

        {/* Top row */}
        <div
          ref={topRowRef}
          className="flex gap-3 md:gap-5 mb-3 md:mb-5 will-change-transform"
        >
          {parallaxGalleryConfig.parallaxImagesTop.map((image) => (
            <div
              key={image.id}
              className="relative flex-shrink-0 w-[280px] h-[180px] md:w-[380px] md:h-[240px] overflow-hidden image-hover-scale"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(61,53,46,0.2), transparent)' }}
              />
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          ref={bottomRowRef}
          className="flex gap-3 md:gap-5 will-change-transform"
          style={{ transform: 'translateX(-100px)' }}
        >
          {parallaxGalleryConfig.parallaxImagesBottom.map((image) => (
            <div
              key={image.id}
              className="relative flex-shrink-0 w-[280px] h-[180px] md:w-[380px] md:h-[240px] overflow-hidden image-hover-scale"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(61,53,46,0.2), transparent)' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Section */}
      <div 
        className="relative py-8 md:py-10 overflow-hidden border-y"
        style={{ 
          backgroundColor: 'var(--warm-beige)',
          borderColor: 'var(--warm-sand)'
        }}
      >
        <div className="animate-marquee flex whitespace-nowrap">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-6 md:gap-8 mx-6 md:mx-8 text-lg md:text-xl font-serif"
              style={{ color: 'var(--warm-taupe)' }}
            >
              {parallaxGalleryConfig.marqueeTexts.map((text, j) => (
                <span key={j}>{text}</span>
              ))}
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--sportiro-blue)' }} />
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ParallaxGallery;
