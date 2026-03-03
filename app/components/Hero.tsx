import Image from "next/image";
import Link from "next/link";

import Header from "./Header";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-black font-sans overflow-hidden">
      <Header />
      <section className="relative h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Luxury Car Detailing"
            fill
            style={{ objectFit: "cover" }}
            quality={80}
            priority
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60 lg:via-black/85 lg:to-black/40"></div>
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-[15%] right-0 lg:right-10 w-48 lg:w-72 h-48 lg:h-72 bg-['#dc143c'] rounded-full blur-[100px] lg:blur-[150px] opacity-20 lg:opacity-20"></div>
        <div className="absolute bottom-[20%] left-0 lg:left-10 w-32 lg:w-48 h-32 lg:h-48 bg-['#dc143c'] rounded-full blur-[80px] lg:blur-[100px] opacity-10"></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center">
          {/* Left Content */}
          <div className="flex-1 space-y-4 lg:space-y-6 pt-10 lg:pt-0">
            {/* Luxury Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 bg-[#dc143c] rounded-full animate-pulse shadow-[0_0_10px_#dc143c]"></span>
              <span className="font-russo text-white/90 text-xs sm:text-sm font-medium tracking-widest uppercase">
                Premium Auto Care
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-russo text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] lg:leading-[1.1] tracking-tight">
              Precision. Passion. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-red-500 to-[#dc143c] bg-[length:200%_auto] animate-gradient">
                Perfection.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl max-w-lg lg:max-w-xl leading-relaxed">
             We specialize in paint-safe detailing using premium techniques and products. Every vehicle is treated with meticulous care, keeping your paint protected, flawless, and looking its best — no shortcuts, no compromise.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Link
                href="/booking"
                className="group bg-[#dc143c] hover:bg-red-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-xl transition duration-300 shadow-[0_0_30px_rgba(220,20,60,0.3)] hover:shadow-[0_0_40px_rgba(220,20,60,0.5)] flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                Book a Service
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            {/* Location Info - Stack on mobile, row on desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 lg:pt-6">
              {/* Location Card */}
              <div className="flex items-center gap-3 sm:gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#dc143c]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 sm:w-6 h-5 sm:h-6 text-[#dc143c]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">
                    Location
                  </p>
                  <p className="text-white font-semibold text-sm sm:text-base truncate">
                    Loma de Gato Marilao Bulacan
                  </p>
                </div>
              </div>

              {/* Service Type */}
              <div className="flex items-center gap-3 sm:gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#dc143c]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 sm:w-6 h-5 sm:h-6 text-[#dc143c]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">
                    Service
                  </p>
                  <p className="text-white font-semibold text-sm sm:text-base truncate">
                    On-the-Go Auto Care
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Fixed at bottom front */}
        <div className="hidden md:flex absolute bottom-6 right-4 z-20">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/50 text-xs uppercase tracking-widest">
              Scroll
            </span>
            <div className="w-8 h-14 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5 bg-black/20 backdrop-blur-sm ">
              <div className="w-1.5 h-3 bg-[#dc143c] rounded-full  shadow-[0_0_10px_#dc143c]"></div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      </section>
    </section>
  );
};

export default Hero;
