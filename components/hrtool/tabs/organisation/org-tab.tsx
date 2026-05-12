'use client';

import { useQuery } from '@tanstack/react-query';
import { hrmsService } from '@/services/hrms.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Users, Shield, Map, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function OrgTab() {
  const { data: departments, isLoading: deptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => hrmsService.getDepartments(),
  });

  const { data: designations, isLoading: desigLoading } = useQuery({
    queryKey: ['designations'],
    queryFn: () => hrmsService.getDesignations(),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Structure</h2>
          <p className="text-sm text-muted-foreground">Manage departments, designations, and company hierarchy.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-xs h-9 border-border/50">
            <Map className="mr-2 h-4 w-4" /> Org Chart
          </Button>
          <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white h-9 text-xs rounded-sm">
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Departments */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Departments
            </h3>
            <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[10px] rounded-sm">
              {departments?.data?.results?.length || 0} Total
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {departments?.data?.results?.map((dept: any) => (
              <Card key={dept.id} className="bg-card/50 border-border/50 hover:bg-muted/30 transition-all cursor-pointer group rounded-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{dept.name}</h4>
                      <p className="text-xs text-muted-foreground">{dept.employee_count || 0} Employees</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-sm h-8 w-8">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Designations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Designations
            </h3>
            <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[10px] rounded-sm">
              {designations?.data?.results?.length || 0} Total
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {designations?.data?.results?.map((desig: any) => (
              <Card key={desig.id} className="bg-card/50 border-border/50 hover:bg-muted/30 transition-all cursor-pointer group rounded-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{desig.title}</h4>
                      <p className="text-xs text-muted-foreground">{desig.employee_count || 0} People assigned</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-sm h-8 w-8">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
