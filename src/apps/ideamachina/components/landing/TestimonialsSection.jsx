import React from "react";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
    {
        name: "Marina Silva",
        role: "Escritora e Blogueira",
        content: "A Máquina de Ideias salvou minha carreira! Nunca mais fiquei sem assunto para escrever. Vale cada centavo!",
        rating: 5,
        avatar: "M"
    },
    {
        name: "Carlos Mendes",
        role: "Empreendedor",
        content: "Por R$ 10 eu tenho acesso a ideias que me ajudaram a criar 3 novos produtos. ROI incrível!",
        rating: 5,
        avatar: "C"
    },
    {
        name: "Ana Costa",
        role: "Designer Gráfica",
        content: "As ideias para projetos de arte são simplesmente geniais. Minha criatividade multiplicou por 10!",
        rating: 5,
        avatar: "A"
    },
    {
        name: "Pedro Santos",
        role: "Publicitário",
        content: "Uso todos os dias para campanhas de marketing. Os clientes ficam impressionados com a qualidade!",
        rating: 5,
        avatar: "P"
    }
];

export default function TestimonialsSection() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block transform rotate-2 mb-6">
                        <h2 className="brutalist-text text-4xl md:text-6xl text-black brutalist-border bg-blue-600 text-white px-8 py-4 brutalist-shadow">
                            DEPOIMENTOS
                        </h2>
                    </div>
                    <p className="text-xl font-bold text-gray-700 max-w-3xl mx-auto">
                        VEJA O QUE NOSSOS USUÁRIOS ESTÃO DIZENDO
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {TESTIMONIALS.map((testimonial, index) => (
                        <div 
                            key={index}
                            className={`brutalist-border bg-yellow-100 p-6 brutalist-shadow transform hover:translate-y-[-4px] transition-all duration-300 ${
                                index % 2 === 0 ? 'rotate-1' : '-rotate-1'
                            }`}
                        >
                            {/* Quote Icon */}
                            <div className="mb-4">
                                <Quote className="w-8 h-8 text-blue-600" />
                            </div>
                            
                            {/* Stars */}
                            <div className="flex mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                                ))}
                            </div>
                            
                            {/* Content */}
                            <p className="font-semibold text-gray-800 mb-6 text-sm leading-relaxed">
                                "{testimonial.content}"
                            </p>
                            
                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 brutalist-border flex items-center justify-center">
                                    <span className="brutalist-text text-white text-sm">
                                        {testimonial.avatar}
                                    </span>
                                </div>
                                <div>
                                    <div className="font-bold text-black text-sm">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-xs text-gray-600 font-semibold">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}