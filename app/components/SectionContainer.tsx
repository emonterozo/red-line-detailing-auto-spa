
type SectionContainerProps = {
  id: string;
  title: string;
  secondaryTitle: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

const SectionContainer = ({
  id,
  title,
  secondaryTitle,
  description,
  children,
  className = "relative py-20 lg:py-32 bg-black overflow-hidden",
}: SectionContainerProps) => {
  return (
    <section
      id={id}
      className={className}
    >
      {/* Section Header */}
      <div className="text-center mb-16 md:mb-20">
        <h2 className="font-russo text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
          {`${title}`}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-red-500 to-[#dc143c] bg-[length:200%_auto]">
            {secondaryTitle}
          </span>
        </h2>

        <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#dc143c]"></div>
          <div className="w-2 h-2 rotate-45 bg-[#dc143c]"></div>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#dc143c]"></div>
        </div>
      </div>

      {children}
    </section>
  );
};

export default SectionContainer;
