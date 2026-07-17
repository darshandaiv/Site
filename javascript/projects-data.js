/* ================================================================
   PROJECTS CMS DATA
   — Single source of truth for:
       • Homepage Work section     → index.html
       • All projects grid         → projects.html
       • Case Study pages          → projects/case-*.html

   FILE LOCATION NOTE:
   This file (projects-data.js) lives at the SITE ROOT, alongside
   index.html and projects.html. Case study HTML files live one
   level deeper, inside the "projects/" folder (capital P — must
   match exactly, folder names are case-sensitive on most servers).

   ────────────────────────────────────────────────────────────────
   FIELD GUIDE — read this before adding/editing a project
   ────────────────────────────────────────────────────────────────
   id           : Internal stable key. NEVER change once set, even
                  if you rename the project later. Used only for
                  internal lookups — never shown in a URL.

   slug         : Editable, human-facing URL segment. This is what
                  determines the case study filename AND the link
                  everywhere on the site.
                  e.g. slug: "fluent-2024"
                    → file must be named: projects/case-fluent-2024.html
                    → link becomes:       projects/case-fluent-2024.html
                  You can rename slug anytime — just remember to
                  rename the matching projects/case-*.html file to
                  match, or the link will 404.
                  Rules: lowercase letters, numbers, and hyphens
                  only. No spaces, no uppercase, no symbols.

   title        : Full project name, shown as the <h1> on the case
                  study page and as the card title everywhere else.

   year         : Year of completion. Shown as plain text (e.g. "2024").

   behanceUrl   : Full URL to the Behance project. Powers the
                  "View on Behance ↗" button on the case study page.

   projectType  : One of "Academic", "Industry", or "Personal".
                  Shown in the case study meta row, and can also be
                  used as a filter-pill value on projects.html.

   client       : Client or organization name. Use "Self-Initiated"
                  or "Personal Project" if there's no external client.

   tags[]       : Array of category labels (e.g. "UI Design",
                  "Motion", "3D"). Shown as chips on cards + case
                  study meta row. Also usable as filter-pill values
                  on projects.html.
                  ⚠️ PENDING CLEANUP: tag vocabulary across projects
                  is currently inconsistent with the filter pills on
                  projects.html (flagged during last review — to be
                  standardized in a future pass, not fixed yet).

   thumb        : Image path used for the small card thumbnail on
                  index.html + projects.html. Root-relative path
                  (e.g. "assets/images/photo.jpg") — do NOT add "../"
                  here, that's handled automatically by the render
                  functions in script.js depending on which page
                  is loading the image.

   heroImage    : Large image path used at the top of the case study
                  page. Same root-relative path rule as thumb.

   description  : 1–3 sentence project summary. Shown as body text
                  on the case study page.

   frames[]     : Array of media blocks shown stacked on the case
                  study page, in the order listed here. Each frame
                  needs:
                    type    : "image", "video", or "split"
                    src     : root-relative path (same rule as thumb)
                              — NOT used when type is "split"

                  SPLIT FRAMES (2 images side by side):
                  Use type: "split" instead of "image"/"video" when
                  you want two images shown next to each other rather
                  than one wide image. Structure:
                    {
                      type: "split",
                      images: [
                        { src: "assets/images/left.jpg", },
                        { src: "assets/images/right.jpg", }
                      ]
                    }
                  On mobile/tablet (<768px), the two images stack to
                  full width, one above the other, keeping their own
                  aspect ratio — this is handled automatically by CSS.

   summary      : Optional. A closing paragraph shown at the very
                  end of the case study, after all frames — think
                  "results", "reflection", or "what I learned". Shown
                  in a visually distinct block. Leave this field out
                  entirely (or set to "") on projects that don't need
                  a closing summary.

   featured     : true  → project appears on the homepage Work
                          section (index.html)
                  false → project still appears on projects.html,
                          just NOT on the homepage
================================================================ */

