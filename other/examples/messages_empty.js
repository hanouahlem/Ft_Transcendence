import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const customStyles = {
  body: {
    backgroundColor: '#D4C9B3',
    backgroundImage: `
      linear-gradient(rgba(26, 26, 26, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26, 26, 26, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  waxSeal: {
    width: '40px',
    height: '40px',
    background: '#8B0000',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.4), 2px 2px 5px rgba(0,0,0,0.3)',
    position: 'absolute',
    transform: 'rotate(-5deg)',
    top: '50%',
    left: '50%',
    marginTop: '-20px',
    marginLeft: '-20px',
    opacity: 0.8,
    zIndex: 1,
    color: 'rgba(255,255,255,0.2)',
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  stampText: {
    mixBlendMode: 'multiply',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  mailboxSketch: {
    maskImage: 'linear-gradient(to bottom, black 70%, transparent)',
    filter: 'grayscale(1) contrast(0.8) sepia(0.2)',
    opacity: 0.6,
  },
};

const floatKeyframes = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(3deg); }
    50% { transform: translateY(-10px) rotate(-1deg); }
  }
  .floating {
    animation: float 6s ease-in-out infinite;
  }
`;

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let animFrameId;
    let particles = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 0.2 + 0.05);
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.color = 'rgba(26, 26, 26, 0.1)';
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 0.2 + 0.05);
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.color = 'rgba(26, 26, 26, 0.1)';
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y < -20) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < 15; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
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
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.2 }}
    />
  );
};

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
  ];

  return (
    <aside
      className="w-[72px] shrink-0 flex flex-col py-8 px-3 sticky top-0 h-screen border-r border-ink-black/10 transition-[width] duration-200 ease-out group/sidebar overflow-hidden hover:w-[240px]"
      style={{ backgroundColor: '#E8E1D5', zIndex: 10 }}
    >
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-8 h-8 flex items-center justify-center shrink-0 transform -rotate-6">
          <svg className="w-8 h-8 text-ink-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-bold text-xl text-ink-black opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap tracking-tight font-serif">
          Field Notes
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 justify-center">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 w-full text-left ${isActive ? 'bg-ink-black/5' : 'hover:bg-ink-black/5'}`}
            >
              <span className={isActive ? 'text-ink-black' : 'text-ink-fade'}>
                {item.icon}
              </span>
              <span className={`font-semibold text-base opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap ${isActive ? 'text-ink-black' : 'text-ink-fade'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          className="mt-4 flex items-center justify-center gap-0 group-hover/sidebar:gap-3 p-3 rounded-xl bg-ink-black hover:bg-ink-black/80 transition-all duration-200 w-full"
          style={{ boxShadow: '2px 4px 0 #FF4A1C' }}
          onClick={() => {}}
        >
          <svg className="w-5 h-5 text-paper-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-semibold text-base text-paper-light opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap overflow-hidden">
            Log Entry
          </span>
        </button>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-ink-black/5 cursor-pointer">
          <div
            className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shrink-0 transform -rotate-3"
            style={{ backgroundColor: '#D4C9B3' }}
          >
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(1) contrast(1.25) sepia(0.3)' }}
              alt="avatar"
            />
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            <div className="font-semibold text-sm text-ink-black">Elara Vance</div>
            <div className="font-mono text-xs text-ink-fade">@fieldnotes_ev</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const EmptyInboxPage = ({ onNewEntry }) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
      <div className="max-w-xl w-full flex flex-col items-center gap-8 relative">
        <header className="mb-2">
          <h1
            className="font-black text-4xl text-ink-black/60 transform rotate-2 mb-2"
            style={{ ...customStyles.stampText, mixBlendMode: 'multiply' }}
          >
            No Correspondence Received
          </h1>
          <div className="font-mono text-xs text-ink-fade tracking-widest">
            VOLUME III / UNWRITTEN PAGES
          </div>
        </header>

        <div className="relative w-full h-64 flex items-center justify-center mb-4">
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={customStyles.mailboxSketch}
          >
            <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
              <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" />
              <path d="m22 6-10 7L2 6" />
              <circle cx="12" cy="18" r="40" style={{ stroke: 'rgba(90,86,76,0.1)' }} />
            </svg>
          </div>

          <div
            className="floating relative z-10 w-64 h-40 flex flex-col justify-center items-center"
            style={{
              backgroundColor: '#F5F2EB',
              padding: '2rem',
              transform: 'rotate(3deg)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              border: '1px solid rgba(90,86,76,0.1)',
            }}
          >
            <div style={customStyles.waxSeal}>FN</div>
            <div className="w-full h-px bg-ink-fade/10 absolute" style={{ top: '33%' }} />
            <div className="w-full h-px bg-ink-fade/10 absolute" style={{ top: '66%' }} />
          </div>
        </div>

        <div className="flex flex-col gap-4 px-12">
          <p className="font-serif italic text-lg text-ink-fade leading-relaxed">
            "The archive grows quiet when the pen rests. Somewhere in the field, a discovery waits to be named."
          </p>
          <p className="font-mono text-xs text-ink-black/40 uppercase tracking-tighter">
            Status: Pending Observation
          </p>
        </div>

        <div className="mt-4">
          <button
            className="font-mono text-sm bg-ink-black text-paper-light px-8 py-3 rounded-sm transform hover:scale-105 hover:-rotate-1 transition-all duration-200 shadow-lg border border-thread-orange/20"
            onClick={onNewEntry}
          >
            BEGIN NEW LOG ENTRY
          </button>
          <div className="mt-6 flex justify-center gap-4 opacity-40 grayscale">
            <div className="w-2 h-2 rounded-full bg-thread-orange" />
            <div className="w-2 h-2 rounded-full bg-leaf-green" />
            <div className="w-2 h-2 rounded-full bg-bead-blue" />
          </div>
        </div>
      </div>
    </main>
  );
};

const RightAside = () => (
  <aside className="w-[260px] shrink-0 hidden xl:flex flex-col gap-10 sticky top-12 h-fit py-8 pr-12">
    <div
      className="relative p-6 transform -rotate-1 border border-black/5"
      style={{ backgroundColor: '#E8E1D5' }}
    >
      <div className="font-mono text-[10px] text-ink-fade tracking-widest uppercase mb-4 border-b border-ink-black/10 pb-2">
        Current Dispatch
      </div>
      <div className="font-serif text-sm italic text-ink-fade">
        No active transmissions recorded for the current cycle. Check your local frequency.
      </div>
    </div>

    <footer className="mt-auto font-mono text-[10px] text-ink-fade/40 leading-relaxed">
      <p>SILENCE IS TEMPORARY</p>
      <p>© 2024 Field Notes Corp.</p>
    </footer>
  </aside>
);

const NewEntryModal = ({ isOpen, onClose }) => {
  const [entryText, setEntryText] = useState('');
  const [title, setTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !entryText.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setEntryText('');
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,26,26,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg p-8 transform rotate-1 relative"
        style={{
          backgroundColor: '#F5F2EB',
          boxShadow: '4px 6px 0 #FF4A1C',
          border: '1px solid rgba(90,86,76,0.2)',
        }}
      >
        <div className="font-mono text-[10px] text-ink-fade tracking-widest uppercase mb-6 border-b border-ink-black/10 pb-2">
          NEW LOG ENTRY / FIELD NOTES
        </div>
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="font-serif text-2xl text-leaf-green font-bold">Entry Logged.</div>
            <div className="font-mono text-xs text-ink-fade">Filed to the archive.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[10px] text-ink-fade tracking-widest uppercase block mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-b border-ink-black/20 font-serif text-lg text-ink-black outline-none py-1 focus:border-ink-black transition-colors"
                placeholder="Name this discovery..."
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-ink-fade tracking-widest uppercase block mb-1">Observation</label>
              <textarea
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                className="w-full bg-transparent border border-ink-black/10 font-serif text-base text-ink-black outline-none p-3 resize-none focus:border-ink-black/30 transition-colors"
                rows={5}
                placeholder="Describe what you found in the field..."
              />
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-xs text-ink-fade px-4 py-2 hover:text-ink-black transition-colors"
              >
                DISCARD
              </button>
              <button
                type="submit"
                className="font-mono text-xs bg-ink-black text-paper-light px-6 py-2 hover:bg-ink-black/80 transition-colors"
                style={{ boxShadow: '2px 2px 0 #FF4A1C' }}
              >
                FILE ENTRY
              </button>
            </div>
          </form>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-fade hover:text-ink-black transition-colors font-mono text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [activeNav, setActiveNav] = useState('notifications');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&family=Shadows+Into+Light&display=swap');

      ${floatKeyframes}

      * { box-sizing: border-box; }

      ::selection {
        background-color: #FF4A1C;
        color: #F5F2EB;
      }

      .font-serif {
        font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif;
      }
      .font-mono {
        font-family: 'Courier Prime', 'Courier New', monospace;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div
        className="w-full h-screen relative overflow-hidden font-serif"
        style={customStyles.body}
      >
        <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
          <filter id="torn-paper" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        <ParticleCanvas />

        <div className="relative z-10 w-full h-full flex">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

          <Routes>
            <Route
              path="/"
              element={
                <EmptyInboxPage onNewEntry={() => setModalOpen(true)} />
              }
            />
          </Routes>

          <RightAside />
        </div>

        <NewEntryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </Router>
  );
};

export default App;