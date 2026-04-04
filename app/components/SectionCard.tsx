export function SectionCard({
  icon,
  title,
  subtitle,
  children,
  last,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  last?: boolean;
}>) {
  return (
    <div className="relative">
      {!last && (
        <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-[#dc143c]/40 to-transparent z-0" />
      )}
      <div className="relative z-10 flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#dc143c] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#dc143c]/40">
          <span className="w-4 h-4">{icon}</span>
        </div>

        <div className="flex-1 pb-10">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-lg leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}