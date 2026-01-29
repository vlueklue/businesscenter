

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Lightbulb, History, Heart, Zap, DollarSign } from "lucide-react";
import WhatsAppFloat from "./components/shared/WhatsAppFloat";

export default function Layout({ children, currentPageName }) {
    const location = useLocation();

    const navItems = [
        { name: "Página de Vendas", url: createPageUrl("LandingPage"), icon: DollarSign },
        { name: "Gerador", url: createPageUrl("Generator"), icon: Zap },
        { name: "Histórico", url: createPageUrl("History"), icon: History },
        { name: "Favoritos", url: createPageUrl("Favorites"), icon: Heart }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
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
                `}
            </style>
            
            {/* Header */}
            <header className="brutalist-border bg-white brutalist-shadow mb-8 relative">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-pink-600 brutalist-border flex items-center justify-center transform -rotate-3">
                                <Lightbulb className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="brutalist-text text-2xl md:text-3xl text-black">
                                    MÁQUINA DE IDEIAS
                                </h1>
                                <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    GERADOR DE CONCEITOS CRIATIVOS
                                </p>
                            </div>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.url}
                                    className={`px-6 py-3 brutalist-border brutalist-text text-sm transition-all duration-200 transform hover:translate-y-[-2px] ${
                                        location.pathname === item.url
                                            ? 'bg-blue-600 text-white brutalist-shadow'
                                            : 'bg-white text-black hover:bg-lime-400'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4 inline mr-2" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    
                    {/* Mobile Navigation */}
                    <nav className="md:hidden mt-6 flex flex-wrap gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.url}
                                className={`px-4 py-2 brutalist-border brutalist-text text-xs transition-all duration-200 ${
                                    location.pathname === item.url
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-black hover:bg-lime-400'
                                }`}
                            >
                                <item.icon className="w-3 h-3 inline mr-1" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 pb-12">
                {children}
            </main>

            {/* WhatsApp Float Button */}
            <WhatsAppFloat />
        </div>
    );
}

