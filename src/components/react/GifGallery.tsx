import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { deriveMediaPaths } from "@lib/utils";

interface GifItem {
  src: string;
  alt: string;
  caption?: string;
}

interface Props {
  items: GifItem[];
}

function isGif(src: string): boolean {
  return src.toLowerCase().endsWith(".gif");
}

function MediaElement({
  item,
  className,
  autoPlay = false,
}: {
  item: GifItem;
  className?: string;
  autoPlay?: boolean;
}) {
  if (isGif(item.src)) {
    const media = deriveMediaPaths(item.src);
    return (
      <video
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        poster={media.poster}
        className={className}
      >
        <source src={media.webm} type="video/webm" />
        <source src={media.mp4} type="video/mp4" />
      </video>
    );
  }
  return <img src={item.src} alt={item.alt} className={className} />;
}

export default function GifGallery({ items }: Props) {
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + items.length) % items.length),
    [items.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % items.length),
    [items.length]
  );
  const close = useCallback(() => setIsFullscreen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFullscreen && e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    if (isFullscreen) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      if (isFullscreen) document.body.style.overflow = "";
    };
  }, [isFullscreen, prev, next, close]);

  if (!items.length) return null;
  const current = items[index];

  return (
    <>
      <figure className="my-8">
        <div className="relative group">
          <div className="relative overflow-hidden border border-border" data-squircle="12">
            <button
              onClick={() => setIsFullscreen(true)}
              className="block w-full cursor-pointer p-0 m-0 bg-transparent border-none"
              aria-label="View fullscreen"
            >
              <MediaElement
                key={index}
                item={current}
                className="w-full h-auto block"
                autoPlay
              />
            </button>
          </div>

          {items.length > 1 && (
            <>
              <NavButton dir="left" onClick={prev} />
              <NavButton dir="right" onClick={next} />
            </>
          )}
        </div>

        <div className="text-center mt-3">
          {items.length > 1 && (
            <div className="font-mono text-[0.7rem] text-text-tertiary tracking-[0.1em] mb-1">
              {index + 1} / {items.length}
            </div>
          )}
          {current.caption && (
            <figcaption className="text-sm text-text-tertiary font-light">
              {current.caption}
            </figcaption>
          )}
        </div>
      </figure>

      {isFullscreen && createPortal(
        <Lightbox
          item={current}
          index={index}
          total={items.length}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />,
        document.body
      )}
    </>
  );
}

function Lightbox({
  item, index, total, onClose, onPrev, onNext,
}: {
  item: GifItem; index: number; total: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10 cursor-pointer"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 md:left-8 text-white/40 hover:text-white transition-colors z-10 cursor-pointer"
              aria-label="Previous"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 md:right-8 text-white/40 hover:text-white transition-colors z-10 cursor-pointer"
              aria-label="Next"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="max-w-[90vw] max-h-[85vh] overflow-hidden"
          data-squircle="12"
          onClick={(e) => e.stopPropagation()}
        >
          {isGif(item.src) ? (
            (() => {
              const media = deriveMediaPaths(item.src);
              return (
                <video autoPlay muted loop playsInline poster={media.poster} className="max-w-[90vw] max-h-[85vh] object-contain">
                  <source src={media.webm} type="video/webm" />
                  <source src={media.mp4} type="video/mp4" />
                </video>
              );
            })()
          ) : (
            <img src={item.src} alt={item.alt} className="max-w-[90vw] max-h-[85vh] object-contain" />
          )}
        </motion.div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center max-w-[90vw]">
          {total > 1 && (
            <div className="font-mono text-[0.7rem] text-white/40 tracking-[0.1em] mb-2">
              {index + 1} / {total}
            </div>
          )}
          {item.caption && (
            <div className="text-sm text-white/60 font-light px-4">{item.caption}</div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function NavButton({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  const isLeft = dir === "left";
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? "left-2" : "right-2"} opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center cursor-pointer`}
      data-squircle="20"
      aria-label={isLeft ? "Previous" : "Next"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={isLeft ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
      </svg>
    </button>
  );
}
