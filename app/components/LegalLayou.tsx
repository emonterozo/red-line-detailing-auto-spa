import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function LegalLayout({ title, children }: Readonly<{ title: string, children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#030303] text-white p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-[#dc143c] mb-8 transition-colors text-xs uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Back to Login
        </Link>
        <h1 className="font-russo text-3xl md:text-4xl mb-8 text-[#dc143c] uppercase tracking-tight">
          {title}
        </h1>
        <div className="prose prose-invert prose-red max-w-none text-gray-400 leading-relaxed space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}