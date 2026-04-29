import React from 'react';

interface Job {
  role: string;
  department: string;
  location: string;
  job_type: string;
}

interface JobListProps {
  jobs?: Job[];
}

export const JobList = ({ jobs = [] }: JobListProps) => {
  const displayJobs = jobs.length > 0 ? jobs : [
    {
      role: "Senior AI Engineer",
      department: "Engineering",
      location: "Remote / San Francisco",
      job_type: "Full-time"
    },
    {
      role: "Product Designer",
      department: "Product",
      location: "London / Remote",
      job_type: "Full-time"
    },
    {
      role: "Ecosystem Growth Lead",
      department: "Operations",
      location: "New York / Remote",
      job_type: "Full-time"
    }
  ];

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="space-y-4">
        {displayJobs.map((job, i) => (
          <div key={i} className="group bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.role}</h3>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="text-sm text-slate-500">{job.department}</span>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-slate-500">{job.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                {job.job_type}
              </span>
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
