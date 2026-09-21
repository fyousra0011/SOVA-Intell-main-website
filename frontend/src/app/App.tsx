import React, { useState, useEffect, useRef, FormEvent, ReactNode } from "react";
import { ImageWithFallback } from "@/app/components/media/ImageWithFallback";
import { WhatsAppButton } from "@/app/components/WhatsAppButton";
import sovaLogo from "@/imports/sova.png";
import salasiahPic from "@/imports/salasiah.jpeg";
import fadillahPic from "@/imports/fadillah.jpeg";
import waynePic from "@/imports/wayne.jpeg";
import sovaImg1 from "@/imports/image-1.png";
import sovaImg2 from "@/imports/image-2.png";
import sovaImg3 from "@/imports/image-3.png";
import {
  Menu, X, ArrowRight, Linkedin, Instagram, Facebook, Twitter,
  Brain, Zap, BarChart3,
  Globe, CheckCircle, ChevronRight,
  Send, Shield, Cpu,
} from "lucide-react";

type Page = "home" | "about" | "services" | "rsvp";

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY    = "'DM Sans', sans-serif";
const GRAD    = "linear-gradient(125deg, #4F7DFF 0%, #8B5CF6 100%)";

// ══════════════════════════════════════════════════════════════
// SCROLL ANIMATION PRIMITIVES
// ══════════════════════════════════════════════════════════════

function useInView(threshold = 0.12, once = false) {
  const ref  = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); if (once) observer.disconnect(); }
        else if (!once) setInView(false);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);
  return { ref, inView };
}

function TextBlockReveal({
  children, blockColor = "#2d2d2d", delay = 0, duration = 860, className = "",
}: { children: ReactNode; blockColor?: string; delay?: number; duration?: number; className?: string }) {
  const { ref, inView } = useInView(0.15, false);
  const [textVisible,  setTextVisible]  = useState(false);
  const [blockPlaying, setBlockPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    clearAll();
    if (inView) {
      setTextVisible(false); setBlockPlaying(false);
      const t0 = setTimeout(() => {
        setBlockPlaying(true);
        const t1 = setTimeout(() => setTextVisible(true), delay + duration * 0.41);
        timers.current.push(t1);
      }, 32);
      timers.current.push(t0);
    } else { setTextVisible(false); setBlockPlaying(false); }
    return clearAll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div style={{ opacity: textVisible ? 1 : 0, transition: "none" }}>{children}</div>
      <div aria-hidden style={{
        position: "absolute", inset: 0, backgroundColor: blockColor,
        pointerEvents: "none", zIndex: 1,
        clipPath: blockPlaying ? undefined : "inset(0 100% 0 0)",
        animation: blockPlaying ? `blockWipe ${duration}ms cubic-bezier(0.77,0,0.175,1) ${delay}ms both` : "none",
      }} />
    </div>
  );
}

