// Site copy, word for word from the content document.

export type Row = { label: string; value: string[] };

export const site = {
  name: "Shreyan Dhawa",
  url: "https://shreyan.tech",
  description:
    "Shreyan is a computer science undergraduate who builds open-source tools for single-cell biology — and tests whether their results actually hold up.",

  home: {
    headline:
      "Shreyan is a computer science undergraduate who builds open-source tools for single-cell biology — and tests whether their results actually hold up.",
    intro:
      "Cancer immunotherapy works by getting T cells to recognise a tumour. To study that, you need to know which cells came from which ancestor and how they changed over time — and the methods that reconstruct this are easy to get wrong and hard to check. I build the tools, and then I try to break them.",
    currently:
      "lumenCell v0.2.0, released on PyPI. Studying statistics, differential equations and software engineering at the University of Southern Mississippi. Looking for summer 2027 research in computational immuno-oncology.",
    previously:
      "Shipped Arohexis to v2.3. Built a clinical-record checker on CAR-T case data, where a frontier language model beat my own pipeline and I published that result instead of burying it. Worked food service at Aramark, 300–500 customers a shift, while carrying a 4.00.",
  },

  about: [
    "I'm a computer science undergraduate at the University of Southern Mississippi, minoring in biology and mathematics. I work on single-cell biology, and specifically on the gap between a result and whether you should believe it.",
    "That gap is where my current project lives. Trajectory inference tells you the order cells passed through — but the method can't check its own answer, so I score it against T-cell receptor clonotypes, which carry ancestry information the inference never touches. Two cells sharing a receptor came from the same ancestor, whether or not the model noticed.",
    "I build with AI assistance and say so plainly. What I own is the part that decides whether a result is real: the evaluation design, the thresholds written down before any score, and the checks that are allowed to fail. In lumenCell some of them do fail, and the app says so.",
  ],

  research: [
    {
      label: "lumenCell",
      value: [
        "single-cell trajectory inference with T-cell clonotype validation. Independent, April 2026 – present. Benchmarked three published methods against synthetic trees and four public datasets under pre-registered thresholds; case studies on published CAR-T and T-cell exhaustion data. Released as v0.2.0.",
      ],
    },
    {
      label: "Interests",
      value: [
        "computational immuno-oncology, single-cell immune repertoires, trajectory inference, and honest evaluation of biological machine learning.",
      ],
    },
    {
      label: "Looking for",
      value: ["a summer 2027 research placement. Applying to PhD programmes in December 2027."],
    },
    {
      label: "Stack I actually work in",
      value: [
        "Python, TypeScript, scanpy, AnnData, NumPy, SciPy, pandas, FastAPI, SQLAlchemy, React, pytest, hypothesis, mypy, Git, GitHub Actions.",
      ],
    },
    {
      label: "Learning now",
      value: [
        "neural network fundamentals from first principles, protein language models, TCR repertoire analysis.",
      ],
    },
  ] satisfies Row[],

  education: [
    {
      label: "B.S. Computer Science",
      value: [
        "minors in Biology and Mathematics",
        "University of Southern Mississippi, Hattiesburg — expected May 2028 — GPA 4.00/4.00",
      ],
    },
    {
      label: "Coursework",
      value: [
        "Probability & Statistics · Linear Algebra · Differential Equations · Data Structures · Software Engineering · Programming Languages · Database Systems · Operating Systems · Computer Networks · Secure Software Development",
      ],
    },
    { label: "Spring 2027", value: ["Genetics and Cell Biology in spring 2027."] },
  ] satisfies Row[],

  contact: {
    email: "shreyan.dhawa@gmail.com",
    github: { href: "https://github.com/shreyandhawa", label: "github.com/shreyandhawa" },
    city: "Hattiesburg, Mississippi",
    availability: "Open to summer 2027 research placements and internships",
  },

  footerNote: "There is another side to this site. Try the flower.",
};
