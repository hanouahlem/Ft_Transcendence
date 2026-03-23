import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  body: {
    background: 'repeating-linear-gradient(45deg, #E8E8E6, #E8E8E6 12px, #F0F0EE 12px, #F0F0EE 24px)',
    WebkitFontSmoothing: 'antialiased',
    textRendering: 'optimizeLegibility',
  },
  borderStandard: {
    border: '1.5px solid #0A0A0A',
  },
  borderHeavy: {
    border: '3px solid #0A0A0A',
  },
  borderBHeavy: {
    borderBottom: '3px solid #0A0A0A',
  },
  borderTHeavy: {
    borderTop: '3px solid #0A0A0A',
  },
  borderRHeavy: {
    borderRight: '3px solid #0A0A0A',
  },
  borderLHeavy: {
    borderLeft: '3px solid #0A0A0A',
  },
  statusDot: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    background: '#D4FF00',
    border: '2px solid #0A0A0A',
    borderRadius: '50%',
  },
  statusDotSm: {
    width: '8px',
    height: '8px',
    borderWidth: '1.5px',
  },
  inputFrameFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FA4616',
    outline: 'none',
  },
  inputFrameDefault: {
    backgroundColor: '#F0F0EE',
  },
};

const StatusDot = ({ sm = false }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(v => !v);
    }, 750);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{
        display: 'inline-block',
        width: sm ? '8px' : '10px',
        height: sm ? '8px' : '10px',
        background: '#D4FF00',
        border: `${sm ? '1.5px' : '2px'} solid #0A0A0A`,
        borderRadius: '50%',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.1s',
      }}
    />
  );
};

const ScanLine = () => {
  const [top, setTop] = useState(-100);

  useEffect(() => {
    let start = null;
    const duration = 8000;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) % duration;
      const progress = elapsed / duration;
      const newTop = -100 + (window.innerHeight + 100) * progress;
      setTop(newTop);
      requestAnimationFrame(animate);
    };

    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100px',
        zIndex: 50,
        position: 'absolute',
        pointerEvents: 'none',
        background: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(212,255,0,0.05) 25%, rgba(0,0,0,0) 100%)',
        opacity: 0.5,
        top: `${top}px`,
      }}
    />
  );
};

const AuthPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [pulseVisible, setPulseVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseVisible(v => !v);
    }, 750);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setSubmitStatus('error');
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setSubmitStatus('google');
  };

  const handleGithubLogin = () => {
    setSubmitStatus('github');
  };

  return (
    <main
      style={{
        ...customStyles.borderHeavy,
        background: '#F8F8F6',
      }}
      className="w-full h-full lg:h-auto max-w-[1280px] flex flex-col lg:flex-row relative z-10 flex-grow"
    >
      {/* Left Aside */}
      <aside
        style={{
          ...customStyles.borderBHeavy,
          background: '#0A0A0A',
        }}
        className="w-full lg:w-[45%] text-[#F8F8F6] lg:border-b-0 flex flex-col justify-between p-8 md:p-12 relative overflow-hidden group min-h-[400px]"
      >
        <ScanLine />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <StatusDot />
              <div className="flex flex-col">
                <span
                  style={{ color: '#D4FF00' }}
                  className="text-[0.65rem] font-bold uppercase tracking-widest leading-none mb-1"
                >
                  SYS_ACTIVE
                </span>
                <span className="text-[0.55rem] uppercase tracking-[0.2em] leading-none" style={{ color: 'rgba(248,248,246,0.6)' }}>
                  TERMINAL // 0X8F
                </span>
              </div>
            </div>
            <div
              style={{ border: '1px solid rgba(248,248,246,0.3)', color: 'rgba(248,248,246,0.5)' }}
              className="px-2 py-1 text-[0.5rem] font-mono tracking-widest"
            >
              v.4.0.1
            </div>
          </div>

          {/* Hero Text */}
          <div className="my-16 lg:my-auto">
            <h1
              style={{ color: '#F8F8F6', fontFamily: "'Instrument Serif', serif" }}
              className="text-6xl md:text-7xl lg:text-[6rem] leading-[0.85] mb-6 tracking-tight"
            >
              Identify<br />
              yourself<br />
              to the<br />
              <span style={{ color: '#D4FF00' }} className="italic pr-4">network</span>.
            </h1>
            <div style={{ borderLeft: '2px solid #FA4616' }} className="pl-4 py-1">
              <p
                style={{ color: 'rgba(248,248,246,0.8)' }}
                className="text-[0.65rem] font-bold uppercase tracking-[0.2em]"
              >
                Unverified signals will be truncated immediately upon detection.
              </p>
            </div>
          </div>

          {/* Terminal Log */}
          <div className="font-mono text-[0.55rem] uppercase tracking-wider space-y-1" style={{ color: 'rgba(248,248,246,0.4)' }}>
            <p className="flex justify-between">
              <span>&gt; INIT_CONNECTION...</span>
              <span style={{ color: 'rgba(212,255,0,0.7)' }}>OK</span>
            </p>
            <p className="flex justify-between">
              <span>&gt; HANDSHAKE_REQ...</span>
              <span style={{ color: 'rgba(212,255,0,0.7)' }}>OK</span>
            </p>
            <p className="flex justify-between">
              <span>&gt; SEC_LAYER_CHECK...</span>
              <span style={{ color: 'rgba(212,255,0,0.7)' }}>ENCRYPTED</span>
            </p>
            <p
              style={{
                color: '#FA4616',
                opacity: pulseVisible ? 1 : 0.3,
                transition: 'opacity 0.3s',
              }}
              className="mt-2"
            >
              &gt; AWAITING_CREDENTIALS_
            </p>
          </div>
        </div>
      </aside>

      {/* Right Section */}
      <section className="w-full lg:w-[55%] flex flex-col relative bg-[#F8F8F6] flex-grow">
        {/* Header Bar */}
        <header
          style={{ ...customStyles.borderBHeavy, background: '#0A0A0A' }}
          className="p-4 px-6 md:px-8 flex justify-between items-center text-[0.7rem] font-bold uppercase tracking-widest text-[#F8F8F6] shrink-0"
        >
          <div className="flex items-center gap-2">
            <StatusDot sm={true} />
            <span>SYS.AUTH // ACCESS_GATE</span>
          </div>
          <div className="text-right font-black">
            NODE.401-A
          </div>
        </header>

        {/* Form Area */}
        <div className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 relative">
          {submitStatus === 'success' && (
            <div
              style={{ border: '1.5px solid #D4FF00', background: 'rgba(212,255,0,0.1)' }}
              className="w-full max-w-md mb-6 p-4 text-center"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
                ✓ ACCESS_GRANTED // TRANSMITTING...
              </span>
            </div>
          )}
          {submitStatus === 'error' && (
            <div
              style={{ border: '1.5px solid #FA4616', background: 'rgba(250,70,22,0.08)' }}
              className="w-full max-w-md mb-6 p-4 text-center"
            >
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#FA4616' }}>
                ✗ CREDENTIALS_INVALID // RETRY
              </span>
            </div>
          )}
          {(submitStatus === 'google' || submitStatus === 'github') && (
            <div
              style={{ border: '1.5px solid #D4FF00', background: 'rgba(212,255,0,0.1)' }}
              className="w-full max-w-md mb-6 p-4 text-center"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
                REDIRECTING_TO_{submitStatus.toUpperCase()}_AUTH...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-8">
            {/* Username */}
            <div className="space-y-2">
              <label
                style={{ color: '#555555' }}
                className="text-[0.65rem] font-bold uppercase tracking-widest block"
              >
                01_USERNAME
              </label>
              <div
                style={{
                  ...(usernameFocused ? customStyles.inputFrameFocused : { ...customStyles.borderStandard, backgroundColor: '#E8E8E6' }),
                  transition: 'all 0.15s',
                }}
                className="p-3 sm:p-4"
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  className="w-full bg-transparent border-none outline-none text-sm tracking-tight uppercase"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#0A0A0A' }}
                  placeholder="NULL_ID"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                style={{ color: '#555555' }}
                className="text-[0.65rem] font-bold uppercase tracking-widest block"
              >
                02_ACCESS_KEY
              </label>
              <div
                style={{
                  ...(passwordFocused ? customStyles.inputFrameFocused : { ...customStyles.borderStandard, backgroundColor: '#E8E8E6' }),
                  transition: 'all 0.15s',
                }}
                className="p-3 sm:p-4"
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full bg-transparent border-none outline-none text-sm"
                  style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.3em', color: '#0A0A0A' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 pt-4">
              <div style={{ borderTop: '1.5px solid rgba(10,10,10,0.1)', flexGrow: 1 }} />
              <span style={{ color: '#555555' }} className="text-[0.55rem] font-bold uppercase tracking-widest whitespace-nowrap">
                OR_CONNECT_VIA
              </span>
              <div style={{ borderTop: '1.5px solid rgba(10,10,10,0.1)', flexGrow: 1 }} />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <SocialButton
                onClick={handleGoogleLogin}
                hoverBg="#D4FF00"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                }
                label="Google"
              />
              <SocialButton
                onClick={handleGithubLogin}
                hoverBg="#FA4616"
                hoverText="#F8F8F6"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2C6.477,2,2,6.477,2,12c0,4.419,2.865,8.166,6.839,9.489c0.5,0.09,0.682-0.218,0.682-0.484c0-0.236-0.009-0.866-0.014-1.699c-2.782,0.602-3.369-1.338-3.369-1.338c-0.454-1.15-1.11-1.458-1.11-1.458c-0.908-0.62,0.069-0.608,0.069-0.608c1.003,0.07,1.531,1.03,1.531,1.03c0.892,1.529,2.341,1.087,2.91,0.831c0.092-0.646,0.35-1.086,0.636-1.336c-2.22-0.253-4.555-1.11-4.555-4.943c0-1.091,0.39-1.984,1.029-2.683c-0.103-0.253-0.446-1.27,0.098-2.647c0,0,0.84-0.269,2.75,1.025C11.54,5.546,12.43,5.437,13.31,5.433c0.88,0.004,1.77,0.113,2.57,0.334c1.91-1.294,2.75-1.025,2.75-1.025c0.544,1.377,0.201,2.394,0.098,2.647c0.639,0.699,1.029,1.592,1.029,2.683c0,3.842-2.338,4.687-4.565,4.935c0.359,0.309,0.682,0.919,0.682,1.852c0,1.336-0.012,2.415-0.012,2.743c0,0.267,0.18,0.577,0.688,0.48C19.138,20.163,22,16.418,22,12C22,6.477,17.522,2,12,2z" />
                  </svg>
                }
                label="GitHub"
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <TransmitButton isSubmitting={isSubmitting} />
            </div>
          </form>
        </div>

        {/* Orange Footer Links */}
        <div
          style={{ ...customStyles.borderTHeavy, background: '#FA4616' }}
          className="p-4 px-8 flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-[0.6rem] font-bold uppercase tracking-widest text-[#0A0A0A] shrink-0"
        >
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-center transition-colors"
            style={{ color: '#0A0A0A' }}
            onMouseEnter={e => e.target.style.opacity = '0.6'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            [ LOST_KEY ]
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-center transition-colors"
            style={{ color: '#0A0A0A' }}
            onMouseEnter={e => e.target.style.opacity = '0.6'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            [ REQUEST_ID ]
          </a>
        </div>

        {/* Footer */}
        <footer
          style={{ ...customStyles.borderTHeavy, background: '#0A0A0A' }}
          className="text-[#F8F8F6] p-4 px-6 md:px-8 text-[0.65rem] font-bold uppercase tracking-widest flex flex-col sm:flex-row items-center justify-between shrink-0 gap-2 sm:gap-0"
        >
          <div>SEC_LAYER: ENCRYPTED</div>
          <div className="opacity-50 flex items-center gap-2">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FA4616',
                display: 'block',
              }}
              className="animate-pulse"
            />
            WATCHING // RECORDING
          </div>
        </footer>
      </section>
    </main>
  );
};

