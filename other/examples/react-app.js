import React, { useState, useEffect, useRef } from 'react';

const customStyles = {
  root: {
    backgroundColor: '#E6E8E6',
    width: '100%',
    maxWidth: '480px',
    minHeight: '100vh',
    borderLeft: '1px solid #000',
    borderRight: '1px solid #000',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden',
    fontFamily: "'Inter', sans-serif",
    color: '#000',
    lineHeight: '1.2',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    height: '48px',
    borderBottom: '1px solid #000',
  },
  headerLeft: {
    flex: 1,
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    borderRight: '1px solid #000',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    letterSpacing: '0.02em',
  },
  headerRight: {
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.75rem',
    letterSpacing: '0.02em',
  },
  iconSun: {
    width: '14px',
    height: '14px',
    background: 'currentColor',
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  },
  gridRow: {
    borderBottom: '1px solid #000',
    position: 'relative',
  },
  gridRowLast: {
    borderBottom: 'none',
    position: 'relative',
  },
  sectionLabel: {
    padding: '8px 16px',
    borderBottom: '1px solid #000',
    backgroundColor: '#E6E8E6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.75rem',
    letterSpacing: '0.02em',
  },
  asterisk: {
    fontSize: '1.5rem',
    lineHeight: '0.5',
    marginTop: '4px',
  },
  inputArea: {
    padding: '16px',
    backgroundColor: '#E6E8E6',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    background: 'transparent',
    border: 'none',
    resize: 'vertical',
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.25rem',
    color: '#000',
    outline: 'none',
    lineHeight: '1.4',
  },
  analysisContent: {
    padding: '24px 16px',
    fontSize: '1.1rem',
    lineHeight: '1.6',
  },
  correctionDiff: {
    marginBottom: '16px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.75rem',
    letterSpacing: '0.02em',
  },
  wordWrong: {
    textDecoration: 'line-through',
    color: 'rgba(0,0,0,0.5)',
    marginRight: '4px',
  },
  wordCorrect: {
    backgroundColor: '#CCFF00',
    padding: '0 4px',
    fontWeight: 600,
    color: '#000',
    display: 'inline-block',
    border: '1px solid #000',
    transform: 'rotate(-1deg)',
  },
  mentorNote: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '1.5rem',
    color: '#000',
    marginTop: '16px',
    paddingLeft: '12px',
    borderLeft: '2px solid #000',
    fontStyle: 'italic',
  },
  promptArea: {
    backgroundColor: '#FF4D00',
    color: '#000',
    borderBottom: '1px solid #000',
    position: 'relative',
  },
  promptLabel: {
    padding: '8px 16px',
    borderBottom: '1px solid #000',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    letterSpacing: '0.02em',
  },
  promptContent: {
    padding: '24px 16px',
  },
  promptText: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '2.2rem',
    lineHeight: '1',
    marginBottom: '16px',
    wordBreak: 'break-word',
  },
  heavyUnderline: {
    borderBottom: '2px solid #000',
    paddingBottom: '2px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  promptParams: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '16px',
  },
  paramTag: {
    border: '1px solid #000',
    padding: '4px 8px',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    backgroundColor: '#E6E8E6',
  },
  imageOutput: {
    backgroundColor: '#E6E8E6',
    borderBottom: '1px solid #000',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderBottom: '1px solid #000',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#ccc',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'grayscale(100%) contrast(120%)',
  },
  starburstAccent: {
    position: 'absolute',
    bottom: '-20px',
    right: '-20px',
    width: '120px',
    height: '120px',
    backgroundColor: '#CCFF00',
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    border: '1px solid #000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(15deg)',
    zIndex: 10,
  },
  seedBar: {
    padding: '8px 16px',
    borderTop: '1px solid #000',
    borderBottom: 'none',
    backgroundColor: '#E6E8E6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.75rem',
    letterSpacing: '0.02em',
  },
  actionFooter: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    backgroundColor: '#E6E8E6',
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    borderTop: '1px solid #000',
  },
  btnSecondary: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    borderRight: '1px solid #000',
    padding: '16px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    cursor: 'pointer',
    textAlign: 'center',
    color: '#000',
  },
  btnPrimary: {
    appearance: 'none',
    border: 'none',
    backgroundColor: '#000',
    color: '#E6E8E6',
    padding: '16px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    cursor: 'pointer',
    textAlign: 'center',
  },
  btnPrimaryActive: {
    backgroundColor: '#FF4D00',
    color: '#000',
  },
};

