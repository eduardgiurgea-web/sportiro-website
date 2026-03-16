import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Target, Zap, Headphones, ArrowRight } from 'lucide-react';
import { tourScheduleConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const TourSchedule = () => {
  if (tourScheduleConfig.tourDates.length === 0 && !tourScheduleConfig.sectionTitle) {
    return null;
  }

  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeVenue, setActiveVenue] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 85%',
      onEnter: () => setIsVisible(true),
      animation: gsap.from(sectionRef.current, {
        y: 150,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      })
    });

    scrollTriggerRef.current = st;

    return () => {
      st.kill();
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current?.querySelectorAll('.tour-item') || [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isVisible]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-sale':
        return { text: tourScheduleConfig.statusLabels.onSale, color: 'var(--sportiro-blue)' };
      case 'sold-out':
        return { text: tourScheduleConfig.statusLabels.soldOut, color: '#dc2626' };
      case 'coming-soon':
        return { text: tourScheduleConfig.statusLabels.comingSoon, color: '#d97706' };
      default:
        return { text: tourScheduleConfig.statusLabels.default, color: 'var(--warm-brown)' };
    }
  };

  const getIcon = (index: number) => {
    const icons = [Award, Target, Zap, Headphones];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-5 h-5 md:w-6 md:h-6" />;
  };

  const TOUR_DATES = tourScheduleConfig.tourDates;

  return (
    <section
      id="tour"
      ref={sectionRef}
      className="relative w-full min-h-screen py-20 md:py-24 overflow-hidden"
      style={{ backgroundColor: 'var(--warm-beige)' }}
    >
      {/* Side glow effects */}
      <div className="side-glow left hidden md:block" style={{ opacity: 0.3 }} />
      <div className="side-glow right hidden md:block" style={{ opacity: 0.3, animationDelay: '4s' }} />

      {/* Rotating logo */}
      {tourScheduleConfig.vinylImage && (
        <div className="absolute top-12 md:top-20 right-4 md:right-20 w-24 h-24 md:w-48 md:h-48 z-10 opacity-40 md:opacity-60">
          <img
            src={tourScheduleConfig.vinylImage}
            alt="SPORTIRO Logo"
            className="w-full h-full animate-spin-slow rounded-full shadow-xl"
          />
        </div>
      )}

      {/* Content container */}
      <div ref={contentRef} className="relative z-20 max-w-7xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <div className="mb-12 md:mb-16">
          <p className="section-label mb-3 md:mb-4">{tourScheduleConfig.sectionLabel}</p>
          <h2 
            className="font-serif text-4xl md:text-6xl"
            style={{ color: 'var(--warm-dark)' }}
          >
            {tourScheduleConfig.sectionTitle}
          </h2>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Image preview - Desktop only */}
          {TOUR_DATES.length > 0 && (
            <div className="hidden lg:flex lg:items-center">
              <div 
                className="sticky top-32 w-full aspect-[4/3] overflow-hidden shadow-xl"
              >
                <img
                  src={TOUR_DATES[activeVenue]?.image}
                  alt={TOUR_DATES[activeVenue]?.venue}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />

                <div 
                  className="absolute bottom-0 left-0 right-0 p-6 md:p-8"
                  style={{ background: 'linear-gradient(to top, rgba(61,53,46,0.8), transparent)' }}
                >
                  <p className="font-serif text-2xl text-white">
                    {TOUR_DATES[activeVenue]?.city}
                  </p>
                  <p className="text-sm text-white/70 mt-1">
                    {TOUR_DATES[activeVenue]?.venue}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Right: Features list */}
          <div className="space-y-3 md:space-y-4">
            {TOUR_DATES.map((tour, index) => {
              const status = getStatusLabel(tour.status);

              return (
                <div
                  key={tour.id}
                  className="tour-item group relative p-5 md:p-6 rounded-xl bg-white border transition-all duration-300 cursor-pointer"
                  style={{ borderColor: 'var(--warm-sand)' }}
                  onMouseEnter={() => setActiveVenue(index)}
                  onMouseLeave={() => setActiveVenue(0)}
                >
                  <div className="flex items-start gap-4 md:gap-5">
                    {/* Icon */}
                    <div 
                      className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white shadow-lg"
                      style={{ background: 'var(--sportiro-blue)' }}
                    >
                      {getIcon(index)}
                    </div>

                    {/* Main info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-1">
                        <span 
                          className="font-serif text-xl md:text-2xl"
                          style={{ color: 'var(--warm-dark)' }}
                        >
                          {tour.city}
                        </span>
                        <span 
                          className="text-[10px] md:text-xs px-2 py-1 rounded-full font-medium w-fit"
                          style={{ 
                            color: status.color,
                            backgroundColor: `${status.color}15`
                          }}
                        >
                          {status.text}
                        </span>
                      </div>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--warm-brown)' }}
                      >
                        {tour.venue}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex flex-col items-end text-right">
                      <span 
                        className="text-2xl md:text-3xl font-serif"
                        style={{ color: 'var(--sportiro-blue)' }}
                      >
                        {tour.date}
                      </span>
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--warm-taupe)' }}
                      >
                        {tour.time}
                      </span>
                    </div>
                  </div>

                  {/* Mobile stats */}
                  <div className="flex md:hidden items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--warm-sand)' }}>
                    <span className="text-xl font-serif" style={{ color: 'var(--sportiro-blue)' }}>
                      {tour.date}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--warm-taupe)' }}>
                      {tour.time}
                    </span>
                  </div>

                  {/* Hover indicator */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full transition-all duration-300 group-hover:h-16"
                    style={{ backgroundColor: 'var(--sportiro-blue)' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 md:mt-20 text-center">
          <p 
            className="text-sm md:text-base mb-6 md:mb-8 max-w-xl mx-auto"
            style={{ color: 'var(--warm-brown)' }}
          >
            {tourScheduleConfig.bottomNote}
          </p>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-springs inline-flex items-center gap-3 group"
          >
            {tourScheduleConfig.bottomCtaText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--warm-sand), transparent)' }}
      />
    </section>
  );
};

export default TourSchedule;
