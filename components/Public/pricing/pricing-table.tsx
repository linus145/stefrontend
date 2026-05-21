import React from 'react';
import { Check, Sparkles, ShieldCheck, Bot, Zap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PricingTable() {
  const plans = [
    {
      name: 'Growth',
      icon: <Zap className="w-5 h-5 text-slate-600" />,
      price: '6,000',
      description: 'Perfect for fast-growing startups configuring their first autonomous agent hiring pipeline.',
      features: [
        '1 Active Agent Workflow',
        '100 AI Video/Voice Screenings / mo',
        'Core ATS Integrations',
        'Shared Recruiter Workspace',
        'Email Support (24h SLA)',
        'GDPR Compliant Data Store'
      ],
      popular: false,
      ctaText: 'Start Growth Tier',
      badge: 'Starter Pack'
    },
    {
      name: 'Professional',
      icon: <Sparkles className="w-5 h-5 text-[#0a66c2]" />,
      price: '12,000',
      description: 'Orchestrate multiple technical pipelines with advanced candidate score radial analytics.',
      features: [
        '5 Active Agent Workflows',
        '500 AI Video/Voice Screenings / mo',
        'Advanced API & Webhook Access',
        'Granular Roles & Permissions',
        'Priority Phone & Slack Support (2h SLA)',
        'Custom Score Radial Metrics',
        'Automated Interview Scheduler'
      ],
      popular: true,
      ctaText: 'Go Professional',
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      price: '20,000',
      description: 'Full administrative operating control for global teams running thousands of screens.',
      features: [
        'Unlimited Active Agent Workflows',
        'Unlimited AI Screenings',
        'Dedicated Integration Engineer',
        'Custom LLM Voice Tailoring',
        'Custom SLA Contracts & Security Audits',
        'Multi-tenant Dashboard Provisioning',
        'Real-time Payroll & Attendance Sync'
      ],
      popular: false,
      ctaText: 'Deploy Enterprise',
      badge: 'Maximum Scale'
    }
  ];

  return (
    <div className="space-y-20">
      {/* Header Info Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 text-xs text-[#0a66c2] backdrop-blur-md shadow-sm">
          <Bot className="w-3.5 h-3.5" />
          <span className="font-semibold tracking-wide uppercase text-[10px]">Simple Flat Pricing</span>
        </div>
        <h1 id="pricing-title" className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight">
          Transparent plans for <br />
          <span className="text-[#0a66c2] bg-gradient-to-r from-[#0a66c2] via-indigo-600 to-blue-800 bg-clip-text text-transparent">hiring orchestration.</span>
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
          Choose the flat pricing structure that aligns with your operational pipeline. All plans include B2Linq core system infrastructure.
        </p>
      </section>

      {/* Pricing Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white border rounded-sm p-8 flex flex-col justify-between relative transition-all duration-300 ${
              plan.popular
                ? 'border-[#0a66c2] shadow-xl shadow-blue-500/5 md:scale-105 z-20'
                : 'border-slate-200/80 shadow-md shadow-slate-100 hover:shadow-lg'
            }`}
          >
            {/* Highlight Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-sm tracking-wider ${
                  plan.popular
                    ? 'bg-blue-50 text-[#0a66c2] border border-blue-100'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {plan.badge}
              </span>
            </div>

            {/* Price Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-sm flex items-center justify-center ${
                    plan.popular ? 'bg-blue-50 border border-blue-100' : 'bg-slate-100'
                  }`}
                >
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              </div>

              <p className="text-xs text-slate-500 min-h-[48px] leading-relaxed">{plan.description}</p>

              <div className="pt-2">
                <div className="flex items-baseline text-slate-900">
                  <span className="text-2xl font-bold">$</span>
                  <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                  <span className="text-slate-500 text-xs font-semibold ml-2">/ month</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Billed monthly, flat rate setup.</p>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-6" />

            {/* Features List */}
            <div className="space-y-4 flex-grow">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Included Capabilities</h5>
              <ul className="space-y-3 text-xs text-slate-600">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link href="/book-demo" className="w-full">
                <Button
                  id={`cta-${plan.name.toLowerCase()}`}
                  className={`w-full h-11 font-bold rounded-sm transition-all duration-250 cursor-pointer ${
                    plan.popular
                      ? 'bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-100 hover:shadow-lg'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {plan.ctaText}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Trust Badges */}
      <section className="text-center">
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-400" /> GDPR & SOC2 Compliant
          </span>
          <span className="h-3 w-px bg-slate-200" />
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-slate-400" /> No hidden fees
          </span>
        </div>
      </section>
    </div>
  );
}
