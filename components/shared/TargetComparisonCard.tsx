import React from "react";
import { Target } from "lucide-react";
import { formatBigNumber } from "@/lib/formatters";

interface TargetComparisonCardProps {
  label: string;
  actual: number;
  target: number;
  prefix?: string;
  suffix?: string;
  inverse?: boolean;
}

export default function TargetComparisonCard({
  label,
  actual,
  target,
  prefix = "",
  suffix = "",
  inverse = false,
}: TargetComparisonCardProps) {
  const diff = actual - target;
  const isAchieved = inverse ? diff <= 0 : diff >= 0;
  const achievementPct = target > 0 ? (actual / target) * 100 : 0;
  const colorClass = isAchieved ? "text-green-600" : "text-destructive";
  const bgClass = isAchieved ? "bg-green-600" : "bg-primary";

  return (
    <div className="flex flex-col p-3 bg-muted/20 rounded-xl border border-border/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
        <Target size={12} className="text-muted-foreground/70" />
      </div>
      <span className="text-sm font-bold text-foreground">
        {prefix && `${prefix} `}
        {formatBigNumber(actual)}
        {suffix && `${suffix}`}
      </span>
      <div className="flex flex-col mt-1.5 gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground">
            Target: {prefix && `${prefix} `}
            {formatBigNumber(target)}
            {suffix && `${suffix}`}
          </span>
          <span className={`font-bold text-[10px] ${colorClass}`}>
            {achievementPct.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-border/50 rounded-full h-1 overflow-hidden">
          <div
            className={`h-1 rounded-full ${bgClass}`}
            style={{ width: `${Math.min(achievementPct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
