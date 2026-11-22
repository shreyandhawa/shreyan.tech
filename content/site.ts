// Site copy, word for word from the content document.

export type Row = { label: string; value: string[] };

const headline =
  "Shreyan is a computer science undergraduate, minoring in biology and mathematics, focused on computational biology.";

export const site = {
  name: "Shreyan Dhawa",
  url: "https://shreyan.tech",
  description: `${headline} Author of lumenCell, single-cell trajectory inference with T-cell clonotype validation.`,

  home: {
    headline,
    intro:
      "Methods that reconstruct which cells came from which ancestor, and how they changed over time, are easy to get wrong and hard to check. I build the tools, then I try to break them.",
    currently: "lumenCell v0.2.0, released on PyPI. Looking for summer 2027 research in computational immuno-oncology.",
  },

  about: [
    "I'm a computer science undergraduate at the University of Southern Mississippi, minoring in biology and mathematics. I work on single-cell biology, on the gap between a result and whether you should believe it.",
    "I build with AI assistance and say so plainly. What I own is the part that decides whether a result is real: the specification, the evaluation design, the thresholds written before any score, and the checks allowed to fail. In lumenCell some of them fail, and the app says so.",
  ],

  research: [
    {
      label: "lumenCell",
      value: [
        "single-cell trajectory inference with T-cell clonotype validation. Independent, April 2026 – present. Benchmarked three published methods against synthetic trees and four public datasets under pre-registered thresholds; case studies on published CAR-T and T-cell exhaustion data. Released as v0.2.0.",
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
        "Probability & Statistics · Linear Algebra · Differential Equations · Data Structures · Software Engineering · Programming Languages · Database Systems · Operating Systems · Computer Networks · Secure Software Development · Genetics and Cell Biology (spring 2027)",
      ],
    },
  ] satisfies Row[],

  contact: {
    email: "shreyan.dhawa@gmail.com",
    github: { href: "https://github.com/shreyandhawa", label: "github.com/shreyandhawa" },
    linkedin: { href: "https://www.linkedin.com/in/shreyan-dhawa/", label: "linkedin.com/in/shreyan-dhawa" },
    availability: "Open to summer 2027 research placements and internships",
  },

  footerNote: "There is another side to this site. Try the flower.",
};