const PROJECTS = [
/* Tag vocabulary — standardized across the whole site to match the
   filter pills on projects.html exactly. Every project's first tag
   (tags[0]) is treated as its PRIMARY category — it's what displays
   as plain text in the case study meta row, and it's the most
   important tag for filtering. Additional tags still show as chips
   on work cards everywhere else. */

  {
    id: "fluent-design",
    slug: "fluent-design",
    title: "Microsoft Fluent Design",
    year: "2024",
    behanceUrl: "https://www.behance.net/darshandaiv",
    projectType: "Industry",
    client: "Microsoft",
    tags: ["Branding", "Interaction"],
    thumb: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6759.jpg",
    base: "../assets/images/blue-metal-3840x2160-17258.jpg",
    heroImage: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6759.jpg",
    description: "A comprehensive design system overhaul for Microsoft's Fluent Design language, focused on unifying visual identity across desktop, web, and mobile touchpoints while preserving accessibility and performance at scale.",
    frames: [
      { type: "image", src: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6759.jpg" },
      {
        type: "split",
        images: [
          { src: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6762.jpg", },
          { src: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6759.jpg", }
        ]
      },
      { type: "image", src: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6762.jpg" }
    ],
    summary: "This project reinforced how much accessibility and performance constraints can actually sharpen creative decisions rather than limit them — the strongest visual solutions came directly from working within Microsoft's cross-platform technical requirements, not despite them.",
    featured: true
  },
  {
    id: "oroma",
    slug: "oroma",
    title: "Oroma™",
    year: "2024",
    behanceUrl: "https://www.behance.net/darshandaiv",
    projectType: "Personal",
    client: "Oroma",
    tags: ["Motion", "3D Graphics"],   // was: ["Motion", "3D"]
    thumb: "../assets/images/blue-metal-3840x2160-17258.jpg",
    base: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6759.jpg",
    heroImage: "../assets/images/blue-metal-3840x2160-17258.jpg",
    description: "An experimental 3D brand identity exploring metallic material studies and motion-first storytelling for a fictional product launch.",
    frames: [
      { type: "image", src: "../assets/images/blue-metal-3840x2160-17258.jpg" },
      { type: "image", src: "../assets/images/blue-metal-3840x2160-17258.jpg" },
      { type: "image", src: "../assets/images/blue-metal-3840x2160-17258.jpg" },
      { type: "image", src: "../assets/images/blue-metal-3840x2160-17258.jpg" }
    ],
    summary: "This project reinforced how much accessibility and performance constraints can actually sharpen creative decisions rather than limit them — the strongest visual solutions came directly from working within Microsoft's cross-platform technical requirements, not despite them.",
    featured: true
  },
  {
    id: "nimbus-08",
    slug: "nimbus-08",
    title: "The Nimbus 08",
    year: "2023",
    behanceUrl: "https://www.behance.net/darshandaiv",
    projectType: "Academic",
    client: "University Capstone",
    tags: ["Interaction", "Motion"],   // was: ["Frontend", "React"]
    thumb: "../assets/images/gradient-background-3840x2160-10786.jpg",
      base: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6759.jpg",
    heroImage: "../assets/images/gradient-background-3840x2160-10786.jpg",
    description: "A frontend-heavy capstone project focused on gradient-driven visual systems and component-based React architecture.",
    frames: [
      { type: "image", src: "../assets/images/gradient-background-3840x2160-10786.jpg" }
    ],
    summary: "This project reinforced how much accessibility and performance constraints can actually sharpen creative decisions rather than limit them — the strongest visual solutions came directly from working within Microsoft's cross-platform technical requirements, not despite them.",
    featured: true
  },
  {
    id: "project-gamma",
    slug: "project-gamma",
    title: "Project Gamma",
    year: "2023",
    behanceUrl: "https://www.behance.net/darshandaiv",
    projectType: "Personal",
    client: "Self-Initiated",
    tags: ["Interaction"],   // was: ["Frontend", "React"]
    thumb: "../assets/images/gradient-background-3840x2160-10786.jpg",
      base: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6759.jpg",
    heroImage: "../assets/images/gradient-background-3840x2160-10786.jpg",
    description: "A self-initiated exploration into abstract gradient systems used as a foundation for a generative frontend experiment.",
    frames: [
      { type: "image", src: "../assets/images/gradient-background-3840x2160-10786.jpg" }
    ],
    halfFrames: [
      { type: "image", src: "../assets/images/gradient-background-3840x2160-10786.jpg" }
    ],
    summary: "This project reinforced how much accessibility and performance constraints can actually sharpen creative decisions rather than limit them — the strongest visual solutions came directly from working within Microsoft's cross-platform technical requirements, not despite them.",
    featured: false
  },
  {
    id: "project-delta",
    slug: "project-delta",
    title: "Project Delta",
    year: "2022",
    behanceUrl: "https://www.behance.net/darshandaiv",
    projectType: "Industry",
    client: "Delta Co.",
    tags: ["Branding", "Packaging"],   // was: ["Brand", "Strategy"]
    thumb: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6762.jpg",
      base: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6759.jpg",
    heroImage: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6762.jpg",
    description: "Full brand strategy and visual identity rollout for a growth-stage company entering a competitive category.",
    frames: [
      { type: "image", src: "../assets/images/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-3840x2160-6762.jpg" }
    ],
    summary: "This project reinforced how much accessibility and performance constraints can actually sharpen creative decisions rather than limit them — the strongest visual solutions came directly from working within Microsoft's cross-platform technical requirements, not despite them.",
    featured: true
  }

  /* ================================================================
     👇 HOW TO ADD A NEW PROJECT 👇
     1. Copy the entire block below (from the { to the matching },
        including the comma before it if this isn't the last item).
     2. Paste it above this comment, as a new array item.
     3. Fill in every field — delete the placeholder text.
     4. Set featured: true if you want it on the homepage Work
        section, or false to keep it only on projects.html.
     5. Create a matching file: projects/case-<your-slug>.html
        (copy an existing case-*.html file and change only its
        data-project-slug attribute on <body> to match).
     6. Save. Refresh index.html / projects.html — it appears
        automatically. Nothing else needs to be touched.

  {
    id: "your-unique-id",                  // never change after creation
    slug: "your-url-slug",                 // lowercase, numbers, hyphens only
    title: "Project Title Here",
    year: "2025",
    behanceUrl: "https://www.behance.net/yourusername",
    projectType: "Personal",               // "Academic" | "Industry" | "Personal"
    client: "Client Name or Self-Initiated",
    tags: ["Tag One", "Tag Two"],
    thumb: "assets/images/your-thumbnail.jpg",
    heroImage: "assets/images/your-hero-image.jpg",
    description: "One to three sentence summary of the project.",
    frames: [
      { type: "image", src: "assets/images/frame-1.jpg"},
      { type: "video", src: "Assets/Videos/frame-2.mp4"}
    ],
    featured: false                        // true = show on homepage too
  },

  ================================================================ */
];

window.PROJECTS = PROJECTS;

/* ================================================================
   VALIDATION HELPERS
   These run automatically whenever this file loads, and print
   warnings to the browser console (F12 → Console tab) if something
   in the data above looks broken. They don't stop the site from
   working — just help you catch mistakes early.
================================================================ */
(function validateProjects() {
    const seenSlugs = {};
    const validTypes = ["Academic", "Industry", "Personal"];
    const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/; // lowercase, numbers, hyphens only

    PROJECTS.forEach(p => {
        /* Check: missing slug */
        if (!p.slug) {
            console.warn(`[CMS WARNING] Project "${p.title || p.id}" is missing a slug. Its case study link will be broken.`);
            return;
        }

        /* Check: duplicate slugs — would cause two projects to link
           to the exact same case study file */
        if (seenSlugs[p.slug]) {
            console.warn(`[CMS WARNING] Duplicate slug "${p.slug}" found on "${seenSlugs[p.slug]}" and "${p.title}". Their case study links will collide — rename one.`);
        }
        seenSlugs[p.slug] = p.title;

        /* Check: slug format — catches spaces, uppercase, symbols
           that would break the URL/filename */
        if (!slugPattern.test(p.slug)) {
            console.warn(`[CMS WARNING] Slug "${p.slug}" on "${p.title}" contains invalid characters. Use only lowercase letters, numbers, and hyphens (e.g. "my-project-2024").`);
        }

        /* Check: projectType is one of the 3 expected values —
           catches typos like "personal" (lowercase) or "Freelance" */
        if (!validTypes.includes(p.projectType)) {
            console.warn(`[CMS WARNING] "${p.title}" has projectType "${p.projectType}" — expected one of: ${validTypes.join(", ")}.`);
        }

        /* Check: featured field exists and is a boolean, not a
           string like "true" (common copy-paste mistake) */
        if (typeof p.featured !== "boolean") {
            console.warn(`[CMS WARNING] "${p.title}" has featured: ${JSON.stringify(p.featured)} — should be true or false (no quotes).`);
        }

        /* Check: at least one frame exists — a case study with zero
           frames will render an empty section, which usually means
           something was forgotten */
        if (!p.frames || p.frames.length === 0) {
            console.warn(`[CMS WARNING] "${p.title}" has no frames[] — its case study page will be missing project media.`);
        }
    });
})();

(function auditTags() {
    const tagMap = {};
    PROJECTS.forEach(p => {
        p.tags.forEach(tag => {
            if (!tagMap[tag]) tagMap[tag] = [];
            tagMap[tag].push(p.title);
        });
    });
    console.log("[CMS TAG AUDIT]", tagMap);
})();
