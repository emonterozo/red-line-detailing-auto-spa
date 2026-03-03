import Link from "next/link";

const Footer = () => {
  return (
    <div>
      <div className="grid grid-cols-1  md:grid-cols-2">
        <div className="flex flex-col align-items-start justify-center gap-3 p-5">
          <h3 className="font-russo text-white font-bold text-xl tracking-wide text-center md:text-left">
            Store Information
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#dc143c]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-[#dc143c]"
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
            <div>
              <p className="text-white font-medium">
                Loma de Gato, Marilao Bulacan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#dc143c]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-[#dc143c]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <a className="text-white font-medium hover:text-[#dc143c] transition-colors">
                +63 912 201 1108
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <h3 className="font-russo text-white font-bold text-xl tracking-wide text-center md:text-left">
            Follow Us
          </h3>
          <div className="flex items-center justify-around md:justify-start md:gap-10">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-13 h-13 bg-white/5 hover:bg-[#dc143c] border border-white/10 hover:border-[#dc143c] rounded-full flex items-center justify-center transition-all duration-300 group"
            >
              <svg
                className="w-8 h-8 text-white group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-13 h-13 bg-white/5 hover:bg-[#dc143c] border border-white/10 hover:border-[#dc143c] rounded-full flex items-center justify-center transition-all duration-300 group"
            >
              <svg
                className="w-8 h-8 text-white group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-13 h-13 bg-white/5 hover:bg-[#dc143c] border border-white/10 hover:border-[#dc143c] rounded-full flex items-center justify-center transition-all duration-300 group"
            >
              <svg
                className="w-8 h-8 text-white group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-3 p-5 text-center md:text-left">
            <Link
              href="/policy"
              className="text-sm text-gray-500 hover:text-[#dc143c] transition-colors md:order-2 md:text-right order-1"
            >
             Booking Policy
            </Link>
            <p className="text-gray-500 text-sm md:order-1 md:text-left order-2">
              © {new Date().getFullYear()} Red Line Detailing & Auto Spa. All
              Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
