import React from 'react';
import { Info } from 'lucide-react';

export const CreditCostRates: React.FC = () => {
  return (
    <div className="bg-card border border-border rounded-sm p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Info className="w-4 h-4 text-[#0a66c2]" />
        <h3 className="text-sm font-semibold text-foreground">AI Cost Rates</h3>
      </div>

      <ul className="space-y-3 text-xs">
        <li className="flex justify-between items-start gap-3">
          <div>
            <h5 className="font-semibold text-foreground">Full Hiring Workflow</h5>
            <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Autonomous recruiter end-to-end</p>
          </div>
          <span className="font-semibold text-rose-500 shrink-0">150 credits / run</span>
        </li>
        <li className="flex justify-between items-start gap-3 border-t border-border/40 pt-3">
          <div>
            <h5 className="font-semibold text-foreground">Recruitment Agent</h5>
            <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Autonomous candidate source/handover</p>
          </div>
          <span className="font-semibold text-rose-500 shrink-0">10 credits / run</span>
        </li>
        <li className="flex justify-between items-start gap-3 border-t border-border/40 pt-3">
          <div>
            <h5 className="font-semibold text-foreground">Resume Screening</h5>
            <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">AI candidate evaluation & scoring</p>
          </div>
          <span className="font-semibold text-rose-500 shrink-0">1 credit / resume</span>
        </li>
        <li className="flex justify-between items-start gap-3 border-t border-border/40 pt-3">
          <div>
            <h5 className="font-semibold text-foreground">Question Generation</h5>
            <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">AI question generation for rounds</p>
          </div>
          <span className="font-semibold text-rose-500 shrink-0">2 credits / question</span>
        </li>
        <li className="flex justify-between items-start gap-3 border-t border-border/40 pt-3">
          <div>
            <h5 className="font-semibold text-foreground">Question Evaluation</h5>
            <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">AI scoring of candidate responses</p>
          </div>
          <span className="font-semibold text-rose-500 shrink-0">1 credit / question</span>
        </li>
      </ul>
    </div>
  );
};
