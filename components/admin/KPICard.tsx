import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
}

export default function KPICard({
  title,
  value,
  change,
  icon: Icon,
  color = '#4CB5F9',
  subtitle,
}: KPICardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 flex items-start gap-4">
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={22} style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-petfy-grey-text text-sm font-medium truncate">{title}</p>
        <p className="text-2xl font-extrabold text-navy mt-1 leading-tight">{value}</p>

        {subtitle && (
          <p className="text-xs text-petfy-grey-text mt-0.5">{subtitle}</p>
        )}

        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-petfy-grey-text'
          }`}>
            {isPositive ? (
              <TrendingUp size={13} />
            ) : isNegative ? (
              <TrendingDown size={13} />
            ) : (
              <Minus size={13} />
            )}
            <span>
              {isPositive ? '+' : ''}{change.toFixed(1)}% vs período anterior
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
