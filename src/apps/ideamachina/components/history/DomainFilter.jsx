
import React from "react";
import { Button } from "@/components/ui/button";

const DOMAINS = [
    { value: "all", label: "TODOS", color: "bg-gray-600" },
    { value: "escrita", label: "ESCRITA", color: "bg-blue-600" },
    { value: "negócios", label: "NEGÓCIOS", color: "bg-pink-600" },
    { value: "arte", label: "ARTE", color: "bg-lime-400" },
    { value: "tecnologia", label: "TECNOLOGIA", color: "bg-purple-600" },
    { value: "marketing", label: "MARKETING", color: "bg-orange-500" },
    { value: "produto", label: "PRODUTO", color: "bg-red-600" },
    { value: "conteúdo", label: "CONTEÚDO", color: "bg-teal-600" },
    { value: "design", label: "DESIGN", color: "bg-indigo-600" }
];

export default function DomainFilter({ selectedDomain, onDomainChange, ideaCount }) {
    return (
        <div className="brutalist-border bg-white p-6 brutalist-shadow mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="brutalist-text text-xl text-black">
                    FILTRAR POR DOMÍNIO
                </h3>
                <div className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                    {ideaCount} IDEIAS ENCONTRADAS
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {DOMAINS.map((domain) => (
                    <Button
                        key={domain.value}
                        onClick={() => onDomainChange(domain.value)}
                        className={`brutalist-border brutalist-text text-xs p-3 transition-all duration-200 transform hover:scale-105 ${
                            selectedDomain === domain.value
                                ? `${domain.color} text-white brutalist-shadow`
                                : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                    >
                        {domain.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
