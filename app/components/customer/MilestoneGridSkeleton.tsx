export const MilestoneGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      {[1,2,4,5,6,7,8,9].map((item) => (
        <div
          key={item}
          className="p-5 rounded-[2rem] bg-[#111111] border border-white/10 flex flex-col items-center shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="mb-3 p-2 rounded-xl bg-white/5 w-9 h-9 shrink-0" />

          <div className="h-2 w-12 bg-white/10 rounded-full mb-3" />

          <div className="h-8 w-10 bg-white/20 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
