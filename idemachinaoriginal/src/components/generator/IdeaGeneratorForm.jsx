
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Zap } from "lucide-react";

const DOMAINS = [
    { value: "escrita", label: "ESCRITA", color: "bg-blue-600" },
    { value: "negócios", label: "NEGÓCIOS", color: "bg-pink-600" },
    { value: "arte", label: "ARTE", color: "bg-lime-400" },
    { value: "tecnologia", label: "TECNOLOGIA", color: "bg-purple-600" },
    { value: "marketing", label: "MARKETING", color: "bg-orange-500" },
    { value: "produto", label: "PRODUTO", color: "bg-red-600" },
    { value: "conteúdo", label: "CONTEÚDO", color: "bg-teal-600" },
    { value: "design", label: "DESIGN", color: "bg-indigo-600" }
];

const DIFFICULTIES = [
    { value: "iniciante", label: "INICIANTE" },
    { value: "intermediário", label: "INTERMEDIÁRIO" },
    { value: "avançado", label: "AVANÇADO" }
];

export default function IdeaGeneratorForm({ onGenerate, isGenerating }) {
    const [formData, setFormData] = useState({
        domain: "",
        keywords: [],
        outcome: "",
        difficulty: "intermediário"
    });
    const [keywordInput, setKeywordInput] = useState("");

    const handleAddKeyword = () => {
        if (keywordInput.trim() && formData.keywords.length < 8) {
            setFormData(prev => ({
                ...prev,
                keywords: [...prev.keywords, keywordInput.trim()]
            }));
            setKeywordInput("");
        }
    };

    const handleRemoveKeyword = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            keywords: prev.keywords.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.domain && formData.keywords.length > 0) {
            onGenerate(formData);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddKeyword();
        }
    };

    return (
        <div className="brutalist-border bg-white p-8 md:p-12 brutalist-shadow mb-12 transform hover:translate-y-[-4px] transition-transform duration-200">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Domain Selection */}
                <div className="space-y-4">
                    <label className="brutalist-text text-xl text-black block">
                        SELECIONE O DOMÍNIO
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {DOMAINS.map((domain) => (
                            <button
                                key={domain.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, domain: domain.value }))}
                                className={`p-4 brutalist-border brutalist-text text-sm transition-all duration-200 transform hover:scale-105 ${
                                    formData.domain === domain.value
                                        ? `${domain.color} text-white brutalist-shadow`
                                        : 'bg-gray-100 text-black hover:bg-gray-200'
                                }`}
                            >
                                {domain.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Keywords */}
                <div className="space-y-4">
                    <label className="brutalist-text text-xl text-black block">
                        ADICIONE PALAVRAS-CHAVE
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite a palavra-chave..."
                            className="brutalist-border border-black text-lg font-bold"
                            disabled={formData.keywords.length >= 8}
                        />
                        <Button
                            type="button"
                            onClick={handleAddKeyword}
                            disabled={!keywordInput.trim() || formData.keywords.length >= 8}
                            className="brutalist-border bg-lime-400 text-black hover:bg-lime-500 brutalist-text px-6"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                    
                    {/* Keywords Display */}
                    {formData.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.keywords.map((keyword, index) => (
                                <Badge
                                    key={index}
                                    className="brutalist-border bg-yellow-400 text-black text-sm font-bold px-3 py-2 flex items-center gap-2"
                                >
                                    {keyword}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveKeyword(index)}
                                        className="hover:bg-black hover:text-yellow-400 rounded-full p-1 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desired Outcome */}
                <div className="space-y-4">
                    <label className="brutalist-text text-xl text-black block">
                        RESULTADO DESEJADO
                    </label>
                    <Textarea
                        value={formData.outcome}
                        onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                        placeholder="O que você deseja alcançar com essas ideias?"
                        className="brutalist-border border-black text-lg font-semibold min-h-[100px]"
                    />
                </div>

                {/* Difficulty */}
                <div className="space-y-4">
                    <label className="brutalist-text text-xl text-black block">
                        NÍVEL DE DIFICULDADE
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {DIFFICULTIES.map((diff) => (
                            <button
                                key={diff.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, difficulty: diff.value }))}
                                className={`p-4 brutalist-border brutalist-text text-sm transition-all duration-200 ${
                                    formData.difficulty === diff.value
                                        ? 'bg-purple-600 text-white brutalist-shadow'
                                        : 'bg-gray-100 text-black hover:bg-gray-200'
                                }`}
                            >
                                {diff.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-4">
                    <Button
                        type="submit"
                        disabled={!formData.domain || formData.keywords.length === 0 || isGenerating}
                        className="brutalist-border bg-blue-600 text-white hover:bg-blue-700 brutalist-text text-xl px-12 py-6 brutalist-shadow transform hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_var(--brutalist-black)] transition-all duration-200"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                                GERANDO...
                            </>
                        ) : (
                            <>
                                <Zap className="w-6 h-6 mr-3" />
                                GERAR IDEIAS
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
