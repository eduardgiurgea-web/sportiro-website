// =============================================================================
// Site Configuration
// Edit ONLY this file to customize all content across the site.
// All animations, layouts, and styles are controlled by the components.
// =============================================================================

// -- Site-wide settings -------------------------------------------------------
export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  title: "SPORTIRO | Print Your Brand",
  description: "Rendi la tua azienda più visibile. Acquisisci stile e professionalità con la personalizzazione di alta qualità. Da quasi 20 anni serviamo i nostri clienti con i migliori prodotti del settore.",
  language: "it",
};

// -- Hero Section -------------------------------------------------------------
export interface HeroNavItem {
  label: string;
  sectionId: string;
  icon: "disc" | "play" | "calendar" | "music";
}

export interface HeroConfig {
  backgroundImage: string;
  brandName: string;
  decodeText: string;
  decodeChars: string;
  subtitle: string;
  ctaPrimary: string;
  ctaPrimaryTarget: string;
  ctaSecondary: string;
  ctaSecondaryTarget: string;
  cornerLabel: string;
  cornerDetail: string;
  navItems: HeroNavItem[];
}

export const heroConfig: HeroConfig = {
  backgroundImage: "/hero-bg.jpg",
  brandName: "SPORTIRO",
  decodeText: "PRINT YOUR BRAND",
  decodeChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  subtitle: "Rendi la tua azienda più visibile. Acquisisci stile e professionalità con la personalizzazione di alta qualità.",
  ctaPrimary: "Richiedi Consulenza Gratuita",
  ctaPrimaryTarget: "contact",
  ctaSecondary: "Richiedi una Chiamata Istantanea",
  ctaSecondaryTarget: "contact",
  cornerLabel: "SPORTIRO LAB",
  cornerDetail: "Villongo Sant'Alessandro",
  navItems: [
    { label: "Servizi", sectionId: "albums", icon: "disc" },
    { label: "Lavori", sectionId: "gallery", icon: "play" },
    { label: "Contatti", sectionId: "contact", icon: "calendar" },
  ],
};

// -- Album Cube Section (Services) --------------------------------------------
export interface Album {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  description: string;
}

export interface AlbumCubeConfig {
  albums: Album[];
  cubeTextures: string[];
  scrollHint: string;
}

export const albumCubeConfig: AlbumCubeConfig = {
  albums: [
    {
      id: 1,
      title: "Abbigliamento da Lavoro",
      subtitle: "WORKWEAR",
      image: "/abblavoro.jpg",
      description: "Divise da lavoro personalizzate per aziende e abbigliamento antinfortunistico.",
    },
    {
      id: 2,
      title: "Eventi & Tempo Libero",
      subtitle: "EVENTS",
      image: "/tlibero.jpg",
      description: "Magliette, felpe e accessori personalizzati per eventi sportivi e tempo libero.",
    },
    {
      id: 3,
      title: "Gadget Aziendali",
      subtitle: "PROMO",
      image: "/gaziendali.jpg",
      description: "Penne, tazze, shopper e oggetti promozionali con il tuo logo aziendale.",
    },
    {
      id: 4,
      title: "Forniture per Società Sportive",
      subtitle: "SPORT",
      image: "/fsocieta.jpg",
      description: "Box personalizzati e forniture complete per società sportive e associazioni.",
    },
    {
      id: 5,
      title: "Tecniche di Stampa",
      subtitle: "PRINTING",
      image: "/techstamp.jpg",
      description: "Serigrafia, ricamo, sublimazione e stampa digitale con tecnologie all'avanguardia.",
    },
  ],
  cubeTextures: [
    "/fsocieta.jpg",
    "/tlibero.jpg",
    "/print-process-6.jpg",
    "/techstamp.jpg",
    "/abblavoro.jpg",
    "/gaziendali.jpg",
  ],
  scrollHint: "Scorri per esplorare i nostri servizi",
};

// -- Parallax Gallery Section -------------------------------------------------
export interface ParallaxImage {
  id: number;
  src: string;
  alt: string;
}

export interface GalleryImage {
  id: number;
  src: string;
  title: string;
  date: string;
}

export interface ParallaxGalleryConfig {
  sectionLabel: string;
  sectionTitle: string;
  galleryLabel: string;
  galleryTitle: string;
  marqueeTexts: string[];
  endCtaText: string;
  parallaxImagesTop: ParallaxImage[];
  parallaxImagesBottom: ParallaxImage[];
  galleryImages: GalleryImage[];
}

