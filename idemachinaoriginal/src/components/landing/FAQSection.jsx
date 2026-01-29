import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ_DATA = [
    {
        question: "Como funciona a Máquina de Ideias?",
        answer: "Nossa IA analisa suas palavras-chave e preferências para gerar ideias criativas personalizadas em segundos. Você escolhe o domínio (escrita, negócios, arte, etc.) e recebe ideias detalhadas com planos de desenvolvimento."
    },
    {
        question: "Posso cancelar quando quiser?",
        answer: "Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento pelo WhatsApp ou email. Simples e rápido."
    },
    {
        question: "As ideias são realmente únicas?",
        answer: "Cada ideia é gerada especificamente para você com base nos seus inputs. A IA combina suas preferências de forma única, garantindo originalidade."
    },
    {
        question: "Quantas ideias posso gerar por mês?",
        answer: "No plano de R$ 10,00 você tem acesso ILIMITADO! Gere quantas ideias quiser, quando quiser. Sem limites diários ou mensais."
    },
    {
        question: "Funciona para qualquer área?",
        answer: "Sim! Temos 8 domínios: Escrita, Negócios, Arte, Tecnologia, Marketing, Produto, Conteúdo e Design. Perfeito para qualquer profissional criativo."
    },
    {
        question: "E se eu não gostar do serviço?",
        answer: "Oferecemos 7 dias de garantia total. Se não ficar satisfeito, devolvemos 100% do seu dinheiro sem fazer perguntas."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 bg-gray-100">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block transform -rotate-1 mb-6">
                        <h2 className="brutalist-text text-4xl md:text-6xl text-black brutalist-border bg-lime-400 px-8 py-4 brutalist-shadow">
                            DÚVIDAS
                        </h2>
                    </div>
                    <p className="text-xl font-bold text-gray-700 max-w-3xl mx-auto">
                        PERGUNTAS MAIS FREQUENTES
                    </p>
                </div>

                {/* FAQ List */}
                <div className="max-w-3xl mx-auto">
                    {FAQ_DATA.map((faq, index) => (
                        <div 
                            key={index}
                            className="brutalist-border bg-white mb-4 brutalist-shadow transform hover:translate-y-[-2px] transition-transform duration-200"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                            >
                                <h3 className="brutalist-text text-lg text-black pr-4">
                                    {faq.question}
                                </h3>
                                {openIndex === index ? (
                                    <ChevronUp className="w-6 h-6 text-black flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-6 h-6 text-black flex-shrink-0" />
                                )}
                            </button>
                            
                            {openIndex === index && (
                                <div className="px-6 pb-6 border-t-4 border-black">
                                    <p className="font-semibold text-gray-700 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}