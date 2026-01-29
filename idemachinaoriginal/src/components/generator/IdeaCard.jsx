
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Target, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

const DOMAIN_COLORS = {
    escrita: "bg-blue-600",
    negócios: "bg-pink-600",
    arte: "bg-lime-400",
    tecnologia: "bg-purple-600",
    marketing: "bg-orange-500",
    produto: "bg-red-600",
    conteúdo: "bg-teal-600",
    design: "bg-indigo-600"
};

const DIFFICULTY_COLORS = {
    iniciante: "bg-green-500",
    intermediário: "bg-yellow-500",
    avançado: "bg-red-500"
};

export default function IdeaCard({ idea, onToggleFavorite, index, showDate = false }) {
    const cardColors = ["bg-yellow-400", "bg-pink-400", "bg-lime-400"];
    const cardColor = cardColors[index % cardColors.length];
    const rotation = index % 2 === 0 ? "rotate-1" : "-rotate-1";

    return (
        <div className={`brutalist-border ${cardColor} p-8 md:p-10 brutalist-shadow transform ${rotation} hover:rotate-0 hover:translate-y-[-4px] transition-all duration-300 relative`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge className={`${DOMAIN_COLORS[idea.domain]} text-white brutalist-border brutalist-text px-3 py-1`}>
                            {idea.domain?.toUpperCase()}
                        </Badge>
                        <Badge className={`${DIFFICULTY_COLORS[idea.difficulty_level]} text-white brutalist-border brutalist-text px-3 py-1`}>
                            {idea.difficulty_level?.toUpperCase()}
                        </Badge>
                        {idea.estimated_time && (
                            <Badge className="bg-gray-800 text-white brutalist-border brutalist-text px-3 py-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {idea.estimated_time}
                            </Badge>
                        )}
                    </div>
                    
                    <h3 className="brutalist-text text-2xl md:text-3xl text-black mb-3 leading-tight">
                        {idea.title}
                    </h3>
                    
                    {showDate && idea.created_date && (
                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                            {format(new Date(idea.created_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </p>
                    )}
                </div>

                <Button
                    onClick={onToggleFavorite}
                    className={`brutalist-border p-3 transition-all duration-200 transform hover:scale-110 ${
                        idea.is_favorite
                            ? 'bg-red-500 text-white brutalist-shadow'
                            : 'bg-white text-black hover:bg-red-500 hover:text-white'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${idea.is_favorite ? 'fill-current' : ''}`} />
                </Button>
            </div>

            {/* Keywords */}
            {idea.keywords && idea.keywords.length > 0 && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {idea.keywords.map((keyword, idx) => (
                            <span
                                key={idx}
                                className="bg-black text-white px-3 py-1 brutalist-border text-sm font-bold uppercase"
                            >
                                #{keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Description */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-black" />
                    <h4 className="brutalist-text text-lg text-black">O CONCEITO</h4>
                </div>
                <p className="text-black font-semibold text-lg leading-relaxed">
                    {idea.description}
                </p>
            </div>

            {/* Development Paths */}
            {idea.development_paths && idea.development_paths.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-black" />
                        <h4 className="brutalist-text text-lg text-black">CAMINHO DE DESENVOLVIMENTO</h4>
                    </div>
                    <div className="space-y-3">
                        {idea.development_paths.map((path, idx) => (
                            <div key={idx} className="brutalist-border bg-white p-4 transform hover:translate-x-2 transition-transform duration-200">
                                <div className="flex items-start gap-3">
                                    <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center brutalist-text text-sm flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-black text-sm uppercase mb-1">
                                            {path.step}
                                        </h5>
                                        <p className="text-gray-700 font-medium text-sm">
                                            {path.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
