import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, DollarSign, Upload, Image as ImageIcon, Loader2, AlertCircle, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Expense, User } from "@/api/entities";
// import { apiClient } from "@/api/apiClient"; // Removed - will use Google services later
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ExpensesPage = () => {
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        image_url: ""
    });
    const [uploading, setUploading] = useState(false);
    const [locationError, setLocationError] = useState(null);

    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await User.me();
                setUser(userData);

                // Load records
                const records = await Expense.list({
                    where: { userId: userData.id }
                });

                // Sort by timestamp desc
                const sortedRecords = records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setHistory(sortedRecords);

            } catch (error) {
                console.error("Error loading expenses data:", error);
                toast.error("No se pudo cargar el historial de viáticos");
            } finally {
                setInitializing(false);
            }
        };

        loadData();
    }, []);

    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("La geolocalización no es compatible con este navegador."));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // TODO: Implement Google Cloud Storage upload
            // For now, just create a placeholder URL
            const placeholderUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, image_url: placeholderUrl }));
            toast.success("Comprobante cargado (demo mode)");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error al subir comprobante");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLocationError(null);

        if (!formData.description || !formData.amount || !formData.image_url) {
            toast.error("Todos los campos son obligatorios, incluyendo la imagen");
            setLoading(false);
            return;
        }

        try {
            // 1. Get Location
            let location = null;
            try {
                location = await getLocation();
            } catch (error) {
                console.error("Geolocation error:", error);
                setLocationError("No pudimos obtener tu ubicación. Permite el acceso para registrar el viático.");
                setLoading(false);
                return;
            }

            // 2. Create Record
            const now = new Date().toISOString();
            const newRecord = {
                userId: user.id,
                description: formData.description,
                amount: parseFloat(formData.amount),
                image_url: formData.image_url,
                timestamp: now,
                location: location,
                status: 'pending' // pending, approved, rejected
            };

            await Expense.create(newRecord);

            // 3. Update State
            setHistory(prev => [newRecord, ...prev]);
            setFormData({ description: "", amount: "", image_url: "" });
            toast.success("Viático registrado correctamente");

        } catch (error) {
            console.error("Error registering expense:", error);
            toast.error("Hubo un error al registrar el viático");
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Registro de Viáticos</h1>
                    <p className="text-slate-500 mt-1">Sube tus gastos y comprobantes desde tu ubicación</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Card */}
                <Card className="lg:col-span-1 shadow-lg border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-lg">Nuevo Gasto</CardTitle>
                        <CardDescription>
                            Registra un nuevo comprobante
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Monto ($)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="pl-9 text-lg font-medium"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    placeholder="¿En qué se gastó?"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Comprobante (Foto)</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors text-center cursor-pointer relative group">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        required={!formData.image_url}
                                    />
                                    {formData.image_url ? (
                                        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-100">
                                            <img src={formData.image_url} alt="Comprobante" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white text-sm font-medium">Cambiar imagen</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 py-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-1">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">Subir imagen</p>
                                            <p className="text-xs text-slate-500">JPG, PNG, WebP</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {locationError && (
                                <div className="p-3 bg-red-50 rounded-lg flex items-start gap-2 text-xs text-red-600">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{locationError}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-slate-400 justify-center pt-2">
                                <MapPin className="w-3 h-3" />
                                <span>Se registrará tu ubicación actual</span>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading || uploading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Receipt className="mr-2 h-4 w-4" />}
                                Registrar Gasto
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Card */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Historial de Gastos</CardTitle>
                        <CardDescription>Tus registros recientes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Monto</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Detalles</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                No hay gastos registrados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        history.map((item, index) => (
                                            <TableRow key={index} className="hover:bg-slate-50/50">
                                                <TableCell className="text-sm text-slate-500">
                                                    {format(new Date(item.timestamp), 'd MMM, HH:mm', { locale: es })}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-700">
                                                    {item.description}
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {item.location ? `${item.location.lat.toFixed(4)}, ${item.location.lng.toFixed(4)}` : 'Ubicación desconocida'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-slate-900">
                                                    ${item.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.status === 'approved' ? 'default' : 'secondary'} className={
                                                        item.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' :
                                                            item.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' :
                                                                'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200'
                                                    }>
                                                        {item.status === 'pending' ? 'Pendiente' : item.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.image_url && (
                                                        <a href={item.image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                            <ImageIcon className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ExpensesPage;
