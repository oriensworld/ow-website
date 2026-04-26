import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useMotionValue } from "motion/react";

// ════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════

interface FloatingProject {
  title: string;
  icon: string;
  category: string;
  context?: string;
  tags?: string[];
  slug: string;
  coverImage?: string;
  coverImageGif?: string;
  featured?: boolean;
}

interface Props {
  projects?: FloatingProject[];
}

// ════════════════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════════════

const SIZE_DIMS = {
  sm: { w: 160, h: 96 },
  md: { w: 220, h: 132 },
  lg: { w: 280, h: 168 },
} as const;

type FloaterSize = keyof typeof SIZE_DIMS;

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

/** Generate a seeded 0-1 ratio pair for top/left. */
function randomRatios(seed: number, index: number): [number, number] {
  const rand = seededRandom(seed, index);
  return [rand(), rand()];
}

/** Convert ratios to pixel positions. Card is guaranteed in-bounds. */
function ratiosToPos(
  ratios: [number, number],
  containerW: number,
  containerH: number,
  size: FloaterSize,
): { top: number; left: number } {
  const { w, h } = SIZE_DIMS[size];
  return {
    top: ratios[0] * Math.max(0, containerH - h),
    left: ratios[1] * Math.max(0, containerW - w),
  };
}

// ════════════════════════════════════════════════════════════════════
// Derive media paths from GIF path
// ════════════════════════════════════════════════════════════════════

function deriveMedia(gifPath: string) {
  const base = gifPath.replace(/\.[^.]+$/, "");
  return { poster: `${base}-poster.webp`, mp4: `${base}.mp4`, webm: `${base}.webm` };
}

// ════════════════════════════════════════════════════════════════════
// FloatingCard — fixed size, overlay text on hover, GIF on hover
// ════════════════════════════════════════════════════════════════════

