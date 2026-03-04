const StatisticsCard = ({
  title,
  count,
  breakdown,
}: {
  title: string;
  count: number;
  breakdown?: { label: string; value: number }[];
}) => (
  <div className="group relative bg-neutral-900 border border-neutral-800 border-l-4 border-l-[#dc143c] p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300">
    <h3 className="font-russo text-neutral-400 text-xs uppercase tracking-widest font-semibold mb-2">
      {title}
    </h3>
    <div className="text-4xl font-bold text-white mb-5">
      {count.toLocaleString()}
    </div>
    {breakdown && (
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 scrollbar">
          {breakdown.map((item) => (
            <div
              key={item.label}
              className="snap-start shrink-0 px-5 py-2 rounded-full bg-gradient-to-br 
              from-[#DC143C] to-[#8B0E2A] 
              border border-[#DC143C]/40 
              text-white text-sm tracking-wide font-medium 
              shadow-[0_4px_20px_rgba(220,20,60,0.35)]
              hover:scale-105 hover:shadow-[0_6px_24px_rgba(220,20,60,0.55)]
              transition-all duration-300 cursor-default"
            >
              <span className="opacity-80">{item.label}</span>
              <span className="mx-2 opacity-50">•</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default StatisticsCard;