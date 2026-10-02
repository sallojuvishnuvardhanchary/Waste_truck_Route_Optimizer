import React from 'react';

export default function QuickStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  badge = null
}) {
  const colorMap = {
    emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400',
    cyan: 'from-cyan-500/10 to-blue-500/5 border-cyan-500/20 text-cyan-400',
    amber: 'from-amber-500/10 to-yellow-500/5 border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/10 to-indigo-500/5 border-purple-500/20 text-purple-400',
    rose: 'from-rose-500/10 to-red-500/5 border-rose-500/20 text-rose-400'
  };

  const selectedColor = colorMap[color] || colorMap.emerald;

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedColor} border backdrop-blur-sm shadow-lg flex flex-col justify-between`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-current">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="my-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <span className="text-[11px] text-slate-400 truncate">{subtitle}</span>
      )}
    </div>
  );
}
