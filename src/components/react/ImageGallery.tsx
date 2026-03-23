import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  images: { src: string; alt: string }[];
  columns?: 2 | 3;
}

/**
 * Clickable image grid with fullscreen lightbox overlay.
 * Supports keyboard navigation (←/→/Esc) and swipe-like prev/next.
 */
export default function ImageGallery({ images, columns = 3 }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () =>
      setActiveIndex((i) =>
        i !== null ? (i - 1 + images.length) % images.length : null
      ),
    [images.length]
  );
  const next = useCallback(
    () =>
      setActiveIndex((i) =>
        i !== null ? (i + 1) % images.length : null
      ),
    [images.length]
  );

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [activeIndex, close, prev, next]);

  const colClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={`grid ${colClass} gap-3 my-8`}>
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setActiveIndex(i)}
            className="group relative aspect-video overflow-hidden cursor-pointer bg-bg-card transition-[filter] duration-300 hover:[filter:drop-shadow(0_0_0.5px_var(--color-border-hover))]"
            style={{ filter: "drop-shadow(0 0 0.5px var(--color-border))" }}
            data-squircle="8"
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={close}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10 cursor-pointer"
              aria-label="Close"
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

            {/* Prev button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 md:left-8 text-white/40 hover:text-white transition-colors z-10 cursor-pointer"
              aria-label="Previous image"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Image */}
            <motion.img
              key={activeIndex}
              src={images[activeIndex].src}
              alt={images[activeIndex].alt}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              data-squircle="12"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 md:right-8 text-white/40 hover:text-white transition-colors z-10 cursor-pointer"
              aria-label="Next image"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] text-white/40 tracking-[0.1em]">
              {activeIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
