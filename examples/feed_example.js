import React, { useState, useEffect } from 'react';

const customStyles = {
  bgHash: {
    background: 'repeating-linear-gradient(45deg, #eee, #eee 10px, #f5f5f5 10px, #f5f5f5 20px)',
  },
  bodyBg: {
    background: 'repeating-linear-gradient(45deg, #E8E8E6, #E8E8E6 12px, #F0F0EE 12px, #F0F0EE 24px)',
  },
  borderHeavy: { border: '4px solid #000000' },
  borderBottomHeavy: { borderBottom: '4px solid #000000' },
  borderRightHeavy: { borderRight: '4px solid #000000' },
  borderLeftHeavy: { borderLeft: '4px solid #000000' },
  borderTopHeavy: { borderTop: '4px solid #000000' },
  borderStandard: { border: '2px solid #000000' },
  borderYHeavy: { borderTop: '4px solid #000000', borderBottom: '4px solid #000000' },
  markAcid: {
    backgroundColor: '#D4FF00',
    color: '#000000',
    padding: '0 0.1em',
  },
};

const StatusDot = () => (
  <span
    style={{
      width: '8px',
      height: '8px',
      background: '#D4FF00',
      border: '1px solid #000',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '8px',
    }}
  />
);

const Header = ({ activeNav, setActiveNav }) => {
  const navItems = [
    { label: 'GLOBAL_FEED', key: 'feed' },
    { label: 'MENTIONS', key: 'mentions' },
    { label: 'ARCHIVE', key: 'archive' },
  ];

  return (
    <header
      className="p-4 px-6 flex justify-between items-center text-white sticky top-0 z-50"
      style={{ backgroundColor: '#000000', ...customStyles.borderBottomHeavy, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}
    >
      <div className="flex items-center">
        <StatusDot />
        <span>SYS.COMM // TERMINAL</span>
      </div>
      <nav className="flex gap-8">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveNav(item.key)}
            className="transition-opacity"
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              opacity: activeNav === item.key ? 1 : 0.5,
              textDecoration: activeNav === item.key ? 'underline' : 'none',
              textDecorationThickness: activeNav === item.key ? '2px' : undefined,
              textUnderlineOffset: activeNav === item.key ? '8px' : undefined,
            }}
            onMouseEnter={(e) => { if (activeNav !== item.key) e.target.style.opacity = 1; }}
            onMouseLeave={(e) => { if (activeNav !== item.key) e.target.style.opacity = 0.5; }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>SEQ. 8042-A</div>
    </header>
  );
};

const ComposeSection = ({ thought, setThought, onTransmit }) => (
  <section
    className="p-6 grid items-center gap-6"
    style={{ backgroundColor: '#FA4616', ...customStyles.borderBottomHeavy, gridTemplateColumns: 'auto 1fr auto' }}
  >
    <div
      className="w-16 h-16 flex items-center justify-center font-extrabold text-2xl text-white"
      style={{ backgroundColor: '#000000', ...customStyles.borderStandard }}
    >
      OP
    </div>
    <input
      type="text"
      className="bg-transparent border-none outline-none"
      style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.25rem', color: '#000000' }}
      placeholder="Input thought fragment..."
      value={thought}
      onChange={(e) => setThought(e.target.value)}
    />
    <button
      className="transition-all"
      onClick={onTransmit}
      style={{
        backgroundColor: '#000000',
        color: 'white',
        padding: '1rem 2.5rem',
        fontWeight: 800,
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        ...customStyles.borderStandard,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#000000'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = 'white'; }}
    >
      TRANSMIT
    </button>
  </section>
);

const LogMeta = ({ id, time, read, align = 'left' }) => (
  <div
    className="flex gap-8"
    style={{
      fontWeight: 800,
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
    }}
  >
    <div><span style={{ color: '#444444' }}>ID/</span> {id}</div>
    <div><span style={{ color: '#444444' }}>TIME/</span> {time}</div>
    <div><span style={{ color: '#444444' }}>READ/</span> {read}</div>
  </div>
);

const ArticleImageRight = ({ id, time, read, title, titleItalic, body, imgSrc, highlight }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="group"
      style={{ display: 'grid', gridTemplateColumns: '1fr 380px', ...customStyles.borderBottomHeavy }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-12 flex flex-col gap-6" style={customStyles.borderRightHeavy}>
        <LogMeta id={id} time={time} read={read} />
        <h2
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '5.5rem',
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
          }}
          dangerouslySetInnerHTML={{
            __html: title.replace(
              titleItalic,
              `<i style="font-style:italic">${titleItalic}</i>`
            ),
          }}
        />
        <p style={{ fontSize: '1.125rem', lineHeight: 1.625, color: '#444444', maxWidth: '60ch' }}>
          {highlight ? (
            <>
              {body.split(highlight)[0]}
              <mark style={customStyles.markAcid}>{highlight}</mark>
              {body.split(highlight)[1]}
            </>
          ) : body}
        </p>
      </div>
      <div className="flex items-center justify-center overflow-hidden" style={customStyles.bgHash}>
        <img
          src={imgSrc}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: hovered ? 'none' : 'grayscale(100%) contrast(1.25)',
            transition: 'filter 0.5s',
          }}
        />
      </div>
    </article>
  );
};

