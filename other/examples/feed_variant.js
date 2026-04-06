import React, { useState, useEffect, useRef } from 'react';

const customStyles = {
  body: {
    backgroundColor: '#D4C9B3',
    backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 26, 26, 0.05) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
  },
  linedPaper: {
    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(90, 86, 76, 0.2) 28px)',
    lineHeight: '28px',
  },
  verticalThread: {
    position: 'absolute',
    left: '24px',
    top: 0,
    bottom: 0,
    width: '2px',
    background: 'repeating-linear-gradient(to bottom, #3A698A 0, #3A698A 10px, transparent 10px, transparent 20px)',
    opacity: 0.5,
  },
  tapeStrip: {
    opacity: 0.85,
    mixBlendMode: 'multiply',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
};

const ReplyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const RepostIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 2.1l4 4-4 4" />
    <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4" />
    <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2" />
  </svg>
);

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ActionButtons = ({ replies, reposts, likes }) => {
  const [reposted, setReposted] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <button
        className="text-[#3A698A] hover:bg-[#3A698A] hover:text-[#F5F2EB] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200"
        title="Reply"
        style={{ transition: 'all 0.2s ease' }}
      >
        <ReplyIcon />
        <span className="font-mono text-sm">{replies}</span>
      </button>
      <button
        onClick={() => setReposted(!reposted)}
        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${reposted ? 'bg-[#285A35] text-[#F5F2EB]' : 'text-[#285A35] hover:bg-[#285A35] hover:text-[#F5F2EB]'}`}
        title="Repost"
      >
        <RepostIcon />
        <span className="font-mono text-sm">{reposts}</span>
      </button>
      <button
        onClick={() => setLiked(!liked)}
        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${liked ? 'bg-[#FF4A1C] text-[#F5F2EB]' : 'text-[#FF4A1C] hover:bg-[#FF4A1C] hover:text-[#F5F2EB]'}`}
        title="Favorite"
      >
        <HeartIcon />
        <span className="font-mono text-sm">{likes}</span>
      </button>
    </div>
  );
};

const ActionButtonsLeft = ({ replies, reposts, likes }) => {
  const [reposted, setReposted] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex justify-start gap-8 items-center mt-4">
      <button
        className="text-[#3A698A] hover:bg-[#3A698A] hover:text-[#F5F2EB] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200"
        title="Reply"
      >
        <ReplyIcon />
        <span className="font-mono text-sm">{replies}</span>
      </button>
      <button
        onClick={() => setReposted(!reposted)}
        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${reposted ? 'bg-[#285A35] text-[#F5F2EB]' : 'text-[#285A35] hover:bg-[#285A35] hover:text-[#F5F2EB]'}`}
        title="Repost"
      >
        <RepostIcon />
        <span className="font-mono text-sm">{reposts}</span>
      </button>
      <button
        onClick={() => setLiked(!liked)}
        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${liked ? 'bg-[#FF4A1C] text-[#F5F2EB]' : 'text-[#FF4A1C] hover:bg-[#FF4A1C] hover:text-[#F5F2EB]'}`}
        title="Favorite"
      >
        <HeartIcon />
        <span className="font-mono text-sm">{likes}</span>
      </button>
    </div>
  );
};

