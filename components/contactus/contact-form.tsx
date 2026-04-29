'use client';

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { publicService } from '@/services/public.service';
import { toast } from 'sonner';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await publicService.submitContactInquiry(formData);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ full_name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <Input 
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Enter your name" 
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <Input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@company.com" 
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <Input 
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="How can we help?" 
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Message</label>
          <Textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Tell us more about your inquiry..." 
            className="min-h-[150px] bg-slate-50 border-slate-200 focus:bg-white transition-all" 
          />
        </div>
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-indigo-600 text-white hover:bg-indigo-500 font-bold rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
};
