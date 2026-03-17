import { useEffect, useState } from 'react';
import './index.css';
import useLenis from './hooks/useLenis';
import { siteConfig } from './config';
import { MessageCircle } from 'lucide-react';
import HeroIntro from './sections/HeroIntro';
import Hero from './sections/Hero';
import AlbumCube from './sections/AlbumCube';
import ParallaxGallery from './sections/ParallaxGallery';
import ProcessMap from './sections/ProcessMap';
import Partners from './sections/Partners';
import TourSchedule from './sections/TourSchedule';
import ScrollVideo from './sections/ScrollVideo';
import Footer from './sections/Footer';
import ChatWidget from './components/ChatWidget';
import CallbackModal from './components/CallbackModal';

function App() {
  useLenis();

  const [introComplete, setIntroComplete] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Chat widget state (controlled)
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'chat' | 'questionnaire'>('chat');

  // Callback modal state
  const [callbackOpen, setCallbackOpen] = useState(false);

  useEffect(() => {
    if (siteConfig.title) document.title = siteConfig.title;
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  }, []);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    setTimeout(() => setShowIntro(false), 700);
  };

  const openChat = () => {
    setChatMode('chat');
    setChatOpen(true);
  };

  const openQuestionnaire = () => {
    setChatMode('questionnaire');
    setChatOpen(true);
  };

  return (
    <main
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--warm-cream)' }}
    >
      {/* Intro overlay */}
      {showIntro && <HeroIntro onComplete={handleIntroComplete} />}

      {/* Main content */}
      <Hero
        introComplete={introComplete}
        onOpenQuestionnaire={openQuestionnaire}
        onRequestCallback={() => setCallbackOpen(true)}
      />
      <AlbumCube />
      <ParallaxGallery />
      <ProcessMap />
      
      {/* Sections with strong pull-up effect on scroll */}
      <Partners />
      <TourSchedule />
      <ScrollVideo />
      <Footer />

      {/* AI Chat Widget — Sofia (controlled) */}
      <ChatWidget open={chatOpen} onOpenChange={setChatOpen} mode={chatMode} />

      {/* Callback Modal */}
      <CallbackModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />

      {/* Floating Chat Button — opens Sofia chat */}
      <button
        onClick={openChat}
        className="fixed bottom-4 right-3 z-[100] flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl bg-white shadow-2xl hover:scale-105 transition-transform border border-gray-100 group cursor-pointer md:bottom-6 md:right-6"
      >
        <img
          src="/sportirologo.png"
          className="w-8 h-8 md:w-12 md:h-12 object-contain"
          style={{ animation: 'spin 8s linear infinite' }}
          alt="Sportiro"
        />
        <div className="hidden md:flex flex-col items-center mt-1">
          <span className="text-[#0a1f5c] font-black text-[12px] leading-none tracking-widest">SPORTIRO</span>
          <span className="text-[#00b4ff] text-[9px] italic leading-tight tracking-wider">Print Your Brand</span>
        </div>
        <div className="bg-[#25D366] text-white text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full mt-1 md:mt-2 flex items-center gap-1 md:gap-1.5 shadow-md group-hover:bg-[#20bd5a] transition-colors">
          <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span className="hidden md:inline">Chat Instantaneo</span>
          <span className="md:hidden">Chat</span>
        </div>
      </button>
    </main>
  );
}

export default App;
