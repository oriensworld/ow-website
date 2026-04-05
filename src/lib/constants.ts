export const SITE = {
  title: "nap of the earth",
  description:
    "nap of the earth — Architecture, Graphic Design, Web Development, Software Engineering, and Game Development services.",
  url: "https://napoftheearth.com",
  author: "nap of the earth",
} as const;

export const NAV_ITEMS = [
  { label: "Projects", href: "/projects", anchor: "#projects" },
  { label: "Archive", href: "/archive", anchor: "#archive" },
  { label: "About", href: "/about", anchor: "#about" },
  { label: "Company Profile", href: "/company-profile.pdf", external: true },
] as const;

export const SOCIAL_LINKS = {
  github: "https://github.com/dadavidtseng",
  linkedin: "https://www.linkedin.com/in/dadavidtseng/",
  email: "dadavidtseng@gmail.com",
} as const;

export const PROJECT_CATEGORIES = [
  "All",
  "Architecture",
  "Game Dev",
  "Software",
  "Web",
  "Graphics",
  "Photography",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

// Hierarchical grouping — parent categories with children
// When a parent is selected (collapsed), all children match.
// When expanded, individual children can be selected.
export const CATEGORY_HIERARCHY: {
  label: string;
  children?: string[];
}[] = [
  { label: "All" },
  { label: "Architecture" },
  { label: "Software", children: ["Software", "Game Dev", "Web"] },
  { label: "Graphics", children: ["Graphics", "Photography"] },
];

export const PROJECT_CONTEXTS = [
  "All",
  "Client Work",
  "Internal",
  "Collaborative",
  "R&D",
  "Academic",
  "Individual",
] as const;

export type ProjectContext = (typeof PROJECT_CONTEXTS)[number];

export const BLOG_CATEGORIES = [
  "All",
  "Engineering",
  "Design",
  "Tutorial",
  "Industry",
  "Announcements",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Per-category color tokens for project cards and accents. */
export const CATEGORY_COLORS: Record<
  string,
  { accent: string; glow: string; gradientFrom: string; gradientTo: string }
> = {
  Architecture: {
    accent: "#e53e3e",
    glow: "rgba(229,62,62,0.12)",
    gradientFrom: "#e53e3e",
    gradientTo: "#fc8181",
  },
  "Game Dev": {
    accent: "#d69e2e",
    glow: "rgba(214,158,46,0.12)",
    gradientFrom: "#d69e2e",
    gradientTo: "#f6e05e",
  },
  Software: {
    accent: "#38b2ac",
    glow: "rgba(56,178,172,0.12)",
    gradientFrom: "#38b2ac",
    gradientTo: "#81e6d9",
  },
  Web: {
    accent: "#805ad5",
    glow: "rgba(128,90,213,0.12)",
    gradientFrom: "#805ad5",
    gradientTo: "#b794f4",
  },
  Graphics: {
    accent: "#ed64a6",
    glow: "rgba(237,100,166,0.12)",
    gradientFrom: "#ed64a6",
    gradientTo: "#fbb6ce",
  },
  Photography: {
    accent: "#d4a574",
    glow: "rgba(212,165,116,0.12)",
    gradientFrom: "#d4a574",
    gradientTo: "#e8c9a0",
  },
};

export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS["Architecture"];
