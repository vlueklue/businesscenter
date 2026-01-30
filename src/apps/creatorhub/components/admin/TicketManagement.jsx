import React, { useState, useEffect } from "react";
import { Ticket } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function TicketManagement({ onStatsUpdate }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketUpdate, setTicketUpdate] = useState({ status: "", resolution_notes: "", assigned_to: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const filters = filterStatus === "all" ? {} : { status: filterStatus };
      const ticketData = await Ticket.list({ where: filters });
      setTickets(ticketData);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
    setLoading(false);
  };

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setTicketUpdate({
      status: ticket.status,
      resolution_notes: ticket.resolution_notes || "",
      assigned_to: ticket.assigned_to || ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await Ticket.update(selectedTicket.id, ticketUpdate);
      setSelectedTicket(null);
      loadTickets();
      onStatsUpdate();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = { open: "bg-blue-100 text-blue-800", in_progress: "bg-yellow-100 text-yellow-800", waiting_response: "bg-purple-100 text-purple-800", resolved: "bg-green-100 text-green-800", closed: "bg-gray-100 text-gray-800" };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = { low: "text-blue-600", medium: "text-yellow-600", high: "text-orange-600", urgent: "text-red-600" };
    return colors[priority] || colors.medium;
  };

  if (loading) return <div>Cargando tickets...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Gestión de Tickets</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="open">Abierto</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="waiting_response">Esperando Respuesta</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Asunto</TableHead><TableHead>Solicitante</TableHead><TableHead>Estado</TableHead><TableHead>Prioridad</TableHead><TableHead>Creado</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>{ticket.requester_name}</TableCell>
                  <TableCell><Badge className={getStatusColor(ticket.status)}>{ticket.status === 'open' ? 'Abierto' : ticket.status === 'in_progress' ? 'En Progreso' : ticket.status === 'waiting_response' ? 'Esperando Respuesta' : ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}</Badge></TableCell>
                  <TableCell className={getPriorityColor(ticket.priority)}>{ticket.priority === 'low' ? 'Baja' : ticket.priority === 'medium' ? 'Media' : ticket.priority === 'high' ? 'Alta' : 'Urgente'}</TableCell>
                  <TableCell>{format(parseISO(ticket.created_date), "d MMM, yyyy", { locale: es })}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleView(ticket)}><Eye className="w-4 h-4 mr-1" /> Ver / Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Detalles del Ticket</DialogTitle></DialogHeader>
          {selectedTicket && (
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div><h3 className="font-semibold">{selectedTicket.subject}</h3><p className="text-sm text-slate-600">de {selectedTicket.requester_name}</p></div>
              <p className="text-sm bg-slate-50 p-3 rounded-md">{selectedTicket.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Asignado a</Label><Input value={ticketUpdate.assigned_to} onChange={e => setTicketUpdate({ ...ticketUpdate, assigned_to: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={ticketUpdate.status} onValueChange={v => setTicketUpdate({ ...ticketUpdate, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Abierto</SelectItem><SelectItem value="in_progress">En Progreso</SelectItem><SelectItem value="waiting_response">Esperando Respuesta</SelectItem><SelectItem value="resolved">Resuelto</SelectItem><SelectItem value="closed">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Notas de Resolución</Label><Textarea value={ticketUpdate.resolution_notes} onChange={e => setTicketUpdate({ ...ticketUpdate, resolution_notes: e.target.value })} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedTicket(null)}>Cancelar</Button>
                <Button type="submit">Actualizar Ticket</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}