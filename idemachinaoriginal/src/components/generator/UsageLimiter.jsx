import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UsageLimiter({ remainingIdeas, isPremium, totalUsedToday }) {
    const maxFreeIdeas = 5;
    const usagePercentage = (totalUsedToday / maxFreeIdeas) * 100;

    if (isPremium) {
        return (
            <div className="brutalist-border bg-gradient-to-r from-yellow-400 to-orange-400 p-4 brutalist-shadow mb-6">
                <div className="flex items-center justify-center gap-2">
                    <Crown className="w-6 h-6 text-black" />
                    <span className="brutalist-text text-lg text-black">
                        USUÁRIO PREMIUM - IDEIAS ILIMITADAS!
                    </span>
                    <Crown className="w-6 h-6 text-black" />
                </div>
            </div>
        );
    }

    if (remainingIdeas <= 0) {
        return (
            <div className="brutalist-border bg-red-600 text-white p-8 brutalist-shadow mb-6">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="brutalist-text text-2xl mb-4">
                        LIMITE DIÁRIO ATINGIDO!
                    </h3>
                    <p className="font-bold mb-6 text-lg">
                        Você já gerou suas 5 ideias gratuitas de hoje.
                        <br />
                        Volte amanhã ou assine o plano premium!
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link to={createPageUrl("LandingPage")}>
                            <Button className="brutalist-border bg-yellow-400 text-black hover:bg-yellow-500 brutalist-text px-8 py-3 brutalist-shadow">
                                <Crown className="w-5 h-5 mr-2" />
                                ASSINAR POR R$ 10,00
                            </Button>
                        </Link>
                        <Button 
                            className="brutalist-border bg-white text-black hover:bg-gray-100 brutalist-text px-6 py-3"
                            onClick={() => window.location.reload()}
                        >
                            VOLTAR AMANHÃ
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="brutalist-border bg-white p-6 brutalist-shadow mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="brutalist-text text-3xl text-black mb-1">
                            {remainingIdeas}
                        </div>
                        <div className="text-sm font-bold text-gray-600 uppercase">
                            IDEIAS RESTANTES HOJE
                        </div>
                    </div>
                    
                    {/* Barra de progresso visual */}
                    <div className="w-32 h-4 brutalist-border bg-gray-200">
                        <div 
                            className="h-full bg-gradient-to-r from-green-400 to-red-500 transition-all duration-500"
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="text-center">
                    <Badge className={`mb-3 ${remainingIdeas <= 2 ? 'bg-red-600' : 'bg-blue-600'} text-white brutalist-border brutalist-text px-4 py-2`}>
                        {remainingIdeas <= 2 ? 'ÚLTIMAS CHANCES!' : 'CONTA GRATUITA'}
                    </Badge>
                    <div>
                        <Link to={createPageUrl("LandingPage")}>
                            <Button 
                                className="brutalist-border bg-green-600 text-white hover:bg-green-700 brutalist-text text-xs px-4 py-2"
                                size="sm"
                            >
                                <Zap className="w-4 h-4 mr-1" />
                                UPGRADE AGORA
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {remainingIdeas <= 2 && (
                <div className="mt-4 p-4 brutalist-border bg-yellow-100">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <span className="font-bold text-black text-sm">
                            ⚠️ ATENÇÃO: Você tem apenas {remainingIdeas} {remainingIdeas === 1 ? 'ideia restante' : 'ideias restantes'} hoje!
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}