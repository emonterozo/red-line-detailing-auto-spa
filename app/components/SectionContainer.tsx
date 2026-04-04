import { Activity } from "lucide-react";

type SectionContainerProps = {
  id: string;
  title: string;
  secondaryTitle: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  showAmbientGlow?: boolean;
};

const SectionContainer = ({
  id,
  title,
  secondaryTitle,
  description,
  children,
  className = "relative py-20 lg:py-32 bg-black overflow-hidden",
  showAmbientGlow = false,
}: SectionContainerProps) => {
  return (
    <section id={id} className={`${className} relative`}>
      {/* 1. BACKGROUND LAYER - Pushed to the very back using z-0 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {showAmbientGlow && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a0508_0%,#050505_100%)]" />
        )}

        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#dc143c]/15 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#dc143c]/10 blur-[150px] rounded-full animate-pulse delay-700" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)]" />
      </div>

      {/* 2. CONTENT LAYER - No z-index here! This is the secret. */}
      {/* We use 'relative' only to ensure it sits 'above' the absolute background div naturally */}
      <div className="relative">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-russo text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
            {title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-[#ff4d6d] to-[#dc143c] bg-[length:200%_auto] animate-gradient">
              {secondaryTitle}
            </span>
          </h2>

          <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]" />
            <Activity className="w-4 h-4 text-[#dc143c] animate-pulse" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]" />
          </div>
        </div>

        {/* Children/Form - Now your Modals can 'escape' this section again */}
        {children}
      </div>
    </section>
  );
};

export default SectionContainer;
