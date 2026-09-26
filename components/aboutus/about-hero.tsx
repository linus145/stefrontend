import React from 'react';

interface AboutHeroProps {
  title?: string;
  description?: string;
}

export const AboutHero = ({ 
  title = "Architecting the future of Autonomous Hiring.", 
  description = "B2linq, developed by BillionWorld Pvt Limited, is the premier autonomous hiring platform built to orchestrate end-to-end recruitment without any human help. Our specialized AI agents autonomously source talent, screen candidates, conduct dynamic voice interviews, and make data-driven hiring decisions—delivering seamless, unbiased hiring without human intervention." 
}: AboutHeroProps) => {
  // Gracefully highlight key phrases if present in title
  const highlightPhrases = ["Autonomous Hiring.", "Autonomous Hiring", "Startup Ecosystems.", "Startup Ecosystems"];
  const matchedPhrase = highlightPhrases.find((phrase) => title.includes(phrase));

  let mainTitle = title;
  let highlightedPart = '';

  if (matchedPhrase) {
    const parts = title.split(matchedPhrase);
    mainTitle = parts[0];
    highlightedPart = matchedPhrase;
  }

  return (
    <section className="relative pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
      <div className="inline-flex items-center rounded-full border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 px-4 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-8">
        Our Story
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6 leading-tight transition-colors duration-300">
        {mainTitle}
        {highlightedPart && (
          <span className="text-indigo-600 dark:text-indigo-400">{highlightedPart}</span>
        )}
      </h1>
      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
        {description}
      </p>
    </section>
  );
};
