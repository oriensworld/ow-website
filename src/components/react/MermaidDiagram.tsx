import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  chart: string;
  className?: string;
  caption?: string;
}

let idCounter = 0;

/**
 * Renders a Mermaid diagram with theme-aware styling.
 * Re-renders automatically when the site theme toggles between dark and light.
 * Supports pan, zoom, and fullscreen for complex diagrams.
 */
export default function MermaidDiagram({ chart, className, caption }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const idRef = useRef(`mermaid-${idCounter++}`);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;

    const getTheme = () =>
      document.documentElement.getAttribute("data-theme") === "light"
        ? "default"
        : "dark";

    const render = async () => {
      const mermaid = (await import("mermaid")).default;

      mermaid.initialize({
        startOnLoad: false,
        theme: getTheme(),
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        flowchart: {
          htmlLabels: true,
          nodeSpacing: 40,
          rankSpacing: 50,
          useMaxWidth: false,
        },
        gantt: {
          useMaxWidth: false,
        },
      });

      try {
        const { svg: rendered } = await mermaid.render(
          idRef.current,
          chart.trim()
        );
        if (!cancelled) setSvg(rendered);
      } catch {
        if (!cancelled) setSvg("");
      }
    };

    render();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "data-theme") {
          idRef.current = `mermaid-${idCounter++}`;
          render();
          break;
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [chart]);

  // Trim SVG viewBox to actual content bounds after mounting
  useEffect(() => {
    if (!svg || !containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) return;

    const isGantt = chart.trim().startsWith("gantt");

    try {
      if (isGantt) {
        // Gantt charts: skip viewBox trimming entirely.
        // Mermaid renders Gantt at a small fixed size; trimming the viewBox
        // locks in that tiny aspect ratio. Instead, just override dimensions
        // and let the browser scale the original SVG to fill the container.
        svgEl.setAttribute("width", "100%");
        svgEl.removeAttribute("height");
        svgEl.style.width = "100%";
        svgEl.style.height = "auto";
        svgEl.style.maxWidth = "none";
      } else {
        const bbox = svgEl.getBBox();
        const pad = 8;
        svgEl.setAttribute(
          "viewBox",
          `${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`
        );
        svgEl.removeAttribute("width");
        svgEl.removeAttribute("height");
        svgEl.style.width = "100%";
        svgEl.style.height = "auto";
        svgEl.style.maxWidth = `${bbox.width + pad * 2}px`;
      }
    } catch {
      // getBBox can throw on hidden elements — ignore
    }
  }, [svg]);

  // Calculate optimal zoom when entering fullscreen
  useEffect(() => {
    if (isFullscreen && containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        // Get actual rendered dimensions
        const bbox = svgElement.getBoundingClientRect();
        const svgWidth = bbox.width || svgElement.viewBox.baseVal.width || svgElement.width.baseVal.value;
        const svgHeight = bbox.height || svgElement.viewBox.baseVal.height || svgElement.height.baseVal.value;

        // Calculate scale to fit 85% of viewport while maintaining aspect ratio
        const viewportWidth = window.innerWidth * 0.85;
        const viewportHeight = window.innerHeight * 0.85;

        const scaleX = viewportWidth / svgWidth;
        const scaleY = viewportHeight / svgHeight;
        const optimalScale = Math.min(scaleX, scaleY);

        // Apply optimal scale with reasonable bounds (1.5x minimum for better visibility)
        setScale(Math.max(1.5, Math.min(optimalScale, 8)));
      }
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isFullscreen]);

  // Keyboard shortcuts in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.2, 5));
      if (e.key === "-" || e.key === "_") setScale((s) => Math.max(s - 0.2, 0.5));
      if (e.key === "0") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!isFullscreen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.max(0.5, Math.min(5, s + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFullscreen) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isFullscreen) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!svg) return null;

  const diagramContent = (
    <div
      ref={containerRef}
      className={cn(
        "flex justify-center overflow-x-auto [&_svg]:min-w-0",
        isFullscreen && "cursor-move select-none",
        className
      )}
      style={
        isFullscreen
          ? {
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }
          : undefined
      }
      dangerouslySetInnerHTML={{ __html: svg }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );

  return (
    <>
      <figure className="my-8">
        <div className="relative group">
          {diagramContent}
          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-card border border-border hover:border-border-hover rounded px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
            aria-label="View fullscreen"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
        {caption && (
          <figcaption className="text-sm text-text-tertiary text-center mt-3 font-light">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Fullscreen Modal */}
      {isFullscreen && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-sm"
            onWheel={handleWheel}
          >
            {/* Close button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
              aria-label="Close fullscreen"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Controls */}
            <div className="absolute top-6 left-6 flex gap-2 z-10">
              <button
                onClick={() => setScale((s) => Math.min(s + 0.2, 5))}
                className="bg-white/10 hover:bg-white/20 text-white rounded px-3 py-1.5 text-sm transition-colors"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
                className="bg-white/10 hover:bg-white/20 text-white rounded px-3 py-1.5 text-sm transition-colors"
                aria-label="Zoom out"
              >
                −
              </button>
              <button
                onClick={() => {
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="bg-white/10 hover:bg-white/20 text-white rounded px-3 py-1.5 text-sm transition-colors"
                aria-label="Reset view"
              >
                Reset
              </button>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <div className="text-sm text-white/40 font-light">
                Drag to pan • Scroll to zoom • Press ESC to close
              </div>
            </div>

            {/* Diagram */}
            <div className="flex items-center justify-center h-full overflow-hidden">
              {diagramContent}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
