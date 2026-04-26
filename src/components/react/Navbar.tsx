import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_ITEMS, SOCIAL_LINKS } from "@lib/constants";
import ThemeToggle from "./ThemeToggle";

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
// Contact links
// ════════════════════════════════════════════════════════════════════

const CONTACT_LINKS = [
  { label: "GitHub", href: SOCIAL_LINKS.github, external: true, icon: "gh" },
  { label: "LinkedIn", href: SOCIAL_LINKS.linkedin, external: true, icon: "li" },
  { label: "Email", href: `mailto:${SOCIAL_LINKS.email}`, external: false, icon: "em" },
  { label: "Resume", href: "/resume.pdf", external: true, icon: "cv" },
] as const;

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

const CONTACT_ICONS: Record<string, () => React.JSX.Element> = {
  gh: GitHubIcon,
  li: LinkedInIcon,
  em: EmailIcon,
  cv: ResumeIcon,
};

/** Desktop contact dropdown — opens upward from the navbar pill */
function ContactDropdown({ open, onToggle, btnRef }: { open: boolean; onToggle: () => void; btnRef: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <button
      ref={btnRef}
      onClick={onToggle}
      className="text-[0.72rem] font-medium text-bg bg-teal no-underline px-4 py-1 hover:opacity-85 transition-opacity whitespace-nowrap border-none cursor-pointer flex items-center gap-1"
      data-squircle="6"
    >
      Contact
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="transition-transform duration-200"
        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      >
        <polyline points="2 6 5 3 8 6" />
      </svg>
    </button>
  );
}

/** Popover rendered outside the pill so overflow-hidden doesn't clip it */
function ContactPopover({ open, anchorRef }: { open: boolean; anchorRef: React.RefObject<HTMLButtonElement | null> }) {
  const [pos, setPos] = useState<{ left: number } | null>(null);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const btn = anchorRef.current;
    const wrapper = btn.closest(".fixed") as HTMLElement | null;
    if (!wrapper) return;
    const btnRect = btn.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    // Align popover's left edge with button's left edge, relative to wrapper
    setPos({ left: btnRect.left - wrapperRect.left });
  }, [open, anchorRef]);

  return (
    <AnimatePresence>
      {open && pos && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-full mb-2 min-w-[160px] py-1.5 nav-pill-bg-scrolled backdrop-blur-2xl backdrop-saturate-[180%]"
          style={{
            left: pos.left,
            filter: "drop-shadow(0 0 0.5px var(--color-border))",
          }}
          data-squircle="10"
        >
          {CONTACT_LINKS.map((link) => {
            const Icon = CONTACT_ICONS[link.icon];
            return (
              <a
                key={link.label}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-2.5 px-3.5 py-2 text-[0.72rem] text-text-secondary no-underline hover:text-text-primary nav-hover transition-colors"
              >
                <Icon />
                {link.label}
              </a>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ════════════════════════════════════════════════════════════════════
// Main Navbar
// ════════════════════════════════════════════════════════════════════

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const contactBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsHome(window.location.pathname === "/");
  }, []);

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
        setContactOpen(false);
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
        if (contactOpen) {
          setContactOpen(false);
        } else {
          setExpanded(false);
          setMobileOpen(false);
        }
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
    ? "nav-pill-bg-scrolled backdrop-blur-2xl backdrop-saturate-[180%] shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    : "nav-pill-bg backdrop-blur-xl";

  const filterStyle = scrolled
    ? "drop-shadow(0 0 0.5px var(--color-border))"
    : "drop-shadow(0 0 0.5px var(--color-border))";

  return (
    <>
      {/* ─── Desktop: Two-state pill navbar ───────────────────── */}
      <div className="hidden md:block fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
        <ContactPopover open={contactOpen && expanded} anchorRef={contactBtnRef} />
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
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
                onMouseEnter={() => setExpanded(true)}
              >
                {/* Bars icon */}
                <div className="flex flex-col gap-[5px] pl-6 py-3">
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
                {/* Logo — navigates home */}
                <a
                  href="/"
                  className="text-[0.85rem] font-bold text-text-primary no-underline tracking-tight hover:text-teal transition-colors duration-200 pl-3 pr-6 py-3"
                >
                  nap of the earth
                </a>
              </motion.div>
            ) : (
              /* ── Expanded state: full navigation ── */
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="flex items-center gap-3 px-5 py-2"
              >
                {/* Logo — click to go home */}
                <a
                  href="/"
                  className="text-[0.8rem] font-bold text-text-primary tracking-tight no-underline hover:text-teal transition-colors duration-200 whitespace-nowrap"
                >
                  nap of the earth
                </a>

                {/* Separator */}
                <div className="w-px h-3.5 bg-border/40" />

                {/* Nav Links */}
                <ul className="flex gap-0.5 list-none m-0 p-0">
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
                        className="text-[0.72rem] text-text-secondary no-underline px-2 py-1 hover:text-text-primary nav-hover transition-colors"
                        data-squircle="6"
                      >
                        {item.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>

                {/* Separator */}
                <div className="w-px h-3.5 bg-border/40" />

                {/* CTA Button — Contact Dropdown */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                >
                  <ContactDropdown open={contactOpen} onToggle={() => setContactOpen((o) => !o)} btnRef={contactBtnRef} />
                </motion.div>

                {/* Shuffle Button — only on homepage */}
                {isHome && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent("hero-shuffle"))
                    }
                    className="flex items-center gap-1 text-[0.72rem] font-medium text-text-secondary px-2 py-1 hover:text-text-primary nav-hover transition-colors border-none bg-transparent cursor-pointer whitespace-nowrap"
                    data-squircle="6"
                    aria-label="Shuffle floating objects"
                  >
                    <ShuffleIcon />
                    Shuffle
                  </motion.button>
                )}

                {/* Theme Toggle */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.22 }}
                >
                  <ThemeToggle />
                </motion.div>

                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.28 }}
                  onClick={() => { setExpanded(false); setContactOpen(false); }}
                  className="flex items-center justify-center w-6 h-6 text-text-tertiary hover:text-text-primary nav-hover transition-colors border-none bg-transparent cursor-pointer"
                  data-squircle="4"
                  aria-label="Close navigation"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>

      {/* ─── Mobile: Compact pill + hamburger ─────────────────── */}
      <nav
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-1.5 flex items-center gap-2 md:hidden ${bgClass}`}
        style={{ filter: filterStyle }}
        data-squircle="20"
      >
        <a
          href="/"
          className="text-[0.75rem] font-bold text-text-primary no-underline tracking-tight whitespace-nowrap"
        >
          nap of the earth
        </a>

        {/* Shuffle (mobile) — only on homepage */}
        {isHome && (
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("hero-shuffle"))
            }
            className="flex items-center p-1 bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Shuffle"
          >
            <ShuffleIcon />
          </button>
        )}

        {/* Theme Toggle (mobile) */}
        <ThemeToggle />

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 p-1 bg-transparent border-none cursor-pointer z-[60]"
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
              {/* Contact links */}
              {CONTACT_LINKS.map((link, li) => {
                const Icon = CONTACT_ICONS[link.icon];
                return (
                  <motion.li
                    key={link.label}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 + (NAV_ITEMS.length + li) * 0.05 }}
                  >
                    <a
                      href={link.href}
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      onClick={closeMobile}
                      className="text-lg text-text-secondary no-underline px-6 py-3 hover:text-text-primary hover:bg-bg-card transition-colors flex items-center gap-3"
                      data-squircle="10"
                    >
                      <Icon />
                      {link.label}
                    </a>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
