import React from 'react';

interface Principle {
  title: string;
  description: string;
  icon: string;
}

interface MissionSectionProps {
  principles?: Principle[];
}

export const MissionSection = ({ principles = [] }: MissionSectionProps) => {
  const displayPrinciples = principles.length > 0 ? principles : [
    {
      title: "Efficiency",
      description: "We eliminate the friction in capital allocation through advanced matching algorithms.",
      
    },
    {
      title: "Transparency",
      description: "Every connection on B2linq is backed by verified data and genuine intent.",
     
    },
    {
      title: "Velocity",
      description: "Moving at the speed of thought. We help startups go from seed to scale faster.",
      
    }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight transition-colors duration-300">The Core Principles</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 transition-colors duration-300">What drives every line of code we write.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayPrinciples.map((m, i) => (
            <div key={i} className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
              {/* <div className="text-4xl mb-6">{m.icon}</div> */}
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3 transition-colors duration-300">{m.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
