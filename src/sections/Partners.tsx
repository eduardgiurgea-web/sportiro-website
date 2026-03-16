import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { partnersConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const Partners = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Strong pull up effect
      gsap.from(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 150,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-16 md:py-24 overflow-hidden"
      style={{ backgroundColor: 'var(--warm-cream)' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className="font-serif text-2xl md:text-3xl tracking-widest uppercase opacity-80"
            style={{ color: 'var(--warm-dark)' }}
          >
            {partnersConfig.sectionTitle}
          </h2>
          <div className="w-12 h-px bg-warm-sand mx-auto mt-4 opacity-50" />
        </div>

        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 lg:gap-20">
          {partnersConfig.partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-center transition-all duration-500 hover:scale-105 opacity-90 hover:opacity-100 cursor-pointer px-4"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-10 md:h-16 lg:h-20 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/sportirologo.png';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
