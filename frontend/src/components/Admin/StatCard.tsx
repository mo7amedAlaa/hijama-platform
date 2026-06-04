interface StatCardProps {
  icon: string; label: string; value: number | string;
  color?: string; sub?: string; onClick?: () => void;
}
export default function StatCard({ icon, label, value, color = "#00C9A7", sub, onClick }: StatCardProps) {
  return (
    <button onClick={onClick} className="w-full text-right bg-[#111E33] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {icon}
        </div>
        <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">←</span>
      </div>
      <div className="text-2xl font-black mb-1" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: `${color}80` }}>{sub}</div>}
    </button>
  );
}