import React, { useState, useEffect } from "react";
import { CreativeIdea } from "@/api/entities";
import { DailyUsage } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import IdeaGeneratorForm from "../components/generator/IdeaGeneratorForm";
import IdeaCard from "../components/generator/IdeaCard";
import LoadingAnimation from "../components/generator/LoadingAnimation";
import UsageLimiter from "../components/generator/UsageLimiter";

export default function Generator() {
    const [generatedIdeas, setGeneratedIdeas] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastQuery, setLastQuery] = useState(null);
    const [dailyUsage, setDailyUsage] = useState(null);
    const [user, setUser] = useState(null);
    const [remainingIdeas, setRemainingIdeas] = useState(5);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                await checkDailyUsage(currentUser);
            } catch (error) {
                console.error("Erro ao carregar usuário:", error);
            }
        };

        initializeUser();
    }, []);

    const checkDailyUsage = async (currentUser) => {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Verifica se já existe registro de uso para hoje
            const usageRecords = await DailyUsage.filter({
                user_email: currentUser.email,
                date: today
            });

            let todayUsage;
            if (usageRecords.length === 0) {
                // Cria novo registro para hoje
                todayUsage = await DailyUsage.create({
                    date: today,
                    user_email: currentUser.email,
                    ideas_generated: 0,
                    is_premium: currentUser.is_premium || false
                });
            } else {
                todayUsage = usageRecords[0];
            }

            setDailyUsage(todayUsage);
            
            // Calcula ideias restantes
            if (todayUsage.is_premium) {
                setRemainingIdeas(999); // Ilimitado para premium
            } else {
                const used = todayUsage.ideas_generated || 0;
                setRemainingIdeas(Math.max(0, 5 - used));
            }
        } catch (error) {
            console.error("Erro ao verificar uso diário:", error);
        }
    };

    const generateIdeas = async (formData) => {
        // Verifica se usuário pode gerar mais ideias
        if (!dailyUsage?.is_premium && remainingIdeas <= 0) {
            alert("Você atingiu o limite de 5 ideias diárias! Assine o plano premium para ideias ilimitadas.");
            return;
        }

        setIsGenerating(true);
        setLastQuery(formData);

        try {
            const prompt = `Gere 3 ideias únicas e criativas em português para o domínio "${formData.domain}".
            
            Palavras-chave/temas: ${formData.keywords.join(", ")}
            Resultado desejado: ${formData.outcome}
            Nível de dificuldade alvo: ${formData.difficulty}
            
            Para cada ideia, forneça:
            1. Um título criativo e memorável
            2. Uma descrição detalhada (2-3 frases)
            3. 3-4 passos de desenvolvimento com ações práticas
            4. Tempo estimado para concluir
            
            Certifique-se de que as ideias sejam:
            - Únicas e inovadoras
            - Acionáveis e práticas
            - Relevantes para o domínio especificado
            - Adequadas para o nível de dificuldade
            - Criativas mas viáveis`;

            const response = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        ideas: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    development_paths: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                step: { type: "string" },
                                                description: { type: "string" }
                                            }
                                        }
                                    },
                                    estimated_time: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const ideasWithMetadata = response.ideas.map(idea => ({
                ...idea,
                domain: formData.domain,
                keywords: formData.keywords,
                difficulty_level: formData.difficulty,
                is_favorite: false
            }));

            // Save ideas to database
            for (const idea of ideasWithMetadata) {
                await CreativeIdea.create(idea);
            }

            // Atualiza o uso diário
            const newIdeasCount = dailyUsage.ideas_generated + response.ideas.length;
            await DailyUsage.update(dailyUsage.id, {
                ideas_generated: newIdeasCount
            });

            // Atualiza estado local
            if (!dailyUsage.is_premium) {
                setRemainingIdeas(Math.max(0, 5 - newIdeasCount));
            }
            
            setDailyUsage(prev => ({ ...prev, ideas_generated: newIdeasCount }));
            setGeneratedIdeas(ideasWithMetadata);

        } catch (error) {
            console.error("Error generating ideas:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleFavorite = async (idea, index) => {
        const updatedIdea = { ...idea, is_favorite: !idea.is_favorite };
        
        if (idea.id) {
            await CreativeIdea.update(idea.id, { is_favorite: updatedIdea.is_favorite });
        }

        const updatedIdeas = [...generatedIdeas];
        updatedIdeas[index] = updatedIdea;
        setGeneratedIdeas(updatedIdeas);
    };

    if (!user || !dailyUsage) {
        return (
            <div className="text-center py-20">
                <div className="brutalist-text text-2xl text-black">
                    CARREGANDO...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <div className="inline-block transform -rotate-2 mb-6">
                    <h1 className="brutalist-text text-4xl md:text-6xl text-black brutalist-border bg-yellow-400 px-8 py-4 brutalist-shadow">
                        GERAR IDEIAS
                    </h1>
                </div>
                <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto uppercase tracking-wide">
                    LIBERTE SUA CRIATIVIDADE COM GERAÇÃO DE CONCEITOS POR IA
                </p>
            </div>

            {/* Usage Limiter */}
            <UsageLimiter 
                remainingIdeas={remainingIdeas}
                isPremium={dailyUsage.is_premium}
                totalUsedToday={dailyUsage.ideas_generated || 0}
            />

            {/* Generator Form - só mostra se tem ideias restantes ou é premium */}
            {(remainingIdeas > 0 || dailyUsage.is_premium) && (
                <IdeaGeneratorForm onGenerate={generateIdeas} isGenerating={isGenerating} />
            )}

            {/* Loading State */}
            {isGenerating && <LoadingAnimation />}

            {/* Generated Ideas */}
            {generatedIdeas.length > 0 && !isGenerating && (
                <div className="mt-12">
                    <div className="text-center mb-8">
                        <h2 className="brutalist-text text-3xl text-black mb-2">
                            IDEIAS FRESCAS
                        </h2>
                        <p className="font-bold text-gray-600 uppercase tracking-wider">
                            PARA O DOMÍNIO {lastQuery?.domain?.toUpperCase()}
                        </p>
                    </div>
                    
                    <div className="grid gap-8 md:gap-12">
                        {generatedIdeas.map((idea, index) => (
                            <IdeaCard
                                key={index}
                                idea={idea}
                                onToggleFavorite={() => toggleFavorite(idea, index)}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}