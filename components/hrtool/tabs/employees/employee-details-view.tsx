'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrOrgService, hrEmployeeService } from '@/services/hr';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  User, Shield, Loader2, Save, ArrowLeft, Send
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EmployeePersonalTab } from './details/employee-personal-tab';
import { EmployeeStatutoryTab } from './details/employee-statutory-tab';

interface EmployeeDetailsViewProps {
  employeeId: string;
  onBack: () => void;
}

export function EmployeeDetailsView({ employeeId, onBack }: EmployeeDetailsViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'personal' | 'statutory'>('personal');
  const [showPassword, setShowPassword] = useState(false);

  // Fetch full details from backend
  const { data: detailRes, isLoading: detailsLoading } = useQuery({
    queryKey: ['employee-detail', employeeId],
    queryFn: () => hrEmployeeService.getEmployeeDetail(employeeId),
    enabled: !!employeeId,
  });

  const { data: designationsRes } = useQuery({
    queryKey: ['designations'],
    queryFn: () => hrOrgService.getDesignations(),
  });

  const { data: departmentsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => hrOrgService.getDepartments(),
  });

  const { data: managersRes } = useQuery({
    queryKey: ['active-managers-list'],
    queryFn: () => hrEmployeeService.getEmployees({ role: 'MANAGER', page_size: 100 }),
  });

  const designations = designationsRes?.data?.results || [];
  const departments = departmentsRes?.data?.results || [];
  const managers = managersRes?.data?.results || [];
  const employee = detailRes?.data;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    salary: '',
    employment_type: 'FULL_TIME',
    address: '',
    status: 'ACTIVE',
    role: 'EMPLOYEE',
    designation: '',
    employee_id: '',
    department: '',
    reporting_manager: '',

    // Aadhaar
    aadhaar_number: '',
    aadhaar_enrollment_no: '',
    aadhaar_verified: false,

    // PAN
    pan_number: '',
    pan_verified: false,

    // Joining details
    joining_date: '',
    probation_period: '3 Months',
    confirmation_date: '',

    // Bank Details
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    branch_name: '',
    password: '',
    portal_username: '',
  });

  // Sync state with details when loaded
  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        salary: employee.salary ? String(employee.salary) : '',
        employment_type: employee.employment_type || 'FULL_TIME',
        address: employee.address || '',
        status: employee.status || 'ACTIVE',
        role: employee.role || 'EMPLOYEE',
        designation: employee.designation || '',
        employee_id: employee.employee_id || '',
        department: employee.department || '',
        reporting_manager: employee.reporting_manager || '',

        aadhaar_number: employee.aadhaar_detail?.aadhaar_number || '',
        aadhaar_enrollment_no: employee.aadhaar_detail?.aadhaar_enrollment_no || '',
        aadhaar_verified: !!employee.aadhaar_detail?.aadhaar_verified,

        pan_number: employee.pan_detail?.pan_number || '',
        pan_verified: !!employee.pan_detail?.pan_verified,

        joining_date: employee.joining_detail?.joining_date || employee.joining_date || '',
        probation_period: employee.joining_detail?.probation_period || '3 Months',
        confirmation_date: employee.joining_detail?.confirmation_date || '',

        bank_name: employee.bank_detail?.bank_name || '',
        account_number: employee.bank_detail?.account_number || '',
        ifsc_code: employee.bank_detail?.ifsc_code || '',
        account_holder_name: employee.bank_detail?.account_holder_name || '',
        branch_name: employee.bank_detail?.branch_name || '',
        password: employee.portal_password || '',
        portal_username: employee.portal_username || '',
      });
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const updateMutation = useMutation({
    mutationFn: (payload: any) => hrEmployeeService.updateEmployee(employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-detail', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee profile updated successfully');
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.email?.[0] || 
                       err.response?.data?.employee_id?.[0] || 
                       err.response?.data?.message || 
                       err.message || 
                       'Failed to update employee';
      toast.error(errorMsg);
    }
  });

  const sendCredentialsMutation = useMutation({
    mutationFn: () => hrEmployeeService.sendCredentials(employeeId),
    onSuccess: (res: any) => {
      if (res?.data?.sent) {
        toast.success(`Credentials email dispatched successfully to ${res.data.email}`);
      } else {
        toast.info(`Email registered: ${res?.data?.email}. Portal link: ${res?.data?.login_url}`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to dispatch credentials email.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      salary: formData.salary ? Number(formData.salary) : null,
      employment_type: formData.employment_type,
      address: formData.address,
      status: formData.status,
      role: formData.role,
      designation: formData.designation || null,
      employee_id: formData.employee_id,
      department: formData.department || null,
      reporting_manager: formData.reporting_manager || null,

      aadhaar_detail: {
        aadhaar_number: formData.aadhaar_number,
        aadhaar_enrollment_no: formData.aadhaar_enrollment_no,
        aadhaar_verified: formData.aadhaar_verified
      },

      pan_detail: {
        pan_number: formData.pan_number,
        pan_verified: formData.pan_verified
      },

      joining_detail: {
        joining_date: formData.joining_date || null,
        probation_period: formData.probation_period,
        confirmation_date: formData.confirmation_date || null
      },

      bank_detail: {
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,
        account_holder_name: formData.account_holder_name,
        branch_name: formData.branch_name
      }
    };

    if (formData.password) {
      payload.password = formData.password;
    }
    if (formData.portal_username) {
      payload.portal_username = formData.portal_username;
    }

    updateMutation.mutate(payload);
  };

  if (detailsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#0a66c2]" />
          <p className="text-sm font-semibold text-muted-foreground">Loading employee record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-sm border-border bg-white text-muted-foreground hover:bg-muted font-bold text-xs gap-2"
          data-agent="employee-back-button"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => sendCredentialsMutation.mutate()}
            disabled={sendCredentialsMutation.isPending}
            className="rounded-sm border-border bg-white text-[#0a66c2] hover:bg-[#0a66c2]/5 font-bold text-xs gap-2 shadow-sm"
            data-agent="employee-dispatch-credentials-btn"
          >
            {sendCredentialsMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send Portal Access Email
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="rounded-sm bg-[#0a66c2] text-white hover:bg-[#084e96] font-bold text-xs gap-2 shadow-sm"
            data-agent="employee-save-changes-btn"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Profile
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card className="border-border/40 bg-card rounded-sm shadow-sm overflow-hidden">
            {/* Header section in card */}
            <div className="bg-muted/30 p-6 border-b border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <Avatar className="h-16 w-16 border border-border/60 shadow-md rounded-sm">
                  <AvatarImage src={employee?.avatar} className="rounded-sm" />
                  <AvatarFallback className="bg-blue-500/10 text-[#0a66c2] font-bold text-lg rounded-sm">
                    {formData.first_name[0] || 'N'}{formData.last_name[0] || 'E'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      {formData.first_name} {formData.last_name}
                    </h3>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      {formData.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-[#0a66c2]/80 mt-0.5">
                    {employee?.role === 'MANAGER' ? 'Manager' : (employee?.designation_detail?.title || 'Team Member')} • {employee?.department_detail?.name || 'Operations'}
                    {employee?.reporting_manager_detail && ` • Reports To: ${employee.reporting_manager_detail.first_name} ${employee.reporting_manager_detail.last_name}`}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    ID: {employee?.employee_id || 'TEMP'}
                  </p>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center bg-muted/50 p-1 rounded-[6px] border border-border/20 h-9">
                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className={cn(
                    "px-4 py-1 rounded-[6px] text-[10px] font-bold transition-all whitespace-nowrap h-full flex items-center gap-1",
                    activeTab === 'personal'
                      ? "bg-white text-[#0a66c2] shadow-sm border border-border/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/30"
                  )}
                  data-agent="employee-tab-personal-btn"
                >
                  <User className="h-3 w-3" /> Personal Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('statutory')}
                  className={cn(
                    "px-4 py-1 rounded-[6px] text-[10px] font-bold transition-all whitespace-nowrap h-full flex items-center gap-1",
                    activeTab === 'statutory'
                      ? "bg-white text-[#0a66c2] shadow-sm border border-border/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/30"
                  )}
                  data-agent="employee-tab-statutory-btn"
                >
                  <Shield className="h-3 w-3" /> Statutory & Onboarding
                </button>
              </div>
            </div>

            <CardContent className="p-6">
              {activeTab === 'personal' ? (
                <EmployeePersonalTab
                  formData={formData}
                  handleChange={handleChange}
                  designations={designations}
                  departments={departments}
                  managers={managers}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              ) : (
                <EmployeeStatutoryTab
                  formData={formData}
                  handleChange={handleChange}
                  handleCheckboxChange={handleCheckboxChange}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
