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
  { label: "Graphics" },
];

export const PROJECT_CONTEXTS = [
  "All",
  "Client Work",
  "Internal",
  "Collaborative",
  "R&D",
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
