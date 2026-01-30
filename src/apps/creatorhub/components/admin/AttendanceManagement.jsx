import React, { useState, useEffect } from "react";
import { Attendance } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, LogIn, LogOut } from "lucide-react";

export default function AttendanceManagement({ onStatsUpdate }) {
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        setLoading(true);
        try {
            // In a real app we might want to paginate or filter this
            const data = await Attendance.list();
            // Sort by timestamp desc
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setAttendanceLogs(data);
        } catch (error) {
            console.error("Error loading attendance:", error);
        }
        setLoading(false);
    };

    if (loading) return <div>Cargando registros de asistencia...</div>;

    return (
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">Registro de Asistencias</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Fecha y Hora</TableHead>
                            <TableHead>Ubicación</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.user}</TableCell>
                                <TableCell>
                                    <Badge variant={log.type === 'check-in' ? "default" : "secondary"} className={log.type === 'check-in' ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-orange-100 text-orange-800 hover:bg-orange-200"}>
                                        {log.type === 'check-in' ? (
                                            <div className="flex items-center gap-1"><LogIn className="w-3 h-3" /> Entrada</div>
                                        ) : (
                                            <div className="flex items-center gap-1"><LogOut className="w-3 h-3" /> Salida</div>
                                        )}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {format(parseISO(log.timestamp), "d MMM, yyyy h:mm a", { locale: es })}
                                </TableCell>
                                <TableCell>
                                    {log.location ? (
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <MapPin className="w-3 h-3" />
                                            {log.location.latitude.toFixed(4)}, {log.location.longitude.toFixed(4)}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">No registrada</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {attendanceLogs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                    No hay registros de asistencia.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
