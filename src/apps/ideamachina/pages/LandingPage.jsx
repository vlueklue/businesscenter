import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    Zap, 
    Lightbulb, 
    Target, 
    Star, 
    Check, 
    ArrowRight, 
    Crown, 
    Sparkles,
    Clock,
    Users,
    TrendingUp,
    Shield
} from "lucide-react";
import HeroSection from "../components/landing/HeroSection";
import PricingSection from "../components/landing/PricingSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import FAQSection from "../components/landing/FAQSection";
import CTASection from "../components/landing/CTASection";
import WhatsAppFloat from "../components/shared/WhatsAppFloat";

export default function LandingPage() {
    const [email, setEmail] = useState("");

    const handleSubscribe = () => {
        const message = `Olá! Quero assinar a Máquina de Ideias por R$ 10,00/mês. Meu email é: ${email}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=5527999259141&text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <style>
                {`
                    :root {
                        --brutalist-primary: #0066FF;
                        --brutalist-secondary: #FF0066;
                        --brutalist-accent: #66FF00;
                        --brutalist-warning: #FFFF00;
                        --brutalist-black: #000000;
                    }
                    
                    .brutalist-shadow {
                        box-shadow: 8px 8px 0px var(--brutalist-black);
                    }
                    
                    .brutalist-border {
                        border: 4px solid var(--brutalist-black);
                    }
                    
                    .brutalist-text {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: -0.02em;
                    }

                    .gradient-text {
                        background: linear-gradient(45deg, #0066FF, #FF0066, #66FF00);
                        background-size: 300% 300%;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: gradient 3s ease infinite;
                    }

                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}
            </style>

            <HeroSection onSubscribe={handleSubscribe} email={email} setEmail={setEmail} />
            <FeaturesSection />
            <PricingSection onSubscribe={handleSubscribe} email={email} setEmail={setEmail} />
            <TestimonialsSection />
            <FAQSection />
            <CTASection onSubscribe={handleSubscribe} email={email} setEmail={setEmail} />
            
            <WhatsAppFloat />
        </div>
    );
}