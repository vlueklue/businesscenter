import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simplified login for demo
        navigate('/home');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl text-white">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Creator Hub</CardTitle>
                    <CardDescription className="text-slate-400 text-center">
                        Bienvenido de nuevo. Ingrese sus credenciales para continuar.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                className="bg-slate-800/50 border-slate-700 text-white"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 text-lg transition-all duration-300">
                            Iniciar Sesión
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;
