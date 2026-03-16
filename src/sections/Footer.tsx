import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, Facebook, MessageCircle, Mail, Phone, MapPin, ExternalLink, Clock, ArrowRight } from 'lucide-react';
import { footerConfig } from '../config';
import GoogleMapWidget from './GoogleMapWidget';

gsap.registerPlugin(ScrollTrigger);

const SOCIAL_ICON_MAP = {
  instagram: Instagram,
  twitter: Facebook,
  youtube: MessageCircle,
  music: MessageCircle,
};

const Footer = () => {
  if (!footerConfig.brandName && !footerConfig.heroTitle && footerConfig.socialLinks.length === 0) {
    return null;
  }

  const sectionRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRefs = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (titleRef.current && portraitRef.current) {
        const st = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            if (titleRef.current) {
              gsap.set(titleRef.current, { y: -self.progress * 60 });
            }
          },
        });
        scrollTriggerRefs.current.push(st);
      }

      // Strong Pull Effect for the entire footer section
      const stPull = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        animation: gsap.from(sectionRef.current, {
          y: 150,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
        })
      });
      scrollTriggerRefs.current.push(stPull);

    }, sectionRef);

    return () => {
      ctx.revert();
      scrollTriggerRefs.current.forEach(st => st.kill());
      scrollTriggerRefs.current = [];
    };
  }, []);

  const handleContactClick = () => {
    if (footerConfig.subscribeAlertMessage) {
      alert(footerConfig.subscribeAlertMessage);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: 'var(--warm-cream)' }}
    >
      {/* Map Widget moved to the VERY TOP of the footer section */}
      <div className="w-full">
        <GoogleMapWidget />
      </div>

      {/* Hero portrait section (Print Your Brand) now moved BELOW the Map */}
      <div className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden border-t border-gray-100">
        {/* Side glow effects */}
        <div className="side-glow left hidden md:block" style={{ opacity: 0.4 }} />
        <div className="side-glow right hidden md:block" style={{ opacity: 0.4, animationDelay: '4s' }} />

        {/* Background portrait */}
        <div
          ref={portraitRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-full h-full">
            <img
              src={footerConfig.portraitImage}
              alt={footerConfig.portraitAlt}
              className="w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0"
              style={{ 
                background: 'linear-gradient(to top, var(--warm-cream), rgba(250,248,245,0.5), rgba(250,248,245,0.3))' 
              }}
            />
          </div>
        </div>

        {/* Parallax title overlay */}
        <div
          ref={titleRef}
          className="relative z-10 text-center will-change-transform px-6"
        >
          <h2 
            className="font-serif text-[12vw] md:text-[8vw] leading-[0.9] tracking-tight"
            style={{ color: 'var(--warm-dark)' }}
          >
            {footerConfig.heroTitle}
          </h2>
          <p 
            className="text-lg md:text-2xl mt-4 md:mt-6 max-w-xl mx-auto"
            style={{ color: 'var(--warm-brown)' }}
          >
            {footerConfig.heroSubtitle}
          </p>
          <button 
            onClick={() => window.location.href = `tel:${footerConfig.phone.replace(/\s/g, '')}`}
            className="btn-springs mt-8 md:mt-10 inline-flex items-center gap-3 group"
          >
            <Phone className="w-4 h-4" />
            Chiama Ora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Lab info */}
        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-12 z-20">
          <p 
            className="text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2 font-medium"
            style={{ color: 'var(--warm-taupe)' }}
          >
            {footerConfig.artistLabel}
          </p>
          <h3 
            className="font-serif text-2xl md:text-4xl"
            style={{ color: 'var(--warm-dark)' }}
          >
            {footerConfig.artistName}
          </h3>
          <p 
            className="text-xs md:text-sm mt-1"
            style={{ color: 'var(--warm-brown)' }}
          >
            {footerConfig.artistSubtitle}
          </p>
        </div>
      </div>

      {/* Footer content */}
      <div 
        className="relative py-16 md:py-20 px-6 md:px-12"
        style={{ backgroundColor: 'var(--warm-beige)' }}
      >
        {/* Top divider */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, var(--warm-sand), transparent)' }}
        />

        <div className="max-w-7xl mx-auto mt-4">
          {/* Footer grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shadow-lg"
                  style={{ background: 'var(--sportiro-blue)' }}
                >
                  <span className="text-white font-bold text-lg md:text-xl">S</span>
                </div>
                <div>
                  <span 
                    className="font-serif text-xl md:text-2xl block"
                    style={{ color: 'var(--warm-dark)' }}
                  >
                    {footerConfig.brandName}
                  </span>
                  <span 
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--warm-taupe)' }}
                  >
                    Print Your Brand
                  </span>
                </div>
              </div>
              <p 
                className="text-sm leading-relaxed mb-6"
                style={{ color: 'var(--warm-brown)' }}
              >
                {footerConfig.brandDescription}
              </p>
              {/* Social links */}
              <div className="flex gap-2">
                {footerConfig.socialLinks.map((social) => {
                  const IconComponent = SOCIAL_ICON_MAP[social.icon];
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center transition-all hover:shadow-md"
                      style={{ 
                        borderColor: 'var(--warm-sand)',
                        color: 'var(--warm-brown)'
                      }}
                      aria-label={social.label}
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 
                className="text-xs uppercase tracking-widest mb-5 md:mb-6 font-medium"
                style={{ color: 'var(--warm-dark)' }}
              >
                {footerConfig.quickLinksTitle}
              </h4>
              <ul className="space-y-3">
                {footerConfig.quickLinks.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm flex items-center gap-2 group transition-colors"
                      style={{ color: 'var(--warm-brown)' }}
                    >
                      <span className="group-hover:text-[var(--sportiro-blue)] transition-colors">{link}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 
                className="text-xs uppercase tracking-widest mb-5 md:mb-6 font-medium"
                style={{ color: 'var(--warm-dark)' }}
              >
                {footerConfig.contactTitle}
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5" style={{ color: 'var(--sportiro-blue)' }} />
                  <div>
                    <p 
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--warm-taupe)' }}
                    >
                      {footerConfig.emailLabel}
                    </p>
                    <a 
                      href={`mailto:${footerConfig.email}`} 
                      className="text-sm hover:text-[var(--sportiro-blue)] transition-colors"
                      style={{ color: 'var(--warm-dark)' }}
                    >
                      {footerConfig.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5" style={{ color: 'var(--sportiro-blue)' }} />
                  <div>
                    <p 
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--warm-taupe)' }}
                    >
                      {footerConfig.phoneLabel}
                    </p>
                    <a 
                      href={`tel:${footerConfig.phone.replace(/\s/g, '')}`} 
                      className="text-sm hover:text-[var(--sportiro-blue)] transition-colors"
                      style={{ color: 'var(--warm-dark)' }}
                    >
                      {footerConfig.phone}
                    </a>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--warm-taupe)' }}>338 7703318</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5" style={{ color: 'var(--sportiro-blue)' }} />
                  <div>
                    <p 
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--warm-taupe)' }}
                    >
                      {footerConfig.addressLabel}
                    </p>
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--warm-dark)' }}
                    >
                      {footerConfig.address}
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 mt-0.5" style={{ color: 'var(--sportiro-blue)' }} />
                  <div>
                    <p 
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--warm-taupe)' }}
                    >
                      Orari
                    </p>
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--warm-dark)' }}
                    >
                      Lun - Sab: 09:00 - 12:00<br />16:00 - 19:00
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 
                className="text-xs uppercase tracking-widest mb-5 md:mb-6 font-medium"
                style={{ color: 'var(--warm-dark)' }}
              >
                {footerConfig.newsletterTitle}
              </h4>
              <p 
                className="text-sm mb-4"
                style={{ color: 'var(--warm-brown)' }}
              >
                {footerConfig.newsletterDescription}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="tua@email.com"
                  className="flex-grow px-4 py-3 bg-white border text-sm rounded-lg focus:outline-none transition-all"
                  style={{ 
                    borderColor: 'var(--warm-sand)',
                    color: 'var(--warm-dark)'
                  }}
                />
                <button
                  onClick={handleContactClick}
                  className="px-4 py-3 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: 'var(--sportiro-blue)' }}
                >
                  {footerConfig.newsletterButtonText}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div 
            className="pt-6 md:pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: 'var(--warm-sand)' }}
          >
            <p 
              className="text-[10px] md:text-xs text-center md:text-left"
              style={{ color: 'var(--warm-taupe)' }}
            >
              {footerConfig.copyrightText}
            </p>
            <div className="flex gap-6">
              {footerConfig.bottomLinks.map((link) => (
                <a 
                  key={link} 
                  href="#" 
                  className="text-[10px] md:text-xs hover:text-[var(--sportiro-blue)] transition-colors"
                  style={{ color: 'var(--warm-taupe)' }}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
