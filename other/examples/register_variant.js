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
  paperTextureBefore: {
    backgroundImage: 'radial-gradient(#E8E1D5 1px, transparent 1px)',
    backgroundSize: '16px 16px',
    opacity: 0.5,
  },
  waxSeal: {
    width: '48px',
    height: '48px',
    background: '#a52a2a',
    borderRadius: '50%',
    boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.5), 2px 3px 5px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 'bold',
    fontFamily: "'Noto Serif SC', serif",
    transform: 'rotate(15deg)',
    position: 'relative',
  },
  tapeStrip: {
    backgroundColor: '#FF4A1C',
    opacity: 0.85,
    mixBlendMode: 'multiply',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    position: 'absolute',
    zIndex: 30,
  },
  ledgerInput: {
    background: 'transparent',
    border: 'none',
    borderBottom: '2px dotted #5A564C',
    fontFamily: "'Courier Prime', monospace",
    padding: '12px 4px 4px 4px',
    width: '100%',
    outline: 'none',
    fontSize: '1.125rem',
    color: '#1A1A1A',
    textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.1)',
  },
  stampBtn: {
    position: 'absolute',
    right: '2rem',
    bottom: '8rem',
    zIndex: 40,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: 0,
  },
  stampInner: {
    color: '#D32F2F',
    padding: '1rem 2rem',
    fontFamily: "'Noto Serif SC', serif",
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontSize: '1.5rem',
    transform: 'rotate(-6deg)',
    border: '4px solid #D32F2F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
  },
};

const StarIcon = () => (
  <symbol id="star-icon" viewBox="0 0 50 50">
    <polygon points="25,2 31,18 48,25 31,32 25,48 19,32 2,25 19,18" />
  </symbol>
);

const SVGDefs = () => (
  <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
    <filter id="torn-paper" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="ink-texture" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="4" result="turbulence" />
      <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <symbol id="star-icon" viewBox="0 0 50 50">
      <polygon points="25,2 31,18 48,25 31,32 25,48 19,32 2,25 19,18" />
    </symbol>
  </svg>
);

const LedgerInput = ({ type = 'text', placeholder, value, onChange, id }) => {
  const [focused, setFocused] = useState(false);

  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...customStyles.ledgerInput,
        borderBottomColor: focused ? '#FF4A1C' : '#5A564C',
        backgroundColor: focused ? 'rgba(255, 74, 28, 0.02)' : 'transparent',
        letterSpacing: type === 'password' ? '0.2em' : undefined,
      }}
    />
  );
};

const FormField = ({ label, type, placeholder, value, onChange, id }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className="relative"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      <label
        htmlFor={id}
        style={{
          position: 'absolute',
          top: '-0.75rem',
          left: '0.25rem',
          backgroundColor: '#F5F2EB',
          padding: '0 0.25rem',
          fontFamily: "'Courier Prime', monospace",
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.4em',
          color: focused ? '#FF4A1C' : '#5A564C',
          zIndex: 10,
          transition: 'color 0.3s',
        }}
      >
        {label}
      </label>
      <div
        style={{
          border: `1px solid ${focused ? 'rgba(255, 74, 28, 0.5)' : 'rgba(90, 86, 76, 0.3)'}`,
          padding: '0.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          transition: 'border-color 0.3s',
        }}
      >
        <LedgerInput type={type} placeholder={placeholder} value={value} onChange={onChange} id={id} />
      </div>
    </div>
  );
};

const HomePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [stampHovered, setStampHovered] = useState(false);
  const [stampActive, setStampActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleRegister = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const stampTransform = stampActive
    ? 'scale(0.95) rotate(-2deg)'
    : stampHovered
    ? 'scale(1.05) rotate(-2deg)'
    : 'none';

  return (
    <div
      className="w-full h-screen relative flex items-center justify-center"
      style={{ ...customStyles.body, overflow: 'hidden', WebkitFontSmoothing: 'antialiased' }}
    >
      <SVGDefs />

      <div className="relative w-full max-w-6xl px-8 flex items-center justify-center z-10" style={{ height: '700px' }}>
        <div className="relative w-full h-full flex items-center">

          {/* Left green panel */}
          <div
            className="absolute left-4 top-10 bottom-10 flex flex-col justify-between p-10 overflow-hidden rounded-sm"
            style={{
              width: '65%',
              left: '1rem',
              backgroundColor: '#285A35',
              boxShadow: '15px 15px 30px rgba(0,0,0,0.2)',
              border: '1px solid rgba(0,0,0,0.2)',
            }}
          >
            {/* Background star decoration */}
            <svg
              style={{
                position: 'absolute',
                bottom: '-5rem',
                left: '-2.5rem',
                width: '24rem',
                height: '24rem',
                stroke: 'rgba(245,242,235,0.1)',
                fill: 'none',
                transform: 'rotate(-12deg)',
                pointerEvents: 'none',
              }}
            >
              <use href="#star-icon" />
            </svg>

            <div className="relative z-10" style={{ width: '66%' }}>
              <div className="flex items-center gap-4 mb-8">
                <div
                  style={{
                    width: '4rem',
                    height: '4rem',
                    border: '3px solid rgba(245,242,235,0.4)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg style={{ width: '2rem', height: '2rem', stroke: 'rgba(245,242,235,0.8)', fill: 'none' }}>
                    <use href="#star-icon" />
                  </svg>
                </div>
                <div style={{ height: '1px', flexGrow: 1, backgroundColor: 'rgba(245,242,235,0.3)' }}></div>
              </div>

              <h1
                style={{
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: '5rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: '#F5F2EB',
                  lineHeight: 0.85,
                  letterSpacing: '-0.05em',
                  mixBlendMode: 'overlay',
                }}
              >
                Field<br />Notes
              </h1>

              <div
                style={{
                  marginTop: '2rem',
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: '12px',
                  color: 'rgba(245,242,235,0.7)',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  lineHeight: 2,
                }}
              >
                <p>Official Repository</p>
                <p>Est. 1892</p>
              </div>
            </div>

            <div
              className="relative z-10"
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: '10px',
                color: 'rgba(245,242,235,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                lineHeight: 1.8,
                maxWidth: '24rem',
                borderLeft: '2px solid rgba(255,74,28,0.5)',
                paddingLeft: '1rem',
              }}
            >
              Property of the global observation network. Unauthorized access is strictly recorded. Ensure all entries are permanently affixed.
            </div>
          </div>

          {/* Right paper panel */}
          <div
            className="absolute flex flex-col"
            style={{
              right: '3rem',
              top: 0,
              bottom: 0,
              width: '45%',
              minWidth: '450px',
              backgroundColor: '#F5F2EB',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              transform: 'rotate(2deg)',
              zIndex: 20,
              border: '1px solid #E8E1D5',
              position: 'absolute',
            }}
          >
            {/* Paper texture overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(#E8E1D5 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                opacity: 0.5,
                zIndex: -1,
                pointerEvents: 'none',
              }}
            />

            {/* Tape strips */}
            <div
              style={{
                ...customStyles.tapeStrip,
                top: '-10px',
                left: '25%',
                width: '8rem',
                height: '2rem',
                transform: 'rotate(-3deg)',
              }}
            />
            <div
              style={{
                ...customStyles.tapeStrip,
                bottom: '-8px',
                right: '25%',
                width: '6rem',
                height: '1.5rem',
                transform: 'rotate(2deg)',
              }}
            />

            <div className="p-12 flex flex-col h-full">
              {/* Header */}
              <header className="flex justify-between items-start mb-12">
                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#1A1A1A',
                      color: '#F5F2EB',
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: '9px',
                      padding: '0.25rem 0.5rem',
                      marginBottom: '0.75rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Form 4B - Credential Application
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Noto Serif SC', serif",
                      fontWeight: 900,
                      fontSize: '2.25rem',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.025em',
                      color: '#1A1A1A',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Access Entry
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: '11px',
                      color: '#5A564C',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    APP_ID: New_Access_V1
                  </p>
                </div>
                <div style={{ ...customStyles.waxSeal, marginTop: '-1rem', marginRight: '-1rem', zIndex: 30 }}>
                  42
                  <div
                    style={{
                      position: 'absolute',
                      inset: '2px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                    }}
                  />
                </div>
              </header>

              {/* Form */}
              <form
                className="flex-grow relative z-10"
                style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
                onSubmit={(e) => e.preventDefault()}
              >
                <FormField
                  id="observer-name"
                  label="Name / Observer Designation"
                  type="text"
                  placeholder="Dr. Elara Vance"
                  value={formData.name}
                  onChange={handleChange('name')}
                />
                <FormField
                  id="contact-email"
                  label="Contact Email"
                  type="text"
                  placeholder="e.vance@field.net"
                  value={formData.email}
                  onChange={handleChange('email')}
                />
                <FormField
                  id="access-key"
                  label="Access Key"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange('password')}
                />
              </form>

              {/* Footer actions */}
              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #1A1A1A',
                    paddingBottom: '2rem',
                    marginBottom: '1.5rem',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: '10px',
                      color: '#5A564C',
                      lineHeight: 1.8,
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ width: '2.5rem', opacity: 0.5 }}>DATE:</span>
                      <span style={{ fontWeight: 'bold', color: '#1A1A1A' }}>MAY 14, 2024</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ width: '2.5rem', opacity: 0.5 }}>LOC:</span>
                      <span style={{ fontStyle: 'italic' }}>ENCRYPTED_PORT</span>
                    </div>
                  </div>

                  {/* Register stamp button */}
                  <button
                    type="button"
                    onClick={handleRegister}
                    onMouseEnter={() => setStampHovered(true)}
                    onMouseLeave={() => { setStampHovered(false); setStampActive(false); }}
                    onMouseDown={() => setStampActive(true)}
                    onMouseUp={() => setStampActive(false)}
                    style={{
                      ...customStyles.stampBtn,
                      transform: stampTransform,
                    }}
                  >
                    <div style={customStyles.stampInner}>
                      {submitted ? 'SENT!' : 'REGISTER'}
                    </div>
                  </button>
                </div>

                {/* Alternative access */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ height: '1px', backgroundColor: 'rgba(90,86,76,0.2)', flexGrow: 1 }}></div>
                    <span
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: '#5A564C',
                      }}
                    >
                      Alternative Access Protocols
                    </span>
                    <div style={{ height: '1px', backgroundColor: 'rgba(90,86,76,0.2)', flexGrow: 1 }}></div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <SocialButton icon="google" label="Google" />
                    <SocialButton icon="github" label="GitHub" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative beads */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '20%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              zIndex: 30,
              transform: 'translateX(50%)',
            }}
          >
            {[
              { bg: '#3A698A' },
              { bg: '#285A35' },
              { bg: '#FF4A1C' },
            ].map((bead, i) => (
              <div
                key={i}
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '50%',
                  backgroundColor: bead.bg,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(0,0,0,0.2)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom link */}
        <div
          style={{
            position: 'absolute',
            bottom: '-4rem',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: '11px',
              color: 'rgba(26,26,26,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              backgroundColor: '#E8E1D5',
              display: 'inline-block',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(90,86,76,0.2)',
            }}
          >
            Have an account?{' '}
            <a
              href="#"
              style={{
                color: '#FF4A1C',
                fontWeight: 'bold',
                textDecoration: 'none',
                marginLeft: '0.5rem',
              }}
              onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; e.target.style.textDecorationStyle = 'dotted'; }}
              onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; }}
            >
              Access your log
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const SocialButton = ({ icon, label }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        backgroundColor: hovered ? '#1A1A1A' : '#ffffff',
        border: `1px solid ${hovered ? '#1A1A1A' : 'rgba(90,86,76,0.3)'}`,
        padding: '0.625rem 1rem',
        fontFamily: "'Courier Prime', monospace",
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: hovered ? '#F5F2EB' : '#1A1A1A',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
      }}
    >
      {icon === 'google' && (
        <svg style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      {icon === 'github' && (
        <svg style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      )}
      {label}
    </button>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #root { width: 100%; height: 100%; }
      ::selection { background-color: #285A35; color: #F5F2EB; }
      input::placeholder { color: rgba(90, 86, 76, 0.4); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;