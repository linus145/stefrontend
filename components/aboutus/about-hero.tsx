import React from 'react';

interface AboutHeroProps {
  title?: string;
  description?: string;
}

export const AboutHero = ({ 
  title = "Architecting the future of Startup Ecosystems.", 
  description = "B2linq was founded on a simple premise: the best ideas deserve the best capital and the best talent, without the noise of traditional networking. We are building the infrastructure for the next generation of founders." 
}: AboutHeroProps) => {
  return (
    <section className="relative pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
      <div className="inline-flex items-center rounded-full border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 px-4 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-8">
        Our Story
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6 leading-tight transition-colors duration-300">
        {title.split('Startup Ecosystems.')[0]}
        <span className="text-indigo-600 dark:text-indigo-400">{title.includes('Startup Ecosystems.') ? 'Startup Ecosystems.' : ''}</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
        {description}
      </p>
    </section>
  );
};
