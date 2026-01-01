"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    // uncomment line 22 and comment line 23 if you DONT want the overflow container and want to have it change on the entire page scroll
    // target: ref
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useEffect(() => {
    setMounted(true);
    // watch for theme changes (document class or system preference)
    if (typeof window !== 'undefined') {
      const check = () => {
        try {
          const stored = localStorage.getItem('theme');
          if (stored === 'dark') {
            setIsDark(true);
            return;
          }
          if (stored === 'light') {
            setIsDark(false);
            return;
          }
          const byClass = document.documentElement.classList.contains('dark');
          const byPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDark(!!(byClass || byPref));
        } catch (e) {}
      };
      check();
      const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      const mqlHandler = () => check();
      if (mql) {
        if (mql.addEventListener) mql.addEventListener('change', mqlHandler);
        else if (mql.addListener) mql.addListener(mqlHandler as any);
      }
      const mo = new MutationObserver(() => check());
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => {
        if (mql) {
          if (mql.removeEventListener) mql.removeEventListener('change', mqlHandler);
          else if (mql.removeListener) mql.removeListener(mqlHandler as any);
        }
        mo.disconnect();
      };
    }
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = isDark
    ? ["#0f172a", "#000000", "#171717"]
    : ["#f8fafc", "#ffffff", "#f1f5f9"];
  const linearGradients = isDark
    ? [
        "linear-gradient(to bottom right, #06b6d4, #10b981)",
        "linear-gradient(to bottom right, #ec4899, #6366f1)",
        "linear-gradient(to bottom right, #f97316, #eab308)",
      ]
    : [
        "linear-gradient(to bottom right, #60a5fa, #34d399)",
        "linear-gradient(to bottom right, #f472b6, #a78bfa)",
        "linear-gradient(to bottom right, #fb923c, #facc15)",
      ];

  const backgroundGradient = mounted
    ? linearGradients[activeCard % linearGradients.length]
    : linearGradients[0];

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative flex h-[30rem] justify-center space-x-10 overflow-y-auto rounded-md p-10"
      ref={ref}
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className={cn("text-2xl font-bold", isDark ? "text-slate-100" : "text-slate-900")}
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className={cn("text-kg mt-10 max-w-sm whitespace-pre-line", isDark ? "text-slate-300" : "text-slate-600")}
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        style={{ background: backgroundGradient }}
        className={cn(
          "sticky top-10 hidden h-60 w-80 overflow-hidden rounded-md lg:block",
          isDark ? "bg-neutral-800" : "bg-white",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
