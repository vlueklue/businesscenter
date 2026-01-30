import React, { useState, useEffect } from "react";
import { Announcement } from "@/api/entities";
// import { apiClient } from "@/api/apiClient"; // Removed - will use Google services
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Pin, Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export default function AnnouncementManagement({ onStatsUpdate }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialFormState = {
    title: "",
    content: "",
    priority: "medium",
    category: "general",
    expires_at: "",
    pinned: false,
    requires_acknowledgment: false,
    target_audience: 'all',
    department: '',
    media_url: '',
    media_type: ''
  };
  const [currentAnnouncement, setCurrentAnnouncement] = useState(initialFormState);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await Announcement.list('-created_date');
      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
    setLoading(false);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setCurrentAnnouncement({
      ...announcement,
      expires_at: announcement.expires_at ? format(parseISO(announcement.expires_at), "yyyy-MM-dd'T'HH:mm") : '',
      media_url: announcement.media_url || '',
      media_type: announcement.media_type || ''
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingAnnouncement(null);
    setCurrentAnnouncement(initialFormState);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este anuncio?")) {
      try {
        await Announcement.delete(id);
        loadAnnouncements();
        onStatsUpdate();
        toast.success("Anuncio eliminado");
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error("Error al eliminar anuncio");
      }
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // TODO: Implement Google Cloud Storage upload
      const placeholderUrl = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      setCurrentAnnouncement(prev => ({
        ...prev,
        media_url: placeholderUrl,
        media_type: type
      }));
      toast.success("Archivo cargado (demo mode)");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error al subir archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...currentAnnouncement };
      if (!dataToSave.expires_at) {
        delete dataToSave.expires_at;
      }
      if (editingAnnouncement) {
        await Announcement.update(editingAnnouncement.id, dataToSave);
        toast.success("Anuncio actualizado");
      } else {
        await Announcement.create(dataToSave);
        toast.success("Anuncio creado");
      }
      setShowForm(false);
      loadAnnouncements();
      onStatsUpdate();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("Error al guardar anuncio");
    }
  };

  if (loading) return <div>Cargando anuncios...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Gestión de Anuncios</CardTitle>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Anuncio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Prioridad</TableHead><TableHead>Categoría</TableHead><TableHead>Media</TableHead><TableHead>Fijado</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {announcements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.priority}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {item.media_url ? (
                      item.media_type === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Video className="w-4 h-4 text-purple-500" />
                      )
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>
                  <TableCell>{item.pinned && <Pin className="w-4 h-4 text-amber-500" />}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingAnnouncement ? "Editar Anuncio" : "Crear Nuevo Anuncio"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2"><Label>Título</Label><Input value={currentAnnouncement.title} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, title: e.target.value })} required /></div>

            <div className="space-y-2">
              <Label>Multimedia (Imagen o Video)</Label>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                {currentAnnouncement.media_url ? (
                  <div className="relative rounded-md overflow-hidden bg-black/5 aspect-video flex items-center justify-center group">
                    {currentAnnouncement.media_type === 'video' ? (
                      <video src={currentAnnouncement.media_url} controls className="max-h-64 h-full w-full object-contain" />
                    ) : (
                      <img src={currentAnnouncement.media_url} alt="Media Preview" className="max-h-64 h-full w-full object-contain" />
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentAnnouncement({ ...currentAnnouncement, media_url: "", media_type: "" })}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-100 transition-colors relative">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-600">Click para subir imagen o video</p>
                    <p className="text-xs text-slate-400">JPG, PNG, MP4, WebM</p>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleMediaUpload}
                      disabled={uploading}
                    />
                  </div>
                )}
                {uploading && <p className="text-xs text-blue-500 mt-2">Subiendo archivo...</p>}
              </div>
            </div>

            <div className="space-y-2"><Label>Contenido</Label><Textarea value={currentAnnouncement.content} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, content: e.target.value })} rows={5} required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={currentAnnouncement.priority} onValueChange={v => setCurrentAnnouncement({ ...currentAnnouncement, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baja</SelectItem><SelectItem value="medium">Media</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="urgent">Urgente</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={currentAnnouncement.category} onValueChange={v => setCurrentAnnouncement({ ...currentAnnouncement, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="hr">Rectoría/RRHH</SelectItem><SelectItem value="safety">Seguridad</SelectItem><SelectItem value="technology">Tecnología</SelectItem><SelectItem value="training">Capacitación</SelectItem><SelectItem value="events">Eventos</SelectItem><SelectItem value="other">Otros</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Audiencia Objetivo</Label>
                <Select value={currentAnnouncement.target_audience} onValueChange={v => setCurrentAnnouncement({ ...currentAnnouncement, target_audience: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="managers">Gerentes</SelectItem><SelectItem value="department_specific">Departamento Específico</SelectItem><SelectItem value="executives">Ejecutivos</SelectItem></SelectContent></Select>
              </div>
              {currentAnnouncement.target_audience === 'department_specific' && <div className="space-y-2"><Label>Departamento</Label><Input value={currentAnnouncement.department} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, department: e.target.value })} /></div>}
              <div className="space-y-2">
                <Label>Expira el (Opcional)</Label>
                <Input type="datetime-local" value={currentAnnouncement.expires_at} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, expires_at: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2"><input type="checkbox" id="pinned" checked={currentAnnouncement.pinned} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, pinned: e.target.checked })} /><Label htmlFor="pinned">Fijar Anuncio</Label></div>
              <div className="flex items-center space-x-2"><input type="checkbox" id="requires_acknowledgment" checked={currentAnnouncement.requires_acknowledgment} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, requires_acknowledgment: e.target.checked })} /><Label htmlFor="requires_acknowledgment">Requerir Confirmación de Lectura</Label></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={uploading}>{uploading ? "Subiendo..." : "Guardar Anuncio"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}