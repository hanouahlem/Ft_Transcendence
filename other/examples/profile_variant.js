import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  body: {
    backgroundColor: '#D4C9B3',
    backgroundImage: `
      linear-gradient(rgba(26, 26, 26, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26, 26, 26, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  tape: {
    background: 'rgba(220, 210, 180, 0.4)',
    backdropFilter: 'blur(1px)',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)',
    height: '24px',
    position: 'absolute',
    zIndex: 30,
  },
  tapGreen: {
    background: '#285A35',
    backdropFilter: 'blur(1px)',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)',
    height: '24px',
    position: 'absolute',
    zIndex: 30,
  },
  tapeBlue: {
    background: '#3A698A',
    backdropFilter: 'blur(1px)',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)',
    height: '24px',
    position: 'absolute',
    zIndex: 30,
  },
  tapeOrange: {
    background: '#FF4A1C',
    backdropFilter: 'blur(1px)',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)',
    height: '24px',
    position: 'absolute',
    zIndex: 30,
  },
  tapeSmall: {
    backdropFilter: 'blur(1px)',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)',
    height: '16px',
    position: 'absolute',
    zIndex: 30,
  },
  followButton: {
    boxShadow: '2px 3px 0 #1A1A1A',
  },
  messageButton: {
    boxShadow: '2px 3px 0 #1A1A1A',
  },
  logEntryButton: {
    boxShadow: '2px 4px 0 #FF4A1C',
  },
};

const OrangeStar = () => (
  <svg
    style={{ width: '100%', height: '100%', stroke: '#FF4A1C', strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }}
    viewBox="0 0 50 50"
  >
    <polygon points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20" />
    <line x1="15" y1="15" x2="35" y2="35" />
    <line x1="15" y1="35" x2="35" y2="15" />
  </svg>
);

const Sidebar = ({ sidebarHovered, setSidebarHovered }) => {
  return (
    <aside
      className="shrink-0 hidden lg:flex flex-col py-8 px-3 sticky top-0 h-screen bg-[#E8E1D5] border-r border-[#1A1A1A]/10 transition-all duration-200 ease-out z-50 overflow-hidden"
      style={{ width: sidebarHovered ? '240px' : '72px' }}
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
    >
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-8 h-8 flex items-center justify-center shrink-0 transform -rotate-6">
          <svg className="w-8 h-8 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span
          className="font-bold text-xl text-[#1A1A1A] transition-opacity duration-150 whitespace-nowrap tracking-tight font-serif"
          style={{ opacity: sidebarHovered ? 1 : 0 }}
        >
          Field Notes
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 justify-center">
        {[
          {
            label: 'Timeline',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            ),
          },
          {
            label: 'Discoveries',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            ),
          },
          {
            label: 'Messages',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            ),
          },
          {
            label: 'Bookmarks',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            ),
          },
        ].map((item) => (
          <a key={item.label} href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#1A1A1A]/5 transition-all duration-200">
            <svg className="w-7 h-7 text-[#5A564C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {item.icon}
            </svg>
            <span
              className="font-semibold text-base text-[#5A564C] transition-opacity duration-150 whitespace-nowrap"
              style={{ opacity: sidebarHovered ? 1 : 0 }}
            >
              {item.label}
            </span>
          </a>
        ))}

        <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#1A1A1A]/5 transition-all duration-200 relative">
          <div className="relative">
            <svg className="w-7 h-7 text-[#5A564C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4A1C] rounded-full text-[#F5F2EB] text-[10px] font-bold flex items-center justify-center border-2 border-[#E8E1D5]">3</span>
          </div>
          <span
            className="font-semibold text-base text-[#5A564C] transition-opacity duration-150 whitespace-nowrap"
            style={{ opacity: sidebarHovered ? 1 : 0 }}
          >
            Notifications
          </span>
        </a>

        <a href="#" className="flex items-center gap-4 p-3 rounded-xl bg-[#1A1A1A]/5 transition-all duration-200">
          <svg className="w-7 h-7 text-[#1A1A1A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span
            className="font-semibold text-base text-[#1A1A1A] transition-opacity duration-150 whitespace-nowrap"
            style={{ opacity: sidebarHovered ? 1 : 0 }}
          >
            Profile
          </span>
        </a>

        <button
          className="mt-4 flex items-center p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 transition-all duration-200 transform rotate-1 hover:-rotate-1 active:translate-y-1 w-full"
          style={sidebarHovered ? { ...customStyles.logEntryButton, justifyContent: 'flex-start', gap: '12px' } : { ...customStyles.logEntryButton, justifyContent: 'center', gap: '0px' }}
        >
          <svg className="w-5 h-5 text-[#F5F2EB] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span
            className="font-semibold text-base text-[#F5F2EB] transition-opacity duration-150 whitespace-nowrap overflow-hidden"
            style={{ opacity: sidebarHovered ? 1 : 0, maxWidth: sidebarHovered ? '200px' : '0px' }}
          >
            Log Entry
          </span>
        </button>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#1A1A1A]/5 transition-all duration-200 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#D4C9B3] border-2 border-white overflow-hidden shrink-0 transform -rotate-3">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(100%) contrast(1.25) sepia(0.3)' }}
              alt="Profile"
            />
          </div>
          <div
            className="transition-opacity duration-150 whitespace-nowrap"
            style={{ opacity: sidebarHovered ? 1 : 0 }}
          >
            <div className="font-semibold text-sm text-[#1A1A1A]">Elara Vance</div>
            <div className="font-mono text-xs text-[#5A564C]">@fieldnotes_ev</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const RightSidebar = () => {
  const [searchVal, setSearchVal] = useState('');
  const [followedSarah, setFollowedSarah] = useState(false);
  const [followedJames, setFollowedJames] = useState(false);

  return (
    <aside className="w-[260px] shrink-0 hidden xl:flex flex-col gap-10 sticky top-12 h-fit py-8 pr-4">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search archives..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full bg-[#E8E1D5] border-0 py-2 px-4 font-mono text-sm focus:outline-none focus:bg-[#F5F2EB] placeholder:text-[#5A564C]/60 rounded-lg shadow-inner"
        />
        <span className="absolute right-3 top-2.5 font-mono text-[#5A564C]">/</span>
      </div>

      <div className="relative">
        <div className="font-bold text-lg mb-6 inline-block bg-[#1A1A1A] text-[#F5F2EB] px-4 py-1 transform -rotate-1 uppercase tracking-wide" style={{ mixBlendMode: 'multiply', letterSpacing: '1px' }}>
          Current Trends
        </div>

        <div className="flex flex-col">
          <div className="bg-[#F5F2EB] p-3 -mb-2 relative border border-black/10 flex items-center gap-3 transform -rotate-1 z-30 shadow-sm">
            <span className="font-mono text-xs text-[#5A564C] border-r border-[#5A564C]/30 pr-2">01</span>
            <div className="flex-grow">
              <div className="font-bold text-base leading-none text-[#1A1A1A]">#SpringMigration</div>
              <div className="font-mono text-[10px] text-[#5A564C] mt-1">12.5K Observations</div>
            </div>
          </div>

          <div className="bg-[#E8E1D5] p-3 -mb-2 relative border border-black/10 flex items-center gap-3 transform rotate-1 translate-x-2 z-20 shadow-sm">
            <span className="font-mono text-xs text-[#5A564C] border-r border-[#5A564C]/30 pr-2">02</span>
            <div className="flex-grow">
              <div className="font-bold text-base leading-none text-[#1A1A1A]">Lunar Eclipse</div>
              <div className="font-mono text-[10px] text-[#5A564C] mt-1">Astrology / 8,402 Logs</div>
            </div>
          </div>

          <div className="bg-[#F5F2EB] p-3 relative border border-black/10 flex items-center gap-3 transform -rotate-2 z-10 shadow-sm">
            <span className="font-mono text-xs text-[#5A564C] border-r border-[#5A564C]/30 pr-2">03</span>
            <div className="flex-grow">
              <div className="font-bold text-base leading-none text-[#1A1A1A]">Monarchs</div>
              <div className="font-mono text-[10px] text-[#5A564C] mt-1">Entomology / 5,100 Logs</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-[#E8E1D5] p-6 transform rotate-1 border border-black/10 shadow-sm" style={{ position: 'relative' }}>
        <div className="font-mono text-xs text-[#5A564C] tracking-widest uppercase mb-4 border-b-2 border-[#1A1A1A] pb-2">
          Fellow Observers
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-4 border-b border-dashed border-[#5A564C]/30">
            <div className="w-9 h-9 bg-[#D4C9B3] border-2 border-[#5A564C] flex items-center justify-center font-serif font-bold text-sm text-[#1A1A1A] transform -rotate-2">SO</div>
            <div className="flex-grow leading-tight">
              <div className="font-bold text-sm">Sarah O.</div>
              <div className="font-mono text-[10px] text-[#5A564C]">@sarah_owls</div>
            </div>
            <button
              onClick={() => setFollowedSarah(!followedSarah)}
              className={`font-mono text-[10px] px-3 py-1.5 transition-colors rounded-md border border-[#1A1A1A]/30 ${followedSarah ? 'bg-[#1A1A1A] text-[#F5F2EB]' : 'bg-[#D4C9B3]/80 text-[#1A1A1A] hover:bg-[#D4C9B3]'}`}
            >
              {followedSarah ? 'FOLLOWING' : 'FOLLOW'}
            </button>
          </div>
          <div className="flex items-center gap-3 pb-4 border-b border-dashed border-[#5A564C]/30">
            <div className="w-9 h-9 bg-[#285A35] border-2 border-[#5A564C] flex items-center justify-center font-serif font-bold text-sm text-[#F5F2EB] transform rotate-1">JP</div>
            <div className="flex-grow leading-tight">
              <div className="font-bold text-sm">James P.</div>
              <div className="font-mono text-[10px] text-[#5A564C]">@pines_birder</div>
            </div>
            <button
              onClick={() => setFollowedJames(!followedJames)}
              className={`font-mono text-[10px] px-3 py-1.5 transition-colors rounded-md border border-[#1A1A1A]/30 ${followedJames ? 'bg-[#1A1A1A] text-[#F5F2EB]' : 'bg-[#D4C9B3]/80 text-[#1A1A1A] hover:bg-[#D4C9B3]'}`}
            >
              {followedJames ? 'FOLLOWING' : 'FOLLOW'}
            </button>
          </div>
        </div>
      </div>

      <footer className="font-mono text-[10px] text-[#5A564C] leading-relaxed mt-auto pl-2">
        <p>Terms · Privacy · Cookies</p>
        <p>© 2024 Field Notes Corp.</p>
      </footer>
    </aside>
  );
};

