"use client";
import React from "react";
import { StickyScroll } from "../ui/sticky-scroll-reveal";

const content = [
  {
    title: "VISION",
    description: `The Zamboanga del Sur Provincial Government College (ZDSPGC) is envisaged to be the leading institution
of higher learning in the Province, continually pursuing excellence in the formation of globally–competitive local
professionals and technologists who are dedicated and committed to uplift the quality of life among all
Zambosurians.
`,
    content: (
      <div className="flex h-full w-full items-center justify-center text-white">
        <div className="flex h-full w-full items-center justify-center text-6xl bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
          VISION
        </div>
      </div>
    ),
  },
  {
    title: "MISSION",
    description:
      "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
    content: (
      <div className="flex h-full w-full items-center justify-center text-white">
        <div className="flex h-full w-full items-center justify-center text-6xl bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
          MISSION
        </div>
      </div>
    ),
  },
  {
    title: "GOALS",
    description: `
1. To help Zambosurians to obtain quality yet affordable academic degrees on relevant programs and field of
studies 
  
2. Collaborate with various stakeholders from both government and private sectors in pursuit of social and
economic community development

3. To produce technologically skilled graduates who can apply theories into real-life situation

4. To provide a conductive learning environment and enhances quality teaching-learning process. 

5. To develop learner’s critical thinking and decision-making abilities `,
    content: (
      <div className="flex h-full w-full items-center justify-center text-6xl bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
        GOALS
      </div>
    ),
  },
];
export function StickyScrollRevealDemo() {
  return (
    <div className="w-auto">
      <StickyScroll content={content} />
    </div>
  );
}
