import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
    const whatsappNumber = "5527999259141"; // Brasil (55) + ES (27) + número
    
    const handleWhatsAppClick = (e) => {
        e.preventDefault();
        
        const message = "Olá! Vim através da Máquina de Ideias e gostaria de saber mais informações.";
        const encodedMessage = encodeURIComponent(message);
        
        // URL para WhatsApp Web/App
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
        
        // Tentar abrir no app primeiro, depois web
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // No mobile, tenta abrir o app primeiro
            window.location.href = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;
            
            // Fallback para web após um pequeno delay
            setTimeout(() => {
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            }, 1000);
        } else {
            // No desktop, abre direto o WhatsApp Web
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
        
        console.log('WhatsApp clicado!', whatsappUrl); // Debug
    };

    return (
        <>
            {/* Botão Principal */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleWhatsAppClick}
                    className="group relative brutalist-border bg-green-500 text-white p-4 brutalist-shadow hover:bg-green-600 transition-all duration-300 transform hover:scale-110 hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_var(--brutalist-black)] cursor-pointer"
                    style={{ 
                        animationDuration: '2s', 
                        animationIterationCount: 'infinite',
                        animation: 'bounce 2s infinite'
                    }}
                    title="Falar no WhatsApp"
                    type="button"
                >
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-6 h-6" />
                        <span className="brutalist-text text-sm hidden md:inline">
                            WHATSAPP
                        </span>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="brutalist-border bg-white text-black p-3 brutalist-shadow whitespace-nowrap">
                            <div className="brutalist-text text-xs">
                                FALE CONOSCO NO WHATSAPP
                            </div>
                            <div className="text-xs font-bold text-gray-600 mt-1">
                                (27) 99925-9141
                            </div>
                        </div>
                    </div>
                </button>
                
                {/* Pulse animation ring */}
                <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-30 pointer-events-none"></div>
            </div>

            {/* Botão alternativo menor para mobile */}
            <div className="md:hidden fixed bottom-20 right-6 z-40">
                <button
                    onClick={handleWhatsAppClick}
                    className="brutalist-border bg-green-600 text-white p-3 brutalist-text text-xs hover:bg-green-700 transition-colors duration-200"
                    type="button"
                >
                    CHAT
                </button>
            </div>
        </>
    );
}