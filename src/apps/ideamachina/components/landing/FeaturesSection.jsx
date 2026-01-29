import React from "react";
import { 
    Lightbulb, 
    Zap, 
    Target, 
    Clock, 
    Users, 
    TrendingUp,
    Sparkles,
    Shield
} from "lucide-react";

const FEATURES = [
    {
        icon: Lightbulb,
        title: "IDEIAS ILIMITADAS",
        description: "Gere quantas ideias criativas você quiser, sem limites diários ou mensais.",
        color: "bg-yellow-400"
    },
    {
        icon: Zap,
        title: "RESULTADOS INSTANTÂNEOS",
        description: "Receba suas ideias em segundos. Nossa IA trabalha na velocidade da luz.",
        color: "bg-blue-600"
    },
    {
        icon: Target,
        title: "MÚLTIPLOS DOMÍNIOS",
        description: "Escrita, negócios, arte, tecnologia, marketing e muito mais.",
        color: "bg-pink-600"
    },
    {
        icon: Clock,
        title: "ECONOMIZE TEMPO",
        description: "Pare de perder horas pensando. Tenha ideias prontas em minutos.",
        color: "bg-lime-400"
    },
    {
        icon: Users,
        title: "PARA TODOS OS NÍVEIS",
        description: "Iniciante ou avançado? Temos ideias personalizadas para você.",
        color: "bg-purple-600"
    },
    {
        icon: TrendingUp,
        title: "AUMENTE SUA PRODUTIVIDADE",
        description: "Multiplique sua capacidade criativa e execute mais projetos.",
        color: "bg-orange-500"
    },
    {
        icon: Sparkles,
        title: "QUALIDADE PROFISSIONAL",
        description: "Ideias elaboradas com contexto, explicações e planos de desenvolvimento.",
        color: "bg-teal-600"
    },
    {
        icon: Shield,
        title: "SUAS IDEIAS SEGURAS",
        description: "Todas as suas criações ficam salvas e organizadas no seu perfil.",
        color: "bg-indigo-600"
    }
];

export default function FeaturesSection() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block transform rotate-1 mb-6">
                        <h2 className="brutalist-text text-4xl md:text-6xl text-black brutalist-border bg-lime-400 px-8 py-4 brutalist-shadow">
                            POR QUE ESCOLHER
                        </h2>
                    </div>
                    <p className="text-xl font-bold text-gray-700 max-w-3xl mx-auto">
                        A MÁQUINA DE IDEIAS É A FERRAMENTA MAIS COMPLETA PARA CRIATIVOS
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FEATURES.map((feature, index) => (
                        <div 
                            key={index}
                            className={`brutalist-border bg-white p-6 brutalist-shadow transform hover:translate-y-[-4px] hover:rotate-1 transition-all duration-300 ${
                                index % 2 === 0 ? 'rotate-1' : '-rotate-1'
                            }`}
                        >
                            <div className={`w-16 h-16 ${feature.color} brutalist-border flex items-center justify-center mb-4 transform -rotate-3`}>
                                <feature.icon className="w-8 h-8 text-white" />
                            </div>
                            
                            <h3 className="brutalist-text text-lg text-black mb-3">
                                {feature.title}
                            </h3>
                            
                            <p className="font-semibold text-gray-600 text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}