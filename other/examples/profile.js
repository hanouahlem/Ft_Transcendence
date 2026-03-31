import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

const customStyles = {
  body: {
    backgroundColor: '#F5F2EB',
    color: '#1A1A1A',
    backgroundImage: 'radial-gradient(#E8E1D5 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    overflowX: 'hidden',
  },
  tape: {
    background: 'rgba(220, 210, 180, 0.4)',
    backdropFilter: 'blur(1px)',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)',
    width: '80px',
    height: '25px',
    position: 'absolute',
    zIndex: 30,
  },
  specimenCase: {
    border: '1px solid rgba(0,0,0,0.1)',
    background: 'rgba(255,255,255,0.4)',
    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)',
  },
  handwritten: {
    fontFamily: "'Shadows Into Light', cursive",
    color: '#2b3a67',
    lineHeight: 1.2,
  },
  stampText: {
    mixBlendMode: 'multiply',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  photoImg: {
    filter: 'grayscale(100%) contrast(1.1) sepia(20%)',
    mixBlendMode: 'multiply',
  },
  tornEdge: {
    position: 'relative',
    zIndex: 1,
  },
};

const SVGDefs = () => (
  <svg style={{ width: 0, height: 0, position: 'absolute' }}>
    <filter id="torn-paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="torn-paper-heavy">
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

const OrangeStar = ({ className = '', style = {} }) => (
  <div
    className={className}
    style={{
      position: 'absolute',
      width: '28px',
      height: '28px',
      zIndex: 20,
      ...style,
    }}
  >
    <svg
      style={{
        width: '100%',
        height: '100%',
        stroke: '#FF4A1C',
        strokeWidth: 2,
        fill: 'none',
      }}
    >
      <use href="#orange-star" />
    </svg>
  </div>
);

const Tape = ({ style = {} }) => (
  <div
    style={{
      ...customStyles.tape,
      ...style,
    }}
  />
);

const ProfileCard = () => (
  <div
    className="bg-paper-mid p-8 transform -rotate-2 border border-black/10 relative"
    style={{ ...customStyles.tornEdge, filter: 'url(#torn-paper)' }}
  >
    <Tape style={{ top: '-10px', left: '30%', transform: 'rotate(-5deg)' }} />

    <div className="w-40 h-40 mx-auto bg-paper-dark border-4 border-white shadow-lg transform rotate-3 mb-6 relative">
      <img
        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
        className="w-full h-full object-cover"
        alt="Researcher"
        style={customStyles.photoImg}
      />
      <OrangeStar style={{ bottom: '-8px', right: '-8px' }} />
    </div>

    <div className="text-center">
      <h1
        className="text-3xl font-black leading-none mb-1"
        style={customStyles.stampText}
      >
        Elara Vance
      </h1>
      <p className="font-mono text-sm text-ink-fade mb-4">@fieldnotes_ev</p>
      <p className="text-xl px-4 italic" style={{ ...customStyles.handwritten, fontSize: '1.25rem' }}>
        "Collecting the whispers of the Northern Woods before the winter hush."
      </p>
    </div>

    <div className="mt-8 pt-6 border-t border-dashed border-ink-fade space-y-3 font-mono text-xs uppercase tracking-widest">
      <div className="flex justify-between">
        <span>Rank</span>
        <span className="font-bold">Senior Observer</span>
      </div>
      <div className="flex justify-between">
        <span>Joined</span>
        <span className="font-bold">May 12, 1994</span>
      </div>
      <div className="flex justify-between">
        <span>Climate</span>
        <span className="font-bold">Sub-Arctic</span>
      </div>
    </div>
  </div>
);

const LedgerSummary = () => (
  <div
    className="bg-paper-dark p-6 transform rotate-1 ml-4 relative"
    style={{ ...customStyles.tornEdge, filter: 'url(#torn-paper)' }}
  >
    <div className="font-mono text-[10px] text-ink-fade border-b border-ink-fade/20 pb-1 mb-3">
      FIELD LEDGER SUMMARY
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center border-r border-ink-fade/20">
        <div className="text-2xl font-black">1,482</div>
        <div className="font-mono text-[9px] uppercase tracking-tighter">Total Records</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-black">8.9K</div>
        <div className="font-mono text-[9px] uppercase tracking-tighter">Observers</div>
      </div>
    </div>
  </div>
);

const NavCard = ({ activeTab, setActiveTab }) => {
  const navItems = ['Timeline', 'Atlas', 'Specimens', 'Contact'];

  return (
    <div
      className="bg-ink-black text-paper-light p-5 transform -rotate-3 shadow-xl relative"
      style={{ ...customStyles.tornEdge, marginLeft: '-20px', filter: 'url(#torn-paper)' }}
    >
      <nav className="flex flex-col gap-2 font-bold uppercase tracking-widest text-sm">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item.toLowerCase())}
            className="hover:text-thread-orange transition-colors flex items-center justify-between w-full text-left"
            style={{
              color: activeTab === item.toLowerCase() ? '#FF4A1C' : undefined,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {item} <span>→</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const BioSection = () => (
  <div
    className="bg-white p-10 transform rotate-1 shadow-sm relative"
    style={{ ...customStyles.tornEdge, filter: 'url(#torn-paper-heavy)' }}
  >
    <div className="absolute top-4 right-6 font-mono text-xs text-ink-fade">REF: BIO_LOG_01</div>
    <div className="max-w-lg">
      <h3
        className="text-2xl font-black mb-4 border-b-2 border-ink-black pb-2"
        style={customStyles.stampText}
      >
        Field Notes &amp; Bio
      </h3>
      <p className="text-lg leading-relaxed mb-6">
        An ethnobotanist by training and a wanderer by nature. My work focuses on the intersection
        of fungal networks and local folklore in the hemlock forests of the northeast.
      </p>
      <div
        className="text-2xl mt-8"
        style={{ ...customStyles.handwritten, fontSize: '1.5rem', transform: 'rotate(-1deg)', color: '#3A698A' }}
      >
        Current focus: Mapping the bioluminescent migration of forest floor spores. The dampness
        this season is unprecedented. Must remember to check the hollow log by the creek.
      </div>
    </div>

    <div
      className="absolute -bottom-10 -right-4 w-56 h-64 bg-paper-mid p-3 shadow-xl transform rotate-6 border border-black/5"
      style={{ zIndex: 10 }}
    >
      <img
        src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop"
        className="w-full h-48 object-cover grayscale"
        alt="Forest View"
      />
      <div className="text-sm mt-2 text-center" style={customStyles.handwritten}>
        North Creek, Dusk
      </div>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-bead-blue rounded-full border-2 border-white shadow-inner flex items-center justify-center text-paper-light text-[10px]">
        PIN
      </div>
    </div>
  </div>
);

const SpecimenCard = ({ icon, name, location, rotation }) => (
  <div
    className="bg-paper-light p-4 relative"
    style={{
      ...customStyles.tornEdge,
      ...customStyles.specimenCase,
      transform: `rotate(${rotation}deg)`,
      filter: 'url(#torn-paper)',
    }}
  >
    <div className="w-full h-32 flex items-center justify-center opacity-60 grayscale mb-3">
      <img src={icon} className="w-16 opacity-40" alt="Specimen icon" />
    </div>
    <div className="border-t border-dashed border-ink-fade pt-2 text-center">
      <div className="font-mono text-[10px] uppercase font-bold">{name}</div>
      <div className="font-mono text-[8px] text-ink-fade">{location}</div>
    </div>
  </div>
);

const SpecimensSection = () => (
  <div className="mt-8">
    <h3
      className="font-bold text-xl mb-6 flex items-center gap-3"
      style={customStyles.stampText}
    >
      <span className="w-8 h-0.5 bg-ink-black inline-block"></span>
      Collected Specimens
    </h3>
    <div className="grid grid-cols-3 gap-6">
      <SpecimenCard
        icon="https://img.icons8.com/ios/100/leaf.png"
        name="Acer Rubrum"
        location="SITE 4 // OCT 24"
        rotation={-2}
      />
      <SpecimenCard
        icon="https://img.icons8.com/ios/100/feather.png"
        name="Strix Varia"
        location="RIVER EDGE // NOV 02"
        rotation={1}
      />
      <SpecimenCard
        icon="https://img.icons8.com/ios/100/shellfish.png"
        name="Dry Fossils"
        location="CAVE B // SEPT 15"
        rotation={-1}
      />
    </div>
  </div>
);

const QuoteCard = () => (
  <div
    className="bg-paper-dark p-6 transform -rotate-1 self-start mt-4 max-w-sm relative"
    style={{ ...customStyles.tornEdge, marginLeft: '5rem', filter: 'url(#torn-paper)' }}
  >
    <OrangeStar style={{ top: '-12px', left: '-12px', transform: 'scale(0.75)' }} />
    <div className="text-lg leading-tight" style={{ ...customStyles.handwritten, fontSize: '1.125rem' }}>
      "Observation is not just seeing; it is a way of waiting for the world to reveal itself."
    </div>
  </div>
);

const TimelineContent = () => (
  <div
    className="bg-white p-10 transform rotate-1 shadow-sm relative"
    style={{ ...customStyles.tornEdge, filter: 'url(#torn-paper-heavy)' }}
  >
    <div className="absolute top-4 right-6 font-mono text-xs text-ink-fade">REF: TIME_LOG_01</div>
    <h3 className="text-2xl font-black mb-6 border-b-2 border-ink-black pb-2" style={customStyles.stampText}>
      Field Timeline
    </h3>
    <div className="space-y-6">
      {[
        { date: 'NOV 02', title: 'Strix Varia Sighting', desc: 'Barred owl observed at River Edge site during evening survey.' },
        { date: 'OCT 24', title: 'Acer Rubrum Collected', desc: 'Red maple specimen collected at Site 4, peak autumn coloration.' },
        { date: 'SEPT 15', title: 'Cave B Excavation', desc: 'Dry fossils uncovered in the limestone cave near the northern trail.' },
        { date: 'AUG 30', title: 'Fungal Network Mapping', desc: 'Completed first quadrant map of bioluminescent spore migration paths.' },
      ].map((item, i) => (
        <div key={i} className="flex gap-4 items-start">
          <div className="font-mono text-[10px] uppercase text-ink-fade w-16 shrink-0 pt-1">{item.date}</div>
          <div className="flex-1 border-l border-dashed border-ink-fade pl-4">
            <div className="font-mono text-sm font-bold uppercase">{item.title}</div>
            <div className="text-sm leading-relaxed mt-1">{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AtlasContent = () => (
  <div
    className="bg-white p-10 transform rotate-1 shadow-sm relative"
    style={{ ...customStyles.tornEdge, filter: 'url(#torn-paper-heavy)' }}
  >
    <div className="absolute top-4 right-6 font-mono text-xs text-ink-fade">REF: ATLAS_01</div>
    <h3 className="text-2xl font-black mb-6 border-b-2 border-ink-black pb-2" style={customStyles.stampText}>
      Field Atlas
    </h3>
    <div className="grid grid-cols-2 gap-6">
      {[
        { name: 'Northern Hemlock Forest', coords: '44.2°N, 72.8°W', visits: 12 },
        { name: 'River Edge Site', coords: '44.1°N, 72.9°W', visits: 8 },
        { name: 'Cave B - Limestone', coords: '44.3°N, 72.7°W', visits: 5 },
        { name: 'North Creek Basin', coords: '44.0°N, 72.8°W', visits: 15 },
      ].map((loc, i) => (
        <div key={i} className="bg-paper-light p-4 border border-dashed border-ink-fade">
          <div className="font-mono text-xs font-bold uppercase mb-1">{loc.name}</div>
          <div className="font-mono text-[10px] text-ink-fade">{loc.coords}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="font-mono text-[9px] uppercase">Visits:</div>
            <div className="font-bold text-sm">{loc.visits}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ContactContent = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
    }
  };

  return (
    <div
      className="bg-white p-10 transform rotate-1 shadow-sm relative"
      style={{ ...customStyles.tornEdge, filter: 'url(#torn-paper-heavy)' }}
    >
      <div className="absolute top-4 right-6 font-mono text-xs text-ink-fade">REF: CONTACT_01</div>
      <h3 className="text-2xl font-black mb-6 border-b-2 border-ink-black pb-2" style={customStyles.stampText}>
        Contact the Observer
      </h3>
      {submitted ? (
        <div className="py-8 text-center">
          <div className="text-2xl mb-2" style={customStyles.handwritten}>
            Message received!
          </div>
          <div className="font-mono text-sm text-ink-fade">We'll be in touch from the field.</div>
          <button
            onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
            className="mt-6 font-mono text-xs uppercase tracking-widest border border-ink-black px-4 py-2 hover:bg-ink-black hover:text-paper-light transition-colors"
          >
            Send Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-dashed border-ink-fade bg-paper-light p-2 font-mono text-sm outline-none"
              required
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-dashed border-ink-fade bg-paper-light p-2 font-mono text-sm outline-none"
              required
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              className="w-full border border-dashed border-ink-fade bg-paper-light p-2 font-mono text-sm outline-none resize-none"
              required
            />
          </div>
          <button
            type="submit"
            className="font-mono text-xs uppercase tracking-widest border border-ink-black px-6 py-2 hover:bg-ink-black hover:text-paper-light transition-colors"
          >
            Transmit Message →
          </button>
        </form>
      )}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('bio');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&family=Shadows+Into+Light&display=swap');
      :root {
        --paper-light: #F5F2EB;
        --paper-mid: #E8E1D5;
        --paper-dark: #D4C9B3;
        --ink-black: #1A1A1A;
        --ink-fade: #5A564C;
        --thread-orange: #FF4A1C;
        --leaf-green: #285A35;
        --bead-blue: #3A698A;
      }
      .bg-paper-light { background-color: #F5F2EB !important; }
      .bg-paper-mid { background-color: #E8E1D5 !important; }
      .bg-paper-dark { background-color: #D4C9B3 !important; }
      .bg-ink-black { background-color: #1A1A1A !important; }
      .bg-bead-blue { background-color: #3A698A !important; }
      .bg-leaf-green { background-color: #285A35 !important; }
      .bg-thread-orange { background-color: #FF4A1C !important; }
      .text-paper-light { color: #F5F2EB !important; }
      .text-paper-mid { color: #E8E1D5 !important; }
      .text-ink-fade { color: #5A564C !important; }
      .text-ink-black { color: #1A1A1A !important; }
      .text-thread-orange { color: #FF4A1C !important; }
      .text-bead-blue { color: #3A698A !important; }
      .border-ink-black { border-color: #1A1A1A !important; }
      .border-ink-fade { border-color: #5A564C !important; }
      .hover\\:text-thread-orange:hover { color: #FF4A1C !important; }
      .hover\\:bg-ink-black:hover { background-color: #1A1A1A !important; }
      .hover\\:text-paper-light:hover { color: #F5F2EB !important; }
      .font-serif { font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif; }
      .font-mono { font-family: 'Courier Prime', 'Courier New', monospace; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const renderMainContent = () => {
    switch (activeTab) {
      case 'timeline':
        return (
          <>
            <TimelineContent />
            <QuoteCard />
          </>
        );
      case 'atlas':
        return (
          <>
            <AtlasContent />
            <QuoteCard />
          </>
        );
      case 'specimens':
        return (
          <>
            <BioSection />
            <SpecimensSection />
            <QuoteCard />
          </>
        );
      case 'contact':
        return (
          <>
            <ContactContent />
            <QuoteCard />
          </>
        );
      default:
        return (
          <>
            <BioSection />
            <SpecimensSection />
            <QuoteCard />
          </>
        );
    }
  };

  return (
    <div
      className="font-serif w-full min-h-screen relative p-8"
      style={customStyles.body}
    >
      <SVGDefs />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 pt-10">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 flex flex-col gap-8 relative">
          <ProfileCard />
          <LedgerSummary />
          <NavCard activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3 flex flex-col gap-10">
          {renderMainContent()}
        </div>
      </div>

      {/* Decorative Beads */}
      <div className="fixed bottom-8 right-8 flex gap-2" style={{ transform: 'rotate(45deg)' }}>
        <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: '#3A698A' }}></div>
        <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: '#285A35' }}></div>
        <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: '#FF4A1C' }}></div>
      </div>
    </div>
  );
};

export default App;