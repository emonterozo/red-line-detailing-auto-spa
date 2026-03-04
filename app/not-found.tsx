import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Grid Effect (Optional) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,20,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,20,60,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="z-10 text-center px-4 sm:px-6 md:px-8 w-full max-w-4xl mx-auto">
        {/* 404 Graphic */}
        <h1 className="text-[8rem] sm:text-[10rem] md:text-[12rem] leading-none font-russo text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 drop-shadow-[0_0_30px_rgba(220,20,60,0.5)]">
          404
        </h1>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-russo uppercase tracking-widest mb-4 sm:mb-6">
          Page <span className="text-[#dc143c]">Not Found</span>
        </h2>

        {/* Description */}
        <p className="font-poppins text-gray-400 text-base sm:text-lg md:text-xl max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
          Oops! The page you’re looking for doesn’t exist. It may have been moved, deleted, or never existed in the first place.
        </p>

        {/* Button */}
        <Link 
          href="/" 
          className="inline-block bg-[#dc143c] hover:bg-red-700 text-white font-russo py-3 sm:py-4 px-6 sm:px-10 rounded-xl transition duration-300 shadow-[0_0_30px_rgba(220,20,60,0.3)] hover:shadow-[0_0_40px_rgba(220,20,60,0.5)] flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base w-full sm:w-auto"
        >
          Return to Base
        </Link>
      </div>
    </div>
  );
}