export const parallaxGalleryConfig: ParallaxGalleryConfig = {
  sectionLabel: "I NOSTRI LAVORI",
  sectionTitle: "Qualità che si vede",
  galleryLabel: "PORTFOLIO",
  galleryTitle: "Alcuni dei nostri progetti",
  marqueeTexts: [
    "PERSONALIZZAZIONE",
    "STAMPA DI QUALITÀ",
    "CONSEGNA RAPIDA",
    "SPORTIRO",
    "PRINT YOUR BRAND",
  ],
  endCtaText: "Richiedi la tua consulenza gratuita",
  parallaxImagesTop: [
    { id: 1, src: "/IMG_0552-300x225.3.jpg", alt: "Kit sportivi completi" },
    { id: 2, src: "/IMG_0539-300x298.6.jpg", alt: "Abbigliamento brandizzato" },
    { id: 3, src: "/IMG_0553-300x235.4.jpg", alt: "Felpe e t-shirt staff" },
    { id: 4, src: "/IMG_0533-300x225.1.jpg", alt: "Abbigliamento da lavoro" },
    { id: 5, src: "/IMG_0517-300x225.7.jpg", alt: "Merchandising eventi" },
    { id: 6, src: "/IMG_0516-300x300.8.jpg", alt: "Gadget aziendali" },
  ],
  parallaxImagesBottom: [
    { id: 1, src: "/IMG_0540-300x160.2.jpg", alt: "Gadget promozionali" },
    { id: 2, src: "/IMG_0561-300x208.5.jpg", alt: "T-shirt per eventi" },
    { id: 3, src: "/IMG_0561-300x208.5.jpg", alt: "Personalizzazione colori" },
    { id: 4, src: "/print-process-1.jpg", alt: "Serigrafia" },
    { id: 5, src: "/print-process-2.jpg", alt: "Ricamo" },
    { id: 6, src: "/print-process-3.jpg", alt: "Stampa a caldo" },
  ],
  galleryImages: [
    { id: 1, src: "/IMG_0552-300x225.3.jpg", title: "Kit Sportivi Completi", date: "2024" },
    { id: 2, src: "/IMG_0539-300x298.6.jpg", title: "Abbigliamento Brandizzato", date: "2024" },
    { id: 3, src: "/IMG_0553-300x235.4.jpg", title: "Felpe & T-Shirt Staff", date: "2024" },
    { id: 4, src: "/IMG_0540-300x160.2.jpg", title: "Gadget Promozionali", date: "2024" },
    { id: 5, src: "/IMG_0561-300x208.5.jpg", title: "T-Shirt per Eventi", date: "2024" },
    { id: 6, src: "/IMG_0516-300x300.8.jpg", title: "Personalizzazione Colori", date: "2024" },
  ],
};

// -- Tour Schedule Section (Why Choose Us) ------------------------------------
export interface TourDate {
  id: number;
  date: string;
  time: string;
  city: string;
  venue: string;
  status: "on-sale" | "sold-out" | "coming-soon";
  image: string;
}

export interface TourStatusLabels {
  onSale: string;
  soldOut: string;
  comingSoon: string;
  default: string;
}

export interface TourScheduleConfig {
  sectionLabel: string;
  sectionTitle: string;
  vinylImage: string;
  buyButtonText: string;
  detailsButtonText: string;
  bottomNote: string;
  bottomCtaText: string;
  statusLabels: TourStatusLabels;
  tourDates: TourDate[];
}

export const tourScheduleConfig: TourScheduleConfig = {
  sectionLabel: "PERCHÉ SCEGLIERE SPORTIRO",
  sectionTitle: "La combinazione di eccellenza",
  vinylImage: "/sportirologo.png",
  buyButtonText: "Richiedi Info",
  detailsButtonText: "Dettagli",
  bottomNote: "Da quasi 20 anni serviamo i nostri clienti con i migliori prodotti del settore",
  bottomCtaText: "Contattaci Ora",
  statusLabels: {
    onSale: "Disponibile",
    soldOut: "Esaurito",
    comingSoon: "Prossimamente",
    default: "Info",
  },
  tourDates: [
    {
      id: 1,
      date: "20+",
      time: "anni",
      city: "ESPERIENZA",
      venue: "Da quasi 20 anni serviamo i nostri clienti con i migliori prodotti del settore",
      status: "on-sale",
      image: "/lab-interior.jpg",
    },
    {
      id: 2,
      date: "100%",
      time: "qualità",
      city: "PRECISIONE",
      venue: "La precisione e l'attenzione ai dettagli sono ciò che ci contraddistinguono",
      status: "on-sale",
      image: "/print-process-2.jpg",
    },
    {
      id: 3,
      date: "24h",
      time: "consegna",
      city: "VELOCITÀ",
      venue: "In un'era che va veloce, offriamo un servizio di consegna molto rapido in tutta Italia",
      status: "on-sale",
      image: "/print-process-3.jpg",
    },
    {
      id: 4,
      date: "1:1",
      time: "supporto",
      city: "SERVIZIO",
      venue: "Ti aiutiamo a scegliere il materiale e la tecnica più adatti alle tue esigenze",
      status: "on-sale",
      image: "/print-process-1.jpg",
    },
  ],
};

