'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  FileText,
  CreditCard,
  UserPlus,
  Layers,
  Copy,
  Check,
  Eye,
  Send
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { hrPayrollService, hrEmployeeService, hrOrgService } from '@/services/hr';
import { toast } from 'sonner';

import {
  DEFAULT_TEMPLATES,
  MONTHS,
  extractPlaceholders,
  renderDocumentTheme
} from './templates.helpers';
import { NewTemplateDialog } from './components/NewTemplateDialog';
import { EditTemplateDialog } from './components/EditTemplateDialog';
import { PreviewTemplateDialog } from './components/PreviewTemplateDialog';
import { SendTemplateDialog } from './components/SendTemplateDialog';

export function TemplatesTab() {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'PAYROLL' | 'OFFER_JOINING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [viewingTemplate, setViewingTemplate] = useState<any>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: 'PAYROLL',
    content: ''
  });

  // Sending State
  const [sendingTemplate, setSendingTemplate] = useState<any>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [parsedVariables, setParsedVariables] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');

  // Payroll period selection
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isFetchingPayroll, setIsFetchingPayroll] = useState(false);

  // Design theme selection
  const [selectedDesign, setSelectedDesign] = useState('corporate');

  // Lock body scroll when modal is active
  useEffect(() => {
    if (viewingTemplate || sendingTemplate || editingTemplate || isNewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [viewingTemplate, sendingTemplate, editingTemplate, isNewOpen]);

  // Reset payroll period states when closing send modal
  useEffect(() => {
    if (!sendingTemplate) {
      setSelectedEmployeeId('');
      setSelectedMonth('');
      setSelectedYear('2026');
      setIsFetchingPayroll(false);
    }
  }, [sendingTemplate]);

  // Query employees
  const { data: employeesRes } = useQuery({
    queryKey: ['active-employees-list-for-templates'],
    queryFn: () => hrEmployeeService.getEmployees({ limit: 100 })
  });
  const employees = employeesRes?.data?.results || [];

  // Query organization profile
  const { data: organizationRes } = useQuery({
    queryKey: ['organization'],
    queryFn: () => hrOrgService.getOrganization()
  });
  const orgName = organizationRes?.data?.name || 'B2Linq Technologies Inc';

  // Send Template Mutation
  const sendTemplateMutation = useMutation({
    mutationFn: ({ employee_id, email_body, subject, template_name, design_id }: any) => 
      hrPayrollService.sendTemplate(employee_id, email_body, subject, template_name, design_id),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Document email sent successfully to the employee!");
      setSendingTemplate(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || err.message || "Failed to send document email.");
    }
  });

  const handleVariableChange = (name: string, val: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const fetchPayroll = async (empId: string, month: string, year: string, currentVars?: Record<string, string>) => {
    if (!empId || !month || !year) return;
    setIsFetchingPayroll(true);
    try {
      const response = await hrPayrollService.fetchPayrollData(empId, month, year);
      if (response.data && response.data.found) {
        const pData = response.data;
        const updated = { ...(currentVars || templateVariables) };
        
        if (parsedVariables.includes('month') || updated['month'] !== undefined) {
          updated['month'] = MONTHS[parseInt(month) - 1] || '';
        }
        if (parsedVariables.includes('year') || updated['year'] !== undefined) {
          updated['year'] = year;
        }
        if (parsedVariables.includes('basic_salary') || updated['basic_salary'] !== undefined) {
          updated['basic_salary'] = pData.basic_salary ? `₹${parseFloat(pData.basic_salary).toLocaleString('en-IN')}` : '';
        }
        if (parsedVariables.includes('hra') || updated['hra'] !== undefined) {
          updated['hra'] = pData.total_allowances ? `₹${parseFloat(pData.total_allowances).toLocaleString('en-IN')}` : '';
        }
        if (parsedVariables.includes('tax_amount') || updated['tax_amount'] !== undefined) {
          updated['tax_amount'] = pData.tax_amount ? `₹${parseFloat(pData.tax_amount).toLocaleString('en-IN')}` : '';
        }
        if (parsedVariables.includes('pf_amount') || updated['pf_amount'] !== undefined) {
          updated['pf_amount'] = pData.pf_amount ? `₹${parseFloat(pData.pf_amount).toLocaleString('en-IN')}` : '';
        }
        if (parsedVariables.includes('net_salary') || updated['net_salary'] !== undefined) {
          updated['net_salary'] = pData.net_salary ? `₹${parseFloat(pData.net_salary).toLocaleString('en-IN')}` : '';
        }
        if (parsedVariables.includes('gross_salary') || updated['gross_salary'] !== undefined) {
          updated['gross_salary'] = pData.gross_salary ? `₹${parseFloat(pData.gross_salary).toLocaleString('en-IN')}` : '';
        }
        if (parsedVariables.includes('deductions') || updated['deductions'] !== undefined) {
          updated['deductions'] = pData.total_deductions ? `₹${parseFloat(pData.total_deductions).toLocaleString('en-IN')}` : '';
        }
        if (parsedVariables.includes('total_deductions') || updated['total_deductions'] !== undefined) {
          updated['total_deductions'] = pData.total_deductions ? `₹${parseFloat(pData.total_deductions).toLocaleString('en-IN')}` : '';
        }
        if (parsedVariables.includes('overtime_amount') || updated['overtime_amount'] !== undefined) {
          updated['overtime_amount'] = pData.overtime_amount ? `₹${parseFloat(pData.overtime_amount).toLocaleString('en-IN')}` : '';
        }
        if (parsedVariables.includes('bonus_amount') || updated['bonus_amount'] !== undefined) {
          updated['bonus_amount'] = pData.bonus_amount ? `₹${parseFloat(pData.bonus_amount).toLocaleString('en-IN')}` : '';
        }

        if (sendingTemplate?.category === 'PAYROLL') {
          updated['annual_salary'] = pData.net_salary ? `₹${parseFloat(pData.net_salary).toLocaleString('en-IN')}` : '';
        }

        setTemplateVariables(updated);
        toast.success(`Successfully loaded payroll records for ${MONTHS[parseInt(month) - 1]} ${year}`);
      } else {
        toast.error(response.data?.message || `No payroll records generated for ${MONTHS[parseInt(month) - 1]} ${year}.`);
      }
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      toast.error("Failed to retrieve payroll record data.");
    } finally {
      setIsFetchingPayroll(false);
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (selectedEmployeeId && month && selectedYear) {
      fetchPayroll(selectedEmployeeId, month, selectedYear);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (selectedEmployeeId && selectedMonth && year) {
      fetchPayroll(selectedEmployeeId, selectedMonth, year);
    }
  };

  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmployeeId(empId);
    if (!empId) {
      const clearedVars = { ...templateVariables };
      parsedVariables.forEach(v => {
        clearedVars[v] = '';
      });
      setTemplateVariables(clearedVars);
      return;
    }

    const emp = employees.find((e: any) => e.id === empId);
    if (emp) {
      const updatedVars = { ...templateVariables };
      
      if (parsedVariables.includes('employee_name')) {
        updatedVars['employee_name'] = `${emp.first_name} ${emp.last_name}`;
      }
      if (parsedVariables.includes('candidate_name')) {
        updatedVars['candidate_name'] = `${emp.first_name} ${emp.last_name}`;
      }
      if (parsedVariables.includes('employee_id')) {
        updatedVars['employee_id'] = emp.employee_id || '';
      }
      if (parsedVariables.includes('joining_date')) {
        updatedVars['joining_date'] = emp.joining_date || new Date().toISOString().split('T')[0];
      }
      if (parsedVariables.includes('annual_salary')) {
        updatedVars['annual_salary'] = emp.salary ? `₹${Number(emp.salary).toLocaleString()}` : '';
      }
      if (parsedVariables.includes('basic_salary')) {
        updatedVars['basic_salary'] = emp.salary ? `₹${(Number(emp.salary) * 0.5).toLocaleString()}` : '';
      }
      if (parsedVariables.includes('hra')) {
        updatedVars['hra'] = emp.salary ? `₹${(Number(emp.salary) * 0.2).toLocaleString()}` : '';
      }
      if (parsedVariables.includes('workplace_mode')) {
        updatedVars['workplace_mode'] = emp.employment_type === 'FULL_TIME' ? 'Office (Full-Time)' : 'Remote';
      }
      if (parsedVariables.includes('reporting_manager')) {
        updatedVars['reporting_manager'] = emp.reporting_manager_detail 
          ? `${emp.reporting_manager_detail.first_name} ${emp.reporting_manager_detail.last_name}`
          : 'HR Manager';
      }
      if (parsedVariables.includes('organization_name')) {
        updatedVars['organization_name'] = emp.organization_detail?.name || orgName;
      }
      if (parsedVariables.includes('pay_period')) {
        const date = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        updatedVars['pay_period'] = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      }
      
      setTemplateVariables(updatedVars);

      if (selectedMonth && selectedYear) {
        fetchPayroll(empId, selectedMonth, selectedYear, updatedVars);
      }
    }
  };

  const handleSendEmail = () => {
    if (!selectedEmployeeId || !sendingTemplate) return;

    let compiledContent = sendingTemplate.content;
    parsedVariables.forEach(v => {
      const val = templateVariables[v] || `{{${v}}}`;
      compiledContent = compiledContent.replaceAll(`{{${v}}}`, val);
    });

    sendTemplateMutation.mutate({
      employee_id: selectedEmployeeId,
      email_body: compiledContent,
      subject: customSubject || `Document: ${sendingTemplate.name}`,
      template_name: sendingTemplate.name,
      design_id: selectedDesign
    });
  };

  // Query database templates
  const { data: templatesRes, isLoading, refetch } = useQuery({
    queryKey: ['document-templates'],
    queryFn: () => hrPayrollService.getTemplates()
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => hrPayrollService.createTemplate(data),
    onSuccess: () => {
      refetch();
      setIsNewOpen(false);
      setForm({ name: '', category: 'PAYROLL', content: '' });
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => hrPayrollService.updateTemplate(id, data),
    onSuccess: () => {
      refetch();
      setEditingTemplate(null);
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => hrPayrollService.deleteTemplate(id),
    onSuccess: () => {
      refetch();
    }
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compile combined list (dynamic DB data + seed data for outstanding visual representation)
  const dbTemplates = templatesRes?.data?.results || [];

  // Exclude static seeds if a matching DB record is found to prevent duplication
  const filteredSeeds = DEFAULT_TEMPLATES.filter(
    seed => !dbTemplates.some((db: any) => db.name === seed.name)
  );

  const allTemplates = [...dbTemplates, ...filteredSeeds];

  // Filtering Logic
  const filteredList = allTemplates.filter((item: any) => {
    // Category Filter
    if (activeCategory === 'PAYROLL' && item.category !== 'PAYROLL') return false;
    if (activeCategory === 'OFFER_JOINING' && item.category === 'PAYROLL') return false;

    // Search Filter
    const searchString = `${item.name} ${item.content} ${item.category}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PAYROLL':
        return <CreditCard className="h-4 w-4 text-[#0a66c2]" />;
      case 'OFFER_LETTER':
        return <UserPlus className="h-4 w-4 text-emerald-600" />;
      case 'JOINING_LETTER':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Layers className="h-4 w-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'PAYROLL': return 'Payroll Related';
      case 'OFFER_LETTER': return 'Offer Letter';
      case 'JOINING_LETTER': return 'Joining Letter';
      default: return category;
    }
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'PAYROLL':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800/40';
      case 'OFFER_LETTER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/40';
      case 'JOINING_LETTER':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-800/40';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#0a66c2]" /> Company Documents & Templates
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Configure customized layouts for payroll vouchers, candidates' offer letters, and standard joining agreements.
          </p>
        </div>
        <Button
          onClick={() => setIsNewOpen(true)}
          className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-500/15 rounded-md text-xs font-bold py-2.5 px-4 cursor-pointer inline-flex items-center gap-1.5 h-10 shrink-0"
        >
          <Plus className="h-4 w-4" /> Create Custom Template
        </Button>
      </div>

      {/* Tabs & Search Navigation Grid */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex bg-slate-100/80 dark:bg-[#151624]/60 p-1 rounded-md border border-slate-200/50 dark:border-slate-800/60 w-full md:w-auto">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${activeCategory === 'ALL'
                ? 'bg-white dark:bg-[#121320] text-[#0a66c2] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            All Templates
          </button>
          <button
            onClick={() => setActiveCategory('PAYROLL')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${activeCategory === 'PAYROLL'
                ? 'bg-white dark:bg-[#121320] text-[#0a66c2] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Payroll Related
          </button>
          <button
            onClick={() => setActiveCategory('OFFER_JOINING')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${activeCategory === 'OFFER_JOINING'
                ? 'bg-white dark:bg-[#121320] text-[#0a66c2] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Offer & Joining Letters
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-9 h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121320] outline-none text-xs"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/50 rounded-md overflow-hidden flex flex-col p-5 gap-3"
            >
              {/* Header row skeleton */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-36 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                    <div className="h-2.5 w-20 rounded-full bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-12 rounded bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
              </div>

              {/* Content preview lines skeleton */}
              <div className="bg-slate-50 dark:bg-[#151624]/40 border border-slate-100 dark:border-slate-800/30 rounded p-3 space-y-1.5">
                <div className="h-2 w-full rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                <div className="h-2 w-5/6 rounded bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                <div className="h-2 w-4/6 rounded bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
                <div className="h-2 w-3/4 rounded bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              </div>

              {/* Footer row skeleton */}
              <div className="pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                <div className="h-2 w-28 rounded bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-7 w-7 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <Card className="border-dashed border-slate-200 dark:border-slate-800 rounded-md p-10 text-center text-slate-400 bg-white dark:bg-[#121320]">
          <Layers className="h-12 w-12 mx-auto opacity-30 mb-2" />
          <p className="text-xs font-bold">No matching templates found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your category filter, changing search keywords, or create a brand new template.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item: any) => {
            const isSeed = item.id.toString().startsWith('default-');
            return (
              <Card
                key={item.id}
                className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/50 rounded-md overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                <CardContent className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <Badge className={`text-[9px] font-bold mt-1 shadow-none border px-2 py-0.5 rounded-md ${getCategoryBadgeStyle(item.category)}`}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                      </div>
                    </div>
                    {isSeed && (
                      <Badge className="bg-amber-100/80 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 font-bold border border-amber-200/50 shadow-none text-[8px] rounded-md uppercase">
                        Default
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-450 dark:text-slate-400 font-semibold line-clamp-4 bg-slate-50 dark:bg-[#151624]/40 p-3 rounded border border-slate-100 dark:border-slate-800/30 font-mono">
                    {item.content}
                  </p>

                  <div className="pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">
                      {isSeed ? 'Ready-only default system preset' : `Updated ${new Date(item.updated_at).toLocaleDateString()}`}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => handleCopy(item.id, item.content)}
                        title="Copy Template Content"
                        className="h-7 w-7 p-0 border border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded cursor-pointer"
                      >
                        {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        onClick={() => setViewingTemplate(item)}
                        title="Preview"
                        className="h-7 w-7 p-0 border border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => {
                          setSendingTemplate(item);
                          const vars = extractPlaceholders(item.content);
                          setParsedVariables(vars);
                          setSelectedEmployeeId('');
                          setCustomSubject(`Document: ${item.name}`);
                          
                          const initialVars: Record<string, string> = {};
                          vars.forEach(v => {
                            if (v === 'organization_name') {
                              initialVars[v] = orgName;
                            } else {
                              initialVars[v] = '';
                            }
                          });
                          setTemplateVariables(initialVars);
                        }}
                        title="Send Document to Employee"
                        className="h-7 w-7 p-0 border border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      {!isSeed && (
                        <>
                          <Button
                            onClick={() => {
                              setEditingTemplate(item);
                              setForm({
                                name: item.name,
                                category: item.category,
                                content: item.content
                              });
                            }}
                            title="Edit"
                            className="h-7 w-7 p-0 border border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm('Are you sure you want to hard delete this customized template?')) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                            title="Delete"
                            className="h-7 w-7 p-0 border border-red-200/50 bg-transparent text-red-500 hover:bg-red-500/5 rounded cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Custom Template Dialog */}
      <NewTemplateDialog
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />

      {/* Edit Custom Template Dialog */}
      <EditTemplateDialog
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        form={form}
        setForm={setForm}
        onSubmit={(data) => updateMutation.mutate({ id: editingTemplate.id, data })}
        isPending={updateMutation.isPending}
      />

      {/* Preview Dialog */}
      <PreviewTemplateDialog
        isOpen={!!viewingTemplate}
        onClose={() => setViewingTemplate(null)}
        template={viewingTemplate}
        orgName={orgName}
        onCopy={handleCopy}
        copiedId={copiedId}
        getCategoryLabel={getCategoryLabel}
        getCategoryBadgeStyle={getCategoryBadgeStyle}
      />

      {/* Send Template to Employee Dialog */}
      <SendTemplateDialog
        isOpen={!!sendingTemplate}
        onClose={() => setSendingTemplate(null)}
        sendingTemplate={sendingTemplate}
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        onEmployeeSelect={handleEmployeeSelect}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        isFetchingPayroll={isFetchingPayroll}
        customSubject={customSubject}
        setCustomSubject={setCustomSubject}
        parsedVariables={parsedVariables}
        templateVariables={templateVariables}
        onVariableChange={handleVariableChange}
        onSend={handleSendEmail}
        isPending={sendTemplateMutation.isPending}
        selectedDesign={selectedDesign}
        onDesignChange={setSelectedDesign}
      />
    </div>
  );
}
