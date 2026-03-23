import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion, useMotionValue } from "motion/react";

// ════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════

interface FloatingProject {
  title: string;
  icon: string;
  category: string;
  slug: string;
}

interface Props {
  projects?: FloatingProject[];
}

// ════════════════════════════════════════════════════════════════════
// Seeded random — deterministic per seed+index for stable layouts
// ════════════════════════════════════════════════════════════════════

function seededRandom(seed: number, index: number): () => number {
  let s = (seed * 9301 + 49297 + index * 233) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function randomPos(seed: number, index: number): React.CSSProperties {
  const rand = seededRandom(seed, index);
  return {
    top: `${2 + rand() * 90}%`,
    left: `${2 + rand() * 88}%`,
  };
}

// ════════════════════════════════════════════════════════════════════
// Floater — generic draggable wrapper with ambient drift
// ════════════════════════════════════════════════════════════════════

function Floater({
  children,
  constraintRef,
  pos,
  delay = 0,
  drift = 1,
  href,
}: {
  children: React.ReactNode;
  constraintRef: React.RefObject<HTMLDivElement | null>;
  pos: React.CSSProperties;
  delay?: number;
  drift?: number;
  href?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragX = useMotionValue(0);

  const handleClick = () => {
    if (!isDragging && href) window.location.href = href;
  };

  return (
    <motion.div
      className="absolute z-10"
      animate={pos}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        animation: `hero-drift-${drift} ${16 + drift * 4}s ease-in-out infinite`,
      }}
    >
      <motion.div
        drag
        dragConstraints={constraintRef}
        dragElastic={0.12}
        dragMomentum
        dragTransition={{ bounceStiffness: 250, bounceDamping: 20 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
        onClick={handleClick}
        style={{
          x: dragX,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        whileDrag={{ scale: 1.1, zIndex: 50 }}
        transition={{
          duration: 0.8,
          delay: 0.4 + delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="select-none"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Floating Object Components
// ════════════════════════════════════════════════════════════════════

/** Project card chip */
function ProjectChip({ project }: { project: FloatingProject }) {
  return (
    <div
      className="relative bg-bg-card/80 backdrop-blur-sm px-8 py-5 transition-all duration-300 group hover:bg-bg-card hover:shadow-[0_0_24px_rgba(45,212,191,0.12)]"
      style={{ filter: "drop-shadow(0 0 0.5px var(--color-border))" }}
      data-squircle="10"
    >
      <div>
        <p className="text-base font-medium text-text-primary/70 group-hover:text-text-primary transition-colors leading-tight max-w-[220px] truncate">
          {project.title}
        </p>
        <p className="text-xs font-mono text-text-tertiary tracking-[0.08em] uppercase">
          {project.category}
        </p>
      </div>
    </div>
  );
}

/** Image thumbnail — polaroid-like floating photo */
function ImageThumb({
  src,
  size = "sm",
}: {
  src: string;
  size?: "sm" | "md";
}) {
  const dims = size === "md" ? "w-[280px] h-[168px]" : "w-[220px] h-[132px]";
  return (
    <div
      className={`${dims} overflow-hidden opacity-90 hover:opacity-100 transition-opacity duration-300`}
      style={{ filter: "drop-shadow(0 0 0.5px var(--color-border))" }}
      data-squircle="8"
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}

/** Dot grid — 5x5 arrangement */
function DotGrid() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full bg-text-tertiary/90" />
      ))}
    </div>
  );
}

/** Crosshair shape */
function Crosshair() {
  return (
    <div className="relative w-12 h-12">
      <div className="absolute top-1/2 left-0 w-full h-px bg-teal/90 -translate-y-1/2" />
      <div className="absolute top-0 left-1/2 w-px h-full bg-teal/90 -translate-x-1/2" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Floater config types
// ════════════════════════════════════════════════════════════════════

type FloaterType =
  | { kind: "chip"; projectIndex: number }
  | { kind: "image"; src: string; size: "sm" | "md" }
  | { kind: "symbol"; char: string; color: string; size: string }
  | { kind: "circle"; size: string; color: string }
  | { kind: "dotgrid" }
  | { kind: "crosshair" }
  | { kind: "line"; width: string; color: string }
  | { kind: "bracket"; corner: "tl" | "tr" | "bl" | "br" };

interface FloaterConfig {
  type: FloaterType;
  delay: number;
  drift: number;
  mobileVisible?: boolean; // kept for type compat but unused
}

// ════════════════════════════════════════════════════════════════════
// Static floater definitions
// ════════════════════════════════════════════════════════════════════

const IMAGES = [
  "/images/placeholder-1.svg",
  "/images/placeholder-2.svg",
  "/images/placeholder-3.svg",
  "/images/placeholder-5.svg",
];

const SYMBOLS: { char: string; color: string; size: string }[] = [
  { char: "✦", color: "text-teal/90", size: "text-7xl" },
  { char: "✦", color: "text-cyan/90", size: "text-6xl" },
  { char: "◇", color: "text-violet/90", size: "text-5xl" },
  { char: "✦", color: "text-teal/90", size: "text-7xl" },
  { char: "◇", color: "text-cyan/90", size: "text-6xl" },
  { char: "✦", color: "text-violet/90", size: "text-5xl" },
  { char: "◇", color: "text-pink/90", size: "text-6xl" },
  { char: "✦", color: "text-teal/90", size: "text-5xl" },
  { char: "✦", color: "text-cyan/90", size: "text-7xl" },
  { char: "✦", color: "text-teal/90", size: "text-8xl" },
  { char: "◇", color: "text-cyan/90", size: "text-7xl" },
  { char: "✦", color: "text-violet/90", size: "text-6xl" },
  { char: "◇", color: "text-pink/90", size: "text-7xl" },
  { char: "✦", color: "text-teal/90", size: "text-6xl" },
  { char: "◇", color: "text-cyan/90", size: "text-8xl" },
  { char: "✦", color: "text-violet/90", size: "text-7xl" },
  { char: "◇", color: "text-pink/90", size: "text-5xl" },
  { char: "✦", color: "text-teal/90", size: "text-6xl" },
  { char: "✦", color: "text-cyan/90", size: "text-7xl" },
  { char: "✦", color: "text-teal/90", size: "text-6xl" },
  { char: "◇", color: "text-cyan/90", size: "text-8xl" },
  { char: "✦", color: "text-violet/90", size: "text-7xl" },
  { char: "✦", color: "text-pink/90", size: "text-6xl" },
  { char: "◇", color: "text-teal/90", size: "text-7xl" },
  { char: "✦", color: "text-cyan/90", size: "text-5xl" },
  { char: "◇", color: "text-violet/90", size: "text-8xl" },
  { char: "✦", color: "text-pink/90", size: "text-6xl" },
];

function buildFloaterConfigs(): FloaterConfig[] {
  const configs: FloaterConfig[] = [];
  let d = 0;
  const nextDelay = () => { d = (d + 0.3) % 2; return d; };
  const nextDrift = (i: number) => (i % 5) + 1;

  // Project chips — 20 instances (reuse indices 0-11)
  for (let i = 0; i < 20; i++) {
    configs.push({ type: { kind: "chip", projectIndex: i % 12 }, delay: nextDelay(), drift: nextDrift(i) });
  }

  // Image thumbnails — 18 instances
  for (let i = 0; i < 18; i++) {
    configs.push({
      type: { kind: "image", src: IMAGES[i % IMAGES.length], size: i % 3 === 0 ? "md" : "sm" },
      delay: nextDelay(), drift: nextDrift(i),
    });
  }

  // Symbols — all from SYMBOLS array
  for (let i = 0; i < SYMBOLS.length; i++) {
    configs.push({
      type: { kind: "symbol", ...SYMBOLS[i] },
      delay: nextDelay(), drift: nextDrift(i),
    });
  }

  // Circles — 8
  const circleColors = ["border-teal/90", "border-cyan/90", "border-violet/90", "border-pink/90"];
  const circleSizes = ["w-20 h-20", "w-24 h-24", "w-28 h-28", "w-32 h-32", "w-16 h-16"];
  for (let i = 0; i < 8; i++) {
    configs.push({
      type: { kind: "circle", size: circleSizes[i % circleSizes.length], color: circleColors[i % circleColors.length] },
      delay: nextDelay(), drift: nextDrift(i),
    });
  }

  // Dot grids — 7
  for (let i = 0; i < 7; i++) {
    configs.push({ type: { kind: "dotgrid" }, delay: nextDelay(), drift: nextDrift(i) });
  }

  // Crosshairs — 6
  for (let i = 0; i < 6; i++) {
    configs.push({ type: { kind: "crosshair" }, delay: nextDelay(), drift: nextDrift(i) });
  }

  // Gradient lines — 8
  const lineColors = ["via-teal/90", "via-cyan/90", "via-violet/90", "via-border/90"];
  const lineWidths = ["w-36", "w-40", "w-44", "w-48", "w-50"];
  for (let i = 0; i < 8; i++) {
    configs.push({
      type: { kind: "line", width: lineWidths[i % lineWidths.length], color: lineColors[i % lineColors.length] },
      delay: nextDelay(), drift: nextDrift(i),
    });
  }

  // Corner brackets — 4 (fixed positions, not randomized)
  configs.push({ type: { kind: "bracket", corner: "tl" }, delay: 0.1, drift: 2, mobileVisible: true });
  configs.push({ type: { kind: "bracket", corner: "tr" }, delay: 0.15, drift: 3, mobileVisible: true });
  configs.push({ type: { kind: "bracket", corner: "bl" }, delay: 0.2, drift: 4, mobileVisible: true });
  configs.push({ type: { kind: "bracket", corner: "br" }, delay: 0.25, drift: 5, mobileVisible: true });

  return configs;
}

const FLOATER_CONFIGS = buildFloaterConfigs();

const BRACKET_POSITIONS: Record<string, React.CSSProperties> = {
  tl: { top: "2%", left: "1%" },
  tr: { top: "2%", right: "1%" },
  bl: { bottom: "2%", left: "1%" },
  br: { bottom: "2%", right: "1%" },
};

const BRACKET_CLASSES: Record<string, string> = {
  tl: "w-14 h-14 border-l border-t border-border/90",
  tr: "w-14 h-14 border-r border-t border-border/90",
  bl: "w-14 h-14 border-l border-b border-border/90",
  br: "w-14 h-14 border-r border-b border-border/90",
};

// ════════════════════════════════════════════════════════════════════
// Main Hero Component
// ════════════════════════════════════════════════════════════════════

export default function HeroAnimated({ projects = [] }: Props) {
  const constraintRef = useRef<HTMLDivElement>(null);
  const p = projects.slice(0, 12);
  const [seed, setSeed] = useState(42);

  // Listen for shuffle event from Navbar
  useEffect(() => {
    const handler = () => setSeed((s) => s + 1);
    window.addEventListener("hero-shuffle", handler);
    return () => window.removeEventListener("hero-shuffle", handler);
  }, []);

  const randomize = useCallback(() => setSeed((s) => s + 1), []);

  // Compute positions for all floaters
  const positions = useMemo(() => {
    return FLOATER_CONFIGS.map((config, i) => {
      if (config.type.kind === "bracket") {
        return BRACKET_POSITIONS[config.type.corner];
      }
      return randomPos(seed, i);
    });
  }, [seed]);

  // Render a floater's content
  const renderContent = (config: FloaterConfig) => {
    const { type } = config;
    switch (type.kind) {
      case "chip": {
        const project = p[type.projectIndex];
        return project ? <ProjectChip project={project} /> : null;
      }
      case "image":
        return <ImageThumb src={type.src} size={type.size} />;
      case "symbol":
        return <span className={`${type.color} ${type.size}`}>{type.char}</span>;
      case "circle":
        return <div className={`${type.size} rounded-full border ${type.color}`} />;
      case "dotgrid":
        return <DotGrid />;
      case "crosshair":
        return <Crosshair />;
      case "line":
        return <div className={`${type.width} h-px bg-gradient-to-r from-transparent ${type.color} to-transparent`} />;
      case "bracket":
        return <div className={BRACKET_CLASSES[type.corner]} />;
    }
  };

  return (
    <div
      ref={constraintRef}
      className="relative w-full h-dvh overflow-hidden"
    >
      {/* ─── All Floating Objects ──────────────────────────────── */}
      {FLOATER_CONFIGS.map((config, i) => {
        const content = renderContent(config);
        if (!content) return null;
        return (
          <Floater
            key={i}
            constraintRef={constraintRef}
            pos={positions[i]}
            delay={config.delay}
            drift={config.drift}
            href={
              config.type.kind === "chip" && p[config.type.projectIndex]
                ? `/projects/${p[config.type.projectIndex].slug}`
                : undefined
            }
          >
            {content}
          </Floater>
        );
      })}

      {/* ═══════════════════════════════════════════════════════════
           Center Content — non-draggable, layered behind floaters
         ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
        {/* Chip Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 text-[0.75rem] font-medium text-teal bg-teal-glow px-5 py-2 mb-10"
          style={{ filter: "drop-shadow(0 0 0.5px rgba(45,212,191,0.2))" }}
          data-squircle="10"
        >
          <span>✦</span>
          Architecture × Design × Software × Games
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-[clamp(2.2rem,7.5vw,6rem)] font-bold tracking-tighter leading-[1.05] max-w-[850px] text-center px-6"
        >
          We design and build
          <br />
          across{" "}
          <span className="relative inline">
            every medium
            <span
              className="absolute bottom-[0.05em] left-0 w-full h-[0.12em] rounded-sm opacity-60"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-teal), var(--color-cyan))",
              }}
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-[clamp(0.9rem,2vw,1.15rem)] font-normal leading-relaxed text-text-secondary max-w-[560px] mt-6 text-center px-6"
        >
          From parametric architecture to game engines to full-stack
          applications. A cross-disciplinary studio bridging physical and
          digital design.
        </motion.p>
      </div>
    </div>
  );
}
