// Project copy, word for word from the content document. Inline `backticks` render as code.

/** Width of the smaller copy (`<src>-840.avif`/`.webp`) that `npm run media` writes beside every wider image. */
export const SMALL = 840;

export type Media = {
  /** Path under public/ without extension; served as .avif with a .webp fallback. */
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type Section = {
  id: string;
  title: string;
  paragraphs: string[];
  commands?: string[];
  figures?: Media[];
};

export type Project = {
  slug: string;
  name: string;
  /** "One line": lead paragraph on the project page and the lily panel. */
  oneLine: string;
  /** Row in the main work list: card meta and description on Home. */
  listing: { what: string; status: string; year: string };
  /** Hidden on the page while undefined; likewise the Stack row while `stack` is empty. */
  role?: string;
  timeline: string;
  status: string;
  where?: string;
  stack: string[];
  code?: string;
  sections: Section[];
  /** Card media on Home; undefined renders the "Interface in progress" panel. */
  card?: Media;
  /** Hero media on the project page; undefined renders the "Interface in progress" panel. */
  hero?: Media;
};

const img = (src: string, width: number, height: number, alt: string, caption?: string): Media => ({
  src: `/media/${src}`,
  width,
  height,
  alt,
  caption,
});

const media = {
  lumencell: {
    playback: img(
      "lumencell/explorer-playback",
      1440,
      900,
      "lumenCell explorer in dark mode playing back pseudotime on a UMAP of 21,762 cells from Sheih 2020 patient NHL-6. The inferred tree is drawn over the cells, gene trends run underneath, and the Evidence panel reports that clones do not back these lineages.",
    ),
    light: img(
      "lumencell/explorer-light",
      1440,
      900,
      "lumenCell explorer in light mode showing a 3-D diffusion-space view of the cells coloured by pseudotime, with one lineage focused and the Evidence panel listing checks C1 to C5.",
    ),
    pickRoot: img(
      "lumencell/explorer-pick-a-root",
      1440,
      900,
      "The Pick a root step: a UMAP coloured by Leiden cluster with the root cell marked at timepoint = IP, and a Run PAGA + DPT button labelled Experimental.",
    ),
    evidence: img(
      "lumencell/explorer-3d-evidence",
      1440,
      900,
      "3-D view in the first three diffusion components with the focused lineage in pink, beside the Evidence panel: connectivity passes, clonal support fails, and clone agreement is scored against three null models.",
    ),
  },
  arohexis: {
    home: img(
      "arohexis/home-desktop",
      1440,
      900,
      "Arohexis home screen in demo mode: a glowing side view of a brain drawn from coloured lines, one colour per area of life, beside a Light a line button and a count of 10 starts this week.",
    ),
    insights: img(
      "arohexis/insights-desktop",
      1440,
      900,
      "Arohexis Insights page with a bar chart of starts per week over 11 weeks, a strip showing most starts happen around 9 AM, and a breakdown of feelings.",
    ),
    started: img(
      "arohexis/started-desktop",
      1440,
      900,
      "The screen after starting a task: the word Started, the line That's the hard part, a two-minute timer and a choice of which area the start belongs to.",
    ),
    phone: img(
      "arohexis/home-phone",
      750,
      1624,
      "Arohexis home screen on a phone: the line brain above category filters, a Check in prompt and the Light a line button.",
    ),
  },
  nosolear: {
    plan: img(
      "nosolear/plan-sketch",
      1728,
      1199,
      "Diagram of the speaking coach plan: a 15-minute daily loop of speak, analyze, feedback, drill and log, the three skills it trains, the services under the hood, and the build order from baseline to progress.",
      "App plan",
    ),
  },
  trustory: {
    concept: img(
      "trustory/concept",
      1728,
      1080,
      "Diagram of what TruStory does: a statement in document A is linked to a contradicting statement in document B and flagged as a conflict; a second pair, matched without confidence, is linked by a dashed line and left unresolved.",
      "Concept",
    ),
  },
};

export const projects: Project[] = [
  {
    slug: "lumencell",
    card: media.lumencell.light,
    hero: media.lumencell.playback,
    name: "lumenCell",
    oneLine:
      "Interactive explorer for pseudotime and lineage trajectories in single-cell RNA-seq data.",
    listing: {
      what: "Single-cell trajectory inference with clonotype validation",
      status: "Shipped, v0.2.0 on PyPI",
      year: "2026 – present",
    },
    role: "Author.",
    timeline: "April 2026 – present",
    status: "Shipped, v0.2.0 on PyPI.",
    stack: ["Python", "scanpy", "PAGA + DPT", "Palantir", "scFates", "FastAPI", "React", "pytest"],
    code: "https://github.com/shreyandhawa/lumenCell_V2",
    sections: [
      {
        id: "overview",
        title: "Overview",
        paragraphs: [
          "Cells don't come with timestamps, so their order has to be inferred. The current version reaches Spearman 0.95 on public pancreas data. My first attempt scored about −0.2 against known ground truth, close to reversed, so I rebuilt the engine to run inference in PCA and diffusion space instead of on the 2-D picture. Every threshold was written into `benchmarks/thresholds.toml` before any score was computed. Methods that miss a gate are marked experimental in the app, and some of mine are.",
        ],
        figures: [media.lumencell.pickRoot],
      },
      {
        id: "validation",
        title: "Validation",
        paragraphs: [
          "T cells that share a receptor sequence descend from a common ancestor, so a correct trajectory should keep each clone together. That checks the answer with evidence the method never saw. I score the agreement against three null models, and exclude receptor genes from feature selection so the model can't recognise clones from expression. Case studies: published CD19 CAR-T data (Sheih et al. 2020) and T-cell exhaustion data (Daniel et al. 2022).",
        ],
        figures: [media.lumencell.evidence],
      },
      {
        id: "try-it",
        title: "Try it",
        paragraphs: [],
        commands: ["pip install lumencell", "lumencell demo"],
      },
    ],
  },
  {
    slug: "arohexis",
    card: media.arohexis.home,
    // replay.webm was tried as the hero: it records a phone-width column, so it reads poorly at 864px.
    hero: media.arohexis.home,
    name: "Arohexis",
    oneLine: "Installable app for chronic procrastination, with no account and no network requests.",
    listing: {
      what: "Offline-first app for chronic procrastination",
      status: "Shipped, v2.3",
      year: "2026",
    },
    role: "Sole author",
    timeline: "November 2026",
    status: "Shipped, v2.3",
    stack: [
      "React 19",
      "TypeScript",
      "IndexedDB via Dexie",
      "vite-plugin-pwa",
      "valibot",
      "date-fns",
      "Playwright",
    ],
    code: "https://github.com/shreyandhawa/arohexis",
    sections: [
      {
        id: "overview",
        title: "Overview",
        paragraphs: [
          "Everything stays on the device: no account, no sign-in, and no network requests, enforced by a Content Security Policy that blocks them. Each feature is grounded in cited psychology research.",
          "623 tests across 73 files, including automated accessibility checks. Shipped v1.0, then v2.1 to v2.3 after a live walkthrough turned up real bugs.",
        ],
        figures: [media.arohexis.insights, media.arohexis.started, media.arohexis.phone],
      },
    ],
  },
  {
    slug: "nosolear",
    card: media.nosolear.plan,
    hero: media.nosolear.plan,
    name: "Nosolear",
    oneLine:
      "Local-first speaking coach that scores pronunciation and plans the next day's practice.",
    listing: {
      what: "Local-first English speaking coach",
      status: "In progress",
      year: "2026 – present",
    },
    role: "Sole author",
    timeline: "November 2026 – present",
    status: "In progress",
    stack: [
      "FastAPI",
      "SQLAlchemy",
      "React",
      "TypeScript",
      "Hugging Face Transformers",
      "Azure Speech",
      "wav2vec2",
      "faster-whisper",
    ],
    code: "https://github.com/shreyandhawa/nosolear",
    sections: [
      {
        id: "overview",
        title: "Overview",
        paragraphs: [
          "Scores pronunciation, keeps a per-speaker error profile, and uses it to choose the next day's practice set rather than running a fixed curriculum. I wrote adapters for on-device speech models as offline alternatives to cloud transcription, so it degrades to fully local instead of breaking. Test suite runs in CI on macOS and Linux.",
        ],
      },
    ],
  },
  {
    slug: "trustory",
    card: media.trustory.concept,
    hero: media.trustory.concept,
    name: "TruStory",
    oneLine:
      "Compares statements across documents and flags conflicting claims, each tied to its source.",
    listing: {
      what: "Statement comparison with source citations",
      status: "In progress",
      year: "Fall 2026 – present",
    },
    role: "Review interface, in a team of seven. The ingestion and comparison backend is my teammates' work.",
    timeline: "Fall 2026 – present",
    status: "In progress",
    where:
      "Mississippi AI Innovation Hub, a collaboration between the University of Southern Mississippi and Himal-Tech",
    stack: ["React", "TypeScript (my part)", "Python and SQLite backend (team)"],
    sections: [
      {
        id: "overview",
        title: "Overview",
        paragraphs: [
          "The system takes statements from text, PDFs, transcripts and other documents, stores versioned evidence, and flags claims that conflict, each flag carrying the exact source text it came from.",
          "I'm building the review interface: the side-by-side view for comparing claims, and the flow for matches the system isn't confident about. An uncertain match stays visibly unresolved rather than being quietly guessed.",
        ],
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The project after this one; order wraps around. */
export function nextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
