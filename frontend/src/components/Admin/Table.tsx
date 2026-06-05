// ─── Table wrapper ────────────────────────────────────────────
 export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto  rounded-2xl border border-white/8">
      <table className="w-full text-sm text-right">{children}</table>
    </div>
  );
}
export function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-xs text-gray-500 font-semibold bg-white/3 whitespace-nowrap">{children}</th>;
}
export function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3.5 border-t border-white/5 text-sm ${className}`}>{children}</td>;
}