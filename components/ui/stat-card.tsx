import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

const StatCard = ({ value, label, className }: StatCardProps) => {
  return (
    <div className={cn("text-center", className)}>
      <p className="text-4xl font-bold text-light-purple text-glow">{value}</p>
      <p className="text-gray-400 uppercase tracking-wider text-xs mt-1">{label}</p>
    </div>
  );
};

export default StatCard;
