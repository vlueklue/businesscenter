import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
// import { apiClient } from "@/api/apiClient"; // Removed - will use Google services
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function EventManagement({ onStatsUpdate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialFormState = {
    title: "",
    description: "",
    type: "company_event",
    start_date: "",
    end_date: "",
    location: "",
    department: "",
    mandatory: false,
    image_url: ""
  };
  const [currentEvent, setCurrentEvent] = useState(initialFormState);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventData = await Event.list('-start_date');
      setEvents(eventData);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setLoading(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setCurrentEvent({
      ...event,
      start_date: format(parseISO(event.start_date), "yyyy-MM-dd'T'HH:mm"),
      end_date: format(parseISO(event.end_date), "yyyy-MM-dd'T'HH:mm"),
      image_url: event.image_url || ""
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingEvent(null);
    setCurrentEvent(initialFormState);
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      try {
        await Event.delete(eventId);
        loadEvents();
        onStatsUpdate();
        toast.success("Evento eliminado");
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Error al eliminar evento");
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // TODO: Implement Google Cloud Storage upload
      const placeholderUrl = URL.createObjectURL(file);
      setCurrentEvent(prev => ({ ...prev, image_url: placeholderUrl }));
      toast.success("Imagen cargada (demo mode)");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await Event.update(editingEvent.id, currentEvent);
        toast.success("Evento actualizado");
      } else {
        await Event.create(currentEvent);
        toast.success("Evento creado");
      }
      setShowForm(false);
      loadEvents();
      onStatsUpdate();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Error al guardar evento");
    }
  };

  if (loading) return <div>Cargando eventos...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Gestión de Eventos</CardTitle>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Evento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Img</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    {event.image_url ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100">
                        <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.type === 'training' ? 'Capacitación' : event.type === 'shift' ? 'Turno' : event.type === 'meeting' ? 'Reunión' : event.type === 'company_event' ? 'Evento de Empresa' : 'Otro'}</TableCell>
                  <TableCell>{format(parseISO(event.start_date), "d MMM, yyyy h:mm a", { locale: es })}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(event)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-4">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Imagen del Evento</Label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center shrink-0 relative group">
                    {currentEvent.image_url ? (
                      <>
                        <img src={currentEvent.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCurrentEvent(p => ({ ...p, image_url: "" }))}
                          className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-slate-500">
                      Sube una imagen para mostrar en los detalles del evento. (JPG, PNG, WebP)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" value={currentEvent.title} onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={currentEvent.type} onValueChange={(value) => setCurrentEvent({ ...currentEvent, type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training">Capacitación</SelectItem>
                      <SelectItem value="shift">Turno</SelectItem>
                      <SelectItem value="meeting">Reunión</SelectItem>
                      <SelectItem value="company_event">Evento de Empresa</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha de Inicio</Label>
                  <Input id="start_date" type="datetime-local" value={currentEvent.start_date} onChange={(e) => setCurrentEvent({ ...currentEvent, start_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha de Fin</Label>
                  <Input id="end_date" type="datetime-local" value={currentEvent.end_date} onChange={(e) => setCurrentEvent({ ...currentEvent, end_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input id="location" value={currentEvent.location} onChange={(e) => setCurrentEvent({ ...currentEvent, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input id="department" value={currentEvent.department} onChange={(e) => setCurrentEvent({ ...currentEvent, department: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" value={currentEvent.description} onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })} />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={currentEvent.mandatory}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, mandatory: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                />
                <Label htmlFor="mandatory">Asistencia Obligatoria</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={uploading}>{uploading ? "Subiendo..." : "Guardar Evento"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}