const OrangeStar = () => (
  <svg viewBox="0 0 50 50" style={{ width: '100%', height: '100%', stroke: '#FF4A1C', strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
    <polygon points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20" />
    <line x1="15" y1="15" x2="35" y2="35" />
    <line x1="15" y1="35" x2="35" y2="15" />
  </svg>
);

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [logEntryOpen, setLogEntryOpen] = useState(false);

  return (
    <aside
      className="shrink-0 hidden lg:flex flex-col py-8 px-3 sticky top-0 h-screen bg-[#E8E1D5] border-r border-black/10 overflow-hidden"
      style={{
        width: sidebarOpen ? '240px' : '72px',
        transition: 'width 0.2s ease-out',
      }}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-8 h-8 flex items-center justify-center shrink-0 transform -rotate-6">
          <svg className="w-8 h-8 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span
          className="font-bold text-xl text-[#1A1A1A] whitespace-nowrap tracking-tight"
          style={{ fontFamily: 'Noto Serif SC, serif', opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.15s' }}
        >
          Field Notes
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 justify-center">
        <a href="#" className="flex items-center gap-4 p-3 rounded-xl bg-black/5 hover:bg-black/10 transition-all duration-200">
          <svg className="w-7 h-7 text-[#1A1A1A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-semibold text-base text-[#1A1A1A] whitespace-nowrap" style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.15s' }}>Timeline</span>
        </a>
        <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 transition-all duration-200">
          <svg className="w-7 h-7 text-[#5A564C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="font-semibold text-base text-[#5A564C] whitespace-nowrap" style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.15s' }}>Discoveries</span>
        </a>
        <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 transition-all duration-200 relative">
          <div className="relative">
            <svg className="w-7 h-7 text-[#5A564C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4A1C] rounded-full text-[#F5F2EB] text-[10px] font-bold flex items-center justify-center border-2 border-[#E8E1D5]">3</span>
          </div>
          <span className="font-semibold text-base text-[#5A564C] whitespace-nowrap" style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.15s' }}>Notifications</span>
        </a>
        <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 transition-all duration-200">
          <svg className="w-7 h-7 text-[#5A564C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-semibold text-base text-[#5A564C] whitespace-nowrap" style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.15s' }}>Messages</span>
        </a>
        <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 transition-all duration-200">
          <svg className="w-7 h-7 text-[#5A564C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span className="font-semibold text-base text-[#5A564C] whitespace-nowrap" style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.15s' }}>Bookmarks</span>
        </a>
        <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 transition-all duration-200">
          <svg className="w-7 h-7 text-[#5A564C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-semibold text-base text-[#5A564C] whitespace-nowrap" style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.15s' }}>Profile</span>
        </a>

        <button
          onClick={() => setLogEntryOpen(true)}
          className="mt-4 flex items-center p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 transition-all duration-200 transform rotate-1 hover:-rotate-1 w-full active:translate-y-1"
          style={{ boxShadow: '2px 4px 0 #FF4A1C', gap: sidebarOpen ? '12px' : '0', justifyContent: 'center' }}
        >
          <svg className="w-5 h-5 text-[#F5F2EB] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-semibold text-base text-[#F5F2EB] whitespace-nowrap overflow-hidden" style={{ opacity: sidebarOpen ? 1 : 0, maxWidth: sidebarOpen ? '100%' : '0', transition: 'opacity 0.15s' }}>Log Entry</span>
        </button>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-black/5 transition-all duration-200 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#D4C9B3] border-2 border-white overflow-hidden shrink-0 transform -rotate-3">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" style={{ filter: 'grayscale(100%) contrast(1.25) sepia(0.3)' }} alt="Elara Vance" />
          </div>
          <div style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.15s' }} className="whitespace-nowrap">
            <div className="font-semibold text-sm text-[#1A1A1A]">Elara Vance</div>
            <div className="font-mono text-xs text-[#5A564C]">@fieldnotes_ev</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NewLogEntry = () => {
  const [text, setText] = useState('');

  return (
    <div className="bg-white p-6 pb-12 transform rotate-1 border-2 border-white/20 relative mt-4" style={{ boxShadow: '8px 12px 30px rgba(26,26,26,0.12)' }}>
      <div className="absolute -top-3 left-8 w-24 h-6 rotate-1 z-30" style={{ backgroundColor: '#FF4A1C', ...customStyles.tapeStrip }}></div>
      <div style={customStyles.verticalThread}></div>
      <div className="pl-10">
        <div className="font-mono text-xs text-[#5A564C] mb-4 border-b border-dashed border-[#5A564C]/30 pb-2 flex justify-between">
          <span>NEW LOG [ENTRY: PENDING]</span>
          <span>DATE: --/--/----</span>
        </div>
        <textarea
          className="w-full bg-transparent resize-none focus:outline-none text-lg min-h-[120px] text-[#1A1A1A]"
          placeholder="What have you observed today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ ...customStyles.linedPaper, fontFamily: 'Noto Serif SC, serif' }}
        />
        <div className="absolute bottom-4 right-6 flex items-center gap-6">
          <button className="font-mono text-xs text-[#5A564C] hover:text-[#1A1A1A] transition-colors">[ ADD SKETCH ]</button>
          <button className="font-mono font-bold text-sm text-[#FF4A1C] border border-[#FF4A1C] px-4 py-1 transform -rotate-2 hover:bg-[#FF4A1C] hover:text-[#F5F2EB] transition-all">
            RECORD -&gt;
          </button>
        </div>
      </div>
    </div>
  );
};

const Article1 = () => (
  <article className="bg-[#F5F2EB] border-2 border-[#5A564C]/30 p-6 relative group" style={{ boxShadow: '6px 8px 25px rgba(26,26,26,0.1)' }}>
    <div className="absolute -top-3 left-6 w-20 h-5 rotate-2 z-30" style={{ backgroundColor: '#285A35', ...customStyles.tapeStrip }}></div>
    <div className="flex justify-between items-baseline border-b border-dashed border-[#5A564C]/40 pb-2 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#D4C9B3] overflow-hidden border border-[#5A564C] p-0.5 transform -rotate-2">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="Arthur Pendelton" className="w-full h-full object-cover" style={{ filter: 'grayscale(100%) contrast(1.25) sepia(0.3)' }} />
        </div>
        <span className="font-bold text-lg uppercase tracking-wide text-[#1A1A1A]">Arthur Pendelton</span>
        <span className="font-mono text-xs text-[#5A564C]">@art_botanist</span>
      </div>
      <span className="font-mono text-xs text-[#5A564C] bg-[#D4C9B3] px-2 py-0.5 transform rotate-2">2h ago</span>
    </div>
    <div className="text-lg leading-relaxed mb-6 text-justify">
      <p style={{ fontFamily: 'Noto Serif SC, serif' }}>
        <span className="text-4xl font-black text-[#FF4A1C] float-left mr-2 leading-none">S</span>
        potted a remarkable specimen of <i>Amanita muscaria</i> near the old oak roots. The vibrant red cap was almost glowing in the overcast morning light. The damp soil indicates optimal conditions for further fungal blooms this week.
      </p>
    </div>
    <div className="bg-white p-2 pb-8 transform -rotate-2 shadow-lg relative w-[90%] mx-auto mb-6" style={{ cursor: 'default' }}>
      <img src="https://images.unsplash.com/photo-1515446134809-993c501ca304?q=80&w=800&auto=format&fit=crop" alt="Mushroom observation" className="w-full h-64 object-cover border border-[#5A564C]/20" style={{ filter: 'grayscale(100%) contrast(1.2) sepia(0.3)', mixBlendMode: 'multiply' }} />
      <div className="absolute bottom-2 right-3 font-mono text-[10px] text-[#5A564C]">FILM ROLL 42 - EXP 12</div>
      <div className="absolute -top-4 -left-4 transform scale-75 rotate-12 w-8 h-8 pointer-events-none">
        <OrangeStar />
      </div>
    </div>
    <div className="pt-4 border-t border-[#5A564C]/20">
      <ActionButtons replies="12" reposts="5" likes="128" />
    </div>
  </article>
);

const Article2 = () => (
  <article className="bg-[#E8E1D5] p-6 pb-10 relative transform -rotate-1" style={{ boxShadow: '6px 10px 28px rgba(26,26,26,0.12)' }}>
    <div className="absolute -top-3 right-8 w-16 h-5 -rotate-2 z-30" style={{ backgroundColor: '#FF4A1C', ...customStyles.tapeStrip }}></div>
    <div className="absolute left-10 top-full h-12 w-0.5 border-l border-dashed border-[#5A564C] z-0"></div>
    <div className="flex justify-between items-baseline border-b border-[#5A564C] pb-2 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#285A35] overflow-hidden border border-[#5A564C] p-0.5 transform rotate-1">
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" alt="Dr. Silva" className="w-full h-full object-cover" style={{ filter: 'grayscale(100%) contrast(1.25) sepia(0.3)' }} />
        </div>
        <span className="font-bold text-lg uppercase tracking-wide text-[#1A1A1A]">Dr. Silva</span>
        <span className="font-mono text-xs text-[#5A564C]">@canopy_research</span>
      </div>
      <span className="font-mono text-xs text-[#5A564C]">5h ago</span>
    </div>
    <div className="text-lg leading-relaxed mb-4" style={{ fontFamily: 'Noto Serif SC, serif' }}>
      <p>We need to talk about the migration patterns we're seeing this season. The data from the coastal tracking stations is showing anomalies that haven't been recorded since the late 90s.</p>
      <p className="mt-4">Thread / 1</p>
    </div>
    <div className="font-mono text-xs mt-6">
      <ActionButtons replies="45" reposts="312" likes="1.2K" />
    </div>
    <div className="absolute bottom-3 right-4 flex gap-1">
      <div className="w-[5px] h-[5px] rounded-full shadow-sm" style={{ backgroundColor: '#285A35' }}></div>
      <div className="w-[5px] h-[5px] rounded-full shadow-sm" style={{ backgroundColor: '#285A35' }}></div>
    </div>
  </article>
);

const Article3 = () => (
  <article className="bg-[#F5F2EB] p-6 relative transform rotate-1 ml-4 border-l-4 border-[#3A698A]" style={{ boxShadow: '5px 8px 22px rgba(26,26,26,0.1)' }}>
    <div className="absolute -top-3 left-1/2 w-16 h-5 -rotate-1 z-30" style={{ backgroundColor: '#3A698A', ...customStyles.tapeStrip }}></div>
    <div className="absolute -left-5 top-8 w-2 h-2 rounded-full bg-[#5A564C]"></div>
    <div className="flex justify-between items-baseline mb-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#285A35] overflow-hidden border border-[#5A564C] p-0.5 transform rotate-1">
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" alt="Dr. Silva" className="w-full h-full object-cover" style={{ filter: 'grayscale(100%) contrast(1.25) sepia(0.3)' }} />
        </div>
        <span className="font-bold uppercase tracking-wide text-[#1A1A1A]">Dr. Silva</span>
      </div>
      <span className="font-mono text-[10px] text-[#5A564C]">5h ago</span>
    </div>
    <div className="text-base leading-relaxed mb-4 text-[#5A564C]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
      <p>Historically, the northern passage is clear by mid-April. We are seeing flocks lingering in the southern marshlands well into May. Temperature variations in the nesting grounds might be the primary deterrent.</p>
    </div>
    <div className="bg-[#D4C9B3] p-3 my-4 font-mono text-xs transform -rotate-1 border border-[#1A1A1A]/20">
      <div className="border-b border-dashed border-[#5A564C] pb-1 mb-1 text-[#FF4A1C]">DATA EXCERPT_</div>
      <div>STATION A: +2.4°C dev</div>
      <div>STATION B: +1.8°C dev</div>
      <div>MARSH H2O: -0.5°C dev</div>
    </div>
    <ActionButtonsLeft replies="2" reposts="14" likes="89" />
  </article>
);

const Article4 = () => (
  <article className="bg-[#D4C9B3] border-2 border-[#5A564C]/40 p-6 relative transform -rotate-1" style={{ boxShadow: '6px 10px 30px rgba(26,26,26,0.18)' }}>
    <div className="absolute -top-3 left-4 w-20 h-5 rotate-3 z-30" style={{ backgroundColor: '#FF4A1C', ...customStyles.tapeStrip }}></div>
    <div className="absolute top-2 right-6 transform scale-50 rotate-90 w-8 h-8 pointer-events-none">
      <OrangeStar />
    </div>
    <div className="flex justify-between items-baseline border-b border-dashed border-[#1A1A1A]/20 pb-2 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#3A698A] overflow-hidden border border-[#5A564C] p-0.5 transform -rotate-1">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Marina" className="w-full h-full object-cover" style={{ filter: 'grayscale(100%) contrast(1.25) sepia(0.3)' }} />
        </div>
        <span className="font-bold text-lg uppercase tracking-wide text-[#1A1A1A]">Marina</span>
        <span className="font-mono text-xs text-[#5A564C]">@tide_pools</span>
      </div>
      <span className="font-mono text-xs text-[#5A564C]">8h ago</span>
    </div>
    <div className="text-2xl font-bold italic text-center py-8 px-4 leading-snug opacity-90" style={{ fontFamily: 'Noto Serif SC, serif' }}>
      "The ocean was like glass this morning. Not a single ripple, just the slow breathing of the tide."
    </div>
    <div className="mt-2 border-t border-[#1A1A1A]/10 pt-4">
      <ActionButtons replies="5" reposts="12" likes="304" />
    </div>
  </article>
);

const Article5 = () => (
  <article className="bg-[#E8E1D5] border-2 border-[#5A564C]/30 p-6 relative group" style={{ boxShadow: '6px 8px 25px rgba(26,26,26,0.12)' }}>
    <div className="absolute -top-3 right-12 w-24 h-6 -rotate-2 z-30" style={{ backgroundColor: '#285A35', ...customStyles.tapeStrip }}></div>
    <div className="flex justify-between items-baseline border-b border-dashed border-[#5A564C]/40 pb-2 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#D4C9B3] overflow-hidden border border-[#5A564C] p-0.5 transform rotate-2">
          <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=100&auto=format&fit=crop" alt="Field Guide Co." className="w-full h-full object-cover" style={{ filter: 'grayscale(100%) contrast(1.25) sepia(0.3)' }} />
        </div>
        <span className="font-bold text-lg uppercase tracking-wide text-[#1A1A1A]">Field Guide Co.</span>
        <span className="font-mono text-xs text-[#5A564C]">@fieldguide</span>
      </div>
      <span className="font-mono text-xs text-[#5A564C]">12h ago</span>
    </div>
    <div className="text-lg leading-relaxed mb-4" style={{ fontFamily: 'Noto Serif SC, serif' }}>
      <p>New tutorial up: "Binding your own weatherproof field journal using traditional stitch methods." Essential for upcoming rainy season expeditions.</p>
    </div>
    <a href="#" className="block bg-[#E8E1D5] border border-[#1A1A1A] p-4 transform rotate-1 hover:rotate-0 transition-transform cursor-pointer relative hover:bg-[#D4C9B3]">
      <div className="border-2 border-dashed border-[#5A564C] h-40 flex items-center justify-center mb-3 bg-[#F5F2EB]">
        <span className="font-mono text-[#5A564C] tracking-widest">[ PLAY INSTRUCTIONAL RECORDING ]</span>
      </div>
      <h3 className="font-bold text-lg leading-tight" style={{ fontFamily: 'Noto Serif SC, serif' }}>Bookbinding Techniques Vol. 4</h3>
      <p className="font-mono text-xs text-[#5A564C] mt-1">external link / fieldguide.co</p>
      <div className="absolute top-2 right-2 flex gap-0.5">
        <div className="w-1 h-3 bg-[#FF4A1C] transform rotate-45"></div>
        <div className="w-1 h-3 bg-[#FF4A1C] transform -rotate-45"></div>
      </div>
    </a>
    <div className="mt-6">
      <ActionButtons replies="22" reposts="89" likes="512" />
    </div>
  </article>
);

const RightSidebar = () => {
  const [searchVal, setSearchVal] = useState('');

  return (
    <aside className="w-[260px] shrink-0 hidden xl:flex flex-col gap-10 sticky top-12 h-fit py-8">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search archives..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full bg-[#E8E1D5] border-0 py-2 px-4 font-mono text-sm focus:outline-none focus:bg-[#F5F2EB] rounded-lg text-[#1A1A1A]"
          style={{ fontFamily: 'Courier Prime, monospace' }}
        />
        <span className="absolute right-3 top-2.5 font-mono text-[#5A564C]">/</span>
      </div>

      <div className="relative">
        <div className="font-bold text-lg mb-6 inline-block bg-[#1A1A1A] text-[#F5F2EB] px-4 py-1 transform -rotate-1 uppercase tracking-wide">
          Current Trends
        </div>
        <div className="flex flex-col">
          <div className="bg-[#F5F2EB] p-3 -mb-2 relative border border-black/10 flex items-center gap-3 transform -rotate-1 z-30">
            <span className="font-mono text-xs text-[#5A564C] border-r border-[#5A564C]/30 pr-2">01</span>
            <div className="flex-grow">
              <div className="font-bold text-base leading-none text-[#1A1A1A]">#SpringMigration</div>
              <div className="font-mono text-[10px] text-[#5A564C] mt-1">12.5K Observations</div>
            </div>
            <button className="font-mono text-xs text-[#5A564C] hover:text-[#1A1A1A]">[+]</button>
          </div>
          <div className="bg-[#E8E1D5] p-3 -mb-2 relative border border-black/10 flex items-center gap-3 transform rotate-1 translate-x-2 z-20">
            <span className="font-mono text-xs text-[#5A564C] border-r border-[#5A564C]/30 pr-2">02</span>
            <div className="flex-grow">
              <div className="font-bold text-base leading-none text-[#1A1A1A]">Lunar Eclipse</div>
              <div className="font-mono text-[10px] text-[#5A564C] mt-1">Astrology / 8,402 Logs</div>
            </div>
            <button className="font-mono text-xs text-[#5A564C] hover:text-[#1A1A1A]">[+]</button>
          </div>
          <div className="bg-[#F5F2EB] p-3 relative border border-black/10 flex items-center gap-3 transform -rotate-2 z-10">
            <span className="font-mono text-xs text-[#5A564C] border-r border-[#5A564C]/30 pr-2">03</span>
            <div className="flex-grow">
              <div className="font-bold text-base leading-none text-[#1A1A1A]">Monarchs</div>
              <div className="font-mono text-[10px] text-[#5A564C] mt-1">Entomology / 5,100 Logs</div>
            </div>
            <button className="font-mono text-xs text-[#5A564C] hover:text-[#1A1A1A]">[+]</button>
          </div>
        </div>
      </div>

      <div className="relative bg-[#E8E1D5] p-6 transform rotate-1 border border-black/10">
        <div className="font-mono text-xs text-[#5A564C] tracking-widest uppercase mb-4 border-b-2 border-[#1A1A1A] pb-2">
          Fellow Observers
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-4 border-b border-dashed border-[#5A564C]/30">
            <div className="w-9 h-9 bg-[#D4C9B3] border-2 border-[#5A564C] flex items-center justify-center font-bold text-sm text-[#1A1A1A] transform -rotate-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>SO</div>
            <div className="flex-grow leading-tight">
              <div className="font-bold text-sm">Sarah O.</div>
              <div className="font-mono text-[10px] text-[#5A564C]">@sarah_owls</div>
            </div>
            <button className="font-mono text-[10px] bg-[#D4C9B3]/80 text-[#1A1A1A] px-3 py-1.5 hover:bg-[#D4C9B3] transition-colors rounded-md transform hover:-rotate-1 border border-[#1A1A1A]/30">
              FOLLOW
            </button>
          </div>
          <div className="flex items-center gap-3 pb-4 border-b border-dashed border-[#5A564C]/30">
            <div className="w-9 h-9 bg-[#285A35] border-2 border-[#5A564C] flex items-center justify-center font-bold text-sm text-[#F5F2EB] transform rotate-1" style={{ fontFamily: 'Noto Serif SC, serif' }}>JP</div>
            <div className="flex-grow leading-tight">
              <div className="font-bold text-sm">James P.</div>
              <div className="font-mono text-[10px] text-[#5A564C]">@pines_birder</div>
            </div>
            <button className="font-mono text-[10px] bg-[#D4C9B3]/80 text-[#1A1A1A] px-3 py-1.5 hover:bg-[#D4C9B3] transition-colors rounded-md transform hover:-rotate-1 border border-[#1A1A1A]/30">
              FOLLOW
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#3A698A] border-2 border-[#5A564C] flex items-center justify-center font-bold text-sm text-[#F5F2EB] transform -rotate-1" style={{ fontFamily: 'Noto Serif SC, serif' }}>NW</div>
            <div className="flex-grow leading-tight">
              <div className="font-bold text-sm">Nat Wildlife</div>
              <div className="font-mono text-[10px] text-[#5A564C]">@natwildlife</div>
            </div>
            <button className="font-mono text-[10px] bg-[#D4C9B3]/80 text-[#1A1A1A] px-3 py-1.5 hover:bg-[#D4C9B3] transition-colors rounded-md transform hover:-rotate-1 border border-[#1A1A1A]/30">
              FOLLOW
            </button>
          </div>
        </div>
      </div>

      <footer className="font-mono text-[10px] text-[#5A564C] leading-relaxed mt-auto">
        <p>Terms of Service · Privacy Policy · Cookie Policy</p>
        <p>Accessibility · Ads info · © 2024 Field Notes Corp.</p>
      </footer>
    </aside>
  );
};

const NatureCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor(initial = false) {
        this.reset(initial);
      }
      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 0.5 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.life = Math.random();
        this.type = Math.random() > 0.8 ? 'thread' : 'seed';
        this.length = Math.random() * 20 + 10;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
        const colors = ['rgba(40, 90, 53, 0.2)', 'rgba(58, 105, 138, 0.2)', 'rgba(26, 26, 26, 0.1)', 'rgba(255, 74, 28, 0.1)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.life * 10) * 0.2;
        this.life += 0.005;
        this.angle += this.rotSpeed;
        if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if (this.type === 'seed') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(-this.length / 2, 0);
          ctx.lineTo(this.length / 2, 0);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < 30; i++) {
      particles.push(new Particle(true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&family=Shadows+Into+Light&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div
      className="font-serif w-full h-full min-h-screen relative"
      style={{
        ...customStyles.body,
        fontFamily: 'Noto Serif SC, serif',
        color: '#1A1A1A',
        overflowX: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
        <filter id="torn-paper" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="torn-paper-heavy" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <NatureCanvas />

      <div className="relative z-10 w-full mx-auto flex min-h-screen">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 flex justify-center gap-12">
          <main className="min-w-0 flex flex-col gap-12 px-8 py-12 max-w-[800px]">
            <NewLogEntry />

            <div className="flex flex-col gap-10">
              <Article1 />
              <Article2 />
              <Article3 />
              <Article4 />
              <Article5 />
            </div>

            <div className="text-center font-mono text-sm text-[#5A564C] py-8 border-t border-dashed border-[#5A564C]">
              --- END OF RECENT LOGS ---
            </div>
          </main>

          <RightSidebar />
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex gap-2 rotate-45">
        <div className="w-3 h-3 rounded-full bg-[#3A698A] shadow-md"></div>
        <div className="w-3 h-3 rounded-full bg-[#285A35] shadow-md"></div>
        <div className="w-3 h-3 rounded-full bg-[#FF4A1C] shadow-md"></div>
      </div>
    </div>
  );
};

export default App;