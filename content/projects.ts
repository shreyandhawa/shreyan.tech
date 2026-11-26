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
  /** A looping clip (path under public/, with extension) that plays on top of this still, which is its poster. */
  video?: string;
};

export type Section = {
  id: string;
  title: string;
  paragraphs: string[];
  commands?: string[];
  figures?: Media[];
  /** Opens the figures with the field, which recolours along pseudotime as it scrolls up the screen (components/field/Scrub.tsx). */
  scrub?: boolean;
};

export type Project = {
  slug: string;
  name: string;
  /** "One line": lead paragraph on the project page. */
  oneLine: string;
  /** Row in the main project list: card meta and description on Home. */
  listing: { what: string; status: string; year: string };
  /** Hidden on the page while undefined; likewise the Stack row while `stack` is empty. */
  role?: string;
  timeline: string;
  status: string;
  where?: string;
  /** Where it runs for real; hidden while undefined (projects that only run locally). */
  deployed?: { label: string; href: string };
  stack: string[];
  code?: string;
  /** Extra links (results, plans) shown under the Code link. */
  links?: { label: string; href: string }[];
  /** Two to four figures shown under the facts. Only numbers already stated in the copy. */
  stats?: { value: string; label: string }[];
  /** BibTeX entry the Cite button copies. */
  cite?: string;
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

/** Home card and project hero: `<name>/card.mp4` with its poster `<name>/card-poster`. Width and height are the clip's. */
const clip = (name: string, width: number, height: number, alt: string): Media => ({
  ...img(`${name}/card-poster`, width, height, alt),
  video: `/media/${name}/card.mp4`,
});

const media = {
  lumencell: {
    card: clip(
      "lumencell",
      1280,
      800,
      "Preview of lumenCell: the app's four steps (Prepare, Choose root, Run method, Inspect) beside a cloud of cells branching from a marked root cell, coloured by pseudotime.",
    ),
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
    card: clip(
      "arohexis",
      1280,
      800,
      "Preview of Arohexis: a glowing side view of a brain drawn from coloured lines, beside the name and the line Trains the moment of starting.",
    ),
    home: img(
      "arohexis/home-desktop",
      1440,
      900,
      "Arohexis home screen in demo mode: a glowing side view of a brain drawn from coloured lines, one colour per area of life, beside a Check in prompt, a Light a line button and links to Plans, Insights, Replay and Settings, with a count of 98 starts and 28 lines.",
    ),
    insights: img(
      "arohexis/insights-desktop",
      1440,
      900,
      "Arohexis Insights page in demo mode: a line chart of how automatic starting feels over 10 weekly check-ins, rising to 4.8 out of 7, above a bar chart of starts per week with 98 starts over 11 weeks.",
    ),
    started: img(
      "arohexis/started-desktop",
      1440,
      900,
      "The screen after starting a task: the word Started, the line That's the hard part, a two-minute timer over drifting lines, and a choice of which area the start belongs to, with Done for now and Undo buttons.",
    ),
    phone: img(
      "arohexis/home-phone",
      750,
      1624,
      "Arohexis home screen on a phone in demo mode: the brain of lines above the category filters, a Check in prompt, the Light a line button and links to Plans, Insights, Replay and Settings.",
    ),
  },
  nosolear: {
    card: clip(
      "nosolear",
      1280,
      720,
      "Preview of Nosolear: the sound /θ/ marked as not /t/, a T-for-TH error, beside a panel for what the app trains: sounds, pronunciation, stress and rhythm.",
    ),
    plan: img(
      "nosolear/plan-sketch",
      1728,
      1199,
      "Diagram of the speaking coach plan: a 15-minute daily loop of speak, analyze, feedback, drill and log, the three skills it trains, the services under the hood, and the build order from baseline to progress.",
      "App plan",
    ),
  },
  trustory: {
    comparison: img(
      "trustory/comparison",
      1600,
      973,
      "TruStory Statement comparison page with a potential conflict on an attribute: two accounts side by side, witness-b saying the sedan was blue and witness-a saying it was red, each quote linked to its source version and character span.",
    ),
    unresolved: img(
      "trustory/unresolved",
      1600,
      973,
      "TruStory Statement comparison page showing an unresolved finding: Another Alex described a blue sedan and Alex described a red sedan are not compared, because the page says to review provisional identity links first; retrieval does not establish alignment.",
    ),
    graph: img(
      "trustory/graph",
      1600,
      1000,
      "TruStory evidence graph for a case with two statements: a canvas linking the case, its two witness statements, two quoted clues, unreviewed event and object references, and one potential conflict on event order, with a filter panel listing node types.",
    ),
    card: clip(
      "trustory",
      1280,
      720,
      "Preview of TruStory: two statements from different sources, I left the house at nine and It was closer to ten, set side by side to compare.",
    ),
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
    card: media.lumencell.card,
    hero: media.lumencell.card,
    name: "lumenCell",
    oneLine:
      "Interactive explorer for pseudotime and lineage trajectories in single-cell RNA-seq data.",
    listing: {
      what: "Single-cell trajectory inference with clonotype validation",
      status: "Shipped on PyPI",
      year: "April 2026 – present",
    },
    role: "Author.",
    timeline: "April 2026 – present",
    status: "Shipped on PyPI.",
    deployed: { label: "PyPI, pip install lumencell", href: "https://pypi.org/project/lumencell/" },
    stack: ["Python", "scanpy", "PAGA + DPT", "Palantir", "scFates", "FastAPI", "React", "pytest"],
    code: "https://github.com/shreyandhawa/lumenCell_V2",
    links: [
      { label: "Results: github.com/shreyandhawa/clonal-trajectory-research", href: "https://github.com/shreyandhawa/clonal-trajectory-research" },
      { label: "Analysis plan, committed before any results: PR #51", href: "https://github.com/shreyandhawa/lumenCell_V2/pull/51" },
    ],
    // From the copy: the explorer screenshot's cell count, the research row's methods and datasets, the Overview's Spearman range.
    stats: [
      { value: "21,762", label: "Cells, patient NHL-6" },
      { value: "3", label: "Published methods" },
      { value: "4", label: "Public datasets" },
      { value: "0.67–0.95", label: "Spearman vs. known stages" },
    ],
    cite: `@software{dhawa_lumencell_2026,
  author = {Dhawa, Shreyan},
  title = {{lumenCell}: Interactive explorer for pseudotime and lineage trajectories in single-cell {RNA-seq} data},
  year = {2026},
  url = {https://github.com/shreyandhawa/lumenCell_V2},
}`,
    sections: [
      {
        id: "overview",
        title: "Overview",
        paragraphs: [
          "Cells don't come with timestamps, so their order has to be inferred. Across the three published methods it runs, cell order tracked known stages with Spearman 0.67–0.95. My first attempt scored about −0.2 against known ground truth, close to reversed, so I rebuilt the engine to run inference in PCA and diffusion space instead of on the 2-D picture. The pass/fail thresholds in `benchmarks/thresholds.toml` were set in advance, and the analysis plan was committed publicly before any real data was scored. Methods that miss a gate are marked experimental in the app, and some of mine are.",
        ],
        figures: [media.lumencell.playback, media.lumencell.pickRoot],
      },
      {
        id: "validation",
        title: "Validation",
        paragraphs: [
          "T cells that share a receptor sequence descend from a common ancestor, so a correct trajectory should keep each clone together. That checks the answer with evidence the method never saw. I score the agreement against three null models, and exclude receptor genes from feature selection so the model can't recognise clones from expression. Case study: published CD19 CAR-T data (Sheih et al. 2020), where none of 12 per-patient runs was supported as a branching tree, reported as a negative result. T-cell exhaustion data (Daniel et al. 2022) is in the benchmark, but its clone check was not assessable.",
        ],
        scrub: true,
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
    slug: "trustory",
    card: media.trustory.card,
    hero: media.trustory.card,
    name: "TruStory",
    oneLine:
      "Compares statements across documents and flags conflicting claims, each tied to its source.",
    listing: {
      what: "Statement comparison with source citations",
      status: "In progress",
      year: "August 2026 – present",
    },
    role: "Student team member (frontend), one of six on the Himal-Tech team",
    timeline: "August 2026 – present",
    status: "In progress",
    where:
      "A project for the Mississippi AI Innovation Hub, a collaboration between the University of Southern Mississippi and Himal-Tech",
    stack: ["React", "TypeScript", "Python", "SQLite"],
    sections: [
      {
        id: "overview",
        title: "Overview",
        paragraphs: [
          "The system takes statements from text, PDFs, transcripts and other documents, stores versioned evidence, and flags claims that conflict, each flag carrying the exact source text it came from.",
          "I'm one of six on the Himal-Tech team building it for the Mississippi AI Innovation Hub. I took part in planning the backend with the team and was assigned the frontend. My merged work so far is the shared stylesheet that brings every server-rendered page in line with the graph workspace, meets WCAG AA contrast and keeps wide tables readable on phones. By design, an uncertain match stays visibly unresolved rather than being quietly guessed.",
          "The screens below come from the app's fictional demo cases, not real evidence.",
        ],
        figures: [media.trustory.concept, media.trustory.comparison, media.trustory.unresolved, media.trustory.graph],
      },
    ],
  },
  {
    slug: "arohexis",
    card: media.arohexis.card,
    hero: media.arohexis.card,
    name: "Arohexis",
    oneLine: "Installable, offline-first app for chronic procrastination, with no account and data that stays on the device.",
    listing: {
      what: "Offline-first app for chronic procrastination",
      status: "Shipped, v2.3",
      year: "September – November 2026",
    },
    role: "Sole author",
    timeline: "September 2026 – November 2026",
    status: "Shipped, v2.3",
    deployed: { label: "Cloudflare Workers, live demo", href: "https://arohexis.arohexis.workers.dev/welcome" },
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
          "Everything stays on the device: no account, no sign-in, and a Content Security Policy that blocks third-party connections. Each feature is grounded in cited psychology research.",
          "Shipped v1.0, then v2.1 to v2.3 after a live walkthrough turned up real bugs.",
        ],
        figures: [media.arohexis.home, media.arohexis.insights, media.arohexis.started, media.arohexis.phone],
      },
    ],
  },
  {
    slug: "nosolear",
    card: media.nosolear.card,
    hero: media.nosolear.card,
    name: "Nosolear",
    oneLine:
      "Local-first speaking coach that scores pronunciation and plans the next day's practice.",
    listing: {
      what: "Local-first English speaking coach",
      status: "In progress",
      year: "November 2026 – present",
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
          "Scores pronunciation, keeps a per-speaker error profile, and uses it to choose the next day's practice set rather than running a fixed curriculum. I wrote adapters for on-device speech models (wav2vec2, Whisper) as offline alternatives to cloud transcription. Test suite runs in CI on macOS and Linux.",
        ],
        figures: [media.nosolear.plan],
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

/** The project before this one; order wraps around. */
export function prevProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i - 1 + projects.length) % projects.length];
}
