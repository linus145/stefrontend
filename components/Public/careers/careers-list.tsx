'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, MapPin, Clock, ArrowRight, X, Mail, 
  FileText, Send, CheckCircle2, ChevronRight, HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Job {
  id?: number;
  role: string;
  department: string;
  location: string;
  job_type: string;
  description?: string | null;
  created_at?: string;
}

interface CareersListProps {
  jobs: Job[];
}

export function CareersList({ jobs = [] }: CareersListProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyFormData, setApplyFormData] = useState({
    name: '',
    email: '',
    resumeUrl: '',
    coverLetter: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplyFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!applyFormData.name.trim()) errors.name = 'Full Name is required';
    if (!applyFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(applyFormData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!applyFormData.resumeUrl.trim()) {
      errors.resumeUrl = 'Resume URL or Portfolio URL is required';
    } else if (!/^https?:\/\/.+/.test(applyFormData.resumeUrl)) {
      errors.resumeUrl = 'Please enter a valid link starting with http:// or https://';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  const renderDescription = (desc?: string | null) => {
    if (!desc) return null;
    
    // Split by lines
    const lines = desc.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];
    
    const parseInline = (str: string) => {
      const parts = str.split('**');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="font-bold text-slate-900 dark:text-slate-100">{part}</strong>;
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('### ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 my-4 space-y-2 text-slate-600 dark:text-slate-400">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h4 key={index} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-6 mb-2">
            {parseInline(trimmed.slice(4))}
          </h4>
        );
      } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 my-4 space-y-2 text-slate-600 dark:text-slate-400">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        const title = trimmed.startsWith('## ') ? trimmed.slice(3) : trimmed.slice(2);
        elements.push(
          <h3 key={index} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3">
            {parseInline(title)}
          </h3>
        );
      }
      // List items
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(
          <li key={index} className="leading-relaxed">
            {parseInline(trimmed.slice(2))}
          </li>
        );
      }
      // Empty line
      else if (trimmed === '') {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 my-4 space-y-2 text-slate-600 dark:text-slate-400">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
      }
      // Standard paragraph
      else {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 my-4 space-y-2 text-slate-600 dark:text-slate-400">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <p key={index} className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            {parseInline(trimmed)}
          </p>
        );
      }
    });

    if (inList) {
      elements.push(
        <ul key="list-final" className="list-disc pl-5 my-4 space-y-2 text-slate-600 dark:text-slate-400">
          {listItems}
        </ul>
      );
    }

    return <div className="space-y-1">{elements}</div>;
  };

  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence mode="wait">
        {!selectedJob ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Careers List Container */}
            <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto z-10 relative">
              {jobs.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
                  <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Open Roles at the Moment</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                    We aren't actively advertising any open roles. If you'd like to work with us anyway, please reach out via email.
                  </p>
                  <a 
                    href="mailto:careers@b2linq.in" 
                    className="inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 mt-4 underline underline-offset-4"
                  >
                    careers@b2linq.in
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <motion.div 
                      key={job.id || job.role}
                      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                      onClick={() => handleSelectJob(job)}
                      className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-[#0a66c2] transition-all" />
                      
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold text-black dark:text-slate-100 group-hover:text-[#0a66c2] dark:group-hover:text-indigo-400 transition-colors">
                          {job.role}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" /> {job.department}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-sm flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {job.job_type}
                        </span>
                        <div className="w-9 h-9 rounded-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-[#0a66c2] group-hover:border-[#0a66c2] transition-all">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="py-12 px-4 sm:px-6 max-w-3xl mx-auto z-10 relative space-y-8"
          >
            {/* Back button */}
            <button
              onClick={() => setSelectedJob(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-455 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Job Openings
            </button>

            {/* Header section with role details */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-sm p-6 md:p-8 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-[#0a66c2]" />
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a66c2] bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-sm">
                  {selectedJob.department}
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-black dark:text-slate-50 leading-tight pt-2">{selectedJob.role}</h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {selectedJob.location}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {selectedJob.job_type}</span>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-slate max-w-none pt-4">
              {renderDescription(selectedJob.description)}
            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex items-center justify-between">
              <a
                href={`mailto:careers@b2linq.in?subject=Application for ${selectedJob.role}`}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 underline underline-offset-4"
              >
                <Mail className="w-4 h-4" /> Apply via Email
              </a>
              <Button
                onClick={() => {
                  setShowApplyModal(true);
                  setIsSuccess(false);
                  setApplyFormData({ name: '', email: '', resumeUrl: '', coverLetter: '' });
                  setFormErrors({});
                }}
                className="bg-[#0a66c2] hover:bg-[#084e96] text-white font-bold h-12 px-8 rounded-sm shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-none transition-all cursor-pointer flex items-center gap-2"
              >
                Apply Online <ArrowRight className="w-4.5 h-4.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Dialog Modal popup */}
      <AnimatePresence>
        {showApplyModal && selectedJob && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApplyModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 pointer-events-auto"
            />

            {/* Modal Dialog container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-sm border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden pointer-events-auto flex flex-col relative"
              >
                {/* Modal Header */}
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-black dark:text-slate-50 text-lg">Apply for {selectedJob.role}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-semibold mt-1">
                      {selectedJob.department} • {selectedJob.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="p-2 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body / Form */}
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
                  <AnimatePresence mode="wait">
                    {!isSuccess ? (
                      <motion.form
                        key="modal-form"
                        onSubmit={handleApplySubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                          <input
                            name="name"
                            value={applyFormData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className={`w-full px-4 h-11 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-500/20 transition-all rounded-sm text-sm outline-none ${
                              formErrors.name ? 'border-red-500 focus:ring-red-100' : ''
                            }`}
                          />
                          {formErrors.name && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{formErrors.name}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
                          <input
                            name="email"
                            type="email"
                            value={applyFormData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className={`w-full px-4 h-11 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-500/20 transition-all rounded-sm text-sm outline-none ${
                              formErrors.email ? 'border-red-500 focus:ring-red-100' : ''
                            }`}
                          />
                          {formErrors.email && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{formErrors.email}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resume / Portfolio URL</label>
                          <div className="relative">
                            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              name="resumeUrl"
                              value={applyFormData.resumeUrl}
                              onChange={handleInputChange}
                              placeholder="Paste link to Google Drive, Dropbox, or PDF..."
                              className={`w-full pl-10 pr-4 h-11 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-500/20 transition-all rounded-sm text-sm outline-none ${
                                formErrors.resumeUrl ? 'border-red-500 focus:ring-red-100' : ''
                              }`}
                            />
                          </div>
                          {formErrors.resumeUrl && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{formErrors.resumeUrl}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cover Letter (Optional)</label>
                          <textarea
                            name="coverLetter"
                            value={applyFormData.coverLetter}
                            onChange={handleInputChange}
                            placeholder="Tell us why you are a great fit for this role..."
                            className="w-full px-4 py-3 min-h-[100px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-500/20 transition-all rounded-sm text-sm outline-none resize-none"
                          />
                        </div>

                        <div className="pt-4 flex justify-between gap-4">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowApplyModal(false)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#0a66c2] hover:bg-[#084e96] text-white font-bold h-11 px-8 rounded-sm shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                              </span>
                            ) : (
                              <>
                                Submit Application <Send className="w-3.5 h-3.5" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="modal-success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 space-y-6 flex flex-col items-center justify-center"
                      >
                        <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                          <CheckCircle2 className="w-9 h-9" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-slate-900 dark:text-slate-50">Application Submitted!</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                            Thank you for applying, <span className="font-bold text-slate-850 dark:text-slate-200">{applyFormData.name}</span>! Your application has been recorded.
                          </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 rounded-sm border border-slate-100 dark:border-slate-800 p-4 text-xs text-left w-full max-w-sm">
                          <p className="text-slate-500 leading-relaxed">
                            Our recruitment team will review your credentials and contact you at <span className="font-bold text-slate-800">{applyFormData.email}</span> within 3 business days.
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowApplyModal(false)}
                          className="bg-[#0a66c2] hover:bg-[#084e96] text-white font-bold h-11 px-8 rounded-sm shadow-md transition-all cursor-pointer"
                        >
                          Close Window
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
