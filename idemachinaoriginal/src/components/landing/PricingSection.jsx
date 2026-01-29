import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowRight, X } from "lucide-react";

export default function PricingSection({ onSubscribe, email, setEmail }) {
    return (
        <section className="py-20 bg-gray-100">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block transform -rotate-2 mb-6">
                        <h2 className="brutalist-text text-4xl md:text-6xl text-black brutalist-border bg-pink-600 text-white px-8 py-4 brutalist-shadow">
                            PREÇO JUSTO
                        </h2>
                    </div>
                    <p className="text-xl font-bold text-gray-700 max-w-3xl mx-auto">
                        CRIATIVIDADE ILIMITADA POR MENOS QUE UM CAFÉ POR SEMANA
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Plano Gratuito */}
                    <div className="brutalist-border bg-white p-8 brutalist-shadow transform hover:translate-y-[-4px] transition-transform duration-300">
                        <div className="text-center mb-6">
                            <h3 className="brutalist-text text-xl text-black mb-2">TESTE GRÁTIS</h3>
                            <div className="text-4xl font-bold text-black mb-1">R$ 0</div>
                            <p className="text-sm font-bold text-gray-500">POR 3 DIAS</p>
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold">5 ideias por dia</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold">Todos os domínios</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <X className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-semibold text-gray-400">Salvar favoritos</span>
                            </li>
                        </ul>
                        
                        <Button className="w-full brutalist-border bg-gray-600 text-white hover:bg-gray-700 brutalist-text py-3">
                            TESTE GRÁTIS
                        </Button>
                    </div>

                    {/* Plano Premium - DESTAQUE */}
                    <div className="brutalist-border bg-yellow-400 p-8 brutalist-shadow transform scale-105 hover:translate-y-[-4px] transition-all duration-300 relative">
                        {/* Badge de Popular */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-red-600 text-white brutalist-border brutalist-text px-4 py-2">
                                <Crown className="w-4 h-4 mr-1" />
                                MAIS POPULAR
                            </Badge>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="brutalist-text text-2xl text-black mb-2">ACESSO TOTAL</h3>
                            <div className="text-5xl font-bold text-black mb-1">R$ 10</div>
                            <p className="text-sm font-bold text-gray-700">/MÊS</p>
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-black">IDEIAS ILIMITADAS</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-black">Todos os 8 domínios</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-black">Salvar favoritos</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-black">Histórico completo</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-black">Suporte prioritário</span>
                            </li>
                        </ul>
                        
                        <div className="space-y-3">
                            <Input
                                type="email"
                                placeholder="Seu email aqui..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="brutalist-border border-black text-center font-bold"
                            />
                            <Button 
                                onClick={onSubscribe}
                                className="w-full brutalist-border bg-green-600 text-white hover:bg-green-700 brutalist-text py-4 brutalist-shadow transform hover:scale-105 transition-all duration-200"
                            >
                                <ArrowRight className="w-5 h-5 mr-2" />
                                ASSINAR AGORA
                            </Button>
                        </div>
                    </div>

                    {/* Plano Anual */}
                    <div className="brutalist-border bg-white p-8 brutalist-shadow transform hover:translate-y-[-4px] transition-transform duration-300">
                        <div className="text-center mb-6">
                            <h3 className="brutalist-text text-xl text-black mb-2">PLANO ANUAL</h3>
                            <div className="text-4xl font-bold text-black mb-1">R$ 100</div>
                            <p className="text-sm font-bold text-green-600">2 MESES GRÁTIS!</p>
                        </div>
                        
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold">Tudo do plano mensal</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold">Economia de 17%</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold">Recursos exclusivos</span>
                            </li>
                        </ul>
                        
                        <Button className="w-full brutalist-border bg-blue-600 text-white hover:bg-blue-700 brutalist-text py-3">
                            ECONOMIZAR 17%
                        </Button>
                    </div>
                </div>

                {/* Garantia */}
                <div className="text-center mt-12">
                    <div className="brutalist-border bg-green-100 p-6 brutalist-shadow max-w-2xl mx-auto">
                        <h4 className="brutalist-text text-lg text-black mb-2">
                            🛡️ GARANTIA DE 7 DIAS
                        </h4>
                        <p className="font-bold text-gray-700 text-sm">
                            Não ficou satisfeito? Devolvemos seu dinheiro sem perguntas!
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}