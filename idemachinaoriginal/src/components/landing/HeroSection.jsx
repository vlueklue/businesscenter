import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, Lightbulb, Star, ArrowRight, Crown } from "lucide-react";

export default function HeroSection({ onSubscribe, email, setEmail }) {
    return (
        <section className="relative py-20 md:py-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 brutalist-border transform rotate-12 opacity-20"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-pink-600 brutalist-border transform -rotate-12 opacity-20"></div>
            <div className="absolute bottom-20 left-32 w-12 h-12 bg-lime-400 brutalist-border transform rotate-45 opacity-20"></div>

            <div className="container mx-auto px-4 text-center relative z-10">
                {/* Badge de Oferta */}
                <div className="inline-block mb-8 transform -rotate-2">
                    <Badge className="bg-red-600 text-white brutalist-border brutalist-text px-6 py-3 text-lg brutalist-shadow animate-pulse">
                        <Crown className="w-5 h-5 mr-2" />
                        OFERTA LIMITADA
                    </Badge>
                </div>

                {/* Título Principal */}
                <div className="mb-8">
                    <h1 className="brutalist-text text-4xl md:text-7xl text-black mb-4 leading-tight">
                        MÁQUINA DE
                        <span className="gradient-text block"> IDEIAS </span>
                        REVOLUCIONÁRIA
                    </h1>
                    <div className="inline-block transform rotate-1 mt-4">
                        <div className="brutalist-border bg-yellow-400 px-6 py-3 brutalist-shadow">
                            <span className="brutalist-text text-2xl md:text-4xl text-black">
                                APENAS R$ 10,00/MÊS
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subtítulo */}
                <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
                    GERE IDEIAS CRIATIVAS ILIMITADAS COM INTELIGÊNCIA ARTIFICIAL.
                    <br />
                    <span className="text-blue-600">ESCRITORES, EMPREENDEDORES, ARTISTAS E CRIATIVOS</span> JÁ ESTÃO USANDO!
                </p>

                {/* Features em destaque */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {[
                        { icon: Lightbulb, text: "IDEIAS ILIMITADAS" },
                        { icon: Zap, text: "RESULTADOS INSTANTÂNEOS" },
                        { icon: Star, text: "MÚLTIPLOS DOMÍNIOS" }
                    ].map((feature, index) => (
                        <div key={index} className="brutalist-border bg-white px-4 py-3 brutalist-shadow transform hover:translate-y-[-2px] transition-transform duration-200">
                            <div className="flex items-center gap-2">
                                <feature.icon className="w-5 h-5 text-blue-600" />
                                <span className="brutalist-text text-sm text-black">{feature.text}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Principal */}
                <div className="max-w-md mx-auto">
                    <div className="brutalist-border bg-white p-6 brutalist-shadow mb-8">
                        <h3 className="brutalist-text text-xl text-black mb-4">
                            COMECE AGORA MESMO!
                        </h3>
                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Digite seu email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="brutalist-border border-black text-lg font-bold text-center"
                            />
                            <Button
                                onClick={onSubscribe}
                                className="w-full brutalist-border bg-green-600 text-white hover:bg-green-700 brutalist-text text-lg py-6 brutalist-shadow transform hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_var(--brutalist-black)] transition-all duration-300"
                            >
                                <ArrowRight className="w-6 h-6 mr-3" />
                                ASSINAR POR R$ 10,00
                            </Button>
                        </div>
                        <p className="text-xs font-bold text-gray-500 mt-3 uppercase tracking-wider">
                            ✓ SEM COMPROMISSO • ✓ CANCELE QUANDO QUISER
                        </p>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm font-bold text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                        </div>
                        <span>4.9/5 AVALIAÇÃO</span>
                    </div>
                    <div>500+ USUÁRIOS ATIVOS</div>
                    <div>1000+ IDEIAS GERADAS HOJE</div>
                </div>
            </div>
        </section>
    );
}