import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

const customStyles = {
  body: {
    backgroundColor: '#D4C9B3',
    backgroundImage: `
      linear-gradient(rgba(26, 26, 26, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26, 26, 26, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  tornEdge: {
    position: 'relative',
    zIndex: 1,
  },
  tapeStrip: {
    opacity: 0.85,
    mixBlendMode: 'multiply',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  bead: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    boxShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    display: 'inline-block',
  },
};

const NatureCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let animationId;
    const particles = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * height;
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.life = Math.random();
        this.color = ['rgba(40, 90, 53, 0.1)', 'rgba(58, 105, 138, 0.1)', 'rgba(255, 74, 28, 0.05)'][Math.floor(Math.random() * 3)];
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.life * 5) * 0.1;
        this.life += 0.002;
        if (this.y < -20) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < 25; i++) particles.push(new Particle());

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-40"
    />
  );
};

const SVGFilters = () => (
  <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
    <filter id="torn-paper" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="torn-paper-heavy" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <symbol id="orange-star" viewBox="0 0 50 50">
      <polygon points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20" />
      <line x1="15" y1="15" x2="35" y2="35" />
      <line x1="15" y1="35" x2="35" y2="15" />
    </symbol>
  </svg>
);

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navItems = [
    {
      id: 'timeline',
      label: 'Timeline',
      icon: (
        <svg className="w-7 h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'discoveries',
      label: 'Discoveries',
      icon: (
        <svg className="w-7 h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      badge: 3,
      icon: (
        <svg className="w-7 h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: (
        <svg className="w-7 h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: (
        <svg className="w-7 h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-7 h-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-[72px] hover:w-[240px] shrink-0 hidden lg:flex flex-col py-8 px-3 sticky top-0 h-screen bg-[#E8E1D5] border-r border-[#1A1A1A]/10 transition-[width] duration-200 ease-out group/sidebar overflow-hidden">
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-8 h-8 flex items-center justify-center shrink-0 transform -rotate-6">
          <svg className="w-8 h-8 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-bold text-xl text-[#1A1A1A] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap tracking-tight font-serif">Field Notes</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 justify-center">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group/item w-full text-left ${isActive ? 'bg-[#1A1A1A]/5' : 'hover:bg-[#1A1A1A]/5'}`}
            >
              <div className="relative">
                <span className={isActive ? 'text-[#1A1A1A]' : 'text-[#5A564C] group-hover/item:text-[#1A1A1A] transition-colors'}>
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4A1C] rounded-full text-[#F5F2EB] text-[10px] font-bold flex items-center justify-center border-2 border-[#E8E1D5]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`font-semibold text-base opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap ${isActive ? 'text-[#1A1A1A]' : 'text-[#5A564C] group-hover/item:text-[#1A1A1A]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        <button className="mt-4 flex items-center justify-center gap-0 group-hover/sidebar:gap-3 p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 transition-all duration-200 shadow-[2px_4px_0_#FF4A1C] active:shadow-none active:translate-y-1 w-full">
          <svg className="w-5 h-5 text-[#F5F2EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-semibold text-base text-[#F5F2EB] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap overflow-hidden">Log Entry</span>
        </button>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#1A1A1A]/5 cursor-pointer group/item">
          <div className="w-8 h-8 rounded-full bg-[#D4C9B3] border-2 border-white overflow-hidden shrink-0 transform -rotate-3">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(1) contrast(1.25) sepia(0.3)' }}
              alt="Profile"
            />
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            <div className="font-semibold text-sm text-[#1A1A1A]">Elara Vance</div>
            <div className="font-mono text-xs text-[#5A564C]">@fieldnotes_ev</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NotifCard1 = () => (
  <div
    className="bg-[#F5F2EB] border-2 border-[#5A564C]/30 p-5 relative notif-card transform rotate-1"
    style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) rotate(0deg)'; e.currentTarget.style.boxShadow = '8px 12px 25px rgba(26,26,26,0.15)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(1deg)'; e.currentTarget.style.boxShadow = ''; }}
  >
    <div
      className="absolute -top-3 left-6 w-16 h-5 rotate-2 z-30"
      style={{ ...customStyles.tapeStrip, backgroundColor: '#FF4A1C' }}
    />
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-[#FF4A1C]/10 flex items-center justify-center shrink-0 border border-[#FF4A1C]/20 transform -rotate-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF4A1C" stroke="#FF4A1C" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#D4C9B3] border border-[#5A564C] p-0.5 transform rotate-2 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=40&auto=format&fit=crop" className="w-full h-full object-cover" style={{ filter: 'grayscale(1)' }} alt="Arthur" />
            </div>
            <span className="font-bold text-sm">Arthur Pendelton</span>
            <span className="font-mono text-[10px] text-[#5A564C]">@art_botanist</span>
          </div>
          <span className="font-mono text-[10px] text-[#5A564C] bg-[#D4C9B3] px-1.5">12m ago</span>
        </div>
        <p className="text-base text-[#5A564C] leading-tight">
          Favorited your log: <span className="italic font-serif text-[#1A1A1A]">"First frost recorded at the western ridge..."</span>
        </p>
      </div>
    </div>
  </div>
);

const NotifCard2 = ({ onFollowBack }) => {
  const [followed, setFollowed] = useState(false);
  return (
    <div
      className="bg-[#E8E1D5] border-2 border-[#5A564C]/30 p-5 relative notif-card transform -rotate-1"
      style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) rotate(0deg)'; e.currentTarget.style.boxShadow = '8px 12px 25px rgba(26,26,26,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(-1deg)'; e.currentTarget.style.boxShadow = ''; }}
    >
      <div
        className="absolute -top-3 right-8 w-14 h-4 -rotate-3 z-30"
        style={{ ...customStyles.tapeStrip, backgroundColor: '#3A698A' }}
      />
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#3A698A]/10 flex items-center justify-center shrink-0 border border-[#3A698A]/20 transform rotate-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3A698A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#285A35] border border-[#5A564C] p-0.5 transform -rotate-1 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=40&auto=format&fit=crop" className="w-full h-full object-cover" style={{ filter: 'grayscale(1)' }} alt="Dr. Silva" />
              </div>
              <span className="font-bold text-sm">Dr. Silva</span>
              <span className="font-mono text-[10px] text-[#5A564C]">@canopy_research</span>
            </div>
            <span className="font-mono text-[10px] text-[#5A564C] bg-[#D4C9B3] px-1.5">45m ago</span>
          </div>
          <p className="text-base text-[#5A564C]">
            Started following your observations. They have a new fellow researcher!
          </p>
          <button
            onClick={() => setFollowed(!followed)}
            className="mt-3 font-mono text-[10px] bg-[#1A1A1A] text-[#F5F2EB] px-3 py-1 transform hover:scale-105 transition-transform"
          >
            {followed ? 'FOLLOWING' : 'FOLLOW BACK'}
          </button>
        </div>
      </div>
    </div>
  );
};

const NotifCard3 = ({ onViewConversation, onReply }) => (
  <div
    className="bg-[#F5F2EB] border-2 border-[#5A564C]/30 p-5 relative notif-card transform rotate-0 shadow-lg"
    style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) rotate(0deg)'; e.currentTarget.style.boxShadow = '8px 12px 25px rgba(26,26,26,0.15)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(0deg)'; e.currentTarget.style.boxShadow = ''; }}
  >
    <div
      className="absolute"
      style={{
        top: '-16px',
        left: '-16px',
        width: '32px',
        height: '32px',
        zIndex: 20,
        pointerEvents: 'none',
        transform: 'scale(0.75) rotate(12deg)',
      }}
    >
      <svg style={{ width: '100%', height: '100%', stroke: '#FF4A1C', strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
        <use href="#orange-star" />
      </svg>
    </div>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-[#285A35]/10 flex items-center justify-center shrink-0 border border-[#285A35]/20 transform rotate-6">
        <span className="font-mono font-bold text-[#285A35] text-xl">@</span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#D4C9B3] border border-[#5A564C] p-0.5 transform rotate-3 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=40&auto=format&fit=crop" className="w-full h-full object-cover" style={{ filter: 'grayscale(1)' }} alt="Marina" />
            </div>
            <span className="font-bold text-sm">Marina</span>
            <span className="font-mono text-[10px] text-[#5A564C]">@tide_pools</span>
          </div>
          <span className="font-mono text-[10px] text-[#5A564C] bg-[#D4C9B3] px-1.5">2h ago</span>
        </div>
        <div className="bg-[#E8E1D5]/40 p-3 border-l-2 border-[#285A35] font-serif italic text-base leading-relaxed">
          "I think <span className="text-[#FF4A1C] font-bold">@fieldnotes_ev</span> mentioned seeing similar tidal movements last Tuesday. Might be a connection here."
        </div>
        <div className="mt-4 flex gap-4">
          <button onClick={onViewConversation} className="font-mono text-[10px] text-[#3A698A] hover:underline">[ VIEW CONVERSATION ]</button>
          <button onClick={onReply} className="font-mono text-[10px] text-[#5A564C] hover:underline">[ REPLY ]</button>
        </div>
      </div>
    </div>
  </div>
);

const NotifCard4 = () => (
  <div
    className="bg-[#D4C9B3] border-2 border-[#5A564C]/40 p-5 relative notif-card transform rotate-2"
    style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) rotate(0deg)'; e.currentTarget.style.boxShadow = '8px 12px 25px rgba(26,26,26,0.15)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(2deg)'; e.currentTarget.style.boxShadow = ''; }}
  >
    <div
      className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 rotate-1 z-30"
      style={{ ...customStyles.tapeStrip, backgroundColor: '#285A35' }}
    />
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-[#285A35]/10 flex items-center justify-center shrink-0 border border-[#285A35]/20 transform -rotate-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#285A35" strokeWidth="2">
          <path d="M17 2.1l4 4-4 4" />
          <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4" />
          <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#E8E1D5] border border-[#5A564C] p-0.5 transform rotate-1 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=40&auto=format&fit=crop" className="w-full h-full object-cover" style={{ filter: 'grayscale(1)' }} alt="Field Guide" />
            </div>
            <span className="font-bold text-sm">Field Guide Co.</span>
            <span className="font-mono text-[10px] text-[#5A564C]">@fieldguide</span>
          </div>
          <span className="font-mono text-[10px] text-[#5A564C] bg-[#F5F2EB] px-1.5">5h ago</span>
        </div>
        <p className="text-base text-[#5A564C]">
          Reposted your technical drawing of the <span className="italic">Dryopteris filix-mas</span>.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div style={{ ...customStyles.bead, background: '#285A35' }} />
          <span className="font-mono text-[10px] text-[#285A35]">Added to their 'Techniques' collection</span>
        </div>
      </div>
    </div>
  </div>
);

const NotifCard5 = () => (
  <div
    className="bg-[#F5F2EB] border-2 border-[#5A564C]/30 p-5 relative notif-card transform -rotate-1"
    style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) rotate(0deg)'; e.currentTarget.style.boxShadow = '8px 12px 25px rgba(26,26,26,0.15)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(-1deg)'; e.currentTarget.style.boxShadow = ''; }}
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 flex shrink-0 mt-1" style={{ gap: '-16px' }}>
        <div className="w-10 h-10 rounded-full bg-[#D4C9B3] border-2 border-[#F5F2EB] overflow-hidden transform rotate-6 z-20" style={{ marginRight: '-16px' }}>
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=40&auto=format&fit=crop" className="w-full h-full object-cover" style={{ filter: 'grayscale(1)' }} alt="Sarah" />
        </div>
        <div className="w-10 h-10 rounded-full bg-[#E8E1D5] border-2 border-[#F5F2EB] overflow-hidden transform -rotate-3 z-10">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=40&auto=format&fit=crop" className="w-full h-full object-cover" style={{ filter: 'grayscale(1)' }} alt="Arthur" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <span
            className="font-bold text-sm text-[#FF4A1C]"
            style={{ mixBlendMode: 'multiply', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            Recent Activity
          </span>
          <span className="font-mono text-[10px] text-[#5A564C] bg-[#D4C9B3] px-1.5">8h ago</span>
        </div>
        <p className="text-base text-[#5A564C]">
          <span className="font-bold text-[#1A1A1A]">Sarah O.</span> and <span className="font-bold text-[#1A1A1A]">4 others</span> liked your photograph of the evening star.
        </p>
      </div>
    </div>
  </div>
);

const RightSidebar = ({ settings, onToggleSetting, searchValue, onSearchChange }) => (
  <aside className="w-[260px] shrink-0 hidden xl:flex flex-col gap-10 sticky top-12 h-fit py-8">
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search archives..."
        value={searchValue}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full bg-[#E8E1D5] border-0 py-2 px-4 font-mono text-sm focus:outline-none focus:bg-[#F5F2EB] placeholder:text-[#5A564C]/60 rounded-lg"
      />
      <span className="absolute right-3 top-2.5 font-mono text-[#5A564C]">/</span>
    </div>

    <div
      className="relative bg-[#E8E1D5] p-6 transform rotate-1 border border-black/10"
      style={{ position: 'relative' }}
    >
      <div
        className="font-mono text-xs text-[#5A564C] tracking-widest uppercase mb-4 border-b-2 border-[#1A1A1A] pb-2"
      >
        Notification Settings
      </div>
      <div className="flex flex-col gap-3 font-mono text-xs">
        {[
          { key: 'mentions', label: 'Ink Mentions' },
          { key: 'reposts', label: 'Specimen Reposts' },
          { key: 'chatter', label: 'General Chatter' },
        ].map(item => (
          <label
            key={item.key}
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onToggleSetting(item.key)}
          >
            <div className="w-3 h-3 border border-[#1A1A1A] flex items-center justify-center bg-white">
              {settings[item.key] && <div className="w-1.5 h-1.5 bg-[#FF4A1C]" />}
            </div>
            <span className="group-hover:text-[#FF4A1C]">{item.label}</span>
          </label>
        ))}
      </div>
      <div className="absolute bottom-3 right-4 flex gap-1">
        <div style={{ ...customStyles.bead, background: '#285A35' }} />
      </div>
    </div>

    <div className="relative bg-white/40 p-4 transform -rotate-1 border border-[#5A564C]/20">
      <div className="font-mono text-[10px] text-[#5A564C] mb-2">FIELD ADVISORY</div>
      <p className="font-serif text-sm italic leading-snug">
        Expect delays in dispatch logs from the Northern Outpost due to high winds.
      </p>
    </div>

    <footer className="font-mono text-[10px] text-[#5A564C] leading-relaxed mt-auto">
      <p>Terms · Privacy · Archive Access</p>
      <p>© 2024 Field Notes Corp.</p>
    </footer>
  </aside>
);

const ConversationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(26,26,26,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#F5F2EB] border-2 border-[#5A564C]/30 p-8 max-w-md w-full mx-4 transform -rotate-1"
        onClick={e => e.stopPropagation()}
      >
        <div className="font-mono text-xs text-[#5A564C] tracking-widest uppercase mb-4 border-b-2 border-[#1A1A1A] pb-2">
          Conversation Thread
        </div>
        <div className="bg-[#E8E1D5]/40 p-3 border-l-2 border-[#285A35] font-serif italic text-base leading-relaxed mb-4">
          "I think <span className="text-[#FF4A1C] font-bold">@fieldnotes_ev</span> mentioned seeing similar tidal movements last Tuesday. Might be a connection here."
        </div>
        <p className="font-mono text-xs text-[#5A564C]">— @tide_pools, 2h ago</p>
        <button
          onClick={onClose}
          className="mt-6 font-mono text-[10px] bg-[#1A1A1A] text-[#F5F2EB] px-4 py-2 hover:bg-[#1A1A1A]/80 transition-colors"
        >
          [ CLOSE ]
        </button>
      </div>
    </div>
  );
};

const ReplyModal = ({ isOpen, onClose }) => {
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (reply.trim()) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setReply('');
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(26,26,26,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#F5F2EB] border-2 border-[#5A564C]/30 p-8 max-w-md w-full mx-4 transform rotate-1"
        onClick={e => e.stopPropagation()}
      >
        <div className="font-mono text-xs text-[#5A564C] tracking-widest uppercase mb-4 border-b-2 border-[#1A1A1A] pb-2">
          Write Reply
        </div>
        {sent ? (
          <p className="font-serif text-base text-[#285A35] italic">Reply dispatched successfully.</p>
        ) : (
          <>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Your field note reply..."
              className="w-full bg-[#E8E1D5] border-0 py-2 px-4 font-mono text-sm focus:outline-none focus:bg-white/60 placeholder:text-[#5A564C]/60 resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSend}
                className="font-mono text-[10px] bg-[#1A1A1A] text-[#F5F2EB] px-4 py-2 hover:bg-[#1A1A1A]/80 transition-colors"
              >
                [ DISPATCH ]
              </button>
              <button
                onClick={onClose}
                className="font-mono text-[10px] text-[#5A564C] px-4 py-2 hover:underline"
              >
                [ CANCEL ]
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [activeNav, setActiveNav] = useState('notifications');
  const [settings, setSettings] = useState({ mentions: true, reposts: true, chatter: false });
  const [searchValue, setSearchValue] = useState('');
  const [conversationOpen, setConversationOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&family=Shadows+Into+Light&display=swap');
      :root {
        --paper-light: #F5F2EB;
        --paper-mid: #E8E1D5;
        --paper-dark: #D4C9B3;
        --ink-black: #1A1A1A;
        --ink-fade: #5A564C;
        --thread-orange: #FF4A1C;
        --leaf-green: #285A35;
        --bead-blue: #3A698A;
      }
      body {
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }
      ::selection {
        background-color: #FF4A1C;
        color: #F5F2EB;
      }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #F5F2EB; }
      ::-webkit-scrollbar-thumb { background: #D4C9B3; border-radius: 4px; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleToggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Router basename="/">
      <div
        className="font-serif w-full h-full min-h-screen relative"
        style={{
          ...customStyles.body,
          color: '#1A1A1A',
          fontFamily: "'Noto Serif SC', 'Songti SC', STSong, serif",
        }}
      >
        <SVGFilters />
        <NatureCanvas />

        <div className="relative z-10 w-full mx-auto flex min-h-screen">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

          <div className="flex-1 flex justify-center gap-12">
            <main className="min-w-0 flex flex-col gap-6 px-8 py-12 w-full max-w-[800px]">
              <header className="mb-6 flex justify-between items-end">
                <h1
                  className="font-black text-4xl text-[#1A1A1A] transform -rotate-1"
                  style={{ mixBlendMode: 'multiply', textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  Correspondence &amp; Records
                </h1>
                <div className="font-mono text-xs text-[#5A564C] border-b border-dashed border-[#5A564C] pb-1">PAGE 4 / VOL III</div>
              </header>

              <div className="flex flex-col gap-8">
                <NotifCard1 />
                <NotifCard2 />
                <NotifCard3
                  onViewConversation={() => setConversationOpen(true)}
                  onReply={() => setReplyOpen(true)}
                />
                <NotifCard4 />
                <NotifCard5 />
              </div>

              <div className="text-center font-mono text-sm text-[#5A564C] py-12 border-t border-dashed border-[#5A564C] mt-10">
                --- NO MORE CORRESPONDENCE ---
              </div>
            </main>

            <RightSidebar
              settings={settings}
              onToggleSetting={handleToggleSetting}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
            />
          </div>
        </div>

        <div className="fixed bottom-8 right-8 flex gap-2 rotate-45 pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-[#3A698A] shadow-md" />
          <div className="w-3 h-3 rounded-full bg-[#285A35] shadow-md" />
          <div className="w-3 h-3 rounded-full bg-[#FF4A1C] shadow-md" />
        </div>

        <ConversationModal isOpen={conversationOpen} onClose={() => setConversationOpen(false)} />
        <ReplyModal isOpen={replyOpen} onClose={() => setReplyOpen(false)} />
      </div>
    </Router>
  );
};

export default App;