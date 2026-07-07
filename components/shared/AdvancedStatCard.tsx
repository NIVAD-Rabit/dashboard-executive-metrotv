import React from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { formatBigNumber } from "@/lib/formatters";

interface AdvancedStatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isUp: boolean;
  percentage: number;
  inverse?: boolean;
  periodLabel?: string;
}

export default function AdvancedStatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  isUp,
  percentage,
  inverse = false,
  periodLabel = "vs Prev",
}: AdvancedStatCardProps) {
  const isGood = inverse ? !isUp : isUp;
  const colorClass = isGood ? "text-green-600" : "text-destructive";

  return (
    <div className="flex flex-col p-3 bg-muted/20 rounded-xl border border-border/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
        <Activity size={12} className="text-muted-foreground/70" />
      </div>
      <span className="text-sm font-bold text-foreground">
        {prefix && `${prefix} `}
        {formatBigNumber(value)}
        {suffix && `${suffix}`}
      </span>
      <div className="flex flex-col mt-1.5 gap-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground">
            {periodLabel}
          </span>
          <span
            className={`flex items-center gap-0.5 font-bold text-[10px] ${colorClass}`}
          >
            {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