const App = () => {
  const [inputText, setInputText] = useState('静かな森で光が差し込んでいる。');
  const [isPrimaryActive, setIsPrimaryActive] = useState(false);
  const [isSecondaryActive, setIsSecondaryActive] = useState(false);

  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      body { background-color: #222; }
      textarea::placeholder { color: rgba(0,0,0,0.4); }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#222', display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={customStyles.root}>

        {/* Header */}
        <header style={customStyles.header}>
          <div style={customStyles.headerLeft}>
            Sensei Vision
          </div>
          <div style={customStyles.headerRight}>
            <div style={customStyles.iconSun}></div>
            AI Active
          </div>
        </header>

        {/* Input Section */}
        <div style={customStyles.gridRow}>
          <div style={customStyles.sectionLabel}>
            <span>Input →</span>
            <span style={customStyles.asterisk}>✴</span>
          </div>
          <div style={customStyles.inputArea}>
            <textarea
              placeholder="Type your idea in Japanese..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={customStyles.textarea}
            />
          </div>
        </div>

        {/* Mentor Analysis Section */}
        <div style={customStyles.gridRow}>
          <div style={customStyles.sectionLabel}>
            <span>Mentor Analysis</span>
          </div>
          <div style={customStyles.analysisContent}>
            <div style={customStyles.correctionDiff}>
              <span style={customStyles.wordWrong}>静かな森で</span>
              <span style={customStyles.wordCorrect}>静寂な森の中で</span>、
              {' '}
              <span style={customStyles.wordWrong}>光が</span>
              <span style={customStyles.wordCorrect}>木漏れ日が</span>
              {' '}差し込んでいる。
            </div>
            <div style={customStyles.mentorNote}>
              "Komorebi" (木漏れ日) specifically captures the beautiful interplay of sunlight filtering through leaves, making your prompt much more poetic and descriptive for the AI.
            </div>
          </div>
        </div>

        {/* Generated Prompt Section */}
        <div style={customStyles.promptArea}>
          <div style={customStyles.promptLabel}>
            Generated Prompt →
          </div>
          <div style={customStyles.promptContent}>
            <div style={customStyles.promptText}>
              <span style={customStyles.heavyUnderline}>A serene forest</span>
              {' '}
              <span style={customStyles.heavyUnderline}>illuminated by komorebi.</span>
            </div>
            <div style={customStyles.promptParams}>
              <span style={customStyles.paramTag}>--ar 4:5</span>
              <span style={customStyles.paramTag}>--style raw</span>
              <span style={customStyles.paramTag}>--v 6.0</span>
            </div>
          </div>
        </div>

        {/* Image Output Section */}
        <div style={customStyles.imageOutput}>
          <div style={customStyles.sectionLabel}>
            <span>Vision Output →</span>
          </div>
          <div style={customStyles.imageContainer}>
            <img
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Forest sunlight"
              style={customStyles.image}
            />
            <div style={customStyles.starburstAccent}></div>
          </div>
          <div style={customStyles.seedBar}>
            <span>Seed: 8472910</span>
            <span style={{ fontWeight: 600, cursor: 'pointer' }}>Download High-Res</span>
          </div>
        </div>

        {/* Action Footer */}
        <div style={customStyles.actionFooter}>
          <button
            style={{
              ...customStyles.btnSecondary,
              ...(isSecondaryActive ? { backgroundColor: '#CCFF00', color: '#000' } : {}),
            }}
            onMouseDown={() => setIsSecondaryActive(true)}
            onMouseUp={() => setIsSecondaryActive(false)}
            onMouseLeave={() => setIsSecondaryActive(false)}
            onTouchStart={() => setIsSecondaryActive(true)}
            onTouchEnd={() => setIsSecondaryActive(false)}
          >
            Refine Text
          </button>
          <button
            style={{
              ...customStyles.btnPrimary,
              ...(isPrimaryActive ? customStyles.btnPrimaryActive : {}),
            }}
            onMouseDown={() => setIsPrimaryActive(true)}
            onMouseUp={() => setIsPrimaryActive(false)}
            onMouseLeave={() => setIsPrimaryActive(false)}
            onTouchStart={() => setIsPrimaryActive(true)}
            onTouchEnd={() => setIsPrimaryActive(false)}
          >
            Generate Vision
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;