// -- Footer Section -----------------------------------------------------------
export interface FooterImage {
  id: number;
  src: string;
}

export interface SocialLink {
  icon: "instagram" | "twitter" | "youtube" | "music";
  label: string;
  href: string;
}

export interface FooterConfig {
  portraitImage: string;
  portraitAlt: string;
  heroTitle: string;
  heroSubtitle: string;
  artistLabel: string;
  artistName: string;
  artistSubtitle: string;
  brandName: string;
  brandDescription: string;
  quickLinksTitle: string;
  quickLinks: string[];
  contactTitle: string;
  emailLabel: string;
  email: string;
  phoneLabel: string;
  phone: string;
  addressLabel: string;
  address: string;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterButtonText: string;
  subscribeAlertMessage: string;
  copyrightText: string;
  bottomLinks: string[];
  socialLinks: SocialLink[];
  galleryImages: FooterImage[];
}

export const footerConfig: FooterConfig = {
  portraitImage: "/lab-interior.jpg",
  portraitAlt: "SPORTIRO Lab Interior",
  heroTitle: "PRINT YOUR BRAND",
  heroSubtitle: "Rendi la tua azienda più visibile",
  artistLabel: "IL NOSTRO LAB",
  artistName: "SPORTIRO",
  artistSubtitle: "Villongo Sant'Alessandro",
  brandName: "SPORTIRO",
  brandDescription: "Da quasi 20 anni ci occupiamo della personalizzazione di abbigliamento e gadget per aziende, eventi e sport. Qualità, precisione e velocità sono i nostri punti di forza.",
  quickLinksTitle: "Link Rapidi",
  quickLinks: ["Home", "Servizi", "Lavori", "Contatti"],
  contactTitle: "Contatti",
  emailLabel: "Email",
  email: "info@sportiro.it",
  phoneLabel: "Telefono",
  phone: "035 925012",
  addressLabel: "Indirizzo",
  address: "Via Giuseppe Verdi, 9 - 24060 Villongo (BG)",
  newsletterTitle: "Resta Aggiornato",
  newsletterDescription: "Iscriviti per ricevere novità e offerte speciali",
  newsletterButtonText: "Iscriviti",
  subscribeAlertMessage: "Grazie per l'iscrizione! Ti terremo aggiornato sulle nostre novità.",
  copyrightText: "© 2024 Sportiro di Tironi Roberto | P.I. 03321180162",
  bottomLinks: ["Privacy Policy", "Termini e Condizioni"],
  socialLinks: [
    { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/sportiro_villongo_bg/" },
    { icon: "twitter", label: "Facebook", href: "https://www.facebook.com/sportirovillongo/" },
    { icon: "music", label: "WhatsApp", href: "https://wa.me/393387703318" },
  ],
  galleryImages: [
    { id: 1, src: "/IMG_0552-300x225.3.jpg" },
    { id: 2, src: "/IMG_0539-300x298.6.jpg" },
    { id: 3, src: "/IMG_0540-300x160.2.jpg" },
    { id: 4, src: "/IMG_0561-300x208.5.jpg" },
  ],
};

// -- Partners Section ---------------------------------------------------------
export interface Partner {
  id: number;
  name: string;
  logo: string;
}

export interface PartnersConfig {
  sectionTitle: string;
  partners: Partner[];
}

export const partnersConfig: PartnersConfig = {
  sectionTitle: "I NOSTRI PARTNER",
  partners: [
    { id: 1, name: "Stedman", logo: "/STEDMAN.png" },
    { id: 2, name: "Cama", logo: "/CAMA-1.png" },
    { id: 3, name: "Joma", logo: "/JOMA.png" },
    { id: 4, name: "Fruit of the Loom", logo: "/FRUIT-1.png" },
    { id: 5, name: "Diadora", logo: "/Logo_diadora.jpg" },
  ],
};

