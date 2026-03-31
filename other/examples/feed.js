import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const customStyles = {
  body: {
    backgroundColor: "#F5F2EB",
    color: "#1A1A1A",
    overflowX: "hidden",
    WebkitFontSmoothing: "antialiased",
    backgroundImage: "radial-gradient(#E8E1D5 1px, transparent 1px)",
    backgroundSize: "32px 32px",
  },
  tornEdge: {
    position: "relative",
    zIndex: 1,
  },
  linedPaper: {
    backgroundImage:
      "repeating-linear-gradient(transparent, transparent 27px, rgba(90, 86, 76, 0.2) 28px)",
    lineHeight: "28px",
  },
  verticalThread: {
    position: "absolute",
    left: "24px",
    top: 0,
    bottom: 0,
    width: "2px",
    background:
      "repeating-linear-gradient(to bottom, #3A698A 0, #3A698A 10px, transparent 10px, transparent 20px)",
    opacity: 0.5,
  },
};

const OrangeStar = () => (
  <svg
    viewBox="0 0 50 50"
    style={{
      width: "100%",
      height: "100%",
      stroke: "#FF4A1C",
      strokeWidth: 1.5,
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }}
  >
    <polygon points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20" />
    <line x1="15" y1="15" x2="35" y2="35" />
    <line x1="15" y1="35" x2="35" y2="15" />
  </svg>
);

const ReplyIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const RepostIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 2.1l4 4-4 4" />
    <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4" />
    <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2" />
  </svg>
);

const HeartIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ArchiveIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 8v13H3V8" />
    <path d="M1 3h22v5H1z" />
    <path d="M10 12h4" />
  </svg>
);

const ActionButtons = ({ replies, reposts, likes, showArchive = true }) => {
  const [reposted, setReposted] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-[#3A698A] hover:bg-[#3A698A] hover:text-[#F5F2EB]"
        title="Reply"
        style={{ transition: "all 0.2s ease" }}
      >
        <ReplyIcon />
        <span className="font-mono text-sm">{replies}</span>
      </button>
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${reposted ? "bg-[#285A35] text-[#F5F2EB]" : "text-[#285A35] hover:bg-[#285A35] hover:text-[#F5F2EB]"}`}
        title="Repost"
        onClick={() => setReposted(!reposted)}
      >
        <RepostIcon />
        <span className="font-mono text-sm">{reposts}</span>
      </button>
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${liked ? "bg-[#FF4A1C] text-[#F5F2EB]" : "text-[#FF4A1C] hover:bg-[#FF4A1C] hover:text-[#F5F2EB]"}`}
        title="Favorite"
        onClick={() => setLiked(!liked)}
      >
        <HeartIcon />
        <span className="font-mono text-sm">{likes}</span>
      </button>
      {showArchive && (
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-[#3A698A] hover:bg-[#3A698A] hover:text-[#F5F2EB]"
          title="Archive"
        >
          <ArchiveIcon />
        </button>
      )}
    </div>
  );
};

const NatureCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    class Particle {
      constructor(initial = false) {
        this.reset(initial);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -(Math.random() * 0.5 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.life = Math.random();
        this.type = Math.random() > 0.8 ? "thread" : "seed";
        this.length = Math.random() * 20 + 10;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
        const colors = [
          "rgba(40, 90, 53, 0.2)",
          "rgba(58, 105, 138, 0.2)",
          "rgba(26, 26, 26, 0.1)",
          "rgba(255, 74, 28, 0.1)",
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.life * 10) * 0.2;
        this.life += 0.005;
        this.angle += this.rotSpeed;
        if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if (this.type === "seed") {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(-this.length / 2, 0);
          ctx.lineTo(this.length / 2, 0);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < 60; i++) {
      particles.push(new Particle(true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-40"
    />
  );
};

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navItems = [
    { label: "Timeline", active: true },
    { label: "Discoveries", active: false },
    { label: "Notifications", active: false, badge: 3 },
    { label: "Messages", active: false },
    { label: "Archives", active: false },
  ];

  return (
    <aside className="w-[280px] shrink-0 hidden lg:flex flex-col gap-10 sticky top-12 h-fit">
      <div
        className="bg-[#E8E1D5] p-6 transform -rotate-2 border border-black/10"
        style={{
          position: "relative",
          zIndex: 1,
          boxShadow: "2px 3px 6px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-dashed border-[#5A564C]">
          <div
            className="w-16 h-16 bg-[#D4C9B3] rounded-full overflow-hidden border border-[#5A564C] p-1 transform rotate-3"
            style={{ position: "relative", zIndex: 1 }}
          >
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
              alt="Profile"
              className="w-full h-full object-cover"
              style={{ filter: "grayscale(100%) contrast(1.25) sepia(30%)" }}
            />
          </div>
          <div>
            <h2
              className="font-bold text-xl leading-tight uppercase tracking-wide"
              style={{ mixBlendMode: "multiply", letterSpacing: "1px" }}
            >
              Elara Vance
            </h2>
            <span className="font-mono text-xs text-[#5A564C]">
              @fieldnotes_ev
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 font-mono text-xs">
          {[
            ["Records", "1,482"],
            ["Following", "340"],
            ["Observers", "8,901"],
          ].map(([label, val]) => (
            <div
              key={label}
              className="flex justify-between items-baseline border-b border-dashed border-[#5A564C]/50 pb-1"
            >
              <span className="text-[#5A564C] tracking-widest uppercase">
                {label}
              </span>
              <span className="font-bold text-sm">{val}</span>
            </div>
          ))}
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-[#5A564C] tracking-widest uppercase">
              Location
            </span>
            <span className="font-serif italic text-sm">Northern Woods</span>
          </div>
        </div>

        <div
          className="absolute top-2 right-2 w-6 h-6 transform scale-75 rotate-45"
          style={{ zIndex: 20, pointerEvents: "none" }}
        >
          <OrangeStar />
        </div>
      </div>

      <nav className="flex flex-col gap-6 pl-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(item.label)}
            className="flex items-center gap-4 group text-left"
          >
            <span
              className={`font-mono text-xs text-[#FF4A1C] transition-opacity ${activeNav === item.label ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              -&gt;
            </span>
            {activeNav === item.label ? (
              <span
                className="font-bold text-xl uppercase tracking-wider bg-[#1A1A1A] text-[#F5F2EB] px-3 py-1 transform -rotate-1 group-hover:rotate-0 transition-transform"
                style={{ mixBlendMode: "multiply", letterSpacing: "1px" }}
              >
                {item.label}
              </span>
            ) : (
              <span className="font-bold text-lg uppercase tracking-wider text-[#5A564C] group-hover:text-[#1A1A1A] transition-colors">
                {item.label}
                {item.badge && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-[#FF4A1C] text-[#F5F2EB] text-xs rounded-full transform -rotate-12">
                    {item.badge}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}

        <button
          className="mt-8 bg-[#D4C9B3] border border-[#1A1A1A] py-3 px-6 font-mono font-bold uppercase tracking-widest transform rotate-1 hover:-rotate-1 transition-transform active:translate-y-1"
          style={{
            boxShadow: "2px 4px 0 #1A1A1A",
            position: "relative",
            zIndex: 1,
          }}
        >
          Log Entry
        </button>
      </nav>
    </aside>
  );
};

const RightSidebar = () => {
  const [searchVal, setSearchVal] = useState("");
  const [followed, setFollowed] = useState({ J: false, M: false, C: false });

  const toggleFollow = (key) =>
    setFollowed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="w-[320px] shrink-0 hidden xl:flex flex-col gap-10 sticky top-12 h-fit">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search archives..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full bg-[#E8E1D5] border border-[#1A1A1A] py-2 px-4 font-mono text-sm focus:outline-none focus:bg-[#F5F2EB] focus:ring-1 focus:ring-[#FF4A1C] placeholder:text-[#5A564C]/60"
          style={{ position: "relative", zIndex: 1 }}
        />
        <span className="absolute right-3 top-2.5 font-mono text-[#5A564C]">
          /
        </span>
      </div>

      <div className="relative mt-4">
        <div
          className="font-bold text-lg mb-6 inline-block bg-[#1A1A1A] text-[#F5F2EB] px-4 py-1 transform -rotate-1 uppercase tracking-wide"
          style={{ mixBlendMode: "multiply" }}
        >
          Current Trends
        </div>

        <div className="flex flex-col">
          <div
            className="bg-[#FF4A1C] p-3 -mb-2 relative border border-black/10 flex items-center gap-3 transform -rotate-1"
            style={{ zIndex: 30, position: "relative" }}
          >
            <span className="font-mono text-xs text-[#F5F2EB] border-r border-[#F5F2EB]/30 pr-2">
              01
            </span>
            <div className="grow">
              <div className="font-bold text-base leading-none text-[#F5F2EB]">
                #SpringMigration
              </div>
              <div className="font-mono text-[10px] text-[#F5F2EB]/70 mt-1">
                12.5K Observations
              </div>
            </div>
            <button className="font-mono text-xs text-[#F5F2EB] hover:text-white">
              [+]
            </button>
          </div>

          <div
            className="bg-[#285A35] p-3 -mb-2 relative border border-black/10 flex items-center gap-3 transform rotate-1 translate-x-2"
            style={{ zIndex: 20, position: "relative" }}
          >
            <span className="font-mono text-xs text-[#F5F2EB] border-r border-[#F5F2EB]/30 pr-2">
              02
            </span>
            <div className="grow">
              <div className="font-bold text-base leading-none text-[#F5F2EB]">
                Lunar Eclipse
              </div>
              <div className="font-mono text-[10px] text-[#F5F2EB]/70 mt-1">
                Astrology / 8,402 Logs
              </div>
            </div>
            <button className="font-mono text-xs text-[#F5F2EB] hover:text-white">
              [+]
            </button>
          </div>

          <div
            className="bg-[#3A698A] p-3 relative border border-black/10 flex items-center gap-3 transform -rotate-2"
            style={{ zIndex: 10, position: "relative" }}
          >
            <span className="font-mono text-xs text-[#F5F2EB] border-r border-[#F5F2EB]/30 pr-2">
              03
            </span>
            <div className="grow">
              <div className="font-bold text-base leading-none text-[#F5F2EB]">
                Monarchs
              </div>
              <div className="font-mono text-[10px] text-[#F5F2EB]/70 mt-1">
                Entomology / 5,100 Logs
              </div>
            </div>
            <button className="font-mono text-xs text-[#F5F2EB] hover:text-white">
              [+]
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-8 p-5 border-2 border-dashed border-[#5A564C] bg-[#F5F2EB]/50">
        <div className="absolute -top-3 left-4 bg-[#F5F2EB] px-2 font-mono text-xs font-bold text-[#5A564C] tracking-widest uppercase">
          Suggested Recorders
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {[
            {
              key: "J",
              color: "#3A698A",
              name: "James Audubon",
              handle: "@birds_ja",
            },
            {
              key: "M",
              color: "#285A35",
              name: "Maria Merian",
              handle: "@insects_mm",
            },
            {
              key: "C",
              color: "#FF4A1C",
              name: "Charles D.",
              handle: "@beagle_logs",
            },
          ].map(({ key, color, name, handle }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border border-[#1A1A1A] flex items-center justify-center text-[#F5F2EB] font-serif font-bold text-sm"
                  style={{ backgroundColor: color }}
                >
                  {key}
                </div>
                <div className="leading-tight">
                  <div className="font-bold text-sm">{name}</div>
                  <div className="font-mono text-[10px] text-[#5A564C]">
                    {handle}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(key)}
                className={`font-mono text-[10px] border border-[#1A1A1A] px-2 py-1 transition-colors ${followed[key] ? "bg-[#1A1A1A] text-[#F5F2EB]" : "hover:bg-[#1A1A1A] hover:text-[#F5F2EB]"}`}
              >
                {followed[key] ? "FOLLOWING" : "FOLLOW"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <footer className="font-mono text-[10px] text-[#5A564C] leading-relaxed mt-auto">
        <p>Terms of Service · Privacy Policy · Cookie Policy</p>
        <p>Accessibility · Ads info · © 2024 Field Notes Corp.</p>
      </footer>
    </aside>
  );
};

const NewEntryBox = () => {
  const [entryText, setEntryText] = useState("");

  return (
    <div
      className="bg-white p-6 pb-12 transform rotate-1 border border-black/5 shadow-md relative mt-4"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div style={customStyles.verticalThread}></div>
      <div className="pl-10">
        <div className="font-mono text-xs text-[#5A564C] mb-4 border-b border-dashed border-[#5A564C]/30 pb-2 flex justify-between">
          <span>NEW LOG [ENTRY: PENDING]</span>
          <span>DATE: --/--/----</span>
        </div>
        <textarea
          className="w-full bg-transparent resize-none focus:outline-none text-lg min-h-[120px] placeholder:text-[#5A564C]/50 placeholder:italic"
          style={customStyles.linedPaper}
          placeholder="What have you observed today?"
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
        />

        <div className="absolute bottom-4 right-6 flex items-center gap-6">
          <button className="font-mono text-xs text-[#5A564C] hover:text-[#1A1A1A] transition-colors">
            [ ADD SKETCH ]
          </button>
          <button className="font-mono font-bold text-sm text-[#FF4A1C] border border-[#FF4A1C] px-4 py-1 transform -rotate-2 hover:bg-[#FF4A1C] hover:text-[#F5F2EB] transition-all">
            RECORD -&gt;
          </button>
        </div>
      </div>
    </div>
  );
};

const Article1 = () => (
  <article
    className="bg-white border border-[#5A564C] p-6 relative group"
    style={{ position: "relative", zIndex: 1 }}
  >
    <div className="flex justify-between items-baseline border-b border-dashed border-[#5A564C]/40 pb-2 mb-4">
      <div className="flex items-center gap-3">
        <span
          className="font-bold text-lg uppercase tracking-wide"
          style={{ mixBlendMode: "multiply" }}
        >
          Arthur Pendelton
        </span>
        <span className="font-mono text-xs text-[#5A564C]">@art_botanist</span>
      </div>
      <span className="font-mono text-xs text-[#5A564C] bg-[#D4C9B3] px-2 py-0.5 transform rotate-2">
        2h ago
      </span>
    </div>

    <div className="text-lg leading-relaxed mb-6 text-justify">
      <p style={{ textAlign: "justify" }}>
        <span
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            color: "#FF4A1C",
            float: "left",
            marginRight: "8px",
            lineHeight: 1,
          }}
        >
          S
        </span>
        potted a remarkable specimen of <i>Amanita muscaria</i> near the old oak
        roots. The vibrant red cap was almost glowing in the overcast morning
        light. The damp soil indicates optimal conditions for further fungal
        blooms this week.
      </p>
    </div>

    <div
      className="bg-white p-2 pb-8 transform -rotate-2 shadow-lg relative w-[90%] mx-auto mb-6"
      style={{ position: "relative" }}
    >
      <img
        src="https://images.unsplash.com/photo-1543881476-857c006505eb?q=80&w=800&auto=format&fit=crop"
        alt="Mushroom observation"
        className="w-full h-64 object-cover border border-[#5A564C]/20"
        style={{
          filter: "grayscale(100%) contrast(1.2) sepia(30%)",
          mixBlendMode: "multiply",
        }}
      />
      <div className="absolute bottom-2 right-3 font-mono text-[10px] text-[#5A564C]">
        FILM ROLL 42 - EXP 12
      </div>
      <div
        className="absolute -top-4 -left-4 w-8 h-8 transform scale-75 rotate-12"
        style={{ zIndex: 20, pointerEvents: "none" }}
      >
        <OrangeStar />
      </div>
    </div>

    <div className="pt-4 border-t border-[#5A564C]/20">
      <ActionButtons replies="12" reposts="5" likes="128" />
    </div>
  </article>
);

const Article2 = () => (
  <article
    className="bg-[#E8E1D5] p-6 pb-12 relative transform -rotate-1"
    style={{
      position: "relative",
      zIndex: 1,
      boxShadow: "2px 2px 0 rgba(0,0,0,0.1)",
    }}
  >
    <div className="absolute left-10 top-full h-12 w-0.5 border-l border-dashed border-[#5A564C] z-0"></div>

    <div className="flex justify-between items-baseline border-b border-[#5A564C] pb-2 mb-4">
      <div className="flex items-center gap-3">
        <span
          className="font-bold text-lg uppercase tracking-wide"
          style={{ mixBlendMode: "multiply" }}
        >
          Dr. Silva
        </span>
        <span className="font-mono text-xs text-[#5A564C]">
          @canopy_research
        </span>
      </div>
      <span className="font-mono text-xs text-[#5A564C]">5h ago</span>
    </div>

    <div className="text-lg leading-relaxed mb-4">
      <p>
        We need to talk about the migration patterns we're seeing this season.
        The data from the coastal tracking stations is showing anomalies that
        haven't been recorded since the late 90s.
      </p>
      <p className="mt-4">Thread / 1</p>
    </div>

    <div className="flex justify-between items-center font-mono text-xs mt-6">
      <ActionButtons replies="45" reposts="312" likes="1.2K" />
    </div>

    <div className="absolute bottom-3 right-4 flex gap-1">
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: "#285A35",
          boxShadow: "1px 1px 2px rgba(0,0,0,0.3)",
        }}
      ></div>
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: "#285A35",
          boxShadow: "1px 1px 2px rgba(0,0,0,0.3)",
        }}
      ></div>
    </div>
  </article>
);

const Article3 = () => (
  <article
    className="bg-white p-6 relative transform rotate-1 ml-4 border-l-4 border-[#3A698A]"
    style={{ position: "relative", zIndex: 1 }}
  >
    <div className="absolute -left-5 top-8 w-2 h-2 rounded-full bg-[#5A564C]"></div>

    <div className="flex justify-between items-baseline mb-3">
      <div className="flex items-center gap-3">
        <span
          className="font-bold uppercase tracking-wide"
          style={{ mixBlendMode: "multiply" }}
        >
          Dr. Silva
        </span>
      </div>
      <span className="font-mono text-[10px] text-[#5A564C]">5h ago</span>
    </div>

    <div className="text-base leading-relaxed mb-4 text-[#5A564C]">
      <p>
        Historically, the northern passage is clear by mid-April. We are seeing
        flocks lingering in the southern marshlands well into May. Temperature
        variations in the nesting grounds might be the primary deterrent.
      </p>
    </div>

    <div className="bg-[#D4C9B3] p-3 my-4 font-mono text-xs transform -rotate-1 border border-[#1A1A1A]/20">
      <div className="border-b border-dashed border-[#5A564C] pb-1 mb-1 text-[#FF4A1C]">
        DATA EXCERPT_
      </div>
      <div>STATION A: +2.4°C dev</div>
      <div>STATION B: +1.8°C dev</div>
      <div>MARSH H2O: -0.5°C dev</div>
    </div>

    <div className="flex justify-start gap-8 items-center mt-4">
      <ActionButtons replies="2" reposts="14" likes="89" showArchive={false} />
    </div>
  </article>
);

const Article4 = () => (
  <article
    className="bg-[#D4C9B3] border border-[#5A564C] p-6 relative transform -rotate-1"
    style={{ position: "relative", zIndex: 1 }}
  >
    <div
      className="absolute top-2 right-6 w-8 h-8 transform scale-50 rotate-90"
      style={{ zIndex: 20, pointerEvents: "none" }}
    >
      <OrangeStar />
    </div>

    <div className="flex justify-between items-baseline border-b border-dashed border-[#1A1A1A]/20 pb-2 mb-4">
      <div className="flex items-center gap-3">
        <span
          className="font-bold text-lg uppercase tracking-wide"
          style={{ mixBlendMode: "multiply" }}
        >
          Marina
        </span>
        <span className="font-mono text-xs text-[#5A564C]">@tide_pools</span>
      </div>
      <span className="font-mono text-xs text-[#5A564C]">8h ago</span>
    </div>

    <div className="text-2xl font-serif font-bold italic text-center py-8 px-4 leading-snug opacity-90">
      "The ocean was like glass this morning. Not a single ripple, just the slow
      breathing of the tide."
    </div>

    <div className="border-t border-[#1A1A1A]/10 pt-4 mt-2">
      <ActionButtons replies="5" reposts="12" likes="304" />
    </div>
  </article>
);

const Article5 = () => (
  <article
    className="bg-[#E8E1D5] border border-[#5A564C] p-6 relative group"
    style={{ position: "relative", zIndex: 1 }}
  >
    <div className="flex justify-between items-baseline border-b border-dashed border-[#5A564C]/40 pb-2 mb-4">
      <div className="flex items-center gap-3">
        <span
          className="font-bold text-lg uppercase tracking-wide"
          style={{ mixBlendMode: "multiply" }}
        >
          Field Guide Co.
        </span>
        <span className="font-mono text-xs text-[#5A564C]">@fieldguide</span>
      </div>
      <span className="font-mono text-xs text-[#5A564C]">12h ago</span>
    </div>

    <div className="text-lg leading-relaxed mb-4">
      <p>
        New tutorial up: "Binding your own weatherproof field journal using
        traditional stitch methods." Essential for upcoming rainy season
        expeditions.
      </p>
    </div>

    <a
      href="#"
      className="block bg-[#E8E1D5] border border-[#1A1A1A] p-4 transform rotate-1 hover:rotate-0 transition-transform cursor-pointer relative group-hover:bg-[#D4C9B3]"
    >
      <div className="border-2 border-dashed border-[#5A564C] h-40 flex items-center justify-center mb-3 bg-[#F5F2EB]">
        <span className="font-mono text-[#5A564C] tracking-widest">
          [ PLAY INSTRUCTIONAL RECORDING ]
        </span>
      </div>
      <h3 className="font-bold font-serif text-lg leading-tight">
        Bookbinding Techniques Vol. 4
      </h3>
      <p className="font-mono text-xs text-[#5A564C] mt-1">
        external link / fieldguide.co
      </p>
      <div className="absolute top-2 right-2 flex gap-0.5">
        <div className="w-1 h-3 bg-[#FF4A1C] transform rotate-45"></div>
        <div className="w-1 h-3 bg-[#FF4A1C] transform -rotate-45"></div>
      </div>
    </a>

    <div className="mt-6">
      <ActionButtons replies="22" reposts="89" likes="512" />
    </div>
  </article>
);

const HomePage = () => {
  const [activeNav, setActiveNav] = useState("Timeline");

  return (
    <div
      className="font-serif w-full h-full min-h-screen relative"
      style={{
        ...customStyles.body,
        fontFamily: "'Noto Serif SC', 'Songti SC', STSong, serif",
      }}
    >
      <NatureCanvas />

      <div className="relative z-10 max-w-[1440px] mx-auto px-8 py-12 flex justify-center gap-12 xl:gap-20 min-h-screen">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="w-full max-w-[600px] flex flex-col gap-12">
          <header className="relative pl-4 pt-4">
            <div
              className="absolute left-0 top-0 font-mono text-xs text-[#FF4A1C] origin-bottom-left tracking-widest whitespace-nowrap"
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "bottom left",
              }}
            >
              CURRENT OBSERVATIONS
            </div>
            <h1
              className="text-5xl font-black leading-none tracking-tighter"
              style={{
                mixBlendMode: "multiply",
                textTransform: "uppercase",
                letterSpacing: "-0.05em",
              }}
            >
              Field
              <br />
              Timeline
            </h1>

            <div className="absolute flex gap-1 right-12 top-8">
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#3A698A]"
                style={{ boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#3A698A]"
                style={{ boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#3A698A] translate-y-1"
                style={{ boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
              ></div>
            </div>
          </header>

          <NewEntryBox />

          <div className="flex flex-col gap-10">
            <Article1 />
            <Article2 />
            <Article3 />
            <Article4 />
            <Article5 />
          </div>

          <div className="text-center font-mono text-sm text-[#5A564C] py-8 border-t border-dashed border-[#5A564C]">
            --- END OF RECENT LOGS ---
          </div>
        </main>

        <RightSidebar />
      </div>

      <div
        className="fixed bottom-8 right-8 flex gap-2"
        style={{ transform: "rotate(45deg)" }}
      >
        <div className="w-3 h-3 rounded-full bg-[#3A698A] shadow-md"></div>
        <div className="w-3 h-3 rounded-full bg-[#285A35] shadow-md"></div>
        <div className="w-3 h-3 rounded-full bg-[#FF4A1C] shadow-md"></div>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; }
      ::selection { background-color: #FF4A1C; color: #F5F2EB; }
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
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
