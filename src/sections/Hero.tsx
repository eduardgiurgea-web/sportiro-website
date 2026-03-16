import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Disc, Calendar, ArrowRight, Menu, X } from 'lucide-react';
import { heroConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP = {
  disc: Disc,
  play: Play,
  calendar: Calendar,
  music: Play,
};

// Merchandise items configuration
const MERCH_ITEMS = [
  { src: '/Gemini_Generated_Image_mmd0gmmd0gmmd0gm.png', alt: 'Sportiro T-Shirt', size: 'w-36 h-36 md:w-52 md:h-52' },
  { src: '/Gemini_Generated_Image_j1e0yej1e0yej1e0.png', alt: 'Sportiro Hoodie', size: 'w-40 h-40 md:w-56 md:h-56' },
  { src: '/Gemini_Generated_Image_2kjx9d2kjx9d2kjx.png', alt: 'Sportiro Polo', size: 'w-32 h-32 md:w-48 md:h-48' },
  { src: '/Gemini_Generated_Image_5cns1l5cns1l5cns.png', alt: 'Sportiro Cap', size: 'w-28 h-28 md:w-40 md:h-40' },
  { src: '/Gemini_Generated_Image_k25z7ok25z7ok25z.png', alt: 'Sportiro Tote Bag', size: 'w-32 h-32 md:w-44 md:h-44' },
];

// Ribbon positions for merchandise (following a diagonal flowing line, but kept away from center)
const MERCH_POSITIONS = [
  { x: -38, y: 35, z: -200, rotation: -15 }, // Bottom left
  { x: -32, y: -25, z: 100, rotation: 10 },  // Top left
  { x: 35, y: -30, z: -50, rotation: -5 },   // Top right
  { x: 32, y: 15, z: 150, rotation: 15 },    // Middle right
  { x: 0, y: 22, z: 100, rotation: -5 },     // Bottom Center (Directly under buttons)
];

interface HeroProps {
  introComplete: boolean;
  onOpenQuestionnaire?: () => void;
  onRequestCallback?: () => void;
}

const Hero = ({ introComplete, onOpenQuestionnaire, onRequestCallback }: HeroProps) => {
  if (!heroConfig.decodeText && !heroConfig.brandName && heroConfig.navItems.length === 0) {
    return null;
  }

  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoFixedRef = useRef<HTMLDivElement>(null);
  const merchContainerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoInCorner, setLogoInCorner] = useState(false);
  const logoInCornerRef = useRef(false);
  const cachedWindowRef = useRef({ w: window.innerWidth, h: window.innerHeight });
  const merchItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orbitAnimRef = useRef<gsap.core.Timeline | null>(null);

  // Merchandise entrance + orbit animation
  useEffect(() => {
    if (!introComplete || !merchContainerRef.current) return;

    const items = merchItemRefs.current.filter(Boolean);
    if (items.length === 0) return;

    // Off-screen starting positions (pixels, based on current viewport)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const PULL_ORIGINS = [
      { x: -vw * 1.5, y: vh * 1.2 },   // bottom-left
      { x: -vw * 1.5, y: -vh * 1.2 },  // top-left
      { x:  vw * 1.5, y: -vh * 1.2 },  // top-right
      { x:  vw * 1.5, y: 0 },           // right
      { x: 0,          y:  vh * 1.6 },  // bottom-center
    ];

    // Set initial state — off-screen, invisible
    items.forEach((item, i) => {
      if (!item) return;
      gsap.set(item, {
        xPercent: -50,
        yPercent: -50,
        x: PULL_ORIGINS[i].x,
        y: PULL_ORIGINS[i].y,
        z: MERCH_POSITIONS[i].z,
        rotation: MERCH_POSITIONS[i].rotation * 3,
        opacity: 0,
      });

    });

    // Pull-in timeline — items fly in one by one, slightly overlapping
    const tl = gsap.timeline({
      onComplete: startOrbit,
    });

    items.forEach((item, i) => {
      if (!item) return;
      const pos = MERCH_POSITIONS[i];
      tl.to(
        item,
        {
          x: `${pos.x}vw`,
          y: `${pos.y}vh`,
          opacity: 1,
          rotation: pos.rotation,
          duration: 0.9,
          ease: 'back.out(1.5)',
        },
        i === 0 ? 0.2 : `-=0.6`  // first item starts at 0.2s, rest overlap by 0.6s
      );
    });

    // Orbit starts only after all items have landed
    function startOrbit() {
      items.forEach((item, i) => {
        if (!item) return;
        const pos = MERCH_POSITIONS[i];

        gsap.to(item, {
          x: `+=${(pos.x > 0 ? 1 : -1) * 40}`,
          y: `-=30`,
          duration: gsap.utils.random(4, 7),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3,
        });

        gsap.to(item, {
          y: `+=${gsap.utils.random(15, 28)}`,
          duration: gsap.utils.random(2.5, 4),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.5,
        });

        gsap.to(item, {
          rotation: pos.rotation + gsap.utils.random(-6, 6),
          duration: gsap.utils.random(3.5, 6),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.7,
        });
      });
    }

    return () => {
      tl.kill();
      orbitAnimRef.current?.kill();
      gsap.killTweensOf(items);
    };
  }, [introComplete]);

  // Cache window size on resize to avoid reading it every scroll frame
  useEffect(() => {
    const handleResize = () => {
      cachedWindowRef.current = { w: window.innerWidth, h: window.innerHeight };
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll-driven logo transition: center → top-left corner
  useEffect(() => {
    if (!introComplete || !heroRef.current || !logoRef.current) return;

    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: '40% top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        if (!logoRef.current) return;

        const suctionProgress = Math.pow(progress, 3);
        const scale = 1 - 0.65 * suctionProgress;
        const { w, h } = cachedWindowRef.current;
        const xPercent = -50 + 50 * suctionProgress;
        const yMove = suctionProgress * -h * 0.42;
        const xMove = suctionProgress * -w * 0.45;

        gsap.set(logoRef.current, { scale, x: xMove, y: yMove, xPercent, yPercent: -50 });

        if (merchContainerRef.current) {
          const opacity = Math.max(0, 1 - progress * 1.5);
          gsap.set(merchContainerRef.current, { opacity, scale: 1 - progress * 0.3 });
        }

        // Only trigger React re-render when the boolean flips, not every frame
        const shouldBeInCorner = progress > 0.8;
        if (shouldBeInCorner !== logoInCornerRef.current) {
          logoInCornerRef.current = shouldBeInCorner;
          setLogoInCorner(shouldBeInCorner);
        }
      },
    });

    return () => st.kill();
  }, [introComplete]);

  // Entrance animations for logo, nav, subtitle, CTA
  useEffect(() => {
    if (!introComplete) return;

    const ctx = gsap.context(() => {
      // Staggered entrance: elements fade in smoothly as the intro overlay fades out
      gsap.set(logoRef.current, { xPercent: -50, yPercent: -50 });
      gsap.set(navRef.current, { xPercent: -50 });

      const targets = [logoRef.current, navRef.current, subtitleRef.current, ctaRef.current].filter(Boolean);

      gsap.fromTo(
        targets,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.15,
          delay: 0.2, // slight delay so overlay fades out seamlessly
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, [introComplete]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-[120vh] overflow-hidden"
      style={{ backgroundColor: 'var(--warm-cream)' }}
    >
      {/* Side glow effects */}
      <div className="side-glow left hidden md:block" />
      <div className="side-glow right hidden md:block" />

      {/* Background image - Flowing Ribbon */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="ribbon-flow absolute inset-[-30%] w-[160%] h-[160%] bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroConfig.backgroundImage})`,
            opacity: 0.85, // Increased visibility
            filter: 'contrast(1.1) brightness(1.05)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(250,248,245,0.1) 0%, rgba(250,248,245,0.3) 50%, rgba(250,248,245,0.7) 100%)', // More transparent mask
          }}
        />
      </div>


      {/* Desktop Navigation */}
      <nav
        ref={navRef}
        className="hidden md:flex fixed top-6 left-1/2 z-50 nav-pill px-2 py-2"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-1">
          {heroConfig.navItems.map((item) => {
            const IconComponent = ICON_MAP[item.icon];
            return (
              <button
                key={item.sectionId}
                onClick={() => scrollToSection(item.sectionId)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors rounded-full hover:bg-white/50"
                style={{ color: 'var(--warm-dark)' }}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-4 left-4 right-4 z-50">
        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/sportirologo.png" alt="Sportiro" className="w-8 h-8 object-contain" />
            <span className="font-medium text-sm" style={{ color: 'var(--warm-dark)' }}>
              {heroConfig.brandName}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mt-2 glass rounded-2xl p-4 space-y-2">
            {heroConfig.navItems.map((item) => (
              <button
                key={item.sectionId}
                onClick={() => scrollToSection(item.sectionId)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-wider rounded-xl hover:bg-white/50 transition-colors text-left"
                style={{ color: 'var(--warm-dark)' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Fixed logo in corner (appears when scrolled) */}
      {logoInCorner && (
        <div
          ref={logoFixedRef}
          className="fixed top-6 left-6 z-[60] flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img
            src="/sportirologo.png"
            alt="Sportiro"
            className="w-10 h-10 object-contain"
          />
          <div>
            <span
              className="font-bold text-sm block leading-tight tracking-wide"
              style={{ color: '#0a1f5c' }}
            >
              SPORTIRO
            </span>
            <span
              className="text-[9px] italic tracking-wider"
              style={{ color: 'var(--sportiro-blue)' }}
            >
              Print Your Brand
            </span>
          </div>
        </div>
      )}

      {/* 3D Perspective container for merchandise */}
      <div
        ref={merchContainerRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
      >
        {MERCH_ITEMS.map((item, i) => (
          <div
            key={i}
            ref={(el) => { merchItemRefs.current[i] = el; }}
            className={`absolute top-1/2 left-1/2 ${item.size} merch-item`}
            style={{
              opacity: 0,
              filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.2))',
              zIndex: 10 + i,
              mixBlendMode: 'multiply'
            }}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
        ))}
      </div>

      {/* Logo lockup — hidden until intro ends, then GSAP fades it in centered at 35% */}
      <div
        ref={logoRef}
        className="absolute z-20"
        style={{
          left: '50%',
          top: '20%',
          transformOrigin: 'top left',
          opacity: 0,
        }}
      >
        <img
          src="/backgroundnew.png"
          alt="Sportiro"
          className="w-72 md:w-[500px] lg:w-[600px] object-contain"
        />
      </div>

      {/* Subtitle + CTA — positioned in the lower half, connected to logo visually */}
      <div
        className="absolute left-0 right-0 z-20 flex flex-col items-center px-6"
        style={{ top: '42%' }}
      >
        <p
          ref={subtitleRef}
          className="text-base md:text-xl lg:text-2xl max-w-2xl mx-auto mb-6 leading-relaxed text-center font-semibold"
          style={{
            color: '#0a1f5c',
            opacity: 0,
            textShadow: '0 4px 20px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,1)',
          }}
        >
          {heroConfig.subtitle}
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl"
          style={{ opacity: 0 }}
        >
          <button
            onClick={onOpenQuestionnaire ?? (() => scrollToSection(heroConfig.ctaPrimaryTarget))}
            className="btn-orange-pulse flex items-center justify-center gap-3 group px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all"
          >
            {heroConfig.ctaPrimary}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onRequestCallback ?? (() => scrollToSection(heroConfig.ctaSecondaryTarget))}
            className="btn-orange-pulse flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all"
          >
            {heroConfig.ctaSecondary}
          </button>
        </div>
      </div>

      {/* Corner accents - Desktop only */}
      <div className="hidden md:block absolute top-8 right-8 text-right">
        <p
          className="text-[10px] uppercase tracking-widest font-medium"
          style={{ color: 'var(--warm-taupe)' }}
        >
          {heroConfig.cornerLabel}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--warm-brown)' }}>
          {heroConfig.cornerDetail}
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 w-full h-32"
        style={{
          background: 'linear-gradient(to top, var(--warm-cream), transparent)',
        }}
      />
    </section>
  );
};

export default Hero;
