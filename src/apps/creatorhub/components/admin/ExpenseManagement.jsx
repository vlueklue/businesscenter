import React, { useState, useEffect } from "react";
import { Expense } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Receipt, Eye, CheckCircle, XCircle } from "lucide-react";

export default function ExpenseManagement({ onStatsUpdate }) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        setLoading(true);
        try {
            const data = await Expense.list();
            // Sort by date desc
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setExpenses(data);
        } catch (error) {
            console.error("Error loading expenses:", error);
        }
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aprobado</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rechazado</Badge>;
            default: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
        }
    };

    if (loading) return <div>Cargando viáticos...</div>;

    return (
        <>
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">Gestión de Viáticos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Comprobante</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>
                                        {format(parseISO(expense.date), "d MMM, yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="font-medium">{expense.user}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell className="font-bold">${Number(expense.amount).toFixed(2)}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(expense.status)}
                                    </TableCell>
                                    <TableCell>
                                        {expense.receipt_url ? (
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(expense.receipt_url)}>
                                                <Eye className="w-4 h-4 mr-1" /> Ver
                                            </Button>
                                        ) : (
                                            <span className="text-slate-400 text-xs">Sin comprobante</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {expenses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        No hay viáticos registrados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Comprobante de Gasto</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center p-4 bg-slate-100 rounded-lg">
                        {selectedReceipt && (
                            <img src={selectedReceipt} alt="Comprobante" className="max-h-[70vh] object-contain shadow-md" />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
