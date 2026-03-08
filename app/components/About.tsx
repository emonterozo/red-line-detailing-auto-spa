import SectionContainer from "./SectionContainer";

const About = () => {
  return (
    <SectionContainer
      id="about"
      title="Redefining"
      secondaryTitle="Perfection"
      description=""
    >
      {/* Main Description */}
      <div className="text-center mb-12">
        <p className="text-white text-xl sm:text-2xl font-semibold leading-relaxed max-w-3xl mx-auto">
          {`We don't just clean vehicles — we refine, protect, and elevate them
          beyond the ordinary.`}
        </p>
      </div>

      {/* Cards Container - Side by Side on Tablet+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mx-4 md:mx-10">
        {/* Expert Team Card */}
        <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-[#dc143c]/40 transition-all duration-500 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#dc143c]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#dc143c]/20 transition-color">
            <svg
              className="w-8 h-8 text-[#dc143c]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>

          {/* Content */}
          <div>
            <h3 className="font-russo text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-[#dc143c] transition-colors">
              Passionate Team
            </h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Our team is passionate about car detailing and takes pride in every vehicle we service. We focus on precision, care, and attention to every detail to ensure each car leaves looking its best. Every job is handled with dedication and professionalism.
            </p>
          </div>
        </div>

        <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-[#dc143c]/40 transition-all duration-500 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#dc143c]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#dc143c]/20 transition-color">
            <svg
              className="w-8 h-8 text-[#dc143c]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>

          {/* Content */}
          <div>
            <h3 className="font-russo text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-[#dc143c] transition-colors">
              Our Commitment
            </h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              At Red Line, quality and professionalism aren’t just goals—they’re
              a standard. Every job reflects our dedication to excellence and
              meticulous attention. We believe true craftsmanship shows in the
              details, and that’s what sets us apart.
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default About;