const ProfilePage = () => {
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(12300);

  const handleFollow = () => {
    setFollowing(!following);
    setFollowers(prev => following ? prev - 1 : prev + 1);
  };

  const formatFollowers = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <main className="min-w-0 flex flex-col pb-12 w-full max-w-[800px]">

      {/* Cover */}
      <div className="relative w-full mt-8">
        <div className="w-full h-[280px] bg-[#E8E1D5] relative overflow-hidden border border-[#1A1A1A]/10">
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-80"
            style={{ filter: 'grayscale(100%) contrast(1.1)', mixBlendMode: 'multiply' }}
            alt="Forest Canopy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
          <div
            className="absolute top-4 right-4 bg-[#F5F2EB]/90 border border-[#1A1A1A]/20 px-2 py-1 font-mono text-[10px] uppercase tracking-wide transform rotate-2 shadow-sm"
            style={{ mixBlendMode: 'multiply' }}
          >
            LOC: SECTOR_04_NORTH
          </div>
        </div>
        <div
          style={{
            ...customStyles.tapGreen,
            top: '-6px',
            left: '15%',
            transform: 'rotate(-2deg)',
            width: '112px',
          }}
        />
        <div
          style={{
            ...customStyles.tapeBlue,
            top: '-6px',
            right: '10%',
            transform: 'rotate(4deg)',
            width: '144px',
          }}
        />
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6 px-4 md:px-8 -mt-20 relative z-10 w-full">
        <div className="w-32 h-32 md:w-48 md:h-48 bg-[#F5F2EB] p-2.5 transform -rotate-3 border border-[#5A564C]/10 shadow-xl shrink-0 relative">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
            className="w-full h-full object-cover transition-all duration-400"
            style={{ filter: 'grayscale(100%) contrast(1.1) sepia(20%)', mixBlendMode: 'multiply' }}
            alt="Elara Vance"
            onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0%) contrast(1) sepia(0%)'; e.currentTarget.style.mixBlendMode = 'normal'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(100%) contrast(1.1) sepia(20%)'; e.currentTarget.style.mixBlendMode = 'multiply'; }}
          />
          <div className="absolute -bottom-2 -right-2" style={{ width: '32px', height: '32px', position: 'absolute', zIndex: 20, transform: 'scale(0.9)' }}>
            <OrangeStar />
          </div>
        </div>

        <div className="flex-1 pt-12 md:pt-0 mb-2 w-full">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wide leading-none mb-1 text-white break-words" style={{ mixBlendMode: 'normal' }}>
            Elara Vance
          </h1>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-mono text-sm text-white/80">@fieldnotes_ev</span>
          </div>
          <p className="text-xl text-[#3A698A] italic max-w-lg mb-5" style={{ fontFamily: "'Shadows Into Light', cursive", lineHeight: 1.3 }}>
            "Field naturalist documenting the quiet wonders of the Pacific Northwest. My camera is always ready, my notebook never far."
          </p>
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={handleFollow}
              className="border border-[#1A1A1A] py-2.5 px-6 font-mono text-xs font-bold uppercase tracking-widest shadow-sm transition-all hover:translate-y-px"
              style={{
                backgroundColor: following ? '#F5F2EB' : '#3A698A',
                color: following ? '#1A1A1A' : '#F5F2EB',
                boxShadow: '2px 3px 0 #1A1A1A',
              }}
            >
              {following ? 'Following' : 'Follow'}
            </button>
            <button
              className="bg-[#F5F2EB] text-[#1A1A1A] border border-[#1A1A1A] py-2.5 px-6 font-mono text-xs font-bold uppercase tracking-widest transition-all hover:translate-y-px"
              style={{ boxShadow: '2px 3px 0 #1A1A1A' }}
            >
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-14 px-2">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="font-bold uppercase tracking-wide text-xl shrink-0">Observer Profile</h3>
          <div className="flex-grow border-t-2 border-[#1A1A1A]/20"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#F5F2EB] p-4 transform rotate-1 border border-[#5A564C]/10 shadow-sm relative text-center">
            <div
              style={{
                ...customStyles.tapeSmall,
                background: '#285A35',
                top: '-8px',
                left: '16px',
                transform: 'rotate(-2deg)',
                width: '32px',
              }}
            />
            <span className="font-black text-2xl text-[#1A1A1A] uppercase tracking-wide block">847</span>
            <span className="font-mono text-[9px] uppercase text-[#5A564C] mt-1 block tracking-wider">Observations</span>
          </div>
          <div className="bg-[#F5F2EB] p-4 transform -rotate-1 border border-[#5A564C]/10 shadow-sm text-center">
            <span className="font-black text-2xl text-[#FF4A1C] uppercase tracking-wide block">{formatFollowers(followers)}</span>
            <span className="font-mono text-[9px] uppercase text-[#5A564C] mt-1 block tracking-wider">Followers</span>
          </div>
          <div className="bg-[#F5F2EB] p-4 transform rotate-2 border border-[#5A564C]/10 shadow-sm relative text-center">
            <div style={{ position: 'absolute', width: '32px', height: '32px', top: '4px', right: '4px', zIndex: 20, transform: 'scale(0.5)' }}>
              <OrangeStar />
            </div>
            <span className="font-black text-2xl text-[#3A698A] uppercase tracking-wide block">234</span>
            <span className="font-mono text-[9px] uppercase text-[#5A564C] mt-1 block tracking-wider">Following</span>
          </div>
          <div className="bg-[#F5F2EB] p-4 transform -rotate-2 border border-[#5A564C]/10 shadow-sm relative text-center">
            <div
              style={{
                ...customStyles.tapeSmall,
                background: '#FF4A1C',
                bottom: '-8px',
                right: '16px',
                transform: 'rotate(6deg)',
                width: '32px',
              }}
            />
            <span className="font-black text-2xl text-[#1A1A1A] uppercase tracking-wide block">42</span>
            <span className="font-mono text-[9px] uppercase text-[#5A564C] mt-1 block tracking-wider">Day Streak</span>
          </div>
          <div className="bg-[#F5F2EB] p-4 transform rotate-1 border border-[#5A564C]/10 shadow-sm text-center col-span-2 md:col-span-1">
            <span className="font-black text-xl text-[#1A1A1A] uppercase tracking-wide block">Mar '21</span>
            <span className="font-mono text-[9px] uppercase text-[#5A564C] mt-1 block tracking-wider">Joined</span>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="mt-12 px-2 flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <h3 className="font-bold uppercase tracking-wide text-xl shrink-0">Recent Entries</h3>
          <div className="flex-grow border-t-2 border-[#1A1A1A]/20"></div>
        </div>

        <article className="bg-[#F5F2EB] p-6 md:p-8 border border-[#5A564C]/10 relative shadow-sm">
          <div
            style={{
              ...customStyles.tapGreen,
              top: '-12px',
              left: '24px',
              transform: 'rotate(-2deg)',
              width: '64px',
            }}
          />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
            <h4 className="font-bold text-xl uppercase tracking-wide text-[#1A1A1A] leading-tight">Moss growth on Western Hemlock</h4>
            <span className="font-mono text-[10px] text-[#5A564C] shrink-0 sm:mt-1">12 MAY 2024</span>
          </div>
          <p className="text-sm leading-relaxed text-[#5A564C] mb-5">
            Unusually dense coverage after the heavy spring rains. Spore counts seem higher than last year. Documenting the spread across the lower branches in Sector 4 to compare against historical data. The vividness of the green is striking against the dark bark.
          </p>
          <div className="flex gap-4 border-t border-[#1A1A1A]/10 pt-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#5A564C]">#Botany</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#5A564C]">#Sector4</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#5A564C]">#Fieldwork</span>
          </div>
        </article>

        <article className="bg-[#F5F2EB] p-6 md:p-8 transform -rotate-1 border border-[#5A564C]/10 relative shadow-sm mt-2">
          <div style={{ position: 'absolute', width: '32px', height: '32px', top: '-8px', right: '-8px', zIndex: 20, transform: 'scale(0.75)' }}>
            <OrangeStar />
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
            <h4 className="font-bold text-xl uppercase tracking-wide text-[#1A1A1A] leading-tight">Bald Eagle sighting near Skagit</h4>
            <span className="font-mono text-[10px] text-[#5A564C] shrink-0 sm:mt-1">08 MAY 2024</span>
          </div>
          <p className="text-sm leading-relaxed text-[#5A564C]">
            Solitary adult circling the upper estuary. Wingspan estimate: 2.1 meters. Returning to known nest site near the old logging road. Behavior suggests active hunting for the late salmon run. Managed to get a few long-distance shots before the fog rolled in entirely.
          </p>
        </article>
      </div>

      <div className="text-center font-mono text-sm text-[#5A564C] py-12 border-t border-dashed border-[#5A564C]/40 mt-12">
        --- END OF PROFILE RECORD ---
      </div>
    </main>
  );
};