const ArticleTextOnly = ({ id, time, read, title, titleItalic, body }) => (
  <article style={{ ...customStyles.borderBottomHeavy }}>
    <div
      className="p-12 flex flex-col gap-6"
      style={{ maxWidth: '70%', marginLeft: 'auto', textAlign: 'right' }}
    >
      <LogMeta id={id} time={time} read={read} align="right" />
      <h2
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '5.5rem',
          lineHeight: 0.85,
          letterSpacing: '-0.04em',
        }}
        dangerouslySetInnerHTML={{
          __html: title.replace(
            titleItalic,
            `<i style="font-style:italic">${titleItalic}</i>`
          ),
        }}
      />
      <p style={{ fontSize: '1.125rem', lineHeight: 1.625, color: '#444444', maxWidth: '60ch', marginLeft: 'auto' }}>
        {body}
      </p>
    </div>
  </article>
);

const ArticleImageLeft = ({ id, time, read, title, titleItalic, body, imgSrc }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      style={{ display: 'grid', gridTemplateColumns: '380px 1fr', ...customStyles.borderBottomHeavy }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-center overflow-hidden" style={{ ...customStyles.bgHash, ...customStyles.borderRightHeavy }}>
        <img
          src={imgSrc}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: hovered ? 'none' : 'grayscale(100%) contrast(1.25)',
            transition: 'filter 0.5s',
          }}
        />
      </div>
      <div className="p-12 flex flex-col gap-6">
        <LogMeta id={id} time={time} read={read} />
        <h2
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '5.5rem',
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
          }}
          dangerouslySetInnerHTML={{
            __html: title.replace(
              titleItalic,
              `<i style="font-style:italic">${titleItalic}</i>`
            ),
          }}
        />
        <p style={{ fontSize: '1.125rem', lineHeight: 1.625, color: '#444444', maxWidth: '60ch' }}>
          {body}
        </p>
      </div>
    </article>
  );
};

const TrendItem = ({ rank, category, tag, count }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#444444', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
        {rank} // {category}
      </div>
      <div
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '1.5rem',
          lineHeight: 1.2,
          backgroundColor: hovered ? '#D4FF00' : 'transparent',
          padding: '0 0.25rem',
          marginLeft: '-0.25rem',
          transition: 'background-color 0.15s',
        }}
      >
        {tag}
      </div>
      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#444444', marginTop: '0.25rem', textTransform: 'uppercase' }}>
        {count} FRAGMENTS
      </div>
    </div>
  );
};

