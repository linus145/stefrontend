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
      <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-xs text-indigo-600 font-medium mb-8">
        Our Story
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
        {title.split('Startup Ecosystems.')[0]}
        <span className="text-indigo-600">{title.includes('Startup Ecosystems.') ? 'Startup Ecosystems.' : ''}</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </section>
  );
};
