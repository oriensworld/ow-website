import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useMotionValue } from "motion/react";

// ════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════

interface FloatingProject {
  title: string;
  icon: string;
  category: string;
  slug: string;
  coverImage?: string;
  coverImageGif?: string;
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

function randomPos(seed: number, index: number): Record<string, string> {
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
  pos: Record<string, string>;
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
          cursor: isDragging
            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='12' fill='none' stroke='%23e53e3e' stroke-width='2' opacity='0.8'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%23e53e3e'/%3E%3C/svg%3E") 16 16, grabbing`
            : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='12' fill='none' stroke='%23e53e3e' stroke-width='1.5' opacity='0.6'/%3E%3C/svg%3E") 16 16, grab`,
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

/** Project card chip — shows cover image + title/category */
function ProjectChip({ project }: { project: FloatingProject }) {
  const coverSrc = project.coverImage || (project.coverImageGif ? project.coverImageGif.replace(/\.gif$/, "-poster.webp") : null);

  return (
    <div
      className="relative bg-bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 group hover:bg-bg-card hover:shadow-[0_0_24px_rgba(229,62,62,0.12)]"
      style={{ filter: "drop-shadow(0 0 0.5px var(--color-border))", width: 240 }}
      data-squircle="10"
    >
      {coverSrc && (
        <div className="w-full h-[120px] overflow-hidden">
          <img
            src={coverSrc}
            alt=""
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            draggable={false}
            loading="lazy"
          />
        </div>
      )}
      <div className="px-5 py-3">
        <p className="text-sm font-medium text-text-primary/70 group-hover:text-text-primary transition-colors leading-tight truncate">
          {project.title}
        </p>
        <p className="text-[0.65rem] font-mono text-text-tertiary tracking-[0.08em] uppercase mt-0.5">
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

// ════════════════════════════════════════════════════════════════════
// Floater config types
// ════════════════════════════════════════════════════════════════════

type FloaterType =
  | { kind: "chip"; projectIndex: number }
  | { kind: "image"; projectIndex: number; size: "sm" | "md" };

interface FloaterConfig {
  type: FloaterType;
  delay: number;
  drift: number;
}

// ════════════════════════════════════════════════════════════════════
// Static floater definitions
// ════════════════════════════════════════════════════════════════════

function buildFloaterConfigs(): FloaterConfig[] {
  const configs: FloaterConfig[] = [];
  let d = 0;
  const nextDelay = () => { d = (d + 0.3) % 2; return d; };
  const nextDrift = (i: number) => (i % 5) + 1;

  // Project chips — 20 instances (reuse indices 0-11)
  for (let i = 0; i < 20; i++) {
    configs.push({ type: { kind: "chip", projectIndex: i % 12 }, delay: nextDelay(), drift: nextDrift(i) });
  }

  // Image thumbnails from project covers — 18 instances
  for (let i = 0; i < 18; i++) {
    configs.push({
      type: { kind: "image", projectIndex: i % 12, size: i % 3 === 0 ? "md" : "sm" },
      delay: nextDelay(), drift: nextDrift(i),
    });
  }

  return configs;
}

const FLOATER_CONFIGS = buildFloaterConfigs();

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

  // Compute positions for all floaters
  const positions = useMemo(() => {
    return FLOATER_CONFIGS.map((_, i) => randomPos(seed, i));
  }, [seed]);

  // Render a floater's content
  const renderContent = (config: FloaterConfig) => {
    const { type } = config;
    switch (type.kind) {
      case "chip": {
        const project = p[type.projectIndex];
        return project ? <ProjectChip project={project} /> : null;
      }
      case "image": {
        const project = p[type.projectIndex];
        if (!project) return null;
        const src = project.coverImage || (project.coverImageGif ? project.coverImageGif.replace(/\.gif$/, "-poster.webp") : null);
        return src ? <ImageThumb src={src} size={type.size} /> : null;
      }
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

    </div>
  );
}
