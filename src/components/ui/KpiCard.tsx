import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  change?: string;
  positive?: boolean;
}

export default function KpiCard({ title, value, subtitle, icon: Icon, iconColor = "bg-blue-50 text-blue-600", change, positive }: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          {change && (
            <p className={cn("text-xs mt-1 font-medium", positive ? "text-green-600" : "text-red-600")}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ml-3", iconColor)}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}
