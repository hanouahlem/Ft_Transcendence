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
  tapeStrip: {
    backgroundColor: '#FF4A1C',
    opacity: 0.85,
    mixBlendMode: 'multiply',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  stampBox: {
    border: '2px solid rgba(90,86,76,0.4)',
    padding: '10px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: '2px',
    opacity: 0.6,
    transform: 'rotate(-3deg)',
    display: 'inline-block',
    color: '#FF4A1C',
    fontFamily: 'Courier Prime, monospace',
    fontSize: '12px',
  },
  verticalThread: {
    position: 'absolute',
    left: '24px',
    top: 0,
    bottom: 0,
    width: '2px',
    background: `repeating-linear-gradient(
      to bottom,
      #3A698A 0,
      #3A698A 10px,
      transparent 10px,
      transparent 20px
    )`,
    opacity: 0.3,
  },
  sketchCanvas: {
    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  },
  mainCard: {
    boxShadow: '10px 15px 40px rgba(26,26,26,0.15)',
    transform: 'rotate(0.5deg)',
  },
  commitBtn: {
    backgroundColor: '#1A1A1A',
    color: '#F5F2EB',
    fontFamily: 'Courier Prime, monospace',
    fontWeight: 'bold',
    padding: '12px 32px',
    transform: 'rotate(-1deg)',
    boxShadow: '4px 4px 0 #FF4A1C',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  commitBtnHover: {
    backgroundColor: '#FF4A1C',
    transform: 'rotate(0deg)',
    boxShadow: '4px 4px 0 #FF4A1C',
  },
  commitBtnActive: {
    boxShadow: 'none',
    transform: 'translateX(1px) translateY(1px)',
  },
  photoSlot: {
    aspectRatio: '1/1',
    backgroundColor: '#D4C9B3',
    border: '1px dashed #5A564C',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  formInput: {
    background: 'transparent',
    borderBottom: '1px dashed #5A564C',
    padding: '2px 4px',
    fontFamily: 'Courier Prime, monospace',
    fontSize: '14px',
    color: '#1A1A1A',
    width: '100%',
    outline: 'none',
  },
};

const TagPill = ({ children, colorClass, hoverClass }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      className={`px-2 py-1 font-mono text-xs rounded cursor-pointer transition-colors ${hovered ? hoverClass : colorClass}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </span>
  );
};

const SketchToolButton = ({ children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        width: '24px',
        height: '24px',
        backgroundColor: hovered ? '#1A1A1A' : '#D4C9B3',
        color: hovered ? 'white' : '#1A1A1A',
        border: '1px solid #5A564C',
        fontSize: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
};

const FormInput = ({ label, type = 'text', placeholder, value, readOnly, italic, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px', color: '#5A564C', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...customStyles.formInput,
          borderBottomStyle: focused ? 'solid' : 'dashed',
          borderBottomColor: focused ? '#FF4A1C' : '#5A564C',
          fontStyle: italic ? 'italic' : 'normal',
          opacity: readOnly ? 0.6 : 1,
          cursor: readOnly ? 'not-allowed' : 'text',
        }}
      />
    </div>
  );
};

const Sidebar = ({ sidebarHovered, setSidebarHovered }) => {
  return (
    <aside
      style={{
        width: sidebarHovered ? '240px' : '72px',
        transition: 'width 0.2s ease-out',
        flexShrink: 0,
        display: 'none',
        flexDirection: 'column',
        padding: '32px 12px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        backgroundColor: '#E8E1D5',
        borderRight: '1px solid rgba(26,26,26,0.1)',
        overflow: 'hidden',
      }}
      className="hidden lg:flex"
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', padding: '0 8px' }}>
        <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: 'rotate(-6deg)' }}>
          <svg className="w-8 h-8" fill="none" stroke="#1A1A1A" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#1A1A1A', opacity: sidebarHovered ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap', fontFamily: 'Noto Serif SC, serif' }}>
          Field Notes
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, justifyContent: 'center' }}>
        {[
          { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />, label: 'Timeline', active: false },
          { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />, label: 'Discoveries', active: false },
          { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />, label: 'New Entry', active: true },
        ].map((item, i) => (
          <NavItem key={i} icon={item.icon} label={item.label} active={item.active} sidebarHovered={sidebarHovered} />
        ))}
      </nav>
    </aside>
  );
};

const NavItem = ({ icon, label, active, sidebarHovered }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: active || hovered ? 'rgba(26,26,26,0.05)' : 'transparent',
        transition: 'all 0.2s',
        textDecoration: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg style={{ width: '28px', height: '28px', color: active ? '#1A1A1A' : '#5A564C', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
      <span style={{
        fontWeight: '600',
        fontSize: '14px',
        color: active ? '#1A1A1A' : '#5A564C',
        opacity: sidebarHovered ? 1 : 0,
        transition: 'opacity 0.2s',
        whiteSpace: 'nowrap',
        fontFamily: 'Noto Serif SC, serif',
      }}>
        {label}
      </span>
    </a>
  );
};

const RightSidebar = () => (
  <aside style={{ width: '280px', flexShrink: 0, display: 'none', flexDirection: 'column', gap: '24px', position: 'sticky', top: '48px', height: 'fit-content', padding: '32px 32px 32px 0' }} className="hidden xl:flex">
    <div style={{ backgroundColor: 'rgba(232,225,213,0.5)', padding: '24px', border: '1px solid rgba(90,86,76,0.2)', transform: 'rotate(1deg)' }}>
      <h3 style={{ fontWeight: 'bold', fontFamily: 'Noto Serif SC, serif', fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid rgba(90,86,76,0.4)', paddingBottom: '4px', color: '#1A1A1A' }}>
        Observer Handbook
      </h3>
      <ul style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px', color: '#5A564C', display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
        <li>• Always verify GPS calibration before logging location.</li>
        <li>• Include reference scale in all anatomical sketches.</li>
        <li>• Scientific names must follow binomial nomenclature.</li>
      </ul>
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '4px' }}>
        <div style={{ width: '8px', height: '8px', backgroundColor: '#3A698A', borderRadius: '50%' }}></div>
        <div style={{ width: '8px', height: '8px', backgroundColor: '#3A698A', borderRadius: '50%' }}></div>
      </div>
    </div>

    <div style={{ backgroundColor: '#F5F2EB', padding: '24px', border: '2px dashed rgba(90,86,76,0.2)', transform: 'rotate(-1deg)', opacity: 0.8 }}>
      <p style={{ fontFamily: 'Noto Serif SC, serif', fontStyle: 'italic', fontSize: '14px', textAlign: 'center', color: '#1A1A1A' }}>
        "To observe without record is to lose a piece of the world's song."
      </p>
    </div>
  </aside>
);

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    location: '',
    email: 'james@fieldnotes.org',
    password: '',
    observations: '',
  });
  const [commitHovered, setCommitHovered] = useState(false);
  const [commitActive, setCommitActive] = useState(false);
  const [photoSlotHovered, setPhotoSlotHovered] = useState(false);
  const [activeTags, setActiveTags] = useState(['#Flora', '#Avian']);
  const [saveDraftMsg, setSaveDraftMsg] = useState(false);
  const [commitMsg, setCommitMsg] = useState(false);
  const [lastSync, setLastSync] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTagClick = (tag) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveDraft = () => {
    setSaveDraftMsg(true);
    setLastSync(0);
    setTimeout(() => setSaveDraftMsg(false), 2000);
  };

  const handleCommit = () => {
    setCommitMsg(true);
    setLastSync(0);
    setTimeout(() => setCommitMsg(false), 2500);
  };

  const getCommitBtnStyle = () => {
    let s = { ...customStyles.commitBtn };
    if (commitActive) {
      s = { ...s, ...customStyles.commitBtnActive };
    } else if (commitHovered) {
      s = { ...s, ...customStyles.commitBtnHover };
    }
    return s;
  };

  const tags = [
    { label: '#Flora', colorClass: 'bg-green-900/10 text-green-900 border border-green-900/30', hoverClass: 'bg-green-900 text-white border border-green-900' },
    { label: '#Avian', colorClass: 'bg-blue-800/10 text-blue-800 border border-blue-800/30', hoverClass: 'bg-blue-800 text-white border border-blue-800' },
    { label: '#Migration', colorClass: 'bg-gray-500/10 text-gray-500 border border-gray-500/30', hoverClass: 'bg-gray-500 text-white border border-gray-500' },
  ];

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '896px', backgroundColor: 'white', padding: '48px', position: 'relative', ...customStyles.mainCard }}>
        {/* Tape strip */}
        <div style={{ ...customStyles.tapeStrip, position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%) rotate(1deg)', width: '128px', height: '32px', zIndex: 30 }}></div>
        {/* Vertical thread */}
        <div style={customStyles.verticalThread}></div>

        {/* Header */}
        <div style={{ paddingLeft: '40px', marginBottom: '32px', borderBottom: '2px solid #1A1A1A', paddingBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'Noto Serif SC, serif', fontWeight: '900', fontSize: '30px', letterSpacing: '-0.05em', textTransform: 'uppercase', marginBottom: '4px', color: '#1A1A1A' }}>
              Profile Configuration
            </h1>
            <p style={{ fontFamily: 'Courier Prime, monospace', fontSize: '11px', color: '#5A564C', textTransform: 'uppercase', letterSpacing: '4px' }}>
              User Settings / Registry Alpha
            </p>
          </div>
          <div style={customStyles.stampBox}>
            {commitMsg ? 'COMMITTED!' : 'PENDING VERIFICATION'}
          </div>
        </div>

        {/* Form Grid */}
        <div style={{ paddingLeft: '40px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
          {/* Left Column */}
          <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '24px' }} className="md:col-span-4">
            <FormInput label="01. Display name" placeholder="Display name" value={formData.displayName} onChange={e => setFormData(p => ({ ...p, displayName: e.target.value }))} />
            <FormInput label="02. username" placeholder="@username" value={formData.username} italic onChange={e => setFormData(p => ({ ...p, username: e.target.value }))} />
            <FormInput label="03. location" placeholder="Portland, OR" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
            <FormInput label="04. email" type="email" value={formData.email} readOnly onChange={() => {}} />
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px', color: '#5A564C', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                05. Visual Capture
              </label>
              <div
                style={{
                  ...customStyles.photoSlot,
                  backgroundColor: photoSlotHovered ? '#E8E1D5' : '#D4C9B3',
                  borderColor: photoSlotHovered ? '#FF4A1C' : '#5A564C',
                  borderRadius: '2px',
                }}
                onMouseEnter={() => setPhotoSlotHovered(true)}
                onMouseLeave={() => setPhotoSlotHovered(false)}
                onClick={() => alert('Photo upload would open here')}
              >
                <svg style={{ width: '24px', height: '24px', color: '#5A564C', marginBottom: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                <span style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px', color: '#5A564C' }}>[ ATTACH PHOTO ]</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '24px' }} className="md:col-span-8">
            <div style={{ position: 'relative' }}>
              <label style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px', color: '#5A564C', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                06. Anatomical Sketch Area
              </label>
              <div style={{ width: '100%', height: '256px', border: '1px solid rgba(90,86,76,0.3)', position: 'relative', backgroundColor: '#F5F2EB', ...customStyles.sketchCanvas }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Courier Prime, monospace', fontSize: '12px', color: 'rgba(90,86,76,0.3)', fontStyle: 'italic' }}>
                    Initialize drawing tool or upload vector...
                  </span>
                </div>
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                  <SketchToolButton>✎</SketchToolButton>
                  <SketchToolButton>♺</SketchToolButton>
                </div>
              </div>
              <div style={{ position: 'absolute', top: '-12px', right: '-12px', opacity: 0.4, transform: 'scale(0.5)', transformOrigin: 'top right' }}>
                <svg width="32" height="32" viewBox="0 0 50 50" fill="none" stroke="#FF4A1C" strokeWidth="1.5">
                  <polygon points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20" />
                  <line x1="15" y1="15" x2="35" y2="35" />
                  <line x1="15" y1="35" x2="35" y2="15" />
                </svg>
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px', color: '#5A564C', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                07. Narrative Field Observations
              </label>
              <textarea
                style={{ width: '100%', height: '128px', backgroundColor: '#F5F2EB', borderBottom: '2px solid rgba(26,26,26,0.1)', outline: 'none', padding: '12px', fontFamily: 'Noto Serif SC, serif', fontSize: '18px', lineHeight: '1.75', resize: 'vertical', boxSizing: 'border-box', color: '#1A1A1A' }}
                placeholder="Describe behavior, habitat, and interactions..."
                value={formData.observations}
                onChange={e => setFormData(p => ({ ...p, observations: e.target.value }))}
              />
            </div>

            <FormInput label="08. password" type="password" placeholder="Enter new password..." value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
          </div>

          {/* Bottom Row */}
          <div style={{ gridColumn: 'span 12', paddingTop: '24px', borderTop: '1px dashed rgba(90,86,76,0.4)', display: 'flex', flexDirection: 'column', gap: '24px' }} className="md:flex-row md:justify-between md:items-end">
            <div style={{ flex: 1 }}>
              <label style={{ fontFamily: 'Courier Prime, monospace', fontSize: '10px', color: '#5A564C', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                09. Taxonomy Tags
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tags.map(tag => (
                  <span
                    key={tag.label}
                    onClick={() => handleTagClick(tag.label)}
                    style={{
                      padding: '4px 8px',
                      fontFamily: 'Courier Prime, monospace',
                      fontSize: '12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: activeTags.includes(tag.label) ? (tag.label === '#Flora' ? '#285A35' : tag.label === '#Avian' ? '#3A698A' : '#5A564C') : 'transparent',
                      color: activeTags.includes(tag.label) ? 'white' : (tag.label === '#Flora' ? '#285A35' : tag.label === '#Avian' ? '#3A698A' : '#5A564C'),
                      border: `1px solid ${tag.label === '#Flora' ? 'rgba(40,90,53,0.3)' : tag.label === '#Avian' ? 'rgba(58,105,138,0.3)' : 'rgba(90,86,76,0.3)'}`,
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
                <span
                  style={{ padding: '4px 8px', border: '1px dashed rgba(90,86,76,0.3)', fontFamily: 'Courier Prime, monospace', fontSize: '12px', color: '#5A564C', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => alert('Tag input would open here')}
                >
                  + ADD TAG
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              <button
                style={{ fontFamily: 'Courier Prime, monospace', fontSize: '12px', color: saveDraftMsg ? '#FF4A1C' : '#5A564C', textTransform: 'uppercase', letterSpacing: '4px', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                onClick={handleSaveDraft}
              >
                {saveDraftMsg ? '[ DRAFT SAVED! ]' : '[ Save Draft ]'}
              </button>
              <button
                style={getCommitBtnStyle()}
                onMouseEnter={() => setCommitHovered(true)}
                onMouseLeave={() => { setCommitHovered(false); setCommitActive(false); }}
                onMouseDown={() => setCommitActive(true)}
                onMouseUp={() => setCommitActive(false)}
                onClick={handleCommit}
              >
                COMMIT TO LEDGER →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', paddingTop: '16px', borderTop: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4, filter: 'grayscale(1)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#1A1A1A', borderRadius: '2px' }}></div>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#1A1A1A', borderRadius: '2px' }}></div>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#1A1A1A', borderRadius: '2px' }}></div>
          </div>
          <div style={{ fontFamily: 'Courier Prime, monospace', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '4px', color: '#1A1A1A' }}>
            AUTHENTIC FIELD DOCUMENTATION / PROPERTY OF VANCE EXPEDITIONS
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Courier Prime, monospace', fontSize: '10px', color: '#5A564C', fontStyle: 'italic' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF4A1C' }}></div>
          Auto-save enabled: Last sync {lastSync}s ago
        </div>
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
        background-image: 
          linear-gradient(rgba(26, 26, 26, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26, 26, 26, 0.05) 1px, transparent 1px);
        background-size: 40px 40px;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
      }

      ::selection {
        background-color: #FF4A1C;
        color: #F5F2EB;
      }

      textarea::placeholder {
        font-style: italic;
        color: rgba(90,86,76,0.4);
      }

      input::placeholder {
        color: rgba(90,86,76,0.5);
      }

      @media (min-width: 768px) {
        .md-col-4 { grid-column: span 4; }
        .md-col-8 { grid-column: span 8; }
        .md-flex-row { flex-direction: row; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', minHeight: '100vh' }}>
        <Sidebar sidebarHovered={sidebarHovered} setSidebarHovered={setSidebarHovered} />
        <Routes>
          <Route path="/" element={<ProfilePage />} />
        </Routes>
        <RightSidebar />
      </div>
    </Router>
  );
};

export default App;