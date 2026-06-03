const ICONS = { 1:"🩸", 2:"💆", 3:"✨", 4:"🏃", 5:"🦾", 6:"🧘" };

export function SessionCard({ session, selected, onSelect }) {
  const icon = ICONS[session.id] ?? "🏥";
  return (
    <button
      type="button"
      onClick={() => onSelect(session)}
      className={`w-full text-right p-5 rounded-2xl border transition-all duration-200 group
        ${selected
          ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/40"
          : "border-white/10 bg-white/5 hover:border-emerald-500/40 hover:bg-white/8"
        }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
          ${selected ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-white/8 border border-white/10"}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-white text-sm">{session.name_ar}</span>
            {selected && (
              <span className="text-emerald-400 text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ✓ محدد
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs leading-relaxed mb-3">{session.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold text-base">{session.price} <span className="text-xs font-normal">ر.س</span></span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-500 text-xs">⏱ {session.duration_minutes} دقيقة</span>
          </div>
        </div>
      </div>
    </button>
  );
}
