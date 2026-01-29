
import React from "react";
import { Lightbulb, Zap, Star } from "lucide-react";

export default function LoadingAnimation() {
    return (
        <div className="text-center py-20">
            <div className="brutalist-border bg-white p-12 brutalist-shadow mb-8 max-w-md mx-auto">
                <div className="flex justify-center items-center gap-4 mb-6">
                    <Lightbulb className="w-8 h-8 text-yellow-500 animate-bounce" />
                    <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
                    <Star className="w-8 h-8 text-pink-500 animate-bounce delay-75" />
                </div>
                
                <h3 className="brutalist-text text-2xl text-black mb-4">
                    CRIANDO IDEIAS...
                </h3>
                
                <p className="font-bold text-gray-600 uppercase tracking-wider text-sm">
                    CÉREBRO DE IA EM AÇÃO
                </p>
                
                <div className="mt-6 flex justify-center">
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-4 h-4 bg-black rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
