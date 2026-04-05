import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date to "MMM YYYY" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

/** Format a date to "MMM DD, YYYY" */
export function formatDateFull(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Estimate reading time from raw MDX content */
export function readingTime(text: string): string {
  const cleaned = text
    .replace(/^---[\s\S]*?---/m, "")       // frontmatter
    .replace(/^import\s.+$/gm, "")         // import lines
    .replace(/```[\s\S]*?```/g, "")         // fenced code blocks
    .replace(/<[^>]*\/?>/g, "")             // HTML/JSX tags
    .replace(/!\[.*?\]\(.*?\)/g, "")        // markdown images
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1"); // markdown links → keep text
  const words = cleaned.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 230));
  return `${minutes} ${minutes === 1 ? "min" : "mins"} read`;
}

/**
 * Derive conventional media paths from a GIF cover path.
 * e.g. "/images/projects/foo/cover.gif" →
 *   poster: "/images/projects/foo/cover-poster.webp"
 *   mp4:    "/images/projects/foo/cover.mp4"
 *   webm:   "/images/projects/foo/cover.webm"
 */
export function deriveMediaPaths(gifPath: string) {
  const base = gifPath.replace(/\.[^.]+$/, "");
  return {
    poster: `${base}-poster.webp`,
    mp4: `${base}.mp4`,
    webm: `${base}.webm`,
  };
}
