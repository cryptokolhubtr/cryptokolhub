"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NetworkNode {
  x: number; y: number; vx: number; vy: number;
  radius: number; color: string; opacity: number;
}

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] } }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function useScrollInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  return { ref, isInView };
}

// ─── Social Icons ─────────────────────────────────────────────────────────────
function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

// ─── Network Canvas (Hero Background) ────────────────────────────────────────
function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<NetworkNode[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#00ff88", "#6366f1", "#0ea5e9", "#a855f7"];

    const initNodes = () => {
      const w = canvas.width, h = canvas.height;
      const count = Math.min(Math.floor((w * h) / 12000), 90);
      nodesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.3,
      }));
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight ?? window.innerHeight;
      initNodes();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodes = nodesRef.current;
      const { x: mx, y: my } = mouseRef.current;

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        const dx = n.x - mx, dy = n.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) { n.vx += (dx / dist) * 0.08; n.vy += (dy / dist) * 0.08; }
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 1.2) { n.vx = (n.vx / speed) * 1.2; n.vy = (n.vy / speed) * 1.2; }
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.25;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, nodes[i].color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
            grad.addColorStop(1, nodes[j].color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.opacity;
        ctx.shadowBlur = 8;
        ctx.shadowColor = n.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    const onMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative py-24 px-6 ${className}`}>
      {children}
    </section>
  );
}

function SectionBadge({ text }: { text: string }) {
  return (
    <div className="flex justify-center mb-6">
      <span className="badge">{text}</span>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Community", href: "#building" },
    { label: "Events", href: "#events" },
    { label: "Creators", href: "#creators" },
    { label: "Team", href: "#team" },
    { label: "Join", href: "#join" },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#030712]/90 backdrop-blur-xl border-b border-white/[0.06]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Crypto KOL Hub" className="w-9 h-9 object-contain" style={{ mixBlendMode: "screen" }} />
          <span className="font-bold text-white text-[15px] tracking-tight">
            Crypto <span className="gradient-text-green">KOL Hub</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] font-medium text-white/60 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop: social icons + CTA */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="https://x.com/cryptokolhub"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow on X"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <XIcon size={15} />
          </a>
          <a
            href="https://t.me/cryptokolhubtr"
            target="_blank"
            rel="noopener noreferrer"
            title="Join Telegram"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <TelegramIcon size={15} />
          </a>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <a href="#join">
            <button className="btn-primary text-[13px]">Join the Network</button>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col gap-[5px] p-2"
        >
          <span className={`block w-6 h-[2px] bg-white transition-all ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-6 h-[2px] bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-[2px] bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#030712]/95 backdrop-blur-xl border-b border-white/[0.06] px-6 pb-5"
          >
            {links.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-white/70 hover:text-white text-sm font-medium border-b border-white/[0.05] last:border-0"
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://x.com/cryptokolhub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
              >
                <XIcon size={14} /> @cryptokolhub
              </a>
              <span className="text-white/20">·</span>
              <a
                href="https://t.me/cryptokolhubtr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
              >
                <TelegramIcon size={14} /> @cryptokolhubtr
              </a>
            </div>
            <a href="#join" onClick={() => setMenuOpen(false)}>
              <button className="btn-primary w-full text-sm mt-4">Join the Network</button>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <NetworkCanvas />
      <div className="absolute inset-0 bg-gradient-radial from-indigo-950/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712]" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 w-full">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <span className="badge">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Building Now · Web3 Creator Network
            </span>
          </motion.div>

          {/* Turkey tagline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-white/50 bg-white/[0.03] border border-white/[0.07] font-medium tracking-wide">
              🇹🇷 Rooted in Türkiye. Connected to Global Web3.
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6"
          >
            Connecting{" "}
            <span className="gradient-text-green">Web3 Events,</span>
            <br />
            Creators and{" "}
            <span className="gradient-text-purple">Real Community</span>
            <br />
            Power
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Crypto KOL Hub is an independent Web3 community initiative bringing together
            creators, KOLs, event communities and local market voices under one
            transparent global network.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <a href="#join">
              <button className="btn-primary px-8 py-4 text-[15px]">Join the Network</button>
            </a>
            <a href="#about">
              <button className="btn-outline px-8 py-4 text-[15px]">Explore the Vision</button>
            </a>
          </motion.div>

          {/* Social links in hero */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-5"
          >
            <a
              href="https://x.com/cryptokolhub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/30 hover:text-white/70 text-sm transition-colors duration-200"
            >
              <XIcon size={14} /> @cryptokolhub
            </a>
            <span className="text-white/15">·</span>
            <a
              href="https://t.me/cryptokolhubtr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/30 hover:text-white/70 text-sm transition-colors duration-200"
            >
              <TelegramIcon size={14} /> @cryptokolhubtr
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection() {
  const { ref, isInView } = useScrollInView();

  const stats = [
    { value: "Global", label: "Network Reach" },
    { value: "100%", label: "Transparent" },
    { value: "Web3", label: "Community First" },
  ];

  return (
    <Section id="about" className="bg-gradient-to-b from-[#030712] to-[#050c1a]">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="section-divider mb-24" />

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"}>
            <motion.div variants={fadeUp} custom={0}>
              <SectionBadge text="About the Initiative" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={0.1} className="text-4xl lg:text-5xl font-black tracking-tight mb-6 text-center lg:text-left">
              A{" "}<span className="gradient-text-green">Community-First</span><br />Web3 Network
            </motion.h2>
            <motion.p variants={fadeUp} custom={0.2} className="text-white/60 text-lg leading-relaxed mb-6 text-center lg:text-left">
              Crypto KOL Hub is being built as a transparent space for Web3 creators,
              KOLs, event communities and ecosystem builders. Our mission is to create
              a trusted network where real people, real communities and global Web3
              events can discover each other more easily.
            </motion.p>
            <motion.p variants={fadeUp} custom={0.3} className="text-white/40 text-base leading-relaxed text-center lg:text-left">
              We are focused on community, transparency and long-term ecosystem
              building — not on commercial services, paid promotions or financial gains.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 gap-4"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
                className="glass-card p-6 flex items-center gap-6 group hover:glow-purple transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-black gradient-text-purple">{s.value[0]}</span>
                </div>
                <div>
                  <div className="text-2xl font-black gradient-text-green">{s.value}</div>
                  <div className="text-white/50 text-sm mt-0.5">{s.label}</div>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="glass-card p-6 border-indigo-500/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0 animate-pulse" />
                <p className="text-white/50 text-sm leading-relaxed">
                  <span className="text-white/80 font-semibold">Building Now — </span>
                  Crypto KOL Hub is an active initiative connecting real Web3 voices
                  with global events and ecosystem opportunities.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── What We're Building ──────────────────────────────────────────────────────
function WhatWeBuilding() {
  const { ref, isInView } = useScrollInView();

  const cards = [
    { icon: "🌐", title: "Creator Network", desc: "A growing network of real Web3 creators, KOLs and community voices from across the global ecosystem.", color: "from-indigo-600/20 to-purple-600/20", border: "border-indigo-500/20" },
    { icon: "📅", title: "Event Discovery", desc: "Following and highlighting relevant global Web3 and crypto events to keep communities informed and connected.", color: "from-cyan-600/20 to-blue-600/20", border: "border-cyan-500/20" },
    { icon: "🔗", title: "Community Bridge", desc: "Connecting global Web3 ecosystems with regional community leaders and local market voices.", color: "from-green-600/20 to-emerald-600/20", border: "border-green-500/20" },
    { icon: "🔍", title: "Transparent Participation", desc: "A clear, honest and community-first approach to creator involvement with no hidden agendas.", color: "from-amber-600/20 to-orange-600/20", border: "border-amber-500/20" },
    { icon: "🗺️", title: "Local Market Insight", desc: "Understanding regional creator communities and market culture to build stronger global connections.", color: "from-pink-600/20 to-rose-600/20", border: "border-pink-500/20" },
    { icon: "🚀", title: "Future Community Events", desc: "Building the foundation for future community-led Web3 gatherings and ecosystem events.", color: "from-violet-600/20 to-purple-600/20", border: "border-violet-500/20" },
  ];

  return (
    <Section id="building" className="bg-[#050c1a]">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.div variants={fadeUp} custom={0}><SectionBadge text="What We're Building" /></motion.div>
          <motion.h2 variants={fadeUp} custom={0.1} className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            A Transparent{" "}<span className="gradient-text-purple">Web3 Ecosystem</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={0.2} className="text-white/50 text-lg max-w-2xl mx-auto">
            Six pillars of a community-first Web3 creator and event network.
          </motion.p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              custom={i * 0.06}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card p-6 group cursor-default transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} border ${card.border} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{card.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

// ─── For Creators ─────────────────────────────────────────────────────────────
function ForCreatorsSection() {
  const { ref, isInView } = useScrollInView();

  return (
    <Section id="creators" className="bg-gradient-to-b from-[#050c1a] to-[#030712]">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="section-divider mb-24" />

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative glass-card p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-cyan-500/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">KOL</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Creator Network</div>
                    <div className="text-white/40 text-xs">Web3 Community Member</div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-green-400 text-xs font-medium bg-green-400/10 px-2 py-1 rounded-full">Active</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {["Connect with global events", "Discover ecosystem builders", "Join transparent network", "Build real community presence"].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      <span className="text-white/70 text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 glass-card px-4 py-2 border-green-500/20"
            >
              <span className="text-green-400 text-sm font-semibold">🌍 Global Network</span>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="order-1 lg:order-2">
            <motion.div variants={fadeUp} custom={0}><SectionBadge text="For Creators & KOLs" /></motion.div>
            <motion.h2 variants={fadeUp} custom={0.1} className="text-4xl lg:text-5xl font-black tracking-tight mb-6">
              For{" "}<span className="gradient-text-green">Creators</span><br />and KOLs
            </motion.h2>
            <motion.p variants={fadeUp} custom={0.2} className="text-white/60 text-lg leading-relaxed mb-8">
              Join a transparent Web3 creator network designed for real voices,
              real communities and long-term ecosystem participation. Crypto KOL Hub
              aims to help creators stay connected with relevant Web3 events,
              communities and global ecosystem opportunities.
            </motion.p>
            <motion.div variants={fadeUp} custom={0.3}>
              <a href="#join"><button className="btn-primary px-8 py-4">Join as a Creator</button></a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── For Events ───────────────────────────────────────────────────────────────
function ForEventsSection() {
  const { ref, isInView } = useScrollInView();

  const events = [
    "Token 2049",
    "ETH Global",
    "Bitcoin Conference",
    "Consensus",
    "Korea Blockchain Week",
    "Permissionless",
  ];

  return (
    <Section id="events" className="bg-[#030712]">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"}>
            <motion.div variants={fadeUp} custom={0}><SectionBadge text="For Events & Communities" /></motion.div>
            <motion.h2 variants={fadeUp} custom={0.1} className="text-4xl lg:text-5xl font-black tracking-tight mb-6">
              For{" "}<span className="gradient-text-purple">Web3 Events</span><br />and Communities
            </motion.h2>
            <motion.p variants={fadeUp} custom={0.2} className="text-white/60 text-lg leading-relaxed mb-8">
              Crypto KOL Hub follows global Web3 events and aims to build stronger
              connections between event ecosystems and regional creator communities.
              Our focus is on visibility, community participation and trusted local
              connections.
            </motion.p>
            <motion.div variants={fadeUp} custom={0.3}>
              <a href="#join"><button className="btn-outline px-8 py-4">Connect With the Community</button></a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
              <div className="relative z-10">
                <h3 className="text-white/80 font-semibold text-sm mb-6 uppercase tracking-wider">
                  Event Ecosystem
                </h3>

                {/* IBW — featured / highlighted */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.35 }}
                  className="mb-3 px-4 py-3 rounded-xl bg-indigo-500/[0.10] border border-indigo-500/25 text-white/90 text-sm text-center font-semibold flex items-center justify-center gap-2"
                >
                  🇹🇷 Istanbul Blockchain Week
                </motion.div>

                <div className="grid grid-cols-2 gap-3">
                  {events.map((ev, i) => (
                    <motion.div
                      key={ev}
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.45 + i * 0.08 }}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/60 text-sm text-center"
                    >
                      {ev}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 1 }}
                  className="mt-4 text-center text-white/30 text-xs"
                >
                  + many more global events
                </motion.div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 glass-card px-4 py-2 border-purple-500/20"
            >
              <span className="text-purple-400 text-sm font-semibold">📡 Always Discovering</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── Global Vision ────────────────────────────────────────────────────────────
function GlobalVisionSection() {
  const { ref, isInView } = useScrollInView();

  return (
    <Section className="bg-gradient-to-b from-[#030712] to-[#050c1a] overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="section-divider mb-24" />

        <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.div variants={fadeUp} custom={0}><SectionBadge text="Global Vision" /></motion.div>
          <motion.h2 variants={fadeUp} custom={0.1} className="text-4xl lg:text-5xl font-black tracking-tight mb-6">
            From{" "}<span className="gradient-text-green">Local Voices</span><br />
            to{" "}<span className="gradient-text-purple">Global Web3 Connections</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={0.2} className="text-white/50 text-lg max-w-2xl mx-auto">
            Web3 is global, but communities are local. Crypto KOL Hub is being built
            to connect regional creators, event communities and ecosystem builders
            through a transparent and community-first network.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1 }}
          className="relative glass-card p-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-cyan-900/10" />
          <div className="relative z-10 h-56 sm:h-72 overflow-hidden">
            <div style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 180 }).map((_, i) => {
                const delay = Math.random() * 3;
                const scale = Math.random() * 0.8 + 0.2;
                const colors = ["#6366f1", "#00ff88", "#0ea5e9", "#a855f7"];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const isPrimary = Math.random() > 0.7;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{ left: `${(i % 18) * 5.56 + Math.random() * 2}%`, top: `${Math.floor(i / 18) * 10 + Math.random() * 4}%`, backgroundColor: color, scale }}
                    animate={isPrimary ? { opacity: [0.2, 0.8, 0.2], scale: [scale, scale * 2, scale] } : { opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 2 + delay, repeat: Infinity, delay }}
                  />
                );
              })}
            </div>
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
              {[
                { x1: "15%", y1: "30%", x2: "40%", y2: "55%", color: "#6366f1" },
                { x1: "40%", y1: "55%", x2: "70%", y2: "35%", color: "#00ff88" },
                { x1: "70%", y1: "35%", x2: "85%", y2: "65%", color: "#0ea5e9" },
                { x1: "15%", y1: "30%", x2: "70%", y2: "35%", color: "#a855f7" },
                { x1: "40%", y1: "55%", x2: "85%", y2: "65%", color: "#6366f1" },
              ].map((line, i) => (
                <motion.line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={line.color} strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }} animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}} transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }} />
              ))}
              {[
                { cx: "15%", cy: "30%", color: "#6366f1" },
                { cx: "40%", cy: "55%", color: "#00ff88" },
                { cx: "70%", cy: "35%", color: "#0ea5e9" },
                { cx: "85%", cy: "65%", color: "#a855f7" },
              ].map((dot, i) => (
                <motion.circle key={i} cx={dot.cx} cy={dot.cy} r="4" fill={dot.color}
                  initial={{ scale: 0, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : {}} transition={{ duration: 0.5, delay: 1 + i * 0.15 }} filter="url(#glow)" />
              ))}
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
            </svg>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {["🇹🇷 Türkiye", "East Asia", "Southeast Asia", "Europe", "Middle East", "Latin America", "North America"].map((region, i) => (
              <motion.span
                key={region}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.2 + i * 0.08 }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  region.startsWith("🇹🇷")
                    ? "text-white/80 bg-indigo-500/10 border-indigo-500/25"
                    : "text-white/60 bg-white/[0.04] border-white/[0.08]"
                }`}
              >
                {region}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── Transparency Section ─────────────────────────────────────────────────────
function TransparencySection() {
  const { ref, isInView } = useScrollInView();

  const negatives = ["No fake engagement", "No fake creator lists", "No scam culture", "No investment advice", "No token sales", "No trading services", "No custody services", "No financial promises"];
  const positives = ["Real creators", "Real communities", "Real Web3 participation", "Transparent processes", "Community-first decisions", "Open network"];

  return (
    <Section id="transparency" className="bg-[#050c1a]">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="section-divider mb-24" />

        <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.div variants={fadeUp} custom={0}><SectionBadge text="Our Commitment" /></motion.div>
          <motion.h2 variants={fadeUp} custom={0.1} className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Built on{" "}<span className="gradient-text-green">Transparency</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={0.2} className="text-white/50 text-lg max-w-xl mx-auto">
            We believe in being completely clear about what we are — and what we are not.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="glass-card p-6 border-red-500/10 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 text-sm">✗</span>
                </div>
                <h3 className="font-bold text-white/80">What We Are Not</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {negatives.map((item, i) => (
                  <motion.div key={item} initial={{ opacity: 0, x: -10 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <span className="text-red-400/60 text-sm flex-shrink-0">—</span>
                    <span className="text-white/50 text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.3 }}>
            <div className="glass-card p-6 border-green-500/10 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <h3 className="font-bold text-white/80">What We Are</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {positives.map((item, i) => (
                  <motion.div key={item} initial={{ opacity: 0, x: 10 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <span className="text-green-400 text-sm flex-shrink-0">✓</span>
                    <span className="text-white/80 text-sm font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1 }}
                className="mt-6 p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                <p className="text-green-400/80 text-sm leading-relaxed">
                  <span className="font-semibold">Our Promise: </span>
                  Every action we take is community-first, transparent and honest.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── Founders Section ─────────────────────────────────────────────────────────
function FoundersSection() {
  const { ref, isInView } = useScrollInView();

  const founders = [
    {
      handle: "TheCryptoOnur",
      displayName: "TheCryptoOnur",
      role: "Co-Founder",
      bio: "Web3 community builder & crypto content creator. Building transparent networks from Türkiye to the globe.",
      xUrl: "https://x.com/TheCryptoOnur",
      gradient: "from-cyan-500/20 to-indigo-500/20",
      dot: "bg-cyan-400",
    },
    {
      handle: "DoodleScr",
      displayName: "DoodleScr",
      role: "Co-Founder",
      bio: "Web3 enthusiast & ecosystem contributor. Co-building the future of KOL & creator communities.",
      xUrl: "https://x.com/DoodleScr",
      gradient: "from-indigo-500/20 to-purple-500/20",
      dot: "bg-indigo-400",
    },
  ];

  return (
    <Section id="team" className="bg-[#030712]">
      <div className="max-w-4xl mx-auto" ref={ref}>
        <div className="section-divider mb-24" />

        <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.div variants={fadeUp} custom={0}><SectionBadge text="The Founders" /></motion.div>
          <motion.h2 variants={fadeUp} custom={0.1} className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Built by{" "}<span className="gradient-text-green">Real People</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={0.2} className="text-white/50 text-lg max-w-xl mx-auto">
            Crypto KOL Hub is founded and led by active Web3 community members
            who are building transparently from day one.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {founders.map((founder, i) => (
            <motion.div
              key={founder.handle}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
            >
              {/* Card banner */}
              <div className={`h-24 bg-gradient-to-br ${founder.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 8 }).map((_, k) => (
                    <div
                      key={k}
                      className="absolute rounded-full border border-white/20"
                      style={{ width: 40 + k * 20, height: 40 + k * 20, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
                    />
                  ))}
                </div>
                {/* X watermark */}
                <div className="absolute top-3 right-4 text-white/10 group-hover:text-white/20 transition-colors">
                  <XIcon size={32} />
                </div>
                {/* Türkiye tag */}
                <div className="absolute bottom-3 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
                  <span className="text-xs">🇹🇷</span>
                  <span className="text-white/60 text-[10px] font-medium">Türkiye</span>
                </div>
              </div>

              {/* Profile photo (overlaps banner) */}
              <div className="px-6 -mt-8 mb-4 flex items-end justify-between">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl overflow-hidden ring-[3px] ring-[#0a0f1e] group-hover:ring-indigo-500/30 transition-all duration-300 shadow-xl">
                    <img
                      src={`https://unavatar.io/twitter/${founder.handle}`}
                      alt={founder.displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.displayName)}&background=6366f1&color=fff&size=64`;
                      }}
                    />
                  </div>
                  {/* Online dot */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${founder.dot} ring-2 ring-[#0a0f1e]`} />
                </div>

                {/* Follow button */}
                <a
                  href={founder.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all duration-200 shadow-lg"
                >
                  <XIcon size={11} />
                  Follow
                </a>
              </div>

              {/* Card body */}
              <div className="px-6 pb-6">
                <h3 className="font-bold text-white text-base mb-0.5 group-hover:text-indigo-300 transition-colors">
                  {founder.displayName}
                </h3>
                <p className="text-indigo-400/70 text-xs font-mono mb-2">@{founder.handle}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] mb-3">
                  <span className="text-white/60 text-[11px] font-semibold uppercase tracking-wide">{founder.role}</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">{founder.bio}</p>

                {/* Stats row */}
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-1 text-white/30 text-xs">
                  <span>Crypto KOL Hub</span>
                  <span className="mx-1">·</span>
                  <span className="gradient-text-green font-medium">Co-Founder</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── Join Section ─────────────────────────────────────────────────────────────
function JoinSection() {
  const { ref, isInView } = useScrollInView();
  const [form, setForm] = useState({ name: "", email: "", telegram: "", twitter: "", country: "", role: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setStatus("success"); setForm({ name: "", email: "", telegram: "", twitter: "", country: "", role: "", message: "" }); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  return (
    <Section id="join" className="bg-gradient-to-b from-[#050c1a] to-[#030712]">
      <div className="max-w-3xl mx-auto" ref={ref}>
        <div className="section-divider mb-24" />

        <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-center mb-12">
          <motion.div variants={fadeUp} custom={0}><SectionBadge text="Join the Network" /></motion.div>
          <motion.h2 variants={fadeUp} custom={0.1} className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Join the{" "}<span className="gradient-text-green">Crypto KOL Hub</span><br />Network
          </motion.h2>
          <motion.p variants={fadeUp} custom={0.2} className="text-white/50 text-lg max-w-xl mx-auto">
            Whether you are a creator, KOL, event organizer, community builder or
            Web3 ecosystem contributor — join the early network and become part of
            a transparent Web3 community initiative.
          </motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.3 }}>
          {status === "success" ? (
            <div className="glass-card p-12 text-center border-green-500/20">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Application Submitted!</h3>
              <p className="text-white/50 text-lg">Thank you for joining the Crypto KOL Hub network. We will be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card p-8">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" className="form-input" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="form-input" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Telegram</label>
                  <input name="telegram" value={form.telegram} onChange={handleChange} placeholder="@username" className="form-input" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">X / Twitter</label>
                  <input name="twitter" value={form.twitter} onChange={handleChange} placeholder="@handle" className="form-input" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Country</label>
                  <input name="country" value={form.country} onChange={handleChange} placeholder="Your country" className="form-input" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Role *</label>
                  <select name="role" value={form.role} onChange={handleChange} required className="form-input">
                    <option value="" disabled>Select your role</option>
                    <option value="Creator / KOL">Creator / KOL</option>
                    <option value="Event Organizer">Event Organizer</option>
                    <option value="Community Builder">Community Builder</option>
                    <option value="Media">Media</option>
                    <option value="Web3 Project">Web3 Project</option>
                    <option value="Ecosystem Contributor">Ecosystem Contributor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={4}
                  placeholder="Tell us about yourself and why you want to join the network..." className="form-input resize-none" />
              </div>

              {status === "error" && <p className="mt-3 text-red-400 text-sm">Something went wrong. Please try again.</p>}

              <button type="submit" disabled={status === "loading"} className="btn-primary w-full mt-6 text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed">
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Submitting...
                  </span>
                ) : "Submit Application"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </Section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Community", href: "#building" },
    { label: "Events", href: "#events" },
    { label: "Creators", href: "#creators" },
    { label: "Team", href: "#team" },
    { label: "Join", href: "#join" },
  ];

  return (
    <footer className="relative bg-[#030712] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Top */}
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Crypto KOL Hub" className="w-9 h-9 object-contain" style={{ mixBlendMode: "screen" }} />
              <span className="font-bold text-white text-lg">
                Crypto <span className="gradient-text-green">KOL Hub</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-4">
              Crypto KOL Hub is an independent Web3 community and creator network
              initiative connecting real creators, events and communities globally.
            </p>
            <span className="inline-flex items-center gap-1.5 text-white/30 text-xs">
              🇹🇷 Rooted in Türkiye. Connected to Global Web3.
            </span>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Navigation</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {navLinks.map(l => (
                <a key={l.label} href={l.href} className="text-white/40 hover:text-white text-sm transition-colors duration-200">
                  {l.label}
                </a>
              ))}
            </div>
            <div className="mt-4">
              <a href="mailto:hello@cryptokolhub.com" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                hello@cryptokolhub.com
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Follow Us</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://x.com/cryptokolhub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 text-sm group"
              >
                <XIcon size={15} />
                <span>@cryptokolhub</span>
              </a>
              <a
                href="https://t.me/cryptokolhubtr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 text-sm group"
              >
                <TelegramIcon size={15} />
                <span>@cryptokolhubtr</span>
              </a>
              <a
                href="https://x.com/TheCryptoOnur"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 text-sm group"
              >
                <XIcon size={15} />
                <span>@TheCryptoOnur</span>
              </a>
              <a
                href="https://x.com/DoodleScr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 text-sm group"
              >
                <XIcon size={15} />
                <span>@DoodleScr</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-8" />

        {/* Disclaimer */}
        <div className="mb-8 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <p className="text-white/25 text-xs leading-relaxed">
            <span className="text-white/40 font-semibold">Disclaimer: </span>
            Crypto KOL Hub is not a crypto exchange, investment platform, launchpad,
            token sale platform, custody provider, trading service or financial advisory
            service. We do not provide investment advice, token sales, custody services,
            trading services or financial promises. Crypto KOL Hub exists as a
            community-first Web3 creator and event network initiative.
          </p>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Crypto KOL Hub. An independent Web3 community initiative.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/25 text-xs">Network Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <WhatWeBuilding />
        <ForCreatorsSection />
        <ForEventsSection />
        <GlobalVisionSection />
        <TransparencySection />
        <FoundersSection />
        <JoinSection />
      </main>
      <Footer />
    </>
  );
}
