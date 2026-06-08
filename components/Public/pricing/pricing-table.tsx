"use client";

import React, { useState, useEffect } from 'react';
import { Check, Sparkles, ShieldCheck, Bot, Zap, Building2, HelpCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { appConfig } from '@/lib/config';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { axiosInstance } from '@/lib/axios';

interface Plan {
  id: string;
  slug?: string;
  name: string;
  price: number | string;
  employee_limit: string;
  description: string;
  is_popular: boolean;
  agent_intelligence_type: string;
  hiring_ats_automation: string;
  onboarding_workflow: string;
  employee_self_service: string;
  system_integrations: string;
  analytics_governance: string;
  highlights: string[];
}

const fallbackPlans: Plan[] = [
  {
    id: 'free',
    slug: 'free-tier',
    name: 'Free Tier',
    price: 0,
    employee_limit: '1-10 Employees',
    description: 'Access the candidate job portal and basic user dashboard.',
    is_popular: false,
    agent_intelligence_type: 'None',
    hiring_ats_automation: 'Candidate job application portal.',
    onboarding_workflow: 'None',
    employee_self_service: 'None',
    system_integrations: 'None',
    analytics_governance: 'None',
    highlights: ['100 Monthly AI Credits', 'User Dashboard Access', 'Job Application Portal', '1-10 Employees', 'No HRMS Features']
  },
  {
    id: 'basic',
    slug: 'basic-plan',
    name: 'Basic Plan',
    price: 6000,
    employee_limit: '1-100 Employees',
    description: 'Automate core data synchronization and triggers across ATS and HRMS tools.',
    is_popular: false,
    agent_intelligence_type: 'No-Agentic Integration(Webhook/Trigger-based)',
    hiring_ats_automation: 'Automated data sync from ATS to HRMS when candidate status changes.',
    onboarding_workflow: 'Auto-triggers welcome emails and standard NDA/Offer packet links.',
    employee_self_service: 'Basic static dashboard to view company links/documents.',
    system_integrations: '2 Core tools (e.g., 1 ATS + 1 HRMS).',
    analytics_governance: 'Standard compliance & system event reporting.',
    highlights: ['500 Monthly AI Credits', 'Manual Tools', '2 Core integrations', '1-100 Employees', 'Auto-triggers & data sync']
  },
  {
    id: 'growth',
    slug: 'growth-plan',
    name: 'Growth Plan',
    price: 12000,
    employee_limit: 'Up to 500 Employees',
    description: 'Full AI integrations for interactive applicant screening, handbook QA, and leave management.',
    is_popular: true,
    agent_intelligence_type: 'Full Conversational Agent(Interactive Chat AI)',
    hiring_ats_automation: 'AI-driven interactive text screening & scoring of applicants.',
    onboarding_workflow: 'Conversational AI guides new hires step-by-step through company setup.',
    employee_self_service: 'Natural language HR policy search (Trained on company handbook).',
    system_integrations: 'Unlimited Standard integrations (Slack, Teams, Workday, BambooHR).',
    analytics_governance: 'Team-level usage summaries and operational bottleneck tracking.',
    highlights: [
      '1,000 Monthly AI Credits',
      'Full Conversational Agent(Interactive Chat AI)',
      'Unlimited Standard integrations',
      'Standard ATS Integrations',
      'Up to 500 Employees',
      'Full Applicant Dashboard',
      'AI Interview Pipeline',
      'AI Resume Screening',
      'Candidate Evaluation Reports',
      'Recruiter Collaboration Panel',
      'HR Workflow Automation',
      'Offer Letter & Hiring Flow',
      'Interview Scheduling System',
      'Analytics & Hiring Insights',
      'Task & Hiring Activity Tracking',
      'Email & Notification Automation',
      'Role-based Team Access'
    ]
  },
  {
    id: 'enterprise',
    slug: 'enterprise-ai-os',
    name: 'Enterprise AI OS',
    price: 18000,
    employee_limit: 'Unlimited Employees',
    description: 'Advanced enterprise intelligence layer. Full autonomous operating scale with single-prompt execution and risk tracking.',
    is_popular: false,
    agent_intelligence_type: 'Full Agentic Autonomous(Single-prompt end-to-end)',
    hiring_ats_automation: 'Single-prompt pipeline execution: Agent handles background check, offer, and provisioning in one go.',
    onboarding_workflow: 'Agent manages employee onboarding, nudges hires, and self-heals data entry errors.',
    employee_self_service: 'Interactive multi-turn processing (e.g., handles complex leave requests via dialogue).',
    system_integrations: 'Custom Enterprise software integrations via custom API schemas.',
    analytics_governance: 'Proactive organizational health & employee burnout/retention risk tracking.',
    highlights: [
      '1,500 Monthly AI Credits',
      'Full Agentic Autonomous(Single-prompt end-to-end)',
      'Custom Enterprise software integrations',
      'API & ERP Integrations',
      'Unlimited Employees',
      'Autonomous AI Hiring Agents',
      'AI Decision Intelligence',
      'Full HR Management Suite',
      'Advanced AI Analytics',
      'AI Candidate Matching Engine',
      'Smart Workforce Insights',
      'Multi-Department Hiring Pipelines',
      'Custom Workflow Builder',
      'Advanced Access Control',
      'AI Performance Monitoring',
      'Predictive Hiring Analytics',
      'Dedicated Success Manager',
      'Priority Infrastructure Support'
    ]
  }
];

export function PricingTable() {
  const [plans, setPlans] = useState<Plan[]>(fallbackPlans);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'compare'>('cards');
  const { isAuthenticated, user, fetchSubscription } = useAuth();
  const router = useRouter();
  const [userSub, setUserSub] = useState<any>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  useEffect(() => {
    // API plan fetching is removed since we are not integrating the backend API for plans as of now.
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserSubscription = async () => {
        try {
          const response = await axiosInstance.get('/subscription/my-subscription/');
          if (response.data) {
            setUserSub(response.data);
          }
        } catch (err) {
          console.error('Error fetching user subscription:', err);
        }
      };
      fetchUserSubscription();
    }
  }, [isAuthenticated]);

  const handlePlanSelect = async (plan: Plan) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const isActivePlan = userSub && (
      userSub.plan_details?.slug === plan.slug ||
      userSub.plan_details?.name?.toLowerCase() === plan.name.toLowerCase()
    );

    if (isActivePlan) {
      toast.info(`You are already subscribed to ${plan.name}.`);
      return;
    }

    setSubscribingId(plan.id);
    try {
      const response = await axiosInstance.post('/subscription/my-subscription/', {
        plan_id: plan.id
      });
      if (response.data) {
        setUserSub(response.data);
        await fetchSubscription();
        if (Number(plan.price) === 0) {
          toast.success(`Successfully activated ${plan.name}!`);
        } else {
          toast.success(`Selected ${plan.name}!`, {
            description: "UPI manual payment proof is required. Please upload your verification screenshot below to activate.",
          });
        }
      }
    } catch (err: any) {
      console.error('Error updating subscription:', err);
      toast.error(err.response?.data?.error || 'Failed to update subscription. Please try again.');
    } finally {
      setSubscribingId(null);
    }
  };

  const getPlanIcon = (name: string, popular: boolean) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('free')) return <Bot className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    if (lowerName.includes('basic')) return <Zap className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    if (lowerName.includes('growth')) return <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    return <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
  };

  const getPlanBadge = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('free')) return 'Startups';
    if (lowerName.includes('basic')) return 'Growing Teams';
    if (lowerName.includes('growth')) return 'Complete Hiring Suite';
    return 'Enterprise AI OS';
  };

  const featureRows = [
    {
      category: 'System Integrations',
      description: 'Syncing with ATS, HRMS, and team communications tools.',
      field: 'system_integrations' as keyof Plan,
    },
    {
      category: 'Agent Intelligence Type',
      description: 'The level of agent capabilities built into the core framework.',
      field: 'agent_intelligence_type' as keyof Plan,
    },
    {
      category: 'Hiring & ATS Automation',
      description: 'Recruiting pipeline triggers and document verification automations.',
      field: 'hiring_ats_automation' as keyof Plan,
    },
    {
      category: 'Onboarding Workflow',
      description: 'Interactive welcome, contract handling, and provisioning setup.',
      field: 'onboarding_workflow' as keyof Plan,
    },
    {
      category: 'Employee Self-Service',
      description: 'Dialogue-driven HR requests, handbook searches, and internal policies.',
      field: 'employee_self_service' as keyof Plan,
    },
    {
      category: 'Analytics & Governance',
      description: 'System metrics, retention risks, and operational bottlenecks.',
      field: 'analytics_governance' as keyof Plan,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header Info Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-sm border border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 text-xs text-[#0a66c2] dark:text-blue-400 backdrop-blur-md shadow-sm">
          <Bot className="w-3.5 h-3.5" />
          <span className="font-semibold tracking-wide uppercase text-[10px]">Dynamic Flat Rate Pricing</span>
        </div>
        <h1 id="pricing-title" className="text-4xl sm:text-6xl font-black leading-tight text-[#0a66c2] dark:text-blue-400 bg-gradient-to-r from-[#0a66c2] via-indigo-600 to-blue-800 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
          Plans
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
          Scale from standard templates to autonomous agent-driven systems. Find the plan that fits your employee count.
        </p>

        {/* View Toggle */}
        <div className="pt-6 flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-sm inline-flex border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-6 py-2 text-xs font-bold rounded-sm transition-all duration-200 cursor-pointer ${activeTab === 'cards'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Plan Overview
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-6 py-2 text-xs font-bold rounded-sm transition-all duration-200 cursor-pointer ${activeTab === 'compare'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Detailed Comparison Matrix
            </button>
          </div>
        </div>
      </section>

      {/* Loading state indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 text-[#0a66c2] dark:text-blue-400 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Synchronizing pricing matrix from server...</p>
        </div>
      )}

      {/* Pricing Overview Cards View */}
      {!loading && activeTab === 'cards' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto px-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-slate-900/50 border rounded-lg p-6 flex flex-col justify-between relative transition-all duration-300 transform hover:-translate-y-1.5 ${plan.is_popular
                  ? 'border-[#0a66c2] dark:border-blue-500 shadow-xl shadow-blue-500/5 dark:shadow-blue-500/10 ring-1 ring-[#0a66c2]/20 dark:ring-blue-500/30 z-10'
                  : 'border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-100 dark:shadow-none hover:shadow-lg dark:hover:shadow-slate-900/30'
                }`}
            >
              {/* Top row with Icon and Badge */}
              <div className="flex justify-between items-center mb-4">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${plan.is_popular ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                >
                  {getPlanIcon(plan.name, plan.is_popular)}
                </div>
                <span
                  className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider ${plan.is_popular
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0a66c2] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                >
                  {getPlanBadge(plan.name)}
                </span>
              </div>

              {/* Price Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{plan.name}</h3>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">{plan.employee_limit}</p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[48px] leading-relaxed mt-2">{plan.description}</p>

                <div className="pt-2">
                  <div className="flex items-baseline text-slate-900 dark:text-white">
                    <span className="text-2xl font-black mr-0.5">₹</span>
                    <span className="text-4xl font-black tracking-tight">
                      {Number(plan.price) === 0 ? '0' : Number(plan.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold ml-1.5">/ month</span>
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Flat monthly billing.</p>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-5" />

              {/* Features Highlights List */}
              <div className="space-y-3.5 flex-grow">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Plan Highlights</h5>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-350">
                  {plan.highlights && plan.highlights.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Button
                  id={`cta-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
                  disabled={subscribingId !== null || (userSub && (userSub.plan_details?.slug === plan.slug || userSub.plan_details?.name?.toLowerCase() === plan.name.toLowerCase()))}
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full h-11 font-bold rounded-md transition-all duration-250 cursor-pointer text-xs ${
                    userSub && (userSub.plan_details?.slug === plan.slug || userSub.plan_details?.name?.toLowerCase() === plan.name.toLowerCase())
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 cursor-not-allowed'
                      : plan.is_popular
                      ? 'bg-[#0a66c2] hover:bg-[#084e96] dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-md shadow-blue-100 dark:shadow-none hover:shadow-lg dark:hover:shadow-none'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {subscribingId === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                  ) : null}
                  {!isAuthenticated ? (
                    <span className="flex items-center justify-center gap-1.5">Get Started <ArrowRight className="w-3.5 h-3.5" /></span>
                  ) : userSub && (userSub.plan_details?.slug === plan.slug || userSub.plan_details?.name?.toLowerCase() === plan.name.toLowerCase()) ? (
                    "Current Plan"
                  ) : (
                    "Select Plan"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Detailed Features Matrix View */}
      {!loading && activeTab === 'compare' && (
        <section className="max-w-6xl mx-auto overflow-hidden border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg dark:shadow-none bg-white dark:bg-slate-950/40 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-5 text-sm font-black text-slate-800 dark:text-slate-100 w-[240px]">Feature Capability</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="p-5 text-center min-w-[200px]">
                      <div className="space-y-1">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">{plan.name}</div>
                        <div className="text-xs text-[#0a66c2] dark:text-blue-400 font-semibold">{plan.employee_limit}</div>
                        <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                          ₹{Number(plan.price) === 0 ? '0' : Number(plan.price).toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">/mo</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {featureRows.map((row) => (
                  <tr key={row.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150">
                    <td className="p-5">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {row.category}
                          <span title={row.description} className="cursor-help inline-flex">
                            <HelpCircle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{row.description}</p>
                      </div>
                    </td>
                    {plans.map((plan) => {
                      const cellValue = plan[row.field];
                      const isNone = cellValue === 'None.' || cellValue === 'None';
                      return (
                        <td key={plan.id} className={`p-5 text-center text-xs leading-relaxed ${plan.is_popular ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''}`}>
                          {isNone ? (
                            <span className="text-slate-400 dark:text-slate-500 italic">Not available</span>
                          ) : (
                            <div className="inline-flex items-center justify-center gap-1.5 max-w-[220px] mx-auto text-slate-700 dark:text-slate-300 font-medium">
                              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                              <span>{cellValue as string}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-900/80 p-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Need custom integrations or custom voice models? We offer customized services.
            </div>
            <Link href="/book-demo">
              <Button className="bg-[#0a66c2] hover:bg-[#084e96] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold h-9 px-4 rounded-md">
                Contact Enterprise Sales
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="text-center pt-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" /> GDPR & SOC2 Compliant Secure Storage
          </span>
          <span className="h-3 w-px bg-slate-200 dark:bg-slate-800 hidden sm:inline" />
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Auto-scalable AI Agent Resources
          </span>
          <span className="h-3 w-px bg-slate-200 dark:bg-slate-800 hidden sm:inline" />
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-slate-400 dark:text-slate-500" /> No setup fees or hidden charges
          </span>
        </div>
      </section>
    </div>
  );
}
