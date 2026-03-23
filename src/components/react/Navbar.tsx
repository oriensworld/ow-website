import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_ITEMS } from "@lib/constants";

/**
 * If we're on the homepage and the nav item has an anchor,
 * smooth-scroll to that section instead of navigating.
 */
function handleNavClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  item: (typeof NAV_ITEMS)[number],
  onAfter?: () => void
) {
  if ("external" in item && item.external) return;

  const isHome = window.location.pathname === "/";
  if (!isHome || !("anchor" in item) || !item.anchor) return;

  const target = document.querySelector(item.anchor);
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth" });
  onAfter?.();
}

// ════════════════════════════════════════════════════════════════════
// Shuffle icon SVG
// ════════════════════════════════════════════════════════════════════

function ShuffleIcon() {
  return (
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
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════
// Main Navbar
// ════════════════════════════════════════════════════════════════════

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close expanded nav when clicking outside
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      const nav = document.getElementById("nav-pill");
      if (nav && !nav.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    // Delay listener to avoid catching the opening click
    const t = setTimeout(() => document.addEventListener("click", handler), 10);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", handler);
    };
  }, [expanded]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExpanded(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const bgClass = scrolled
    ? "bg-[rgba(6,8,15,0.85)] backdrop-blur-2xl backdrop-saturate-[180%] shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    : "bg-[rgba(6,8,15,0.5)] backdrop-blur-xl";

  const filterStyle = scrolled
    ? "drop-shadow(0 0 0.5px rgba(30,41,59,0.8))"
    : "drop-shadow(0 0 0.5px rgba(30,41,59,0.5))";

  return (
    <>
      {/* ─── Desktop: Two-state pill navbar ───────────────────── */}
      <div className="hidden md:block fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
        <motion.nav
          id="nav-pill"
          layout
          transition={{
            layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          }}
          className={`flex items-center overflow-hidden ${bgClass}`}
          style={{ filter: filterStyle }}
          data-squircle="20"
        >
          <AnimatePresence mode="wait">
            {!expanded ? (
              /* ── Idle state: compact pill button ── */
              <motion.button
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setExpanded(true)}
                className="flex items-center gap-3 px-6 py-3 bg-transparent border-none cursor-pointer group"
              >
                {/* Animated bars icon */}
                <div className="flex flex-col gap-[5px]">
                  <motion.span
                    className="block w-4 h-[1.5px] bg-teal origin-left"
                    initial={false}
                    animate={{ width: 16 }}
                  />
                  <motion.span
                    className="block w-3 h-[1.5px] bg-teal/60 origin-left"
                    initial={false}
                    animate={{ width: 12 }}
                  />
                  <motion.span
                    className="block w-2 h-[1.5px] bg-teal/30 origin-left"
                    initial={false}
                    animate={{ width: 8 }}
                  />
                </div>
                <span className="text-[0.85rem] font-bold text-text-primary tracking-tight group-hover:text-teal transition-colors duration-200">
                  nap of the earth
                </span>
              </motion.button>
            ) : (
              /* ── Expanded state: full navigation ── */
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="flex items-center gap-6 px-6 py-2.5"
              >
                {/* Logo — click to collapse */}
                <button
                  onClick={() => setExpanded(false)}
                  className="text-[0.9rem] font-bold text-text-primary tracking-tight bg-transparent border-none cursor-pointer hover:text-teal transition-colors duration-200 whitespace-nowrap"
                >
                  nap of the earth
                </button>

                {/* Separator */}
                <div className="w-px h-4 bg-border/40" />

                {/* Nav Links */}
                <ul className="flex gap-1 list-none m-0 p-0">
                  {NAV_ITEMS.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.05 + i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <a
                        href={item.href}
                        {...("external" in item && item.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        onClick={(e) => handleNavClick(e, item)}
                        className="text-[0.78rem] text-text-secondary no-underline px-3 py-1.5 hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                        data-squircle="8"
                      >
                        {item.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>

                {/* Separator */}
                <div className="w-px h-4 bg-border/40" />

                {/* CTA Button */}
                <motion.a
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  href="/about#contact"
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      document
                        .querySelector("#about")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-[0.78rem] font-medium text-bg bg-teal no-underline px-5 py-1.5 hover:opacity-85 transition-opacity whitespace-nowrap"
                  data-squircle="8"
                >
                  Contact
                </motion.a>

                {/* Shuffle Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("hero-shuffle"))
                  }
                  className="flex items-center gap-1.5 text-[0.78rem] font-medium text-text-secondary px-3 py-1.5 hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)] transition-colors border-none bg-transparent cursor-pointer whitespace-nowrap"
                  data-squircle="8"
                  aria-label="Shuffle floating objects"
                >
                  <ShuffleIcon />
                  Shuffle
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>

      {/* ─── Mobile: Compact pill + hamburger ─────────────────── */}
      <nav
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 flex items-center gap-4 md:hidden ${bgClass}`}
        style={{ filter: filterStyle }}
        data-squircle="20"
      >
        <a
          href="/"
          className="text-[0.85rem] font-bold text-text-primary no-underline tracking-tight"
        >
          nap of the earth
        </a>

        {/* Shuffle (mobile) */}
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("hero-shuffle"))
          }
          className="flex items-center p-2 bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Shuffle"
        >
          <ShuffleIcon />
        </button>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer z-[60]"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={
              mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }
            }
            className="block w-5 h-px bg-text-primary origin-center"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-px bg-text-primary"
          />
          <motion.span
            animate={
              mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }
            }
            className="block w-5 h-px bg-text-primary origin-center"
          />
        </button>
      </nav>

      {/* ─── Mobile Menu Overlay ──────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden overflow-y-auto"
            style={{ background: "var(--mobile-overlay-bg)" }}
          >
            <motion.ul
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col items-center gap-2 pt-24 pb-24 list-none m-0 p-0"
            >
              {NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <a
                    href={item.href}
                    {...("external" in item && item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={(e) => {
                      handleNavClick(e, item, closeMobile);
                      closeMobile();
                    }}
                    className="text-lg text-text-secondary no-underline px-6 py-3 hover:text-text-primary hover:bg-bg-card transition-colors block"
                    data-squircle="10"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + NAV_ITEMS.length * 0.05 }}
              >
                <a
                  href="/about#contact"
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      closeMobile();
                      setTimeout(() => {
                        document
                          .querySelector("#about")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    } else {
                      closeMobile();
                    }
                  }}
                  className="text-lg font-medium text-bg bg-teal no-underline px-8 py-3 hover:opacity-85 transition-opacity block mt-4"
                  data-squircle="10"
                >
                  Contact
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
