import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  category?: string;
  pubDate: string;
  tags: string[];
  draft: boolean;
}

interface Props {
  posts: BlogPost[];
  categories: string[];
}

export default function BlogFilter({ posts, categories }: Props) {
  const [active, setActive] = useState("All");

  const filtered = posts.filter(
    (p) => active === "All" || p.category === active
  );

  const countFor = (cat: string) =>
    posts.filter((p) => cat === "All" || p.category === cat).length;

  return (
    <div>
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap justify-center mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`font-mono text-[0.7rem] tracking-[0.1em] uppercase px-4 py-2 transition-all cursor-pointer ${
              active === cat
                ? "bg-teal text-bg"
                : "bg-transparent text-text-secondary hover:text-text-primary"
            }`}
            style={{
              filter: active === cat ? undefined : "drop-shadow(0 0 0.5px var(--color-border))",
            }}
            data-squircle="8"
          >
            {cat}
            <span className="ml-1.5 opacity-60">{countFor(cat)}</span>
          </button>
        ))}
      </div>

      {/* Blog Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[1100px] mx-auto">
        <AnimatePresence mode="popLayout">
          {filtered.map((post) => (
            <motion.a
              key={post.id}
              href={`/archive/${post.id}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="omnius-card block no-underline group"
            >
              <div className="flex items-center gap-2 mb-3">
                {post.category && (
                  <span className="font-mono text-[0.65rem] text-teal tracking-[0.1em] uppercase">
                    {post.category}
                  </span>
                )}
                <span className="font-mono text-[0.6rem] text-text-tertiary tracking-[0.05em]">
                  {new Date(post.pubDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <h3 className="text-base font-semibold tracking-tight text-text-primary mb-2 group-hover:text-teal transition-colors">
                {post.title}
              </h3>

              <p className="text-sm font-normal leading-relaxed text-text-secondary mb-4">
                {post.description}
              </p>

              <div className="flex gap-1.5 flex-wrap">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[0.6rem] text-text-tertiary bg-[rgba(255,255,255,0.04)] px-2 py-0.5 group-hover:text-text-secondary transition-colors"
                    style={{ filter: "drop-shadow(0 0 0.5px var(--color-border))" }}
                    data-squircle="6"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-tertiary text-sm">
            No posts in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
