// Site copy, word for word from the content document.

export type Row = { label: string; value: string[]; href?: string };

const headline = "Hi! I'm Shreyan Dhawa. I build and benchmark computational tools for single-cell biology, and report when they fail.";

export const site = {
  name: "Shreyan Dhawa",
  url: "https://shreyandhawa.github.io",
  description: `Computer science undergraduate building and benchmarking computational tools for single-cell biology. Author of lumenCell, single-cell trajectory inference with T-cell clonotype validation.`,

  home: {
    headline,
    currently: "Junior at USM, open to research opportunities.",
  },

  about: [
    "I'm a compsci undergrad at USM, currently a junior, studying computational tools to solve problems in biology.",
    "I'm a student, but I have solid foundations in bioinformatics, computer science and maths. I enjoy working at the intersection of these fields to help out biology however much I can.",
    "Outside of this, I love building hobby projects that put my creative brain to the test using AI tools, and I enjoy playing chess.",
    "Open to research and computational lab work. Reach out if you have something fun in mind that intersects with my profile.",
  ],

  research: [
    {
      label: "Clonal trajectory research",
      href: "https://github.com/shreyandhawa/clonal-trajectory-research",
      value: [
        "real-data benchmarks, calibration and case studies behind the trust claims of lumenCell, my single-cell trajectory tool. Independent, September 2026 – present. Three published methods (PAGA + DPT, Palantir, scFates) scored on synthetic trees and four public datasets against gates declared before each analysis, with lineages checked against T-cell receptor clones. Case study on CAR-T data (Sheih et al. 2020): none of 12 per-patient runs was supported as a branching tree, reported as a negative result.",
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
        "Data Structures · Linear Algebra · Probability & Statistics · Differential Equations · Database Systems",
      ],
    },
  ] satisfies Row[],

  contact: {
    email: "shreyan.dhawa@gmail.com",
    github: { href: "https://github.com/shreyandhawa", label: "github.com/shreyandhawa" },
    linkedin: { href: "https://www.linkedin.com/in/shreyan-dhawa/", label: "linkedin.com/in/shreyan-dhawa" },
    availability: "Open to summer 2027 research placements and internships",
  },
};