function FadeUp({ children, delay = 0, distance = 26, className = "", once = false }: {
  children: ReactNode; delay?: number; distance?: number; className?: string; once?: boolean;
}) {
  const { ref, inView } = useInView(0.1, once);
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : `translateY(${distance}px)`,
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LAYERED TEXT  (CSS-only reimplementation — no GSAP)
// ══════════════════════════════════════════════════════════════

const LAYERED_LINES = [
  { top: " ",         bottom: "INTELLIGENCE" },
  { top: "INTELLIGENCE",  bottom: "TRANSFORMS" },
  { top: "TRANSFORMS",      bottom: "MALAYSIA" },
  { top: "MALAYSIA",    bottom: "TOMORROW" },
  { top: "TOMORROW",      bottom: "BEGINS" },
  { top: "BEGINS",        bottom: "NOW" },
  { top: "NOW",           bottom: " " },
];

function LayeredText({ textProgress }: { textProgress: number }) {
  const LH = 44;
  const n = LAYERED_LINES.length;
  const center = Math.floor(n / 2);
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0 -12px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {LAYERED_LINES.map((line, i) => {
        const isEven = i % 2 === 0;
        const offset = (i - center) * 22;
        const threshold = (i / (n - 1)) * 0.6;
        const progress  = Math.max(0, Math.min(1, (textProgress - threshold) / 0.28));
        const shift     = -LH * progress;
        return (
          <li key={i} style={{
            height: LH, overflow: "hidden", flexShrink: 0,
            transform: `translateX(${offset}px) skew(${isEven ? "60deg,-30deg" : "0deg,-30deg"}) scaleY(${isEven ? 0.66667 : 1.33333})`,
          }}>
            <div style={{ transform: `translateY(${shift}px)`, transition: "none" }}>
              {[line.top, line.bottom].map((word, pi) => (
                <p key={pi} style={{
                  height: LH, lineHeight: `${LH - 2}px`, margin: 0, padding: "0 8px",
                  whiteSpace: "nowrap", fontFamily: DISPLAY, fontWeight: 900,
                  fontSize: "clamp(28px, 3.2vw, 46px)", color: "white", letterSpacing: "-0.02em",
                }}>
                  {word}
                </p>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ══════════════════════════════════════════════════════════════
// IMAGE DECK  (CSS fan carousel + scroll parallax)
// ══════════════════════════════════════════════════════════════

const DECK_IMAGES = [
  { url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=85", alt: "AI digital" },
  { url: "https://images.unsplash.com/photo-1677442135131-4d7c123aef1c?auto=format&fit=crop&w=600&q=85", alt: "AI chip" },
  { url: "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?auto=format&fit=crop&w=600&q=85", alt: "AI sphere" },
  { url: "https://images.unsplash.com/photo-1531538512164-e6c51ea63d20?auto=format&fit=crop&w=600&q=85", alt: "Business professionals" },
  { url: "https://images.unsplash.com/photo-1581981657871-77c0d8adc84d?auto=format&fit=crop&w=600&q=85", alt: "Kuala Lumpur" },
  { url: "https://images.unsplash.com/photo-1579565585623-299b4f4730c2?auto=format&fit=crop&w=600&q=85", alt: "City skyline" },
];

// Asymmetric 2-column mosaic — scroll parallax via Ken Burns per image
function ImageMosaic({ scrollProgress: p }: { scrollProgress: number }) {
  const col: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: 12, flexShrink: 0,
  };
  const cell = (h: number, shadow = false): React.CSSProperties => ({
    width: "100%", height: h, borderRadius: 14, overflow: "hidden",
    flexShrink: 0,
    boxShadow: shadow
      ? "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)"
      : "0 12px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
  });
  const imgStyle = (rate: number): React.CSSProperties => ({
    width: "100%", height: "145%", objectFit: "cover", objectPosition: "center",
    display: "block",
    transform: `translateY(${-p * rate}%)`,
    transition: "transform 0.08s linear",
    userSelect: "none" as const,
  });

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", width: 400, flexShrink: 0 }}>
      {/* Left column — starts 40px lower */}
      <div style={{ ...col, width: 188, paddingTop: 40 }}>
        <div style={cell(268, true)}>
          <img src={sovaImg1} alt="SOVA — government engagement" draggable={false} style={imgStyle(18)} />
        </div>
        <div style={cell(148)}>
          <img src={sovaImg2} alt="SOVA — strategic meeting" draggable={false} style={imgStyle(28)} />
        </div>
      </div>
      {/* Right column — starts flush top */}
      <div style={{ ...col, width: 188 }}>
        <div style={cell(176)}>
          <img src={sovaImg3} alt="SOVA — Asia Pacific Sustainability Conference" draggable={false} style={imgStyle(22)} />
        </div>
        <div style={cell(252, true)}>
          <img src={DECK_IMAGES[3].url} alt={DECK_IMAGES[3].alt} draggable={false} style={imgStyle(14)} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// IMPACT SECTION  (sticky-scroll wrapper)
// ══════════════════════════════════════════════════════════════

function ImpactSection() {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect    = el.getBoundingClientRect();
      const total   = el.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: "180vh" }} className="mobile-impact-section relative">
      <div className="sticky top-0 h-screen bg-[#111111] border-t border-b border-[#1a1a1a]">
        <div className="mobile-impact-shell h-full max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-[1fr_560px] gap-0 items-center">

          {/* ── Left column ── */}
          <div className="mobile-impact-copy py-16 lg:py-0 lg:pr-8">
            <FadeUp once>
              <div className="text-[10px] uppercase tracking-[0.38em] text-gray-600 mb-10">
                The Turning Point
              </div>
            </FadeUp>

            {/* Layered text shifted ~32px right of its natural start */}
            <div className="mobile-layered-text mb-10" style={{ paddingLeft: 32 }}>
              <LayeredText textProgress={Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.8))} />
            </div>

            <FadeUp delay={180} once>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-4 max-w-sm" style={{ fontFamily: BODY }}>
                We don't just implement AI.{" "}
                <span className="text-white font-medium">We rewrite what's possible</span> for
                the organisations bold enough to ask for more.
              </p>
            </FadeUp>
            <FadeUp delay={280} once>
              <p className="text-gray-600 text-sm leading-relaxed max-w-sm" style={{ fontFamily: BODY }}>
                Every client we work with discovers the same truth: the distance between where
                you are and where AI can take you is smaller than you think — and the leap is
                more transformative than you imagined.
              </p>
            </FadeUp>

            <FadeUp delay={420} once>
              <div className="mt-10 flex items-center gap-3">
                <div className="w-6 h-px bg-gray-700" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gray-700">
                  Scroll to explore
                </span>
              </div>
            </FadeUp>
          </div>

          {/* ── Right column: mosaic sits flush right ── */}
          <div className="hidden lg:flex justify-end items-center h-full">
            <ImageMosaic scrollProgress={scrollProgress} />
          </div>

          {/* Mobile */}
          <div className="mobile-impact-mosaic flex lg:hidden justify-center pb-16">
            <ImageMosaic scrollProgress={scrollProgress} />
          </div>
        </div>

        {/* Scroll progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1a1a1a]">
          <div
            className="h-full bg-[#4F7DFF]"
            style={{ width: `${scrollProgress * 100}%`, transition: "width 0.1s linear" }}
          />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LOGO
// ══════════════════════════════════════════════════════════════
function SovaLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const hMap = { sm: 20, md: 24, lg: 32 };
  const subSz = { sm: "text-[10px]", md: "text-[11px]", lg: "text-sm" };
  const h = hMap[size];
  return (
    <div className="flex items-center select-none">
      <img
        src={sovaLogo}
        alt="SOVA"
        draggable={false}
        style={{ height: h, width: "auto", mixBlendMode: "screen" as const, display: "block" }}
      />
      <div className="w-px bg-white/35 mx-2.5 flex-shrink-0" style={{ height: Math.round(h * 0.72) }} />
      <span className={`text-white font-light uppercase tracking-[0.18em] ${subSz[size]}`} style={{ fontFamily: DISPLAY }}>
        Intelligence
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LOADING SCREEN  — SOVA left · line · Intelligence right
// ══════════════════════════════════════════════════════════════
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 350);
    const t2 = setTimeout(() => setPhase(2), 850);
    const t3 = setTimeout(() => setPhase(3), 2400);
    const t4 = setTimeout(onComplete, 3150);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      style={{ opacity: phase === 3 ? 0 : 1, transition: "opacity 0.75s ease", pointerEvents: phase === 3 ? "none" : "all", fontFamily: DISPLAY }}
    >
      <div className="flex items-center">

        {/* ── SOVA — LEFT of the centre line ── */}
        <div style={{
          opacity:    phase >= 2 ? 1 : 0,
          transform:  `translateX(${phase >= 2 ? 0 : 36}px)`,
          transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          paddingRight: 28,
        }}>
          <img
            src={sovaLogo}
            alt="SOVA"
            draggable={false}
            style={{ height: "clamp(52px, 10vw, 90px)", width: "auto", mixBlendMode: "screen" as const, display: "block" }}
          />
        </div>

        {/* Centre line */}
        <div style={{
          width: 1.5, background: "white",
          height: phase >= 1 ? 72 : 0,
          transition: "height 0.55s cubic-bezier(0.16,1,0.3,1)",
          flexShrink: 0,
        }} />

        {/* ── Intelligence — RIGHT of the centre line ── */}
        <div style={{
          opacity:    phase >= 2 ? 1 : 0,
          // starts just left of its final position (near the line) → slides right to final
          transform:  `translateX(${phase >= 2 ? 0 : -36}px)`,
          transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          fontWeight: 300,
          fontSize:   "clamp(15px, 3.2vw, 24px)",
          letterSpacing: "0.24em",
          textTransform: "uppercase" as const,
          color:      "rgba(255,255,255,0.85)",
          paddingLeft: 28,
        }}>
          Intelligence
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PARTICLE CANVAS
// ══════════════════════════════════════════════════════════════
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let id: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 65 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
    }));
    const draw = () => {
      const w = canvas.width, h = canvas.height; ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(79,125,255,0.75)"; ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 135) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(79,125,255,${0.11 * (1 - d / 135)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.38 }} />;
}

// ══════════════════════════════════════════════════════════════
// TICKER
// ══════════════════════════════════════════════════════════════
const TICKER_WORDS = [
  "Applied AI","Automation & Ecosystem Designs","Johor Bahru · KL","Zhejiang University MOU",
  "Cyberjaya AI-Exchange","SOVA Rise™","Graphen Partnership","Digital Workflows",
  "Workforce Development","Digital Nation","Data Intelligence","Innovation",
];

function Ticker() {
  const items = [...TICKER_WORDS, ...TICKER_WORDS, ...TICKER_WORDS, ...TICKER_WORDS];
  return (
    <div className="overflow-hidden border-t border-[#1a1a1a] bg-[#0a0a0a] py-3">
      <div className="flex whitespace-nowrap" style={{ animation: "ticker 34s linear infinite" }}>
        {items.map((w, i) => (
          <span key={i} className="inline-flex items-center text-[10px] uppercase tracking-[0.26em] text-gray-600">
            <span className="px-5">{w}</span>
            <span className="text-gray-700 mx-1">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SHARED ATOMS
// ══════════════════════════════════════════════════════════════
function Label({ children }: { children: string }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.38em] text-gray-600 mb-8">
      {children}
    </div>
  );
}

function Statement({ lines }: { lines: string[] }) {
  return (
    <div className="px-6 md:px-16 py-20 md:py-28 border-y border-[#1a1a1a] bg-[#0a0a0a]">
      <div className="max-w-5xl space-y-1">
        {lines.map((line, i) => (
          <TextBlockReveal key={i} blockColor="#2d2d2d" delay={i * 130} duration={880}>
            <p style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "calc(var(--sf) * 2.8)", lineHeight: 1.1, color: "white" }}>
              {line}
            </p>
          </TextBlockReveal>
        ))}
      </div>
    </div>
  );
}

function ThreadsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16.5 7.7c-1.1-.9-2.5-1.4-4.2-1.4-3.2 0-5.4 2-5.4 5.1 0 3 2.2 5 5.4 5 1.8 0 3.1-.5 4.2-1.6l-1.8-1.7c-.7.8-1.6 1.2-2.6 1.2-1.9 0-3.2-1.3-3.2-3.3 0-2 1.3-3.2 3.2-3.2 1.1 0 2.1.4 2.7 1.2l1.7-1.7Zm-4.8 5.1c-.4.6-1 .9-1.8.9-1.5 0-2.5-1-2.5-2.7 0-1.7 1-2.7 2.5-2.7.8 0 1.4.3 1.8.9l1.8-1.7c-.9-.9-2.2-1.4-3.8-1.4-2.8 0-4.8 2-4.8 5 0 3.1 2.1 5.1 4.9 5.1 1.8 0 3.2-.6 4.2-1.8l-1.8-1.8c-.6.7-1.4 1-2.3 1-.9 0-1.7-.4-2.2-1.1l-1.9 1.8c.8 1.3 2.3 2.2 4.2 2.2 3.2 0 5.7-2 5.7-5.4 0-2.8-1.8-4.9-4.4-5.3v2.2h-.1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.6 9.1c.7-.3 1.5-.4 2.3-.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════════════════════════════
function Navbar({ page, go }: { page: Page; go: (p: Page) => void }) {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links: [string, Page][] = [["About","about"],["Services","services"]];
  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/92 backdrop-blur-md border-b border-[#1a1a1a]" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-[72px]">
          <button onClick={() => { go("home"); setOpen(false); }} className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <SovaLogo />
          </button>
          <div className="hidden md:flex items-center gap-7">
            {links.map(([label, p]) => (
              <button key={p} onClick={() => go(p)} className={`text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-white ${page === p ? "text-white" : "text-gray-500"}`}>{label}</button>
            ))}
            <button onClick={() => go("rsvp")} className="ml-3 px-5 py-2 rounded-full border border-white/25 text-white text-[11px] uppercase tracking-[0.16em] hover:bg-white hover:text-black hover:border-white transition-all duration-200">
              Contact
            </button>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-1 min-h-[48px] min-w-[48px] flex items-center justify-center">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col pt-20 px-8 md:hidden transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col gap-6 pt-6">
          {links.map(([label, p]) => (
            <button key={p} onClick={() => { go(p); setOpen(false); }} className="text-left text-4xl font-black text-white uppercase tracking-tight hover:text-gray-300 transition-colors" style={{ fontFamily: DISPLAY }}>{label}</button>
          ))}
          <button onClick={() => { go("rsvp"); setOpen(false); }} className="text-left text-4xl font-black text-white uppercase tracking-tight hover:text-gray-300 transition-colors" style={{ fontFamily: DISPLAY }}>Contact</button>
        </div>
        <div className="mt-auto pb-10 border-t border-[#1a1a1a] pt-8">
          <p className="text-gray-600 text-xs uppercase tracking-[0.2em]">Cyberjaya · Johor Bahru, Malaysia</p>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════════════════════
function Footer({ go }: { go: (p: Page) => void }) {
  return (
    <footer className="bg-[#080808] border-t border-[#1a1a1a] px-6 md:px-16 pt-16 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div>
            <SovaLogo size="lg" />
            <p className="mt-5 text-gray-600 text-sm leading-relaxed max-w-xs" style={{ fontFamily: BODY }}>Intelligence. Innovation. Impact.</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-gray-700 mb-5">Navigate</p>
            <div className="flex flex-col gap-3">
              {([['Home', 'home'], ['About', 'about'], ['Services', 'services'], ['Contact', 'rsvp']] as [string, Page][]).map(([l, p]) => (
                <button key={p} onClick={() => go(p)} className="text-sm text-gray-600 hover:text-white transition-colors text-left" style={{ fontFamily: BODY }}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-gray-700 mb-5">Connect</p>
            <div className="flex flex-wrap gap-3 mb-5">
              {[
                { href: "https://www.linkedin.com/company/sovaintelligence/", label: "LinkedIn", Icon: Linkedin },
                { href: "https://www.facebook.com/SOVAintell/", label: "Facebook", Icon: Facebook },
                { href: "https://www.instagram.com/sovaintell/", label: "Instagram", Icon: Instagram },
                { href: "https://x.com/SOVAintell", label: "X", Icon: Twitter },
                { href: "https://www.threads.com/@sovaintell", label: "Threads", Icon: ThreadsIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  title={label}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#1a1a1a] bg-[#0f0f0f] text-gray-600 hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  <Icon size={16} className="shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.18em]">© 2026 SOVA. All rights reserved.</p>
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.18em]">CYBERJAYA · Johor Bahru, Malaysia</p>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════════
const PARTNER_NAMES = [
  "Zhejiang University","Graphen","SustNET","KPYPJ",
  "Cyberjaya AI-Exchange","KUSKOP","Zhejiang Business Station","MDEC","MITI","Cyberview","UTM","UTHM",
];

const HOME_SERVICES = [
  { icon: Brain,         title: "AI & Advanced Analytics",          desc: "Generative AI, machine learning, predictive analytics and RPA — turning data into decisive action." },
  { icon: Zap,           title: "Intelligent Automation",           desc: "Engineering connected automation paths tailored around your existing operational software." },
  { icon: BarChart3,     title: "Enterprise Intelligence",          desc: "Executive dashboards, data warehousing and real-time analytics that transform raw data into clarity." },
  { icon: Shield,        title: "Cybersecurity & Digital Resilience", desc: "Cybersecurity frameworks, security monitoring and threat intelligence to protect your operations." },
  { icon: Globe,         title: "IoT & Smart Infrastructure",       desc: "IoT sensors, edge computing and remote monitoring for intelligent, connected environments." },
  { icon: Cpu,           title: "Digital Twins & Emerging Tech",    desc: "Digital twin platforms, simulation modelling and scenario analysis for future-ready decision-making." },
];

const WHY_US = [
  { tag: "Enterprise Solutions",  title: "Workflow automation that delivers.",      desc: "Eliminating fragmented manual tracking to slash back-office reporting delays. We build connected automation paths engineered around your existing operational software." },
  { tag: "Decision Intelligence", title: "From raw data to real-time insight.",     desc: "Transforming raw institutional data into predictive dashboards that give leadership the clarity to act — not just report." },
  { tag: "Ecosystem Activation",  title: "Scalable blueprints for growth.",         desc: "Designing compliant technical blueprints built for corporate and ministry infrastructure, with Cyberjaya AI-Exchange and KPYPJ as anchors." },
  { tag: "Personal Solutions",    title: "AI literacy that sticks.",                desc: "Mastery of applied AI tools, smart prompting frameworks, and automated workflows — transitioning your team from awareness to execution." },
];

function HomePage({ go }: { go: (p: Page) => void }) {
  const logoItems = [...PARTNER_NAMES, ...PARTNER_NAMES, ...PARTNER_NAMES, ...PARTNER_NAMES, ...PARTNER_NAMES];

  return (
    <div style={{ fontFamily: BODY }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
        <ParticleCanvas />
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 md:px-16 pt-28 pb-0">
          <div className="text-[10px] uppercase tracking-[0.38em] text-gray-600 mb-8">
            Cyberjaya · Johor Bahru, Malaysia
          </div>
          <h1 className="mobile-hero-title font-black leading-[0.91] tracking-tight text-white mb-8" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 9.2)", letterSpacing: "0.02em", wordSpacing: "0.14em" }}>
            Applied AI.
            <br />
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "0.01em", wordSpacing: "0.12em" }}>
              Real-World<br />Execution.
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-10 max-w-md font-light">
            Practical, inclusive AI for organisations that need more than strategy — they need results. 
          </p>
          <div>
            <button onClick={() => go("about")} className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white text-black font-bold text-xs uppercase tracking-[0.16em] rounded-full hover:bg-white/90 transition-all">
              Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        <div className="relative z-10 mt-20"><Ticker /></div>
      </section>

      {/* ── MILESTONE ─────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-24 md:py-36 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>The Impact</Label></FadeUp>
          <TextBlockReveal blockColor="#2d2d2d" duration={920} className="mb-16">
            <h2 className="mobile-impact-title font-black text-white leading-tight max-w-4xl" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 4.8)", lineHeight: 1.08 }}>
              Most organisations aren't lacking technology — they're struggling with execution. SOVA builds the connective layer that turns investment into measurable impact.
            </h2>
          </TextBlockReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1a1a1a]">
            {([["40–60%","Manual Efficiency Gains"],["3","Operational Pillars"],["Est. 2025","FROM EDTECH TO AI · SINCE 2019"]] as [string,string][]).map(([v, l], i) => (
              <FadeUp key={l} delay={i * 100} className="bg-[#0a0a0a]">
                <div className="p-10 md:p-14">
                  <div className="font-black text-white mb-2" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 5)", lineHeight: 1 }}>{v}</div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-gray-600">{l}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATEMENT 1 ───────────────────────────────────────── */}
      <Statement lines={[
        "Most organisations are not lacking technology.",
        "They are struggling with execution.",
      ]} />

      {/* ── WHO WE ARE ────────────────────────────────────────── */}
      <section className="bg-[#111111] py-24 md:py-36 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>Who We Are</Label></FadeUp>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <TextBlockReveal blockColor="#2d2d2d" duration={880} className="mb-6">
                <h2 className="mobile-section-title font-black text-white leading-tight" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 3.4)", lineHeight: 1.1 }}>
                  Bridging global AI research with local operational needs.
                </h2>
              </TextBlockReveal>
              <FadeUp delay={200}><p className="text-gray-400 leading-relaxed mb-4 text-sm md:text-base">SOVA Intelligence (M) Sdn Bhd is a Malaysian Applied AI, Automation & Ecosystem Designs company. We build the connective layer between advanced global research and on-the-ground operational realities — fixing the fundamentals first, then scaling intelligently.</p></FadeUp>
              <FadeUp delay={320}><p className="text-gray-400 leading-relaxed mb-8 text-sm md:text-base">From Johor Bahru to Kuala Lumpur, we turn technology investments into structured execution, measurable impact, and real-world outcomes for enterprises, governments, and communities alike.</p></FadeUp>
              <FadeUp delay={440}>
                <button onClick={() => go("about")} className="text-sm text-[#4F7DFF] hover:text-white transition-colors flex items-center gap-2 group">
                  Our full story <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </FadeUp>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Brain,         title: "Applied AI",          desc: "Generative AI, ML and predictive analytics for real outcomes" },
                { icon: Zap,           title: "Automation",          desc: "Connected workflow automation built around your existing systems" },
                { icon: BarChart3,     title: "Data Intelligence",   desc: "Executive dashboards and real-time analytics platforms" },
                { icon: Shield,        title: "Digital Resilience",  desc: "Cybersecurity frameworks and threat intelligence" },
              ].map(({ icon: Icon, title, desc }, i) => (
                <FadeUp key={title} delay={i * 110} distance={20}>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 md:p-6 hover:border-[#4F7DFF]/40 hover:-translate-y-0.5 transition-all cursor-default h-full">
                    <Icon size={20} className="text-[#4F7DFF] mb-4" />
                    <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BRAND FILM ────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-20 md:py-28 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <FadeUp once>
            <div className="text-[10px] uppercase tracking-[0.38em] text-gray-600 mb-6">Our Story</div>
          </FadeUp>
          <FadeUp delay={80} once>
            <div style={{
              position: "relative",
              paddingTop: "56.25%", // 16:9
              borderRadius: 16,
              overflow: "hidden",
              background: "#0d0d0d",
              border: "1px solid #1e1e1e",
              boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
            }}>
              <iframe
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                src="https://www.youtube.com/embed/_CR03OZaIrQ?si=9ZVh-cN3_qaeWQyG"
                title="SOVA — Our Story"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-24 md:py-36 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>What We Do</Label></FadeUp>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <FadeUp delay={80}>
              <h2 className="mobile-section-title font-black text-white leading-tight max-w-xl" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 3.4)", lineHeight: 1.1 }}>
                Capabilities built for Malaysia's AI era.
              </h2>
            </FadeUp>
            <FadeUp delay={160}>
              <button onClick={() => go("services")} className="mt-6 md:mt-0 flex-shrink-0 text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                All services <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </FadeUp>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOME_SERVICES.map(({ icon: Icon, title, desc }, i) => (
              <FadeUp key={title} delay={i * 70} distance={18}>
                <div className="bg-[#111111] border border-[#1e1e1e] rounded-lg p-7 hover:border-[#4F7DFF]/30 hover:bg-[#131318] transition-all cursor-default group h-full">
                  <div className="w-10 h-10 rounded-md bg-[#4F7DFF]/10 flex items-center justify-center mb-5 group-hover:bg-[#4F7DFF]/20 transition-colors">
                    <Icon size={18} className="text-[#4F7DFF]" />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATEMENT 2 ───────────────────────────────────────── */}
      <Statement lines={[
        "Fix the fundamentals. Build the connective layer.",
        "Then scale — without friction.",
      ]} />

      {/* ── PARTNERS ──────────────────────────────────────────── */}
      <section className="bg-[#111111] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-16 mb-10">
          <FadeUp><Label>Our Partners</Label></FadeUp>
          <FadeUp delay={100}>
            <h2 className="font-black text-white mb-4" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 3)", lineHeight: 1.1 }}>
              Strategic partners driving applied AI across Malaysia and the region.
            </h2>
          </FadeUp>
          <FadeUp delay={200}>
            <p className="text-gray-500 max-w-lg text-sm leading-relaxed">
              From Zhejiang University to Cyberjaya AI-Exchange, our ecosystem of partners enables technology transfer, applied innovation, and scalable AI deployment across Southeast Asia.
            </p>
          </FadeUp>
        </div>

        <div className="overflow-hidden border-y border-[#1e1e1e] py-5">
          <div className="flex w-max whitespace-nowrap items-center" style={{ animation: "ticker 83s linear infinite", willChange: "transform" }}>
            {[...logoItems, ...logoItems, ...logoItems].map((name, i) => (
              <div key={`${name}-${i}`} className="inline-flex items-center px-4 shrink-0">
                <div className="bg-[#1a1a1a] border border-[#272727] rounded px-8 py-4 min-w-[140px] text-center">
                  <span className="text-gray-500 text-[10px] uppercase tracking-[0.22em] font-semibold">{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <FadeUp delay={100} className="max-w-7xl mx-auto px-6 md:px-16 pt-10">
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
            Through Memoranda of Understanding with leading government bodies, universities, and industry consortiums, SOVA formalises its commitment to long-term, transformative AI partnerships across Malaysia and the region.
          </p>
        </FadeUp>
      </section>

      {/* ── IMPACT SECTION (new) ──────────────────────────────── */}
      <ImpactSection />

      {/* ── WHY US ────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-24 md:py-36 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>What can we do for you?</Label></FadeUp>
          <FadeUp delay={80}>
            <h2 className="mobile-section-title font-black text-white mb-12 max-w-xl" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 3.4)", lineHeight: 1.1 }}>
              Something meaningful for everyone.
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WHY_US.map(({ tag, title, desc }, i) => (
              <FadeUp key={tag} delay={i * 90} distance={20}>
                <div className="bg-[#111111] border border-[#1e1e1e] rounded-lg p-8 md:p-10 hover:border-[#2a2a2a] hover:-translate-y-0.5 transition-all h-full">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#4F7DFF] mb-3">{tag}</div>
                  <h3 className="font-black text-white mb-4" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 1.9)", lineHeight: 1.1 }}>{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN US ───────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-32 md:py-48 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>Work With Us</Label></FadeUp>
          <TextBlockReveal blockColor="#2d2d2d" duration={1000} className="mb-10">
            <h2 className="mobile-join-title font-black text-white leading-none" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 8.75)", lineHeight: 0.92 }}>
              Be part of<br />the movement.
            </h2>
          </TextBlockReveal>
          <FadeUp delay={200}>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => go("rsvp")} className="px-8 py-4 rounded-full font-bold text-sm uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90" style={{ background: GRAD }}>
                Get in Touch
              </button>
              <button onClick={() => go("services")} className="px-8 py-4 rounded-full border border-white/25 text-white font-bold text-sm uppercase tracking-[0.14em] hover:bg-white hover:text-black hover:border-white transition-all">
                Explore Services
              </button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ABOUT PAGE
// ══════════════════════════════════════════════════════════════
function AboutPage({ go }: { go: (p: Page) => void }) {
  return (
    <div className="bg-[#0a0a0a] pt-16" style={{ fontFamily: BODY }}>
      <section className="py-24 md:py-36 px-6 md:px-16 border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>About Us</Label></FadeUp>
          <TextBlockReveal blockColor="#2d2d2d" duration={1000}>
            <h1 className="mobile-page-title font-black text-white leading-tight" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 6.25)", lineHeight: 1.05 }}>
              Applied AI, Automation & Ecosystem Designs.
            </h1>
          </TextBlockReveal>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 bg-[#111111]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <FadeUp><Label>Our Mission</Label></FadeUp>
            <FadeUp delay={100}><p className="text-gray-200 text-base md:text-lg leading-relaxed mb-5">SOVA Intelligence (M) Sdn Bhd (1651222-H) was built around one operational truth: most organisations are not lacking technology — they are struggling with execution. Manual reporting, disconnected systems, and fragmented workflows create costly friction long before AI can deliver value.</p></FadeUp>
            <FadeUp delay={200}><p className="text-gray-400 leading-relaxed mb-5 text-sm md:text-base">We build the connective layer that bridges advanced global research with local operational needs. By fixing the fundamentals first, we turn technology investments into structured execution, measurable impact, and real-world outcomes.</p></FadeUp>
            <FadeUp delay={300}><p className="text-gray-400 leading-relaxed text-sm md:text-base">Headquartered in Johor Bahru with operations across Kuala Lumpur, we work with enterprises, government ministries, and communities — delivering AI-powered, data-driven, outcome-focused transformation.</p></FadeUp>
          </div>
          <div className="space-y-5">
            {[
              { title: "Global to Local to the World", text: "We embrace global perspectives — through partnerships with Zhejiang University, Graphen, and SustNET — while creating solutions that generate value beyond borders." },
              { title: "Impact",                       text: "We measure success by the positive and lasting outcomes we create for people, organisations, and society. A 40–60% manual efficiency gain is a baseline, not a ceiling." },
              { title: "Responsible Innovation",       text: "Deploying secure, reliable systems that uphold corporate and data governance. Every solution we deliver is built to be compliant, auditable, and trustworthy." },
            ].map(({ title, text }, i) => (
              <FadeUp key={title} delay={i * 100} distance={16}>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-7">
                  <h3 className="text-white font-bold text-sm mb-3" style={{ fontFamily: DISPLAY }}>{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>Leadership</Label></FadeUp>

          <div className="flex flex-col divide-y divide-[#1a1a1a]">
            {[
              { src: salasiahPic, name: "Dr. Salasiah Abbas",  role: "Chief Executive Officer",          alt: "Dr. Salasiah Abbas" },
              { src: fadillahPic, name: "Fadillah Iskandar",   role: "Director of Technology Integration", alt: "Fadillah Iskandar" },
              { src: waynePic,    name: "Wayne Yap",           role: "Director of International Business", alt: "Wayne Yap" },
            ].map(({ src, name, role, alt }, i) => (
              <FadeUp key={name} delay={i * 80} distance={32} className="py-20">
                <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                  <div className="w-full rounded-2xl overflow-hidden mb-8" style={{ aspectRatio: "3/4" }}>
                    <ImageWithFallback
                      src={src}
                      alt={alt}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <TextBlockReveal blockColor="#2d2d2d" duration={700}>
                    <h2 className="font-black text-white" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 2.75)" }}>{name}</h2>
                  </TextBlockReveal>
                  <FadeUp delay={120}>
                    <p className="text-[#4F7DFF] text-[10px] uppercase tracking-[0.28em] mt-2">{role}</p>
                  </FadeUp>
                </div>
              </FadeUp>
            ))}
          </div>

        </div>
      </section>

      <Statement lines={[
        "From strategy to deployment — we stand beside",
        "our partners at every stage of execution.",
      ]} />

      <section className="py-24 px-6 md:px-16 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>SOVA Rise™</Label></FadeUp>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <TextBlockReveal blockColor="#2d2d2d" duration={880} className="mb-6">
                <h2 className="font-black text-white" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 3.25)" }}>AI upskilling built for real-world execution.</h2>
              </TextBlockReveal>
              <FadeUp delay={150}><p className="text-gray-400 leading-relaxed mb-5 text-sm md:text-base">SOVA Rise™ is our personal solutions programme — designed to transition participants from theoretical technology awareness into hands-on execution skills through applied AI tools, smart prompting frameworks, and automated workflow mastery.</p></FadeUp>
              <FadeUp delay={250}><p className="text-gray-400 leading-relaxed mb-8 text-sm md:text-base">Built around three core outcomes: Future Workforce Readiness, Core Capability & Resilience, and Productivity Optimisation — eliminating repetitive administrative overhead through smart digital assistants.</p></FadeUp>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[["Future Readiness","Applied AI tools & smart prompting frameworks"],["Core Capability","Hands-on execution & digital resilience"],["Productivity","Smart automation of daily administrative overhead"]].map(([track, desc], i) => (
                  <FadeUp key={track} delay={300 + i * 80} distance={14}>
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 h-full">
                      <div className="text-white text-xs font-bold mb-1" style={{ fontFamily: DISPLAY }}>{track}</div>
                      <div className="text-gray-600 text-xs leading-relaxed">{desc}</div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
            <FadeUp delay={120} distance={16}>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
                <p className="text-[10px] uppercase tracking-[0.32em] text-gray-600 mb-6">Programme Highlights</p>
                <div className="space-y-5">
                  {[
                    "Delivered across Johor Bahru, Kuala Lumpur - Malaysia, Singapore and Indonesia with SIRIM CALIBRATION partnership framework",
                    "Rapid workflow assessments targeting 40–60% manual efficiency gains",
                    "Zhejiang University MOU enabling joint global-to-local technology deployment",
                    "Corporate cohorts aligned to enterprise workflow and automation needs",
                    "KUSKOP policy dialogue — AI literacy for entrepreneurs and women",
                    "Modular growth frameworks adaptable to ministry and corporate infrastructure",
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle size={14} className="text-[#4F7DFF] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-400 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>International Partnerships</Label></FadeUp>
          <FadeUp delay={80}><h2 className="font-black text-white mb-12 max-w-2xl" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 3.25)" }}>Building bridges between Malaysian AI and the world.</h2></FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { partner: "Zhejiang University", country: "People's Republic of China", desc: "MOU partnership enabling joint global-to-local technology deployment. The Zhejiang Business Station ASEAN Headquarters in Johor Bahru anchors our technology transfer and applied research collaboration." },
              { partner: "Graphen & SustNET",   country: "Strategic Technology Partners", desc: "Forming strategic ties to drive technology transfer and applied AI innovation across Malaysia — spanning intelligent data platforms, sustainable infrastructure, and ecosystem activation." },
            ].map(({ partner, country, desc }, i) => (
              <FadeUp key={partner} delay={i * 120} distance={18}>
                <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-8 h-full">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-gray-600 mb-3">{country}</div>
                  <h3 className="font-black text-white mb-4" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 1.875)" }}>{partner}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
          <FadeUp><h2 className="font-black text-white" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 2.75)" }}>Ready to start your AI transformation?</h2></FadeUp>
          <FadeUp delay={150}><button onClick={() => go("rsvp")} className="flex-shrink-0 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-[0.14em] text-white hover:opacity-90 transition-opacity" style={{ background: GRAD }}>Get in Touch</button></FadeUp>
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SERVICES PAGE
// ══════════════════════════════════════════════════════════════
const FULL_SERVICES = [
  { num: "01", icon: Brain,         title: "AI & Advanced Analytics",              headline: "From data to decision — at operational speed.",                      desc: "We deploy Generative AI, machine learning, predictive analytics and robotic process automation to transform how your organisation processes information and makes decisions. Every solution is engineered around your existing data infrastructure.", deliverables: ["Generative AI Integration","Machine Learning Model Deployment","Predictive Analytics Pipelines","Robotic Process Automation (RPA)","Natural Language Processing","AI Performance Monitoring"] },
  { num: "02", icon: Zap,           title: "Intelligent Automation & Digital Workflows", headline: "Less friction. More execution.",                              desc: "We engineer connected automation paths tailored directly around your existing operational software — eliminating fragmented manual tracking, slashing reporting delays, and building process orchestration that scales with your organisation.", deliverables: ["Workflow Automation Design","Process Orchestration Platforms","Legacy System Integration","Intelligent Document Processing","Back-office Reporting Automation","Cross-system Data Synchronisation"] },
  { num: "03", icon: BarChart3,     title: "Enterprise Intelligence & Data Platforms", headline: "Transform raw data into real-time predictive clarity.",          desc: "Executive dashboards, data warehousing, and real-time analytics that give leadership the information they need, the moment they need it — built to the scale and governance standards of enterprise and ministry environments.", deliverables: ["Executive Dashboard Development","Data Warehouse Architecture","Real-Time Analytics Infrastructure","Decision Intelligence Systems","KPI Monitoring & Alerting","Data Governance Frameworks"] },
  { num: "04", icon: Shield,        title: "Cybersecurity & Digital Resilience",   headline: "Secure the foundation. Protect the mission.",                       desc: "Deploying secure, reliable systems that uphold corporate and data governance. Our cybersecurity practice builds frameworks, monitors threats, and ensures the AI systems you deploy remain trustworthy, compliant, and resilient.", deliverables: ["Cybersecurity Framework Design","Security Monitoring Systems","Threat Intelligence Integration","Data Protection Compliance","AI System Security Audits","Incident Response Planning"] },
  { num: "05", icon: Globe,         title: "IoT & Smart Infrastructure",           headline: "Connect the physical. Command the digital.",                        desc: "IoT sensors, edge computing, and remote monitoring solutions that transform physical environments into intelligent, data-generating infrastructure — from smart offices to government facilities and industrial operations.", deliverables: ["IoT Sensor Network Deployment","Edge Computing Architecture","Remote Monitoring Dashboards","Smart Building Integration","Predictive Maintenance Systems","Infrastructure Digital Twins"] },
  { num: "06", icon: Cpu,           title: "Digital Twins & Emerging Technologies", headline: "Simulate today. Optimise tomorrow.",                              desc: "Digital twin platforms, simulation modelling, and scenario analysis tools that let your organisation test decisions, model futures, and deploy emerging technologies — from ASEAN technology transfer initiatives to Cyberjaya AI-Exchange ecosystem activation.", deliverables: ["Digital Twin Platform Development","Simulation & Scenario Modelling","Technology Transfer Programmes","Ecosystem Activation Blueprints","Emerging Tech Pilot Design","Zhejiang University Joint Deployments"] },
];

function ServicesPage({ go }: { go: (p: Page) => void }) {
  return (
    <div className="bg-[#0a0a0a] pt-16" style={{ fontFamily: BODY }}>
      <section className="py-24 md:py-36 px-6 md:px-16 border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <FadeUp><Label>What We Do</Label></FadeUp>
          <TextBlockReveal blockColor="#2d2d2d" duration={1000} className="mb-6">
            <h1 className="mobile-page-title font-black text-white leading-[0.92]" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 8.1)", lineHeight: 0.92 }}>
              A choice that<br />
              <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>changes everything.</span>
            </h1>
          </TextBlockReveal>
          <FadeUp delay={150}><p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">Six integrated capabilities — AI-powered, data-driven, outcome-focused — built to take Malaysian organisations from operational friction to structured execution.</p></FadeUp>
        </div>
      </section>

      {FULL_SERVICES.map(({ num, icon: Icon, title, headline, desc, deliverables }, i) => (
        <section key={num} className={`py-20 md:py-28 px-6 md:px-16 border-b border-[#1a1a1a] ${i % 2 === 1 ? "bg-[#111111]" : "bg-[#0a0a0a]"}`}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              <div>
                <FadeUp><div className="flex items-center gap-4 mb-6"><span className="text-[10px] text-gray-600 tracking-[0.35em] font-mono">{num}</span><Icon size={17} className="text-[#4F7DFF]" /></div></FadeUp>
                <TextBlockReveal blockColor="#2d2d2d" duration={780} className="mb-3"><h2 className="font-black text-white" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 2.5)" }}>{title}</h2></TextBlockReveal>
                <FadeUp delay={100}><p className="text-lg text-gray-400 font-light italic mb-5 leading-relaxed">"{headline}"</p></FadeUp>
                <FadeUp delay={200}><p className="text-gray-500 text-sm leading-relaxed">{desc}</p></FadeUp>
              </div>
              <FadeUp delay={120} distance={16}>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 h-full">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-gray-600 mb-6">Deliverables</p>
                  <div className="space-y-4">
                    {deliverables.map((d, j) => (
                      <div key={j} className="flex gap-3 items-center">
                        <div className="w-1 h-1 rounded-full bg-[#4F7DFF] flex-shrink-0" />
                        <span className="text-gray-400 text-sm">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>
      ))}

      <section className="py-32 px-6 md:px-16 bg-[#0a0a0a] text-center">
        <div className="max-w-2xl mx-auto">
          <TextBlockReveal blockColor="#2d2d2d" duration={900} className="mb-6"><h2 className="font-black text-white" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 5)" }}>Not sure where to start?</h2></TextBlockReveal>
          <FadeUp delay={100}><p className="text-gray-500 mb-10 leading-relaxed">Let us help you identify the right entry point for your organisation's AI journey.</p></FadeUp>
          <FadeUp delay={200}><button onClick={() => go("rsvp")} className="px-10 py-5 rounded-full font-bold text-sm uppercase tracking-[0.15em] text-white hover:opacity-90 transition-opacity" style={{ background: GRAD }}>Get in Touch</button></FadeUp>
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CONTACT / RSVP PAGE
// ══════════════════════════════════════════════════════════════
const QUERY_TYPES = [
  "Partnership Opportunity","SOVA Rise™ Programme",
  "AI Consulting","Government Solutions","Media & Press","General Enquiry",
];

function RSVPPage() {
  const [form, setForm]           = useState({ name:"", org:"", title:"", email:"", phone:"", queryType:"", message:"" });
  const [submitted, setSubmitted] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = (e: FormEvent) => { e.preventDefault(); setSubmitted(true); };

  if (submitted) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center pt-16 px-6">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full border border-[#4F7DFF] flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={26} className="text-[#4F7DFF]" />
          </div>
          <h2 className="font-black text-white mb-4" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 3.5)" }}>Thank you.</h2>
          <p className="text-gray-500 leading-relaxed" style={{ fontFamily: BODY }}>The SOVA team will be in touch within 48 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16" style={{ fontFamily: BODY }}>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <FadeUp><Label>Get in Touch</Label></FadeUp>
        <TextBlockReveal blockColor="#2d2d2d" duration={1000} className="mb-4">
          <h1 className="mobile-page-title font-black text-white leading-none" style={{ fontFamily: DISPLAY, fontSize: "calc(var(--sf) * 6.25)", lineHeight: 1 }}>
            Let us know<br />anything.
          </h1>
        </TextBlockReveal>
        <FadeUp delay={150}><p className="text-gray-500 mb-16 leading-relaxed text-sm md:text-base max-w-md">Whether you're exploring a partnership or simply want to learn more about SOVA — we'd love to hear from you.</p></FadeUp>

        <form onSubmit={handleSubmit} className="border-t border-[#1a1a1a]">
          {[
            { key:"name",  label:"Full Name",     type:"text",  req:true  },
            { key:"org",   label:"Organisation",  type:"text",  req:true  },
            { key:"title", label:"Job Title",     type:"text",  req:true  },
            { key:"email", label:"Email Address", type:"email", req:true  },
            { key:"phone", label:"Phone Number",  type:"tel",   req:false },
          ].map(({ key, label, type, req }, i) => (
            <FadeUp key={key} delay={i * 60} distance={12}>
              <div className="border-b border-[#1a1a1a] py-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-gray-600 text-[10px] uppercase tracking-[0.28em] sm:w-44 flex-shrink-0">
                  {label}{req && <span className="text-[#4F7DFF] ml-1">*</span>}
                </label>
                <input type={type} required={req} value={(form as Record<string,string>)[key]} onChange={e => set(key, e.target.value)}
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  className="flex-1 bg-transparent text-white placeholder-gray-700 text-sm outline-none border-none focus:outline-none min-h-[44px]" />
              </div>
            </FadeUp>
          ))}

          <FadeUp delay={300} distance={12}>
            <div className="border-b border-[#1a1a1a] py-6 flex flex-col sm:flex-row sm:items-start gap-3">
              <label className="text-gray-600 text-[10px] uppercase tracking-[0.28em] sm:w-44 flex-shrink-0 pt-1">
                Nature of Enquiry <span className="text-[#4F7DFF]">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {QUERY_TYPES.map(qt => (
                  <button key={qt} type="button" onClick={() => set("queryType", qt)}
                    className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.16em] border transition-all min-h-[44px] ${form.queryType === qt ? "border-[#4F7DFF] text-[#4F7DFF] bg-[#4F7DFF]/10" : "border-[#2a2a2a] text-gray-600 hover:border-[#3a3a3a] hover:text-gray-400"}`}>
                    {qt}
                  </button>
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={360} distance={12}>
            <div className="border-b border-[#1a1a1a] py-6 flex flex-col sm:flex-row sm:items-start gap-3">
              <label className="text-gray-600 text-[10px] uppercase tracking-[0.28em] sm:w-44 flex-shrink-0 pt-1">Message</label>
              <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={4}
                placeholder="Anything you'd like us to know..."
                className="flex-1 bg-transparent text-white placeholder-gray-700 text-sm outline-none resize-none" />
            </div>
          </FadeUp>

          <FadeUp delay={420}>
            <div className="pt-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <p className="text-gray-600 text-xs leading-relaxed max-w-xs">
                The SOVA team will be in touch within 48 hours.
              </p>
              <button type="submit" className="flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-[0.15em] text-white group hover:opacity-90 transition-opacity" style={{ background: GRAD }}>
                Submit <Send size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </FadeUp>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [loaded,  setLoaded]  = useState(false);
  const [page,    setPage]    = useState<Page>("home");
  const [visible, setVisible] = useState(true);

  const go = (p: Page) => {
    if (p === page) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setVisible(false);
    setTimeout(() => { setPage(p); window.scrollTo(0, 0); setVisible(true); }, 160);
  };

  if (!loaded) return <LoadingScreen onComplete={() => setLoaded(true)} />;

  return (
    <div className="mobile-app-root bg-[#0a0a0a] min-h-screen">
      <style>{`
        @media (max-width: 767px) {
          html, body {
            overflow-x: hidden;
            width: 100%;
          }

          .mobile-app-root section,
          .mobile-app-root footer {
            min-width: 0;
          }

          .mobile-app-root section,
          .mobile-app-root footer {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
          }

          .mobile-app-root nav > div {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
          }

          .mobile-hero-title {
            font-size: clamp(3.25rem, 15.5vw, 5.25rem) !important;
            line-height: 0.9 !important;
            letter-spacing: 0.01em !important;
            word-spacing: 0.12em !important;
            overflow-wrap: break-word;
          }

          .mobile-impact-title,
          .mobile-section-title {
            font-size: clamp(2.25rem, 9vw, 3.5rem) !important;
            line-height: 1.04 !important;
            overflow-wrap: break-word;
          }

          .mobile-page-title {
            font-size: clamp(3.2rem, 13vw, 5rem) !important;
            line-height: 0.95 !important;
            letter-spacing: -0.025em !important;
            overflow-wrap: break-word;
          }

          .mobile-join-title {
            font-size: clamp(3.6rem, 17vw, 6rem) !important;
            line-height: 0.9 !important;
            letter-spacing: -0.03em !important;
          }

          .mobile-impact-section {
            height: auto !important;
          }

          .mobile-impact-section > .sticky {
            position: relative;
            height: auto;
          }

          .mobile-impact-shell {
            height: auto !important;
            display: block;
          }

          .mobile-impact-copy {
            padding-top: 4.5rem;
            padding-bottom: 3.5rem;
          }

          .mobile-layered-text {
            padding-left: 0 !important;
            margin-bottom: 2.5rem;
          }

          .mobile-layered-text ul {
            align-items: center !important;
            margin: 0 !important;
          }

          .mobile-layered-text li,
          .mobile-layered-text li > div {
            transform: none !important;
          }

          .mobile-layered-text p {
            width: 100%;
            text-align: center;
            font-size: clamp(2rem, 9vw, 3.4rem) !important;
            letter-spacing: -0.035em !important;
          }

          .mobile-impact-mosaic {
            display: none;
          }

          .mobile-app-root .grid-cols-2 {
            grid-template-columns: 1fr;
          }

          .mobile-app-root button,
          .mobile-app-root input,
          .mobile-app-root textarea {
            max-width: 100%;
          }

          .mobile-app-root form input,
          .mobile-app-root form textarea {
            min-width: 0;
            width: 100%;
          }

          .mobile-app-root form button {
            min-height: 48px;
          }

          .mobile-app-root footer .grid {
            gap: 2.5rem;
          }

          .sova-whatsapp-float {
            right: 1rem !important;
            bottom: 1rem !important;
          }
        }

        @media (max-width: 380px) {
          .mobile-hero-title {
            font-size: 3rem !important;
          }

          .mobile-page-title {
            font-size: 2.9rem !important;
          }
        }
      `}</style>
      <WhatsAppButton />
      <Navbar page={page} go={go} />
      <div className="transition-opacity duration-150" style={{ opacity: visible ? 1 : 0 }}>
        {page === "home"     && <HomePage     go={go} />}
        {page === "about"    && <AboutPage    go={go} />}
        {page === "services" && <ServicesPage go={go} />}
        {page === "rsvp"     && <RSVPPage />}
        <Footer go={go} />
      </div>
    </div>
  );
}
