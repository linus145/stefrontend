'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { publicService } from '@/services/public.service';
import { toast } from 'sonner';
import { 
  Bot, Sparkles, Mail, User, Briefcase, Phone, MessageSquare, 
  ArrowRight, ShieldCheck, Check, Building
} from 'lucide-react';
import Link from 'next/link';

export function BookDemoForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    company_size: '',
    phone_number: '',
    message: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Work Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid work email address';
    }
    if (!formData.company_name.trim()) newErrors.company_name = 'Company Name is required';
    if (!formData.company_size) newErrors.company_size = 'Please select a company size';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      await publicService.submitContactSales(formData);
      setIsSuccess(true);
      toast.success('Your demo request has been successfully scheduled!');
    } catch (error: any) {
      console.error('Failed to submit demo booking:', error);
      toast.error('Failed to submit booking request. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
      
      {/* Left Column: Value Prop Section */}
      <div className="lg:col-span-5 flex flex-col justify-center space-y-8 lg:pr-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-1.5 text-xs text-indigo-700 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold tracking-wide uppercase text-[10px]">Orchestrate Custom Workflows</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            A custom demo <br /> built for your <br />
            <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">hiring requirements.</span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Experience B2Linq's autonomous hiring orchestration engine. See how specialized AI agents can evaluate talent capability and save your team 90% of traditional screening hours.
          </p>
        </div>

        {/* Structured Stats Grid */}
        <div className="grid grid-cols-3 gap-4 border-y border-slate-200 py-6">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 block">12x</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hiring Speedup</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 block">95%</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Accuracy Match</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">90%</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Effort Saved</span>
          </div>
        </div>

        {/* Feature Checkpoints */}
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Autonomous Talent Ingestion</h4>
              <p className="text-slate-500 text-xs">Simulate importing profiles and automatically matching capability vectors.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Interactive Voice Assessment</h4>
              <p className="text-slate-500 text-xs">Preview a sample evaluation call and check structural conversation metrics.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Granular Administrative Control</h4>
              <p className="text-slate-500 text-xs">Observe leave logs, payroll scopes, and role attendance sync trackers.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-slate-400" /> GDPR Compliant</span>
          <span className="h-3 w-px bg-slate-200" />
          <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-slate-400" /> Live AI Engine Sandbox</span>
        </div>
      </div>

      {/* Right Column: Interactive Form Panel */}
      <div className="lg:col-span-7 flex items-center justify-center">
        <div className="w-full bg-white/80 border border-slate-200/80 rounded-sm p-8 sm:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden min-h-[580px] flex flex-col justify-center">
          
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="booking-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Request Sales Demo</h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Tell us about your team size and operational scope, and we'll configure a tailored playground.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Name & Email Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className={`w-full pl-10 pr-4 h-11 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all rounded-sm text-sm outline-none ${
                            errors.full_name ? 'border-red-500 focus:ring-red-100' : ''
                          }`}
                        />
                      </div>
                      {errors.full_name && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.full_name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@company.com"
                          className={`w-full pl-10 pr-4 h-11 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all rounded-sm text-sm outline-none ${
                            errors.email ? 'border-red-500 focus:ring-red-100' : ''
                          }`}
                        />
                      </div>
                      {errors.email && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Company Name & Company Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Company Name</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleChange}
                          placeholder="Acme Corp"
                          className={`w-full pl-10 pr-4 h-11 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all rounded-sm text-sm outline-none ${
                            errors.company_name ? 'border-red-500 focus:ring-red-100' : ''
                          }`}
                        />
                      </div>
                      {errors.company_name && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.company_name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Company Size</label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                          name="company_size"
                          value={formData.company_size}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 h-11 bg-white border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 focus-visible:outline-none transition-all rounded-sm text-sm appearance-none outline-none ${
                            errors.company_size ? 'border-red-500 focus:ring-red-100' : ''
                          }`}
                        >
                          <option value="">Select Company Size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                      </div>
                      {errors.company_size && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.company_size}</p>}
                    </div>
                  </div>

                  {/* Phone Number (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone Number (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 h-11 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all rounded-sm text-sm outline-none"
                      />
                    </div>
                  </div>

                  {/* Message (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Special Requirements (Optional)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about the candidate roles or pipeline steps you wish to evaluate..."
                        className="w-full pl-10 pr-4 pt-3 min-h-[100px] bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all rounded-sm text-sm outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#0a66c2] hover:bg-[#084e96] text-white font-bold rounded-sm shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group mt-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Request...
                      </span>
                    ) : (
                      <>
                        Schedule Custom Demo
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </Button>

                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="text-center space-y-6 py-6"
              >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-100 text-emerald-600 shadow-inner relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <Check className="w-10 h-10" />
                  </motion.div>
                  <span className="absolute -inset-1 rounded-full border border-emerald-400 animate-ping opacity-25" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lead Captured!</h2>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                    Thank you for booking a demo with B2Linq, <span className="font-bold text-slate-900">{formData.full_name}</span>. 
                    Our orchestration engineers are preparing a customized playground configuration for <span className="font-bold text-slate-900">{formData.company_name}</span>.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-sm p-5 text-left border border-slate-100 max-w-md mx-auto space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Inquiry Scope</span>
                    <span className="font-bold text-indigo-600 uppercase tracking-wide">Custom Demo Setup</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Target Organization</span>
                      <span className="font-bold text-slate-800">{formData.company_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Work Email Address</span>
                      <span className="font-bold text-slate-800 truncate block">{formData.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-11 px-8 bg-[#0a66c2] hover:bg-[#084e96] text-white font-bold rounded-sm transition-all shadow-md">
                      Return to Home
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({
                        full_name: '',
                        email: '',
                        company_name: '',
                        company_size: '',
                        phone_number: '',
                        message: ''
                      });
                    }}
                    className="w-full sm:w-auto h-11 px-6 rounded-sm border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-semibold"
                  >
                    Submit Another
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