const App = () => {
  const [sidebarHovered, setSidebarHovered] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&family=Shadows+Into+Light&display=swap');
      body {
        background-color: #D4C9B3;
        color: #1A1A1A;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        background-image: 
          linear-gradient(rgba(26, 26, 26, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26, 26, 26, 0.05) 1px, transparent 1px);
        background-size: 40px 40px;
        margin: 0;
      }
      ::selection {
        background-color: #FF4A1C;
        color: #F5F2EB;
      }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #F5F2EB; }
      ::-webkit-scrollbar-thumb { background: #D4C9B3; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #5A564C; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div className="relative z-10 w-full flex min-h-screen" style={{ fontFamily: "'Noto Serif SC', 'Songti SC', STSong, serif" }}>
        <Sidebar sidebarHovered={sidebarHovered} setSidebarHovered={setSidebarHovered} />

        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="flex w-full max-w-[1200px]">
            <div className="flex-1 flex justify-center px-4 overflow-hidden">
              <Routes>
                <Route path="/" element={<ProfilePage />} />
              </Routes>
            </div>
            <RightSidebar />
          </div>
        </div>

        {/* Decorative beads */}
        <div className="fixed bottom-8 right-8 flex gap-2 rotate-45 pointer-events-none z-0">
          <div className="w-3 h-3 rounded-full bg-[#3A698A] shadow-md opacity-50"></div>
          <div className="w-3 h-3 rounded-full bg-[#285A35] shadow-md opacity-50"></div>
          <div className="w-3 h-3 rounded-full bg-[#FF4A1C] shadow-md opacity-50"></div>
        </div>
      </div>
    </Router>
  );
};

export default App;