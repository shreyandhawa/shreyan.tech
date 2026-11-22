// Site copy, word for word from the content document.

export type Row = { label: string; value: string[] };

const headline = "Shreyan is a computer science undergraduate working where code meets biology.";

export const site = {
  name: "Shreyan Dhawa",
  url: "https://shreyan.tech",
  description: `${headline} Author of lumenCell, single-cell trajectory inference with T-cell clonotype validation.`,

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
