import React, { useState, useEffect, useRef } from 'react';

const customStyles = {
  body: {
    backgroundColor: '#D4C9B3',
    backgroundImage: `
      linear-gradient(rgba(26, 26, 26, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26, 26, 26, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  tapeStrip: {
    backgroundColor: '#FF4A1C',
    opacity: 0.85,
    mixBlendMode: 'multiply',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  stampText: {
    mixBlendMode: 'multiply',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  newEntryButton: {
    boxShadow: '2px 4px 0 #FF4A1C',
  },
};

const NatureCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animId;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() { this.reset(); this.y = Math.random() * height; }
      reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 0.5 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.life = Math.random();
        this.type = Math.random() > 0.8 ? 'thread' : 'seed';
        this.angle = Math.random() * Math.PI * 2;
        this.color = ['rgba(40, 90, 53, 0.2)', 'rgba(58, 105, 138, 0.2)', 'rgba(255, 74, 28, 0.1)'][Math.floor(Math.random() * 3)];
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.life += 0.005;
        if (this.y < -30) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < 30; i++) particles.push(new Particle());

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-40"
    />
  );
};

const SVGDefs = () => (
  <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
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

const Sidebar = () => {
  const [activeNav, setActiveNav] = useState('discoveries');

  const navItems = [
    {
      id: 'timeline',
      label: 'Timeline',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      ),
    },
    {
      id: 'discoveries',
      label: 'Discoveries',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      ),
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      ),
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 w-full text-left ${activeNav === item.id ? 'bg-[#1A1A1A]/5' : 'hover:bg-[#1A1A1A]/5'}`}
          >
            {item.id === 'notifications' ? (
              <div className="relative">
                <svg className="w-7 h-7 text-[#5A564C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4A1C] rounded-full text-[#F5F2EB] text-[10px] font-bold flex items-center justify-center border-2 border-[#E8E1D5]">3</span>
              </div>
            ) : (
              <svg className={`w-7 h-7 ${activeNav === item.id ? 'text-[#1A1A1A]' : 'text-[#5A564C]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
            )}
            <span className={`font-semibold text-base opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 ${activeNav === item.id ? 'text-[#1A1A1A]' : 'text-[#5A564C]'}`}>
              {item.label}
            </span>
          </button>
        ))}

        {/* Notifications separately for badge */}
        <button
          onClick={() => setActiveNav('notifications')}
          className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 w-full text-left ${activeNav === 'notifications' ? 'bg-[#1A1A1A]/5' : 'hover:bg-[#1A1A1A]/5'}`}
        >
          <div className="relative">
            <svg className={`w-7 h-7 ${activeNav === 'notifications' ? 'text-[#1A1A1A]' : 'text-[#5A564C]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4A1C] rounded-full text-[#F5F2EB] text-[10px] font-bold flex items-center justify-center border-2 border-[#E8E1D5]">3</span>
          </div>
          <span className={`font-semibold text-base opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 ${activeNav === 'notifications' ? 'text-[#1A1A1A]' : 'text-[#5A564C]'}`}>
            Notifications
          </span>
        </button>

        <button
          className="mt-4 flex items-center justify-center gap-0 group-hover/sidebar:gap-3 p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 transition-all duration-200 w-full"
          style={customStyles.newEntryButton}
        >
          <svg className="w-5 h-5 text-[#F5F2EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-semibold text-base text-[#F5F2EB] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap max-w-0 group-hover/sidebar:max-w-full overflow-hidden">Log Entry</span>
        </button>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#1A1A1A]/5 transition-all duration-200 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#D4C9B3] border-2 border-white overflow-hidden transform -rotate-3" style={{ filter: 'url(#torn-paper)' }}>
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(100%) contrast(1.25) sepia(30%)' }}
              alt="profile"
            />
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150">
            <div className="font-semibold text-sm text-[#1A1A1A]">Elara Vance</div>
            <div className="font-mono text-xs text-[#5A564C]">@fieldnotes_ev</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const UserCard = ({ bg, rotate, headerImg, avatarBg, avatarImg, name, handle, bio, logs, observers, following, hasStar }) => (
  <article
    className={`${bg} border border-[#5A564C]/30 overflow-hidden shadow-md cursor-pointer relative group`}
    style={{
      filter: 'url(#torn-paper)',
      transform: `rotate(${rotate}deg)`,
      transition: 'transform 0.2s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = `rotate(${rotate}deg) scale(1.02)`}
    onMouseLeave={e => e.currentTarget.style.transform = `rotate(${rotate}deg) scale(1)`}
  >
    <div className="h-24 bg-[#5A564C]/10 relative overflow-hidden">
      <img
        src={headerImg}
        className="w-full h-full object-cover"
        style={{ filter: 'grayscale(100%) contrast(1.25) sepia(30%)' }}
        alt="header"
      />
    </div>
    <div className="p-5 pt-0 relative">
      <div
        className="w-16 h-16 rounded-full border-4 overflow-hidden absolute -top-8 left-5 shadow-md"
        style={{ borderColor: avatarBg, filter: 'url(#torn-paper)' }}
      >
        <img
          src={avatarImg}
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(100%) contrast(1.25) sepia(30%)' }}
          alt={name}
        />
      </div>
      <div className="pt-10">
        <h3 className="font-bold text-lg leading-tight text-[#1A1A1A]" style={customStyles.stampText}>{name}</h3>
        <p className="font-mono text-xs text-[#5A564C] mb-3">{handle}</p>
        <p className="font-serif text-sm text-[#1A1A1A] leading-relaxed mb-4">{bio}</p>
        <div className="flex items-center gap-6 border-t border-dashed border-[#5A564C]/30 pt-3">
          <div className="text-center">
            <div className="font-bold text-base text-[#1A1A1A]">{logs}</div>
            <div className="font-mono text-[10px] text-[#5A564C] uppercase">Logs</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-base text-[#1A1A1A]">{observers}</div>
            <div className="font-mono text-[10px] text-[#5A564C] uppercase">Observers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-base text-[#1A1A1A]">{following}</div>
            <div className="font-mono text-[10px] text-[#5A564C] uppercase">Following</div>
          </div>
        </div>
      </div>
    </div>
    {hasStar && (
      <div className="absolute -bottom-3 -right-3 transform scale-75 w-8 h-8 z-20 pointer-events-none">
        <svg width="100%" height="100%" stroke="#FF4A1C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <use href="#orange-star" />
        </svg>
      </div>
    )}
  </article>
);

const RightSidebar = () => (
  <aside className="w-[260px] shrink-0 hidden xl:flex flex-col gap-10 sticky top-12 h-fit py-8">
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search archives..."
        className="w-full bg-[#E8E1D5] border-0 py-2 px-4 font-mono text-sm focus:outline-none focus:bg-[#F5F2EB] placeholder:text-[#5A564C]/60 rounded-lg"
      />
      <span className="absolute right-3 top-2.5 font-mono text-[#5A564C]">/</span>
    </div>

    <div className="relative">
      <div
        className="font-bold text-lg mb-6 inline-block bg-[#1A1A1A] text-[#F5F2EB] px-4 py-1 transform -rotate-1"
        style={customStyles.stampText}
      >
        Current Trends
      </div>
      <div className="flex flex-col">
        <div
          className="bg-[#F5F2EB] p-3 -mb-2 relative border border-black/10 flex items-center gap-3 z-30 transform -rotate-1"
          style={{ filter: 'url(#torn-paper)' }}
        >
          <span className="font-mono text-xs text-[#5A564C] border-r border-[#5A564C]/30 pr-2">01</span>
          <div className="flex-grow">
            <div className="font-bold text-base leading-none text-[#1A1A1A]">#SpringMigration</div>
            <div className="font-mono text-[10px] text-[#5A564C] mt-1">12.5K Observations</div>
          </div>
        </div>
        <div
          className="bg-[#E8E1D5] p-3 -mb-2 relative border border-black/10 flex items-center gap-3 z-20 transform rotate-1 translate-x-2"
          style={{ filter: 'url(#torn-paper)' }}
        >
          <span className="font-mono text-xs text-[#5A564C] border-r border-[#5A564C]/30 pr-2">02</span>
          <div className="flex-grow">
            <div className="font-bold text-base leading-none text-[#1A1A1A]">Lunar Eclipse</div>
            <div className="font-mono text-[10px] text-[#5A564C] mt-1">Astrology / 8,402 Logs</div>
          </div>
        </div>
        <div
          className="bg-[#F5F2EB] p-3 relative border border-black/10 flex items-center gap-3 z-10 transform -rotate-2"
          style={{ filter: 'url(#torn-paper)' }}
        >
          <span className="font-mono text-xs text-[#5A564C] border-r border-[#5A564C]/30 pr-2">03</span>
          <div className="flex-grow">
            <div className="font-bold text-base leading-none text-[#1A1A1A]">Monarchs</div>
            <div className="font-mono text-[10px] text-[#5A564C] mt-1">Entomology / 5,100 Logs</div>
          </div>
        </div>
      </div>
    </div>

    <div
      className="relative bg-[#E8E1D5] p-6 transform rotate-1 border border-black/10"
      style={{ filter: 'url(#torn-paper)' }}
    >
      <div className="font-mono text-xs text-[#5A564C] tracking-widest uppercase mb-4 border-b-2 border-[#1A1A1A] pb-2">
        Fellow Observers
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-4 border-b border-dashed border-[#5A564C]/30">
          <div
            className="w-9 h-9 bg-[#D4C9B3] border-2 border-[#5A564C] flex items-center justify-center font-serif font-bold text-sm text-[#1A1A1A] transform -rotate-2"
            style={{ filter: 'url(#torn-paper)' }}
          >SO</div>
          <div className="flex-grow leading-tight">
            <div className="font-bold text-sm">Sarah O.</div>
            <div className="font-mono text-[10px] text-[#5A564C]">@sarah_owls</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 bg-[#285A35] border-2 border-[#5A564C] flex items-center justify-center font-serif font-bold text-sm text-[#F5F2EB] transform rotate-1"
            style={{ filter: 'url(#torn-paper)' }}
          >JP</div>
          <div className="flex-grow leading-tight">
            <div className="font-bold text-sm">James P.</div>
            <div className="font-mono text-[10px] text-[#5A564C]">@pines_birder</div>
          </div>
        </div>
      </div>
    </div>

    <footer className="font-mono text-[10px] text-[#5A564C] leading-relaxed mt-auto">
      <p>Terms of Service · Privacy Policy</p>
      <p>© 2024 Field Notes Corp.</p>
    </footer>
  </aside>
);

const SearchSection = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
  const tabs = ['Observations', 'Users', 'Tags', 'Locations'];

  return (
    <div
      className="relative bg-white p-6 border border-[#1A1A1A]/5 shadow-xl"
      style={{ filter: 'url(#torn-paper-heavy)', transform: 'rotate(-0.5deg)' }}
    >
      <div
        className="absolute -top-3 left-10 w-24 h-5 rotate-2 z-20"
        style={customStyles.tapeStrip}
      />
      <div className="flex flex-col gap-6">
        <div className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="SEARCH DISCOVERIES [TAXONOMY, HABITAT, OBSERVER]..."
            className="w-full bg-[#F5F2EB] border-2 border-[#5A564C]/20 py-4 px-12 font-mono text-lg focus:outline-none focus:border-[#FF4A1C] transition-colors"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#5A564C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-8 font-mono text-xs text-[#5A564C] border-b border-dashed border-[#5A564C]/30 pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1 hover:text-[#1A1A1A] transition-colors uppercase tracking-widest ${activeTab === tab ? 'border-b-2 border-[#FF4A1C] text-[#1A1A1A]' : ''}`}
            >
              {tab}
            </button>
          ))}
          <button className="pb-1 hover:text-[#1A1A1A] transition-colors uppercase tracking-widest ml-auto">[ FILTERS ]</button>
        </div>
      </div>
    </div>
  );
};

const users = [
  {
    bg: 'bg-[#F5F2EB]',
    rotate: 1,
    headerImg: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=400&auto=format&fit=crop',
    avatarBg: '#F5F2EB',
    avatarImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
    name: 'Sarah O.',
    handle: '@sarah_owls',
    bio: 'Ornithologist documenting owl populations across the Pacific Northwest. Night walks & field recordings.',
    logs: '847',
    observers: '12.3K',
    following: '892',
    hasStar: false,
  },
  {
    bg: 'bg-[#E8E1D5]',
    rotate: -1,
    headerImg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop',
    avatarBg: '#E8E1D5',
    avatarImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    name: 'James P.',
    handle: '@pines_birder',
    bio: 'Forest ecologist specializing in old-growth canopy species. Seeking the unseen.',
    logs: '1.2K',
    observers: '8.7K',
    following: '543',
    hasStar: false,
  },
  {
    bg: 'bg-white',
    rotate: 0.5,
    headerImg: 'https://images.unsplash.com/photo-1518173946687-a4c036bc0d99?q=80&w=400&auto=format&fit=crop',
    avatarBg: 'white',
    avatarImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    name: 'Marina T.',
    handle: '@marina_tides',
    bio: 'Marine biologist and tidal researcher. Documenting intertidal ecosystems and coastal phenomena.',
    logs: '634',
    observers: '5.2K',
    following: '1.1K',
    hasStar: true,
  },
  {
    bg: 'bg-[#F5F2EB]',
    rotate: -1.5,
    headerImg: 'https://images.unsplash.com/photo-1511497584788-89676077a667?q=80&w=400&auto=format&fit=crop',
    avatarBg: '#F5F2EB',
    avatarImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    name: 'Arthur Pendleton',
    handle: '@fungi_father',
    bio: "Mycologist and amateur forager. Tracking mushroom seasons across temperate zones since '89.",
    logs: '2.1K',
    observers: '15.6K',
    following: '234',
    hasStar: false,
  },
];

const tags = ['#Ornithology', '#Mycology', '#MarineBio', '#ForestEcology'];

const App = () => {
  const [activeTab, setActiveTab] = useState('Users');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&family=Shadows+Into+Light&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const filteredUsers = users.filter(u =>
    searchQuery === '' ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        ...customStyles.body,
        fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', serif",
        WebkitFontSmoothing: 'antialiased',
        overflowX: 'hidden',
        minHeight: '100vh',
        color: '#1A1A1A',
      }}
    >
      <SVGDefs />
      <NatureCanvas />

      <div className="relative z-10 w-full mx-auto flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex justify-center gap-12 px-8">
          <main className="w-full max-w-[900px] flex flex-col gap-8 py-12">
            <SearchSection
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <div className="flex flex-wrap gap-3">
              <span className="font-mono text-[10px] text-[#5A564C] w-full uppercase tracking-widest mb-1">Recommended:</span>
              {tags.map(tag => (
                <button
                  key={tag}
                  className="bg-[#E8E1D5]/50 border border-[#5A564C]/20 px-3 py-1 text-sm font-serif italic hover:bg-[#F5F2EB] transition-colors"
                  style={{ filter: 'url(#torn-paper)' }}
                  onClick={() => setSearchQuery(tag.replace('#', ''))}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredUsers.map((user, idx) => (
                <UserCard key={idx} {...user} />
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center font-mono text-sm text-[#5A564C] py-8 border border-dashed border-[#5A564C]/30 bg-[#F5F2EB]/50">
                --- NO RESULTS FOUND ---
              </div>
            )}

            <div className="text-center font-mono text-sm text-[#5A564C] py-8 border-t border-dashed border-[#5A564C]">
              --- END OF ARCHIVE RESULTS ---
            </div>
          </main>

          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default App;