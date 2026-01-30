import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Clock, LogIn, LogOut, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Attendance, User } from "@/api/entities";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const AttendancePage = () => {
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [locationError, setLocationError] = useState(null);

    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await User.me();
                setUser(userData);

                // Load all attendance records for this user
                const records = await Attendance.list({
                    where: { userId: userData.id }
                });

                // Sort by timestamp desc
                const sortedRecords = records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setAttendanceHistory(sortedRecords);

                // Check if currently checked in (last record was 'in' without a matching 'out' is checking last record enough? 
                // A simpler way is to check the most recent record. If it's 'in', we are checked in.)
                if (sortedRecords.length > 0 && sortedRecords[0].type === 'in') {
                    setCurrentSession(sortedRecords[0]);
                }

            } catch (error) {
                console.error("Error loading attendance data:", error);
                toast.error("No se pudo cargar el historial de asistencia");
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

    const handleAttendanceAction = async (type) => {
        setLoading(true);
        setLocationError(null);

        try {
            // 1. Get Location
            let location = null;
            try {
                location = await getLocation();
            } catch (error) {
                console.error("Geolocation error:", error);
                setLocationError("No pudimos obtener tu ubicación. Asegúrate de permitir el acceso.");
                setLoading(false);
                return;
            }

            // 2. Create Record
            const now = new Date().toISOString();
            const newRecord = {
                userId: user.id,
                type: type, // 'in' or 'out'
                timestamp: now,
                location: location,
                date: now.split('T')[0] // Helper date field
            };

            await Attendance.create(newRecord);

            // 3. Update State
            setAttendanceHistory(prev => [newRecord, ...prev]);

            if (type === 'in') {
                setCurrentSession(newRecord);
                toast.success("Entrada registrada correctamente");
            } else {
                setCurrentSession(null);
                toast.success("Salida registrada correctamente");
            }

        } catch (error) {
            console.error("Error registering attendance:", error);
            toast.error("Hubo un error al registrar tu asistencia");
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Registro de Asistencia</h1>
                    <p className="text-slate-500 mt-1">Gestiona tus entradas y salidas laborales</p>
                </div>

                {currentSession ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-1.5 text-sm border-green-200">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        Actualmente trabajando
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 px-4 py-1.5 text-sm">
                        <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
                        Fuera de turno
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Action Card */}
                <Card className="md:col-span-1 shadow-lg border-slate-200 overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-lg">Control de Horario</CardTitle>
                        <CardDescription>
                            Registra tu actividad en tiempo real
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center min-h-[200px]">
                        <div className="text-center mb-6">
                            <p className="text-4xl font-mono font-bold text-slate-700 tracking-widest">
                                {format(new Date(), 'HH:mm')}
                            </p>
                            <p className="text-sm text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                                {format(new Date(), 'EEEE, d MMMM', { locale: es })}
                            </p>
                        </div>

                        {currentSession ? (
                            <Button
                                size="lg"
                                onClick={() => handleAttendanceAction('out')}
                                disabled={loading}
                                className="w-full max-w-[200px] bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-100 hover:border-red-200 h-16 text-lg shadow-sm"
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
                                Registrar Salida
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                onClick={() => handleAttendanceAction('in')}
                                disabled={loading}
                                className="w-full max-w-[200px] bg-green-50 text-green-600 hover:bg-green-100 border-2 border-green-100 hover:border-green-200 h-16 text-lg shadow-sm"
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                                Registrar Entrada
                            </Button>
                        )}

                        {locationError && (
                            <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2 text-xs text-red-600 max-w-full">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{locationError}</p>
                            </div>
                        )}

                        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span>Ubicación requerida para el registro</span>
                        </div>
                    </CardContent>
                </Card>

                {/* History Card */}
                <Card className="md:col-span-2 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Historial Reciente</CardTitle>
                        <CardDescription>Tus últimos registros de actividad</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Fecha y Hora</TableHead>
                                        <TableHead>Ubicación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceHistory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                                                No hay registros recientes
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        attendanceHistory.map((record, index) => (
                                            <TableRow key={index} className="hover:bg-slate-50/50">
                                                <TableCell>
                                                    {record.type === 'in' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                            <LogIn className="w-3 h-3" /> Entrada
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                            <LogOut className="w-3 h-3" /> Salida
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-700">
                                                    {format(new Date(record.timestamp), 'PPpp', { locale: es })}
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm">
                                                    {record.location ? (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                                        >
                                                            <MapPin className="w-3 h-3" />
                                                            {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400 italic">No disponible</span>
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

export default AttendancePage;