const SocialButton = ({ onClick, hoverBg, hoverText = '#0A0A0A', icon, label }) => {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        ...customStyles.borderStandard,
        backgroundColor: hovered ? hoverBg : '#E8E8E6',
        color: hovered && hoverText !== '#0A0A0A' ? hoverText : '#0A0A0A',
        boxShadow: hovered && !active ? '6px 6px 0px rgba(10,10,10,1)' : 'none',
        transform: hovered && !active ? 'translate(-1px, -1px)' : active ? 'translate(0, 0)' : 'none',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '12px 16px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
};

const TransmitButton = ({ isSubmitting }) => {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <button
      type="submit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      disabled={isSubmitting}
      style={{
        width: '100%',
        ...customStyles.borderHeavy,
        backgroundColor: hovered ? '#FFFFFF' : '#0A0A0A',
        color: hovered ? '#0A0A0A' : '#F8F8F6',
        transform: active ? 'translate(1px, 1px)' : 'none',
        boxShadow: active ? 'none' : undefined,
        transition: 'all 0.15s',
        padding: '20px',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.3em',
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        opacity: isSubmitting ? 0.7 : 1,
      }}
    >
      {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT'}
    </button>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;900&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; }
      input::placeholder { color: rgba(10,10,10,0.2); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div
        style={{
          ...customStyles.body,
          fontFamily: 'Inter, sans-serif',
          color: '#0A0A0A',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflowX: 'hidden',
          width: '100%',
        }}
      >
        <Routes>
          <Route path="/" element={<AuthPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;