
import React, { useState, useEffect } from "react";
import { CreativeIdea } from "@/api/entities";
import IdeaCard from "../components/generator/IdeaCard";
import DomainFilter from "../components/history/DomainFilter";
import EmptyState from "../components/shared/EmptyState";

export default function History() {
    const [ideas, setIdeas] = useState([]);
    const [filteredIdeas, setFilteredIdeas] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadIdeas();
    }, []);

    useEffect(() => {
        if (selectedDomain === "all") {
            setFilteredIdeas(ideas);
        } else {
            setFilteredIdeas(ideas.filter(idea => idea.domain === selectedDomain));
        }
    }, [ideas, selectedDomain]);

    const loadIdeas = async () => {
        try {
            const data = await CreativeIdea.list("-created_date");
            setIdeas(data);
        } catch (error) {
            console.error("Error loading ideas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFavorite = async (idea, index) => {
        const updatedIdea = { ...idea, is_favorite: !idea.is_favorite };
        await CreativeIdea.update(idea.id, { is_favorite: updatedIdea.is_favorite });
        
        const updatedIdeas = [...ideas];
        const originalIndex = ideas.findIndex(i => i.id === idea.id);
        updatedIdeas[originalIndex] = updatedIdea;
        setIdeas(updatedIdeas);
    };

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <div className="brutalist-text text-2xl text-black">
                    CARREGANDO HISTÓRICO...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-block transform rotate-1 mb-6">
                    <h1 className="brutalist-text text-4xl md:text-6xl text-black brutalist-border bg-pink-600 text-white px-8 py-4 brutalist-shadow">
                        HISTÓRICO DE IDEIAS
                    </h1>
                </div>
                <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto uppercase tracking-wide">
                    NAVEGUE POR TODOS OS SEUS CONCEITOS CRIATIVOS GERADOS
                </p>
            </div>

            {/* Domain Filter */}
            <DomainFilter
                selectedDomain={selectedDomain}
                onDomainChange={setSelectedDomain}
                ideaCount={filteredIdeas.length}
            />

            {/* Ideas Grid */}
            {filteredIdeas.length > 0 ? (
                <div className="grid gap-8 md:gap-12">
                    {filteredIdeas.map((idea, index) => (
                        <IdeaCard
                            key={idea.id}
                            idea={idea}
                            onToggleFavorite={() => toggleFavorite(idea, index)}
                            index={index}
                            showDate={true}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="NENHUMA IDEIA AINDA"
                    description="Comece a gerar conceitos criativos para vê-los aqui"
                    actionText="GERAR IDEIAS"
                    actionUrl="Generator"
                />
            )}
        </div>
    );
}
