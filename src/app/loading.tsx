import React from 'react';

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-9999 bg-white/80 backdrop-blur-md">
            <div className="relative flex flex-col items-center">
                {/* Animated Logo/Icon */}
                <div className="relative w-24 h-24">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full animate-ping bg-brand-primary/20" />
                    
                    {/* Static Icon with subtle breathe effect */}
                    <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-xl animate-pulse ring-1 ring-black/5">
                        <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            className="w-12 h-12 text-brand-primary"
                            stroke="currentColor" 
                            strokeWidth="1.5"
                        >
                            <path 
                                d="M12 3V21M12 3C12 3 6 4.5 6 12C6 19.5 12 21 12 21M12 3C12 3 18 4.5 18 12C18 19.5 12 21 12 21M6 12H18" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="flex flex-col items-center gap-2 mt-8">
                    <h2 className="text-xl font-semibold tracking-wide font-playfair text-text-primary">
                        Ledo Valley
                    </h2>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full animate-bounce bg-brand-primary delay-0" />
                        <div className="w-1 h-1 delay-150 rounded-full animate-bounce bg-brand-primary" />
                        <div className="w-1 h-1 delay-300 rounded-full animate-bounce bg-brand-primary" />
                    </div>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-text-secondary/60">
                        Brewing your experience
                    </p>
                </div>
            </div>
        </div>
    );
}
