const ServiceSkeleton = () => {
  return (
    <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 lg:p-10">
      <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 animate-pulse" />

      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-white/10 animate-pulse shadow-lg" />
      </div>

      <div className="h-7 w-3/4 bg-white/10 rounded-lg mb-4 animate-pulse" />

      <div className="space-y-3 mb-8">
        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
      </div>

      <div className="h-[56px] w-full sm:w-[180px] bg-white/10 rounded-xl animate-pulse" />
    </div>
  );
};

export default ServiceSkeleton;