function FloatingCard({
  project,
  size,
  isHovered,
}: {
  project: FloatingProject;
  size: FloaterSize;
  isHovered: boolean;
}) {
  const { w, h } = SIZE_DIMS[size];
  const media = project.coverImageGif ? deriveMedia(project.coverImageGif) : null;
  const posterSrc = project.coverImage || media?.poster || null;
  const showTags = size !== "sm";

  return (
    <div
      className="relative overflow-hidden transition-shadow duration-300"
      style={{
        width: w,
        height: h,
        filter: "drop-shadow(0 0 0.5px var(--color-border))",
        boxShadow: isHovered ? "0 4px 32px rgba(0,0,0,0.4), 0 0 20px rgba(229,62,62,0.1)" : "none",
      }}
      data-squircle={size === "lg" ? "10" : "8"}
    >
      {/* Background image / video — always fills the card */}
      {isHovered && media ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={media.poster}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ transform: "scale(1.05)", transition: "transform 0.5s ease" }}
        >
          <source src={media.webm} type="video/webm" />
          <source src={media.mp4} type="video/mp4" />
        </video>
      ) : posterSrc ? (
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500"
          style={{ opacity: isHovered ? 1 : 0.9, transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          draggable={false}
          loading="lazy"
        />
      ) : null}

      {/* Gradient overlay — wipes up on hover */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(40%)",
          transition: "opacity 0.35s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* Top labels: category + context — slide down from top */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-2.5 pt-2 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(-100%)",
          transition: "opacity 0.3s ease 0.05s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s",
        }}
      >
        <span
          className="text-[0.5rem] font-mono font-medium uppercase tracking-[0.08em] text-white/90 px-1.5 py-0.5"
          style={{ background: "rgba(229,62,62,0.7)", backdropFilter: "blur(4px)" }}
          data-squircle="4"
        >
          {project.category}
        </span>
        {project.context && (
          <span
            className="text-[0.5rem] font-mono uppercase tracking-[0.08em] text-white/70 px-1.5 py-0.5"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)" }}
            data-squircle="4"
          >
            {project.context}
          </span>
        )}
      </div>

      {/* Bottom: title + tags — slide up from bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(100%)",
          transition: "opacity 0.3s ease 0.08s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.08s",
        }}
      >
        <p className={`font-semibold text-white leading-tight truncate ${size === "sm" ? "text-[0.65rem]" : "text-xs"}`}>
          {project.title}
        </p>
        {showTags && project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[0.45rem] font-mono text-white/60 px-1 py-px uppercase tracking-wider"
                style={{ background: "rgba(255,255,255,0.08)" }}
                data-squircle="3"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
  onHoverChange,
  draggable = true,
}: {
  children: React.ReactNode;
  constraintRef: React.RefObject<HTMLDivElement | null>;
  pos: { top: number; left: number };
  delay?: number;
  drift?: number;
  href?: string;
  onHoverChange?: (hovered: boolean) => void;
  draggable?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Reset drag offset when position changes (i.e. on shuffle)
  useEffect(() => {
    x.set(0);
    y.set(0);
  }, [pos.top, pos.left, x, y]);

  const handleClick = () => {
    if (!isDragging && href) window.location.href = href;
  };

  return (
    <motion.div
      className="absolute z-10"
      animate={{ top: pos.top, left: pos.left }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        animation: `hero-drift-${drift} ${16 + drift * 4}s ease-in-out infinite`,
      }}
    >
      <motion.div
        drag={draggable}
        dragConstraints={draggable ? constraintRef : undefined}
        dragElastic={0.12}
        dragMomentum
        dragTransition={{ bounceStiffness: 250, bounceDamping: 20 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
        onHoverStart={() => onHoverChange?.(true)}
        onHoverEnd={() => onHoverChange?.(false)}
        onClick={handleClick}
        style={{
          x,
          y,
          cursor: !draggable
            ? "pointer"
            : isDragging
              ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='12' fill='none' stroke='%23e53e3e' stroke-width='2' opacity='0.8'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%23e53e3e'/%3E%3C/svg%3E") 16 16, grabbing`
              : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='12' fill='none' stroke='%23e53e3e' stroke-width='1.5' opacity='0.6'/%3E%3C/svg%3E") 16 16, grab`,
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ zIndex: 40 }}
        whileDrag={draggable ? { scale: 1.1, zIndex: 50 } : undefined}
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
// Floater config
// ════════════════════════════════════════════════════════════════════

interface FloaterConfig {
  projectIndex: number;
  size: FloaterSize;
  delay: number;
  drift: number;
}

function buildFloaterConfigs(projects: FloatingProject[], maxCount: number): FloaterConfig[] {
  const featured = projects
    .map((p, i) => ({ index: i, featured: !!p.featured }))
    .filter((p) => p.featured);
  const nonFeatured = projects
    .map((p, i) => ({ index: i, featured: !!p.featured }))
    .filter((p) => !p.featured);

  const ordered = [...featured, ...nonFeatured];
  const configs: FloaterConfig[] = [];
  let d = 0;
  const nextDelay = () => { d = (d + 0.3) % 2; return d; };
  const nextDrift = (i: number) => (i % 5) + 1;
  const sizes: FloaterSize[] = ["sm", "md", "lg"];

  for (let i = 0; i < maxCount; i++) {
    const entry = ordered[i % ordered.length];
    configs.push({
      projectIndex: entry.index,
      size: i < featured.length ? "lg" : sizes[i % 3],
      delay: nextDelay(),
      drift: nextDrift(i),
    });
  }
  return configs;
}

const MAX_FLOATERS = 40;
const MAX_FLOATERS_MOBILE = 8;
const DEFAULT_COUNT = 20;
const DEFAULT_COUNT_MOBILE = 5;
const MOBILE_BREAKPOINT = 768;

// ════════════════════════════════════════════════════════════════════
// Main Hero Component
// ════════════════════════════════════════════════════════════════════

export default function HeroAnimated({ projects = [] }: Props) {
  const constraintRef = useRef<HTMLDivElement>(null);
  const p = projects.slice(0, 12);
  const isMobile = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
  const maxCount = isMobile ? MAX_FLOATERS_MOBILE : MAX_FLOATERS;
  const [seed, setSeed] = useState(42);
  const [count, setCount] = useState(isMobile ? DEFAULT_COUNT_MOBILE : DEFAULT_COUNT);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);

  const floaterConfigs = useMemo(() => buildFloaterConfigs(p, MAX_FLOATERS), [p]);

  // Measure container on mount + resize
  useEffect(() => {
    const measure = () => {
      if (constraintRef.current) {
        const rect = constraintRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Listen for shuffle event from Navbar
  useEffect(() => {
    const handler = () => {
      setSeed((s) => s + 1);
      const cap = window.innerWidth < MOBILE_BREAKPOINT ? MAX_FLOATERS_MOBILE : MAX_FLOATERS;
      setCount(Math.floor(Math.random() * (cap - 5 + 1)) + 5);
    };
    window.addEventListener("hero-shuffle", handler);
    return () => window.removeEventListener("hero-shuffle", handler);
  }, []);

  // Scroll-to-shuffle: wheel or touch scroll triggers shuffle
  useEffect(() => {
    const el = constraintRef.current;
    if (!el) return;

    let cooldown = false;
    let touchStartY = 0;

    const shuffle = () => {
      if (cooldown) return;
      cooldown = true;
      window.dispatchEvent(new CustomEvent("hero-shuffle"));
      setTimeout(() => { cooldown = false; }, 800);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 30) {
        e.preventDefault();
        shuffle();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) shuffle();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Compute seeded ratios (stable per seed), then resolve to pixels
  const ratios = useMemo(() => {
    return floaterConfigs.map((_, i) => randomRatios(seed, i));
  }, [seed, floaterConfigs]);

  const positions = useMemo(() => {
    if (!containerSize) return null;
    return floaterConfigs.map((config, i) =>
      ratiosToPos(ratios[i], containerSize.w, containerSize.h, config.size)
    );
  }, [ratios, containerSize, floaterConfigs]);

  const activeConfigs = floaterConfigs.slice(0, count);

  return (
    <div
      ref={constraintRef}
      className="relative w-full h-dvh overflow-hidden"
    >
      {/* ─── Floating Objects (only after container is measured) ── */}
      {positions && activeConfigs.map((config, i) => {
        const project = p[config.projectIndex];
        if (!project) return null;
        return (
          <Floater
            key={i}
            constraintRef={constraintRef}
            pos={positions[i]}
            delay={config.delay}
            drift={config.drift}
            href={`/projects/${project.slug}`}
            onHoverChange={(h) => setHoveredIndex(h ? i : null)}
            draggable={!isMobile}
          >
            <FloatingCard
              project={project}
              size={config.size}
              isHovered={hoveredIndex === i}
            />
          </Floater>
        );
      })}

      {/* ─── Count Slider ─────────────────────────────────────── */}
      <div className="absolute bottom-20 left-6 z-50 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-300">
        <label className="text-[0.6rem] font-mono text-text-tertiary uppercase tracking-wider">
          Objects
        </label>
        <input
          type="range"
          min={5}
          max={maxCount}
          step={1}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-20 h-0.5 accent-teal cursor-pointer"
        />
        <span className="text-[0.6rem] font-mono text-text-tertiary tabular-nums w-5 text-right">
          {count}
        </span>
      </div>
    </div>
  );
}
