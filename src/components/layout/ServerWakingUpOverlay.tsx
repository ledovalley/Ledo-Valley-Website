"use client";

import React from "react";
import { useUI } from "@/context/UIContext";
import { Loader2, Coffee } from "lucide-react";

export default function ServerWakingUpOverlay() {
  const { isServerWakingUp } = useUI();

  if (!isServerWakingUp) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-brand-primary/95 backdrop-blur-md animate-in fade-in duration-500">
      
      {/* Soft Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 text-center shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Animated Icon Section */}
        <div className="relative flex justify-center mb-8">
          <div className="relative">
            <Coffee size={48} className="text-golden animate-bounce" />
            <Loader2 
              size={84} 
              className="absolute -top-4 -left-4 text-white/20 animate-spin-slow" 
              strokeWidth={1}
            />
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl sm:text-3xl font-playfair text-white font-semibold mb-4 tracking-wide">
          Brewing Excellence
        </h2>
        
        <div className="space-y-4">
          <p className="text-white/80 leading-relaxed text-sm sm:text-base">
            We are sorry, our server is waking up and taking a bit more than the expected time.
          </p>
          
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-golden animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-golden animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-golden animate-bounce" />
          </div>
          
          <p className="text-golden font-medium text-xs uppercase tracking-[0.2em] pt-4 opacity-70">
            Thank you for your patience
          </p>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 p-4">
          <div className="w-12 h-12 border-t border-r border-white/10 rounded-tr-2xl" />
        </div>
        <div className="absolute bottom-0 left-0 p-4">
          <div className="w-12 h-12 border-b border-l border-white/10 rounded-bl-2xl" />
        </div>

      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
