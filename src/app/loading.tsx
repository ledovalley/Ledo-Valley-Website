import React from 'react';
import Image from 'next/image';
import Logo from '@/assets/logo/LedoLeaf.jpg';

export default function Loading() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-9999 bg-brand-primary overflow-hidden">
            {/* Background Texture/Soft Light */}
            <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />

            <div className="relative flex flex-col items-center">
                {/* Logo Section */}
                <div className="relative mb-12">
                    {/* Soft Glow */}
                    <div className="absolute inset-0 rounded-full blur-3xl bg-white/10 animate-pulse" />
                    
                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl animate-in fade-in zoom-in duration-1000">
                        <Image 
                            src={Logo} 
                            alt="Ledo Valley Logo" 
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Text Content */}
                <div className="relative flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-[0.15em] font-playfair text-white mb-4">
                        LEDO VALLEY
                    </h2>
                    
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-12 h-[1px] bg-white/30" />
                        <div className="flex gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-golden animate-bounce [animation-delay:-0.3s]" />
                             <div className="w-1.5 h-1.5 rounded-full bg-golden animate-bounce [animation-delay:-0.15s]" />
                             <div className="w-1.5 h-1.5 rounded-full bg-golden animate-bounce" />
                        </div>
                        <div className="w-12 h-[1px] bg-white/30" />
                    </div>

                    <p className="text-sm md:text-base font-medium uppercase tracking-[0.3em] text-white/60">
                        Brewing Excellence Since 1968
                    </p>
                </div>
            </div>

            {/* Bottom Progress Bar (Subtle) */}
            <div className="absolute bottom-0 left-0 h-1 bg-golden animate-progress" />
        </div>
    );
}

