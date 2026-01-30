import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("user@example.com");
    const [password, setPassword] = useState("password");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await User.login(email, password);
            toast.success("¡Bienvenido de nuevo!");
            navigate("/");
        } catch (err) {
            toast.error("Credenciales inválidas (¡prueba con los valores predeterminados!)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
            </div>

            <Card className="w-full max-w-md border-slate-100 bg-white/95 backdrop-blur-md text-slate-900 shadow-2xl relative z-10 overflow-hidden">
                <CardHeader className="space-y-4 pb-8 border-b border-slate-100">
                    <div className="flex justify-center flex-col items-center gap-4">
                        <div className="w-80 h-80 flex items-center justify-center">
                            <img src="/logo.png" alt="Portal Staff Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-center">
                            <CardDescription className="text-slate-500 font-medium">
                                Ingresa tus credenciales para acceder al portal
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4 pt-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Correo electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="nombre@empresa.com"
                                    className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/20 focus:border-blue-600 transition-all h-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-slate-700">Contraseña</label>
                                <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-bold tracking-tight">
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/20 focus:border-blue-600 transition-all h-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-4 pb-8">
                        <Button
                            type="submit"
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all duration-200 shadow-md shadow-blue-200"
                            disabled={loading}
                        >
                            {loading ? "Autenticando..." : "Iniciar Sesión"}
                        </Button>
                        <p className="text-center text-xs text-slate-400 font-medium">
                            Al iniciar sesión, aceptas nuestros Términos de Servicio.
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