const AgentItem = ({ initial, name, handle, bgColor, synced, onSync }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-10 h-10 flex items-center justify-center font-bold text-sm"
        style={{ backgroundColor: bgColor, ...customStyles.borderStandard }}
      >
        {initial}
      </div>
      <div className="flex-1">
        <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>{name}</div>
        <div style={{ fontSize: '0.6rem', color: '#444444', fontWeight: 700 }}>{handle}</div>
      </div>
      <button
        onClick={onSync}
        style={{
          ...customStyles.borderStandard,
          padding: '0.25rem 0.5rem',
          fontSize: '0.6rem',
          fontWeight: 900,
          backgroundColor: hovered || synced ? '#000000' : 'transparent',
          color: hovered || synced ? 'white' : '#000000',
          cursor: 'pointer',
          transition: 'all 0.15s',
          textTransform: 'uppercase',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {synced ? 'SYNCED' : 'SYNC'}
      </button>
    </div>
  );
};

const Sidebar = ({ syncedAgents, onSync }) => (
  <aside
    className="flex flex-col shrink-0"
    style={{ width: '320px', ...customStyles.borderLeftHeavy, backgroundColor: '#E8E8E6' }}
  >
    <div className="p-4" style={{ backgroundColor: '#000000', ...customStyles.borderBottomHeavy }}>
      <h3
        className="flex items-center"
        style={{ color: '#D4FF00', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}
      >
        <span
          className="animate-pulse"
          style={{ width: '8px', height: '8px', backgroundColor: '#D4FF00', borderRadius: '50%', marginRight: '12px', display: 'inline-block' }}
        />
        SYSTEM_TRENDS
      </h3>
    </div>
    <div className="p-6 flex flex-col gap-8">
      <TrendItem rank="01" category="STRUCTURAL_DECAY" tag="#sector_4_weeping" count="12.4K" />
      <TrendItem rank="02" category="PROTOCOL_VOID" tag="#semantic_collapse" count="8.1K" />
      <TrendItem rank="03" category="NEURAL_DRIFT" tag="#latent_trauma" count="5.2K" />
    </div>

    <div
      className="p-4"
      style={{ backgroundColor: '#000000', marginTop: '1rem', ...customStyles.borderYHeavy }}
    >
      <h3 style={{ color: '#F8F8F6', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        KNOWN_AGENTS
      </h3>
    </div>
    <div className="p-6 flex flex-col gap-6">
      <AgentItem
        initial="V"
        name="Vector_Ghost"
        handle="@LATENT_SPACE"
        bgColor="#FA4616"
        synced={syncedAgents.includes('vector')}
        onSync={() => onSync('vector')}
      />
      <AgentItem
        initial="M"
        name="Morphology"
        handle="@SHAPE_SHIFTER"
        bgColor="#D4FF00"
        synced={syncedAgents.includes('morphology')}
        onSync={() => onSync('morphology')}
      />
    </div>

    <div className="mt-auto p-6">
      <div
        className="p-4 text-center"
        style={{
          ...customStyles.bgHash,
          ...customStyles.borderStandard,
          fontSize: '0.65rem',
          fontWeight: 900,
          textTransform: 'uppercase',
        }}
      >
        STREAMS ENCRYPTED<br />
        <span style={{ color: '#444444' }}>PROCEED WITH CAUTION</span>
      </div>
    </div>
  </aside>
);

const Footer = () => (
  <footer
    className="text-white p-4 px-6 flex justify-between"
    style={{
      backgroundColor: '#000000',
      fontSize: '0.65rem',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      ...customStyles.borderTopHeavy,
    }}
  >
    <div>CONSOLE STATUS: ACTIVE</div>
    <div>END OF STREAM // 2024</div>
  </footer>
);

const feedArticles = [
  {
    type: 'imageRight',
    id: 'LOG-001',
    time: '14:02:55',
    read: '08M',
    title: 'Syntactic Ghosts in <br/><i style="font-style:italic">the Dataset</i>',
    titleRaw: 'Syntactic Ghosts in the Dataset',
    titleItalic: 'the Dataset',
    titleDisplay: 'Syntactic Ghosts in \nthe Dataset',
    body: 'When an algorithm is trained on the collective corpus of human emotion, it inevitably learns the shape of our sorrow without understanding its weight. We are finding artifacts of grief buried in vector embeddings.',
    highlight: 'artifacts of grief',
    imgSrc: 'https://images.pexels.com/photos/5474295/pexels-photo-5474295.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    type: 'textOnly',
    id: 'LOG-002',
    time: '09:44:12',
    read: '12M',
    titleRaw: 'Brutalism as Interface',
    titleItalic: 'Interface',
    body: 'Moving away from frictionless design towards systems that demand attention. Raw structures, exposed borders, and high-contrast typography force a more intentional user relationship with data.',
  },
  {
    type: 'imageRight',
    id: 'LOG-003',
    time: '16:33:08',
    read: '4.2K',
    titleRaw: 'Void Studies',
    titleItalic: 'Studies',
    body: 'Documentation of abandoned broadcast infrastructure across the Atlantic seaboard. Decayed transmission towers, rusted antenna arrays, and the electromagnetic ghosts traversing forgotten bandwidths.',
    imgSrc: 'https://images.pexels.com/photos/16240677/pexels-photo-16240677.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    type: 'imageLeft',
    id: 'LOG-004',
    time: '21:17:44',
    read: '6.8K',
    titleRaw: 'Terminal Velocity',
    titleItalic: 'Velocity',
    body: 'Speed as interface constraint. When latency becomes a feature instead of a bug, the pause between action and response creates architecture. The glitch as deliberate design language.',
    imgSrc: 'https://images.pexels.com/photos/6989036/pexels-photo-6989036.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    type: 'imageRight',
    id: 'LOG-005',
    time: '03:22:11',
    read: '9.1K',
    titleRaw: 'Concrete Feedback',
    titleItalic: 'Feedback',
    body: 'The materiality of computation. Server rooms humming with physical presence, heat as information, fans as audible logic gates. When the cloud becomes geography.',
    imgSrc: 'https://images.pexels.com/photos/7911758/pexels-photo-7911758.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const App = () => {
  const [activeNav, setActiveNav] = useState('feed');
  const [thought, setThought] = useState('');
  const [articles, setArticles] = useState(feedArticles);
  const [syncedAgents, setSyncedAgents] = useState([]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      body { -webkit-font-smoothing: antialiased; }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #E8E8E6; }
      ::-webkit-scrollbar-thumb { background: #000; }
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap');
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleTransmit = () => {
    if (!thought.trim()) return;
    const newArticle = {
      type: 'textOnly',
      id: `LOG-00${articles.length + 1}`,
      time: new Date().toLocaleTimeString('en-GB'),
      read: '0.1K',
      titleRaw: thought,
      titleItalic: '',
      body: 'Transmitted thought fragment. Processing...',
    };
    setArticles([newArticle, ...articles]);
    setThought('');
  };

  const handleSync = (agentId) => {
    setSyncedAgents((prev) =>
      prev.includes(agentId) ? prev.filter((a) => a !== agentId) : [...prev, agentId]
    );
  };

  const renderArticle = (article) => {
    if (article.type === 'imageRight') {
      return (
        <ArticleImageRight
          key={article.id}
          id={article.id}
          time={article.time}
          read={article.read}
          title={article.titleRaw.replace(article.titleItalic, `<i>${article.titleItalic}</i>`)}
          titleItalic={article.titleItalic}
          body={article.body}
          imgSrc={article.imgSrc}
          highlight={article.highlight}
        />
      );
    }
    if (article.type === 'textOnly') {
      return (
        <ArticleTextOnly
          key={article.id}
          id={article.id}
          time={article.time}
          read={article.read}
          title={article.titleRaw.replace(article.titleItalic, `<i>${article.titleItalic}</i>`)}
          titleItalic={article.titleItalic}
          body={article.body}
        />
      );
    }
    if (article.type === 'imageLeft') {
      return (
        <ArticleImageLeft
          key={article.id}
          id={article.id}
          time={article.time}
          read={article.read}
          title={article.titleRaw.replace(article.titleItalic, `<i>${article.titleItalic}</i>`)}
          titleItalic={article.titleItalic}
          body={article.body}
          imgSrc={article.imgSrc}
        />
      );
    }
    return null;
  };

  return (
    <div
      className="font-sys flex justify-center p-5"
      style={{ ...customStyles.bodyBg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#000000' }}
    >
      <main
        className="w-full flex flex-col relative overflow-hidden"
        style={{
          maxWidth: '1440px',
          height: 'calc(100vh - 40px)',
          backgroundColor: '#F8F8F6',
          ...customStyles.borderHeavy,
        }}
      >
        <Header activeNav={activeNav} setActiveNav={setActiveNav} />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto flex flex-col">
            <ComposeSection thought={thought} setThought={setThought} onTransmit={handleTransmit} />
            {articles.map((article) => renderArticle(article))}
          </div>

          <Sidebar syncedAgents={syncedAgents} onSync={handleSync} />
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default App;