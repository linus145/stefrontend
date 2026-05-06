'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { jobsService } from '@/services/jobs.service';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';

export function CompanyLoginForm() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGeneralError(null);

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            const newErrors: Record<string, string[]> = {};
            if (!trimmedEmail) newErrors.email = ['Email is required'];
            if (!trimmedPassword) newErrors.password = ['Password is required'];
            setErrors(newErrors);
            toast.error('Required fields are missing', {
                description: 'Please enter both your email and password to sign in.'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await jobsService.companyLogin({ email: trimmedEmail, password: trimmedPassword });
            toast.success('Company login successful!');
            window.location.href = '/recruiter';
        } catch (error: any) {
            if (error.data && typeof error.data === 'object') {
                setErrors(error.data);
                if (error.data.detail || error.data.non_field_errors) {
                    setGeneralError(error.data.detail || error.data.non_field_errors[0]);
                }
            } else {
                setGeneralError(error.message || 'Invalid credentials.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto pb-12">
            <div className="relative w-full rounded-sm bg-card shadow-sm hover:shadow-md transition-shadow border border-border overflow-hidden">

                {/* Top gradient — teal accent for recruiter branding */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-90" />

                <div className="p-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <h2 className="text-[17px] font-semibold text-foreground text-center mb-2">Company Login</h2>
                    <p className="text-xs text-muted-foreground text-center mb-8">Sign in to your recruiter account</p>

                    {generalError && (
                        <div className="mb-6 p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                            {generalError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="founder@ste.io"
                                    disabled={isSubmitting}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full rounded-sm bg-muted/50 border ${errors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-border'} text-foreground pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground/70`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-[10px] font-medium text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {errors.email[0]}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="password">
                                    Password
                                </label>
                                <Link href="#" className="text-[10px] text-blue-500 hover:text-blue-600 hover:underline transition-all">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    disabled={isSubmitting}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full rounded-sm bg-muted/50 border ${errors.password ? 'border-red-400 ring-1 ring-red-400' : 'border-border'} text-foreground pl-10 pr-10 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground/70`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[10px] font-medium text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {errors.password[0]}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In as Company'}
                            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/recruiter/register" className="font-medium text-foreground hover:text-blue-500 transition-colors">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
