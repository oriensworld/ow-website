import { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "motion/react";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@lib/constants";
import { deriveMediaPaths } from "@lib/utils";

export interface ProjectCardProject {
  id: string;
  title: string;
  description: string;
  category: string;
  context?: string;
  icon: string;
  tags: string[];
  featured: boolean;
  coverImage?: string;
  coverImageGif?: string;
}

interface Props {
  project: ProjectCardProject;
}

const COVER_HEIGHT = 200;
const TILT_SPRING = { stiffness: 200, damping: 20 };

export default function ProjectCard({ project }: Props) {
  const colors = CATEGORY_COLORS[project.category] ?? DEFAULT_CATEGORY_COLOR;
  const ref = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  // Lazy load cover media
  useEffect(() => {
    if (!coverRef.current || !project.coverImageGif) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
      },
      { rootMargin: "200px" },
    );
    observer.observe(coverRef.current);
    return () => observer.disconnect();
  }, [project.coverImageGif]);

  // Touch: auto-play when visible
  useEffect(() => {
    if (!isTouch || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCardVisible(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isTouch]);

  const shouldPlay = isTouch ? cardVisible : hovered;
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) { video.play().catch(() => {}); }
    else { video.pause(); video.currentTime = 0; }
  }, [shouldPlay]);

  const media = project.coverImageGif ? deriveMediaPaths(project.coverImageGif) : null;

  // 3D tilt
  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);
  const pxX = useMotionValue(0);
  const pxY = useMotionValue(0);

  const rotateX = useSpring(useTransform(normY, [0, 1], [4, -4]), TILT_SPRING);
  const rotateY = useSpring(useTransform(normX, [0, 1], [-4, 4]), TILT_SPRING);

  const spotlightGradient = useMotionTemplate`radial-gradient(300px circle at ${pxX}px ${pxY}px, ${colors.glow} 0%, transparent 70%)`;
  const spotlightOpacity = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    normX.set(x / rect.width);
    normY.set(y / rect.height);
    pxX.set(x);
    pxY.set(y);
    spotlightOpacity.set(1);
  }

  function handleMouseLeave() {
    normX.set(0.5);
    normY.set(0.5);
    spotlightOpacity.set(0);
    setHovered(false);
  }

  return (
    <motion.a
      ref={ref}
      href={`/projects/${project.id}`}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`project-card group block bg-bg-card border border-border no-underline relative overflow-hidden ${
        project.featured ? "project-card-featured" : ""
      }`}
      data-squircle="16"
      style={{
        "--cat-accent": colors.accent,
        "--cat-glow": colors.glow,
        "--cat-from": colors.gradientFrom,
        "--cat-to": colors.gradientTo,
        rotateX,
        rotateY,
        transformPerspective: 800,
      } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cursor spotlight */}
      <motion.div
        className="card-spotlight"
        style={{ background: spotlightGradient, opacity: spotlightOpacity }}
      />

      {/* Top gradient line */}
      <div className="card-gradient absolute top-0 left-0 w-full z-10" />

      {/* Cover media */}
      {media ? (
        <div
          ref={coverRef}
          className="w-full overflow-hidden relative"
          style={{ height: COVER_HEIGHT }}
        >
          {inView && (
            <>
              <img
                src={media.poster}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{ display: shouldPlay ? "none" : "block" }}
              />
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="none"
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{ display: shouldPlay ? "block" : "none" }}
              >
                <source src={media.webm} type="video/webm" />
                <source src={media.mp4} type="video/mp4" />
              </video>
            </>
          )}
        </div>
      ) : project.coverImage ? (
        <div className="card-cover" style={{ height: COVER_HEIGHT }}>
          <img src={project.coverImage} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
        </div>
      ) : (
        <div className="card-cover" style={{ height: COVER_HEIGHT }}>
          <div className="card-cover-placeholder" />
        </div>
      )}

      {/* Card content */}
      <div className="px-6 pt-5 pb-7">
        <div className="flex items-center gap-2 mb-2">
          <p
            className="font-mono text-[0.65rem] tracking-[0.1em] uppercase"
            style={{ color: colors.accent }}
          >
            {project.category}
          </p>
          {project.context && (
            <span className="font-mono text-[0.55rem] text-text-tertiary tracking-[0.08em] uppercase border border-border px-1.5 py-0.5" data-squircle="4">
              {project.context}
            </span>
          )}
        </div>

        <h3 className="text-base font-medium tracking-tight text-text-primary mb-2">
          {project.title}
        </h3>

        <p className="text-sm font-light leading-relaxed text-text-secondary mb-4 line-clamp-3">
          {project.description}
        </p>

        <div className="flex gap-1.5 flex-wrap">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[0.6rem] text-text-tertiary bg-bg border border-border px-2 py-0.5"
              data-squircle="6"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <span
        className="card-arrow absolute bottom-6 right-6 font-mono text-[0.7rem] tracking-wider uppercase"
        style={{ color: colors.accent }}
      >
        View →
      </span>
    </motion.a>
  );
}
