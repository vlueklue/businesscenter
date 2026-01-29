import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Zap, Crown } from "lucide-react";

export default function CTASection({ onSubscribe, email, setEmail }) {
    return (
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 brutalist-border transform rotate-12 opacity-30"></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-lime-400 brutalist-border transform -rotate-12 opacity-30"></div>
            
            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Title */}
                    <div className="mb-8">
                        <h2 className="brutalist-text text-4xl md:text-6xl text-white mb-4 leading-tight">
                            PARE DE PROCRASTINAR!
                        </h2>
                        <div className="inline-block transform rotate-2">
                            <div className="brutalist-border bg-yellow-400 px-6 py-3 brutalist-shadow">
                                <span className="brutalist-text text-2xl md:text-3xl text-black">
                                    COMECE HOJE MESMO
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-12">
                        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                            <div className="brutalist-border bg-white bg-opacity-20 backdrop-blur-sm p-4 brutalist-shadow text-white">
                                <Zap className="w-8 h-8 mx-auto mb-2" />
                                <div className="brutalist-text text-sm">IDEIAS INSTANTÂNEAS</div>
                            </div>
                            <div className="brutalist-border bg-white bg-opacity-20 backdrop-blur-sm p-4 brutalist-shadow text-white">
                                <Crown className="w-8 h-8 mx-auto mb-2" />
                                <div className="brutalist-text text-sm">QUALIDADE PREMIUM</div>
                            </div>
                            <div className="brutalist-border bg-white bg-opacity-20 backdrop-blur-sm p-4 brutalist-shadow text-white">
                                <ArrowRight className="w-8 h-8 mx-auto mb-2" />
                                <div className="brutalist-text text-sm">RESULTADOS RÁPIDOS</div>
                            </div>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="brutalist-border bg-white p-8 md:p-12 brutalist-shadow max-w-lg mx-auto">
                        <h3 className="brutalist-text text-2xl text-black mb-6">
                            ÚLTIMAS VAGAS POR R$ 10,00!
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <Input
                                type="email"
                                placeholder="Digite seu melhor email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="brutalist-border border-black text-lg font-bold text-center"
                            />
                            <Button
                                onClick={onSubscribe}
                                className="w-full brutalist-border bg-green-600 text-white hover:bg-green-700 brutalist-text text-xl py-6 brutalist-shadow transform hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_var(--brutalist-black)] transition-all duration-300"
                            >
                                <ArrowRight className="w-6 h-6 mr-3" />
                                SIM, EU QUERO ASSINAR!
                            </Button>
                        </div>

                        <div className="text-xs font-bold text-gray-500 space-y-1">
                            <div>✓ Acesso imediato após confirmação</div>
                            <div>✓ Suporte via WhatsApp</div>
                            <div>✓ Garantia de 7 dias</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}