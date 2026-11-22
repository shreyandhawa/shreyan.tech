// Project copy, word for word from the content document. Inline `backticks` render as code.

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
  role: string;
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
  resauce: {
    caseEvidence: img(
      "resauce/case-evidence",
      1728,
      1080,
      "ReSauce case view for synthetic case SYN-0015: a nursing note with the quoted ICE score highlighted, beside the research record, a symptom timeline from Day 0 to Day +28 and an open onset-date finding.",
    ),
    inspector: img(
      "resauce/inspector",
      1728,
      1080,
      "ReSauce pipeline page with a case inspector open on SYN-0015, listing an onset date mismatch and a maximum grade mismatch, each with the record value and the documented value.",
    ),
    reviewQueue: img(
      "resauce/review-queue",
      1728,
      1080,
      "ReSauce review queue: a list of discrepancy alerts on the left, and on the right a finding that the recorded grade is not supported by the documented evidence, with quoted source text and confirm, dismiss and needs clinician buttons.",
    ),
    results: img(
      "resauce/results",
      1728,
      1584,
      "ReSauce results page comparing precision, recall and exact agreement for ReSauce, Baseline A and Baseline B on the dev split and the held-out split, with a note that the data is synthetic and not clinical validation.",
    ),
    audit: img(
      "resauce/audit-trail",
      1728,
      1080,
      "ReSauce audit trail: an append-only table of verification runs for each synthetic case, with time, case, result and the frozen pipeline version.",
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
    role: "Author. Built with AI assistance — I wrote the specification, the evaluation design and the thresholds.",
    timeline: "April 2026 – present",
    status:
      "Shipped — v0.2.0 on PyPI. Individual methods stay labelled experimental until they pass their gates.",
    stack: [
      "Python",
      "scanpy",
      "AnnData",
      "NumPy",
      "SciPy",
      "pandas",
      "PAGA + DPT",
      "Palantir",
      "scFates",
      "FastAPI",
      "pydantic",
      "typer",
      "React",
      "deck.gl",
      "pytest",
      "hypothesis",
      "mypy (strict)",
    ],
    code: "https://github.com/shreyandhawa/lumenCell_V2",
    sections: [
      {
        id: "overview",
        title: "Overview",
        paragraphs: [
          "Cells don't come with timestamps, so their order through a biological process has to be inferred — and my first attempt got it almost exactly backwards (Spearman ≈ −0.2 against known ground truth, meaning the ordering was close to reversed). I rebuilt the engine so inference runs in PCA and diffusion space rather than on the 2-D picture, and the current version reaches Spearman 0.95 on public pancreas data. Every threshold was written into `benchmarks/thresholds.toml` before any score was computed, so I couldn't move the goalposts after seeing the results; methods that miss a gate are marked experimental in the app, and some of mine are.",
        ],
        figures: [media.lumencell.pickRoot],
      },
      {
        id: "validation",
        title: "Validation",
        paragraphs: [
          "The part I care about most is the validation. T cells that share a receptor sequence descend from a common ancestor, so a correct trajectory should keep each clone together — which gives you a way to check the answer using evidence the method never saw. I score that agreement against three null models, and deliberately exclude receptor genes from feature selection so the model can't cheat by recognising clones from expression. It runs on published CD19 CAR-T data (Sheih et al. 2020) and T-cell exhaustion data (Daniel et al. 2022).",
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
          "Everything stays on the device. No account, no sign-in, and no network requests at all — not as a promise but as a Content Security Policy that blocks them, so the claim is enforced rather than stated. Each feature is grounded in cited psychology research instead of invented mechanics.",
          "623 tests across 73 files, including automated accessibility checks. Shipped v1.0, then kept going through v2.1, v2.2 and v2.3 after a live walkthrough turned up real bugs.",
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
    name: "TruStory",
    oneLine:
      "Compares statements across documents and flags conflicting claims, each tied to its source.",
    listing: {
      what: "Statement comparison with source citations",
      status: "In progress",
      year: "Fall 2026 – present",
    },
    role: "Review interface. Team of seven — the ingestion and comparison backend is my teammates' work.",
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
          "My first project built with other people rather than alone. The system takes statements from text, PDFs, transcripts and other documents, stores versioned evidence, and flags claims that conflict with each other — with every flag carrying the exact source text it came from.",
          "I'm responsible for the review interface: the views where a person compares claims side by side, and the flow for handling matches the system isn't confident about. The design principle I'm building to is that an uncertain match stays visibly unresolved rather than being quietly guessed, which means the interface has to make \"we don't know\" a first-class state rather than an error.",
        ],
      },
    ],
  },
  {
    slug: "resauce",
    card: media.resauce.caseEvidence,
    hero: media.resauce.caseEvidence,
    name: "ReSauce",
    oneLine: "Clinical records checked against source documents",
    listing: {
      what: "Clinical records checked against source documents",
      status: "Hackathon prototype, not continued",
      year: "2026",
    },
    role: "TODO: role",
    timeline: "2026",
    status: "Hackathon prototype, not continued",
    stack: ["TODO: stack"],
    code: "https://github.com/shreyandhawa/ReSauce",
    sections: [
      {
        id: "overview",
        title: "Overview",
        paragraphs: [
          "Checks clinical research records against the documents behind them, every finding traced to quoted text. I scored 72 synthetic ICANS cases against two baselines with the specification committed before any model was called, and the frontier-language-model baseline beat my own rules engine. The README explains why rather than hiding it. All data synthetic.",
        ],
        figures: [media.resauce.inspector, media.resauce.reviewQueue, media.resauce.results, media.resauce.audit],
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
