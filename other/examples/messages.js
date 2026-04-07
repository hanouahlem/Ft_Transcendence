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
  postmark: {
    border: '1px double #5A564C',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Courier Prime', monospace",
    textTransform: 'uppercase',
    opacity: 0.6,
    transform: 'rotate(-15deg)',
    pointerEvents: 'none',
  },
  tapeOrange: {
    backgroundColor: '#FF4A1C',
    opacity: 0.85,
    mixBlendMode: 'multiply',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  tapeBlue: {
    backgroundColor: '#3A698A',
    opacity: 0.85,
    mixBlendMode: 'multiply',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  stampText: {
    mixBlendMode: 'multiply',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
};

const NatureCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let width, height;

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

    for (let i = 0; i < 20; i++) particles.push(new Particle());

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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.4,
      }}
    />
  );
};

const SVGFilters = () => (
  <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
    <filter id="torn-paper" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="torn-paper-heavy" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

const ContactCard = ({ contact, isActive, onClick }) => {
  const baseClasses = `p-5 border torn-edge cursor-pointer transition-colors`;
  if (isActive) {
    return (
      <div
        className={`bg-paper-light ${baseClasses} border-2 border-ink-black/10 transform rotate-1 shadow-sm relative ring-2 ring-thread-orange/20`}
        onClick={onClick}
        style={{ filter: 'url(#torn-paper)' }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-paper-dark border-2 border-paper-light overflow-hidden shrink-0" style={{ filter: 'url(#torn-paper)' }}>
            <img
              src={contact.avatar}
              className="w-full h-full object-cover filter grayscale contrast-125"
              style={{ filter: 'grayscale(1) contrast(1.25) sepia(0.3)' }}
              alt={contact.name}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-ink-black truncate">{contact.name}</h4>
              <span className="font-mono text-[10px] text-thread-orange font-bold">• LIVE</span>
            </div>
            <p className="font-mono text-[10px] text-ink-fade truncate">{contact.handle}</p>
            <p className="font-serif text-sm text-ink-black/80 mt-2 line-clamp-2 italic">"{contact.preview}"</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`bg-paper-mid ${baseClasses} border-ink-fade/10 transform ${contact.rotate} hover:bg-paper-light`}
      onClick={onClick}
      style={{ filter: 'url(#torn-paper)' }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-paper-dark border-2 border-paper-light overflow-hidden shrink-0 opacity-80" style={{ filter: 'url(#torn-paper)' }}>
          <img
            src={contact.avatar}
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(1)' }}
            alt={contact.name}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base text-ink-black truncate">{contact.name}</h4>
            {contact.time && <span className="font-mono text-[10px] text-ink-fade">{contact.time}</span>}
          </div>
          <p className="font-mono text-[10px] text-ink-fade truncate">{contact.handle}</p>
          <p className="font-serif text-sm text-ink-fade mt-1 line-clamp-1">{contact.preview}</p>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isLeft = message.side === 'left';
  return (
    <div
      className={`flex flex-col ${isLeft ? 'items-start' : 'items-end self-end'} max-w-[85%] relative transition-transform duration-200 ease-in-out`}
      style={{ transform: `rotate(${message.rotate})` }}
    >
      <div
        className={`${isLeft ? 'bg-paper-light' : 'bg-paper-mid'} p-6 border border-ink-fade/10 shadow-sm relative`}
        style={{ filter: 'url(#torn-paper-heavy)' }}
      >
        {isLeft && message.postmark && (
          <div
            className="absolute -right-4 -top-4 w-16 h-16 text-[8px]"
            style={customStyles.postmark}
          >
            <span className="text-center text-[8px] font-mono">RECD MAR 12<br />STATION 04</span>
          </div>
        )}
        {message.tapeColor === 'orange' && (
          <div
            className="absolute -top-2 left-6 w-12 h-4 rotate-3"
            style={customStyles.tapeOrange}
          />
        )}
        {message.tapeColor === 'blue' && (
          <div
            className="absolute -bottom-3 right-10 w-16 h-5 -rotate-2"
            style={customStyles.tapeBlue}
          />
        )}
        <p className="font-serif text-ink-black leading-relaxed">
          {message.hasTag ? (
            <>
              Bedrock vibrations? That shouldn't be happening this far south. I'll run a check on the seismograph. I think{' '}
              <span className="text-thread-orange font-black">@fieldnotes_ev</span>
              {' '}mentioned similar movements.
            </>
          ) : message.text}
        </p>
      </div>
      <span className={`font-mono text-[10px] text-ink-fade mt-3 ${isLeft ? 'ml-2' : 'mr-2'}`}>
        {message.time}
      </span>
    </div>
  );
};

const contacts = [
  {
    id: 1,
    name: 'Marina T.',
    handle: '@tide_pools',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
    preview: 'Bedrock vibrations? That shouldn\'t be happening...',
    rotate: 'rotate-1',
    isActive: true,
  },
  {
    id: 2,
    name: 'Arthur P.',
    handle: '@fungi_father',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop',
    preview: 'Spore prints came back positive.',
    time: '2h',
    rotate: '-rotate-1',
    isActive: false,
  },
  {
    id: 3,
    name: 'James P.',
    handle: '@pines_birder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    preview: 'Coordinates updated for site B.',
    rotate: 'rotate-0',
    isActive: false,
  },
];

const initialMessages = [
  {
    id: 1,
    side: 'left',
    text: "Elara, I've been tracking the surge at the low-water mark for the past three cycles. It's significantly higher than my previous charts suggested.",
    time: '09:14 AM — STATION 04',
    rotate: '1deg',
    postmark: true,
  },
  {
    id: 2,
    side: 'right',
    text: 'Marina! I just got back from the ridge. The frost was heavy this morning, but yes—the tide pools were still flooded way past the usual line.',
    time: '11:02 AM — FIELD OUTPOST',
    rotate: '-1deg',
    tapeColor: 'orange',
  },
  {
    id: 3,
    side: 'left',
    text: '',
    time: '02:45 PM — STATION 04',
    rotate: '0deg',
    tapeColor: 'blue',
    hasTag: true,
  },
];

const App = () => {
  const [activeContact, setActiveContact] = useState(1);
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&family=Shadows+Into+Light&display=swap');

      * { box-sizing: border-box; }

      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        -webkit-font-smoothing: antialiased;
      }

      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4C9B3; border-radius: 10px; }

      ::selection { background-color: #FF4A1C; color: #F5F2EB; }
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleDispatch = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now(),
      side: 'right',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' — FIELD OUTPOST',
      rotate: '-1deg',
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDispatch();
    }
  };

  const activeContactData = contacts.find(c => c.id === activeContact);

  return (
    <div
      style={{
        ...customStyles.body,
        fontFamily: "'Noto Serif SC', 'Songti SC', STSong, serif",
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        color: '#1A1A1A',
      }}
    >
      <SVGFilters />
      <NatureCanvas />

      <div className="flex h-screen w-full relative" style={{ zIndex: 10 }}>
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-full relative order-first" style={{ backgroundColor: 'rgba(245, 242, 235, 0.3)' }}>
          {/* Header */}
          <header
            className="p-6 md:px-10 lg:px-16 border-b flex justify-between items-center"
            style={{
              borderColor: 'rgba(90, 86, 76, 0.1)',
              backgroundColor: 'rgba(232, 225, 213, 0.3)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center gap-6">
              <div
                className="w-14 h-14 border-2 p-1 overflow-hidden"
                style={{
                  backgroundColor: '#E8E1D5',
                  borderColor: '#5A564C',
                  transform: 'rotate(-3deg)',
                  filter: 'url(#torn-paper)',
                }}
              >
                <img
                  src={activeContactData?.avatar || contacts[0].avatar}
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(1)' }}
                  alt="contact"
                />
              </div>
              <div>
                <h2
                  className="font-black text-2xl text-ink-black"
                  style={customStyles.stampText}
                >
                  {activeContactData?.name || 'Marina'} {activeContactData?.handle || '@tide_pools'}
                </h2>
                <div
                  className="font-mono text-[10px] mt-0.5"
                  style={{ color: '#285A35', letterSpacing: '-0.05em' }}
                >
                  • TRANSMISSION ACTIVE
                </div>
              </div>
            </div>
            <div
              className="hidden sm:block font-mono text-[10px] text-right leading-tight"
              style={{ color: '#5A564C' }}
            >
              VOL III / CH. 12<br />
              <span style={{ borderBottom: '1px dashed #5A564C' }}>COASTAL DISPATCH</span>
            </div>
          </header>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-16 flex flex-col gap-8"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="p-6 md:px-10 lg:px-16"
            style={{ backgroundColor: 'rgba(232, 225, 213, 0.3)' }}
          >
            <div
              className="border-2 p-4 flex items-end gap-4"
              style={{
                backgroundColor: '#F5F2EB',
                borderColor: '#1A1A1A',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.1)',
              }}
            >
              <textarea
                placeholder="Write your correspondence..."
                className="flex-1 bg-transparent border-0 focus:outline-none resize-none"
                style={{
                  fontFamily: "'Shadows Into Light', cursive",
                  fontSize: '1.25rem',
                  minHeight: '60px',
                }}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleDispatch}
                className="font-mono text-xs font-bold uppercase px-8 py-3 transition-colors"
                style={{
                  backgroundColor: '#1A1A1A',
                  color: '#F5F2EB',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(26,26,26,0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
              >
                DISPATCH
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside
          className="w-1/2 md:w-2/5 lg:w-1/3 xl:w-1/4 border-l flex flex-col h-full order-last"
          style={{
            borderColor: 'rgba(26,26,26,0.1)',
            backgroundColor: 'rgba(232, 225, 213, 0.8)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Sidebar Header */}
          <div
            className="p-6 border-b flex items-center gap-4"
            style={{ borderColor: 'rgba(26,26,26,0.1)' }}
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ transform: 'rotate(-6deg)' }}>
              <svg className="w-8 h-8" fill="none" stroke="#1A1A1A" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="font-bold text-xl tracking-tight" style={{ color: '#1A1A1A' }}>Field Notes</h1>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            <div
              className="font-mono text-[10px] tracking-widest uppercase mb-2 px-2"
              style={{ color: '#5A564C' }}
            >
              Dispatches • {contacts.length} Active
            </div>

            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                isActive={activeContact === contact.id}
                onClick={() => setActiveContact(contact.id)}
              />
            ))}
          </div>

          {/* New Dispatch Button */}
          <div
            className="p-6 border-t"
            style={{ borderColor: 'rgba(26,26,26,0.1)', backgroundColor: '#E8E1D5' }}
          >
            <button
              className="w-full flex items-center justify-center gap-3 p-4 transition-all font-bold text-sm"
              style={{
                backgroundColor: '#1A1A1A',
                color: '#F5F2EB',
                boxShadow: '4px 4px 0 #FF4A1C',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(26,26,26,0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1A1A1A';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(4px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '4px 4px 0 #FF4A1C';
              }}
              onClick={() => setInputText('')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>NEW DISPATCH</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;