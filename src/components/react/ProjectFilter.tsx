import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  context?: string;
  icon: string;
  tags: string[];
  featured: boolean;
}

interface CategoryGroup {
  label: string;
  children?: string[];
}

interface Props {
  projects: Project[];
  categoryHierarchy: CategoryGroup[];
  contexts: string[];
}

export default function ProjectFilter({
  projects,
  categoryHierarchy,
  contexts,
}: Props) {
  const [activeGroup, setActiveGroup] = useState("All");
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [activeContext, setActiveContext] = useState("All");

  // Determine which categories are currently active for filtering
  const getActiveCategories = (): string[] | null => {
    if (activeGroup === "All") return null; // null = match all
    const group = categoryHierarchy.find((g) => g.label === activeGroup);
    if (!group) return [activeGroup];
    if (activeChild) return [activeChild];
    return group.children ?? [group.label];
  };

  const activeCategories = getActiveCategories();

  const filtered = projects.filter((p) => {
    const catMatch =
      activeCategories === null || activeCategories.includes(p.category);
    const ctxMatch = activeContext === "All" || p.context === activeContext;
    return catMatch && ctxMatch;
  });

  const countForGroup = (group: CategoryGroup) => {
    const cats = group.label === "All" ? null : (group.children ?? [group.label]);
    return projects.filter((p) => {
      const catMatch = cats === null || cats.includes(p.category);
      const ctxMatch = activeContext === "All" || p.context === activeContext;
      return catMatch && ctxMatch;
    }).length;
  };

  const countForChild = (child: string) =>
    projects.filter((p) => {
      const catMatch = p.category === child;
      const ctxMatch = activeContext === "All" || p.context === activeContext;
      return catMatch && ctxMatch;
    }).length;

  const countForContext = (ctx: string) =>
    projects.filter((p) => {
      const catMatch =
        activeCategories === null || activeCategories.includes(p.category);
      const ctxMatch = ctx === "All" || p.context === ctx;
      return catMatch && ctxMatch;
    }).length;

  const handleGroupClick = (group: CategoryGroup) => {
    if (group.label === activeGroup && group.children) {
      // Toggle expand/collapse
      setExpandedGroup(expandedGroup === group.label ? null : group.label);
    } else {
      setActiveGroup(group.label);
      setActiveChild(null);
      setExpandedGroup(group.children ? group.label : null);
    }
  };

  const handleChildClick = (child: string) => {
    setActiveChild(activeChild === child ? null : child);
  };

  return (
    <div>
      {/* Row 1 — Category Filter with collapsible groups */}
      <div className="flex gap-2 flex-wrap justify-center mb-2">
        {categoryHierarchy.map((group) => {
          const isActive = activeGroup === group.label;
          const hasChildren = group.children && group.children.length > 1;
          return (
            <button
              key={group.label}
              onClick={() => handleGroupClick(group)}
              className={`font-mono text-[0.7rem] tracking-[0.1em] uppercase px-4 py-2 transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                isActive
                  ? "bg-teal text-bg"
                  : "bg-transparent text-text-secondary hover:text-text-primary"
              }`}
              style={{
                filter: isActive ? undefined : "drop-shadow(0 0 0.5px var(--color-border))",
              }}
              data-squircle="8"
            >
              {group.label}
              <span className="opacity-60">{countForGroup(group)}</span>
              {hasChildren && (
                <span
                  className={`text-[0.5rem] transition-transform duration-200 ${
                    expandedGroup === group.label ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded children row */}
      <AnimatePresence>
        {expandedGroup && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-1.5 flex-wrap justify-center py-2">
              {categoryHierarchy
                .find((g) => g.label === expandedGroup)
                ?.children?.map((child) => (
                  <button
                    key={child}
                    onClick={() => handleChildClick(child)}
                    className={`font-mono text-[0.6rem] tracking-[0.08em] uppercase px-3 py-1 transition-all cursor-pointer ${
                      activeChild === child
                        ? "bg-teal/20 text-teal"
                        : "bg-transparent text-text-tertiary hover:text-text-secondary"
                    }`}
                    style={{
                      filter: activeChild === child ? "drop-shadow(0 0 0.5px rgba(45,212,191,0.4))" : undefined,
                    }}
                    data-squircle="6"
                  >
                    {child}
                    <span className="ml-1 opacity-50">
                      {countForChild(child)}
                    </span>
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 2 — Context Filter */}
      <div className="flex gap-1.5 flex-wrap justify-center mb-12 mt-2">
        {contexts.map((ctx) => (
          <button
            key={ctx}
            onClick={() => setActiveContext(ctx)}
            className={`font-mono text-[0.6rem] tracking-[0.08em] uppercase px-3 py-1 transition-all cursor-pointer ${
              activeContext === ctx
                ? "bg-transparent text-text-primary"
                : "bg-transparent text-text-tertiary hover:text-text-secondary"
            }`}
            style={{
              filter: activeContext === ctx ? "drop-shadow(0 0 0.5px var(--color-text-primary))" : undefined,
            }}
            data-squircle="6"
          >
            {ctx}
            <span className="ml-1 opacity-50">{countForContext(ctx)}</span>
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.a
              key={project.id}
              href={`/projects/${project.id}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="omnius-card block no-underline group"
            >
              <div className="flex items-center gap-2 mb-2">
                <p className="font-mono text-[0.65rem] text-teal tracking-[0.1em] uppercase">
                  {project.category}
                </p>
                {project.context && (
                  <span
                    className="font-mono text-[0.55rem] text-text-tertiary tracking-[0.08em] uppercase px-1.5 py-0.5"
                    style={{ filter: "drop-shadow(0 0 0.5px var(--color-border))" }}
                    data-squircle="6"
                  >
                    {project.context}
                  </span>
                )}
              </div>

              <h3 className="text-base font-semibold tracking-tight text-text-primary mb-2 group-hover:text-teal transition-colors">
                {project.title}
              </h3>

              <p className="text-sm font-normal leading-relaxed text-text-secondary mb-4">
                {project.description}
              </p>

              <div className="flex gap-1.5 flex-wrap">
                {project.tags.map((tag) => (
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
            No projects match these filters.
          </p>
        </div>
      )}
    </div>
  );
}
