
import React, { useState, useEffect } from "react";
import { CreativeIdea } from "@/api/entities";
import IdeaCard from "../components/generator/IdeaCard";
import EmptyState from "../components/shared/EmptyState";

export default function Favorites() {
    const [favoriteIdeas, setFavoriteIdeas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const data = await CreativeIdea.filter({ is_favorite: true }, "-created_date");
            setFavoriteIdeas(data);
        } catch (error) {
            console.error("Error loading favorites:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFavorite = async (idea, index) => {
        const updatedIdea = { ...idea, is_favorite: false };
        await CreativeIdea.update(idea.id, { is_favorite: false });
        
        // Remove from favorites list
        const updatedFavorites = favoriteIdeas.filter(fav => fav.id !== idea.id);
        setFavoriteIdeas(updatedFavorites);
    };

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <div className="brutalist-text text-2xl text-black">
                    CARREGANDO FAVORITOS...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-block transform -rotate-1 mb-6">
                    <h1 className="brutalist-text text-4xl md:text-6xl text-black brutalist-border bg-lime-400 px-8 py-4 brutalist-shadow">
                        FAVORITOS
                    </h1>
                </div>
                <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto uppercase tracking-wide">
                    SEUS CONCEITOS CRIATIVOS MAIS INSPIRADORES
                </p>
            </div>

            {/* Favorites Grid */}
            {favoriteIdeas.length > 0 ? (
                <div className="grid gap-8 md:gap-12">
                    {favoriteIdeas.map((idea, index) => (
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
                    title="NENHUM FAVORITO AINDA"
                    description="Marque ideias como favoritas para vê-las aqui"
                    actionText="VER HISTÓRICO"
                    actionUrl="History"
                />
            )}
        </div>
    );
}
