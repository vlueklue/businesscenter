import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutGrid, Bot, Zap } from "lucide-react";

const Home = () => {
    const navigate = useNavigate();

    const apps = [
        {
            id: 'creatorflow',
            name: 'Creator Flow',
            description: 'Gestiona tus flujos de trabajo creativos con facilidad.',
            icon: <Zap className="w-12 h-12 text-yellow-400" />,
            color: 'hover:border-yellow-400/50',
            path: '/creatorflow'
        },
        {
            id: 'creatorhub',
            name: 'Creator Hub',
            description: 'El centro neurálgico para todas tus herramientas de creador.',
            icon: <LayoutGrid className="w-12 h-12 text-blue-400" />,
            color: 'hover:border-blue-400/50',
            path: '/creatorhub'
        },
        {
            id: 'ideamachina',
            name: 'Idea Machina',
            description: 'Convierte tus ideas en proyectos accionables con IA.',
            icon: <Hubot className="w-12 h-12 text-purple-400" />,
            color: 'hover:border-purple-400/50',
            path: '/ideamachina'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Suite Creativa
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Selecciona la herramienta que necesitas para potenciar tu creatividad hoy.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {apps.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => navigate(app.path)}
                            className="group text-left focus:outline-none transition-all duration-300 transform hover:-translate-y-2"
                        >
                            <Card className={`h-full border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-colors duration-300 ${app.color} overflow-hidden relative`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    {app.icon}
                                </div>
                                <CardHeader className="p-8 space-y-4">
                                    <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                                        {app.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                                            {app.name}
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 text-lg leading-relaxed">
                                            {app.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
