import React, { useState, useEffect } from 'react';

const customStyles = {
  app: {
    backgroundColor: '#E6E8E6',
    width: '400px',
    height: '867px',
    borderRadius: '20px',
    border: '1px solid #000000',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  masthead: {
    padding: '32px 16px 16px 16px',
    borderBottom: '3px solid #000000',
    textAlign: 'center',
    position: 'relative',
  },
  mastheadH1: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '4.5rem',
    lineHeight: '0.85',
    textTransform: 'uppercase',
    letterSpacing: '-0.04em',
    marginBottom: '8px',
  },
  mastheadMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid #000000',
    paddingTop: '4px',
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '0.4fr 1fr',
    flexGrow: 1,
  },
  sidebarCol: {
    borderRight: '1px solid #000000',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  contentCol: {
    padding: '24px 16px',
    position: 'relative',
  },
  verticalTag: {
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    transform: 'rotate(180deg)',
    fontWeight: '600',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    opacity: '0.6',
  },
  loginSection: {
    marginTop: '20px',
  },
  sectionTitle: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '2rem',
    fontStyle: 'italic',
    marginBottom: '32px',
    borderBottom: '1px solid #000000',
    paddingBottom: '8px',
  },
  formRow: {
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
  },
  formLabel: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '8px',
    fontFamily: "'Inter', sans-serif",
  },
  formInput: {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #000000',
    padding: '8px 0',
    fontFamily: "'Instrument Serif', serif",
    fontSize: '1.5rem',
    outline: 'none',
  },
  starburstContainer: {
    position: 'absolute',
    top: '-30px',
    right: '-30px',
    width: '100px',
    height: '100px',
    backgroundColor: '#CCFF00',
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    border: '1px solid #000000',
    zIndex: 5,
    animation: 'rotate 20s linear infinite',
  },
  footer: {
    borderTop: '3px solid #000000',
    display: 'flex',
  },
  btnPrimary: {
    flex: 1,
    padding: '24px',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    cursor: 'pointer',
    backgroundColor: '#000000',
    color: '#E6E8E6',
  },
  btnSecondary: {
    flex: 1,
    padding: '24px',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    cursor: 'pointer',
    backgroundColor: '#FF4D00',
    color: '#000000',
    borderRight: '1px solid #000000',
  },
  imageTeaser: {
    marginTop: 'auto',
    border: '1px solid #000000',
    aspectRatio: '1',
    overflow: 'hidden',
    filter: 'grayscale(1) contrast(1.2)',
  },
  quoteRow: {
    marginTop: '40px',
    border: 'none',
    fontFamily: "'Instrument Serif', serif",
    fontSize: '0.9rem',
    lineHeight: '1.4',
    display: 'flex',
    flexDirection: 'column',
  },
};

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      body {
        background-color: #222;
        display: flex;
        justify-content: center;
        font-family: 'Inter', sans-serif;
        color: #000000;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handlePrimaryActive = (e) => {
    e.currentTarget.style.backgroundColor = '#CCFF00';
    e.currentTarget.style.color = '#000000';
  };

  const handlePrimaryInactive = (e) => {
    e.currentTarget.style.backgroundColor = '#000000';
    e.currentTarget.style.color = '#E6E8E6';
  };

  const handleSecondaryActive = (e) => {
    e.currentTarget.style.backgroundColor = '#CCFF00';
    e.currentTarget.style.color = '#000000';
  };

  const handleSecondaryInactive = (e) => {
    e.currentTarget.style.backgroundColor = '#FF4D00';
    e.currentTarget.style.color = '#000000';
  };

  return (
    <div style={{ backgroundColor: '#222', display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={customStyles.app}>

        {/* Masthead */}
        <header style={customStyles.masthead}>
          <div style={customStyles.starburstContainer}></div>
          <h1 style={customStyles.mastheadH1}>
            Sensei<br />Vision
          </h1>
          <div style={customStyles.mastheadMeta}>
            <span>Tokyo // New York</span>
            <span>Vol. 01 — Ed. 04</span>
            <span>AI Assisted</span>
          </div>
        </header>

        {/* Main Grid */}
        <div style={customStyles.mainGrid}>
          {/* Sidebar */}
          <div style={customStyles.sidebarCol}>
            <div style={customStyles.verticalTag}>Visual Intelligence</div>
            <div style={customStyles.imageTeaser}>
              <img
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80"
                alt="Detail"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Content */}
          <div style={customStyles.contentCol}>
            <div style={customStyles.loginSection}>
              <h2 style={customStyles.sectionTitle}>Identification</h2>

              <div style={customStyles.formRow}>
                <label style={customStyles.formLabel}>Username / Email</label>
                <input
                  type="text"
                  placeholder="user_id..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={customStyles.formInput}
                  onFocus={(e) => { e.target.style.borderBottomWidth = '2px'; }}
                  onBlur={(e) => { e.target.style.borderBottomWidth = '1px'; }}
                />
              </div>

              <div style={customStyles.formRow}>
                <label style={customStyles.formLabel}>Access Phrase</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={customStyles.formInput}
                  onFocus={(e) => { e.target.style.borderBottomWidth = '2px'; }}
                  onBlur={(e) => { e.target.style.borderBottomWidth = '1px'; }}
                />
              </div>

              <div style={customStyles.quoteRow}>
                <p>"The objective of the sensei is not to provide the answer, but to provide the tool for seeing."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={customStyles.footer}>
          <button
            style={customStyles.btnSecondary}
            onMouseDown={handleSecondaryActive}
            onMouseUp={handleSecondaryInactive}
            onTouchStart={handleSecondaryActive}
            onTouchEnd={handleSecondaryInactive}
          >
            Join Order
          </button>
          <button
            style={customStyles.btnPrimary}
            onMouseDown={handlePrimaryActive}
            onMouseUp={handlePrimaryInactive}
            onTouchStart={handlePrimaryActive}
            onTouchEnd={handlePrimaryInactive}
          >
            Establish Link
          </button>
        </footer>

      </div>
    </div>
  );
};

export default App;