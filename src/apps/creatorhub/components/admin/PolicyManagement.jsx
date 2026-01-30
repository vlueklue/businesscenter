import React, { useState, useEffect } from "react";
import { Policy } from "@/api/entities";
// import { apiClient } from "@/api/apiClient"; // Removed - will use Google services
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Upload, X, Video, Image as ImageIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from "sonner";

export default function PolicyManagement({ onStatsUpdate }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialFormState = {
    title: "",
    description: "",
    category: "other",
    content: "",
    file_url: "",
    media_url: "",
    media_type: "", // 'image' or 'video'
    effective_date: "",
    last_reviewed: "",
    status: "active"
  };
  const [currentPolicy, setCurrentPolicy] = useState(initialFormState);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const policyData = await Policy.list('-effective_date');
      setPolicies(policyData);
    } catch (error) {
      console.error("Error loading policies:", error);
    }
    setLoading(false);
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setCurrentPolicy({
      ...policy,
      effective_date: policy.effective_date ? format(parseISO(policy.effective_date), 'yyyy-MM-dd') : '',
      last_reviewed: policy.last_reviewed ? format(parseISO(policy.last_reviewed), 'yyyy-MM-dd') : '',
      media_url: policy.media_url || "",
      media_type: policy.media_type || ""
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingPolicy(null);
    setCurrentPolicy(initialFormState);
    setShowForm(true);
  };

  const handleDelete = async (policyId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta política?")) {
      try {
        await Policy.delete(policyId);
        loadPolicies();
        onStatsUpdate();
        toast.success("Política eliminada");
      } catch (error) {
        console.error("Error deleting policy:", error);
        toast.error("Error al eliminar política");
      }
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await apiClient.integrations.Core.UploadFile(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      setCurrentPolicy(prev => ({
        ...prev,
        media_url: result.url,
        media_type: type
      }));
      toast.success("Archivo multimedia subido correctamente");
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
      if (editingPolicy) {
        await Policy.update(editingPolicy.id, currentPolicy);
        toast.success("Política actualizada");
      } else {
        await Policy.create(currentPolicy);
        toast.success("Política creada");
      }
      setShowForm(false);
      loadPolicies();
      onStatsUpdate();
    } catch (error) {
      console.error("Error saving policy:", error);
      toast.error("Error al guardar política");
    }
  };

  if (loading) return <div>Cargando políticas...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Gestión de Políticas</CardTitle>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Política
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Vigencia</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.title}</TableCell>
                  <TableCell>{policy.category === 'hr' ? 'Rectoría/RRHH' : policy.category === 'safety' ? 'Seguridad' : policy.category === 'conduct' ? 'Conducta' : policy.category === 'procedures' ? 'Procedimientos' : policy.category === 'benefits' ? 'Beneficios' : policy.category === 'technology' ? 'Tecnología' : 'Otros'}</TableCell>
                  <TableCell>
                    {policy.media_url ? (
                      policy.media_type === 'image' ? (
                        <ImageIcon className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Video className="w-5 h-5 text-purple-500" />
                      )
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>
                  <TableCell>{policy.status === 'active' ? 'Activo' : policy.status === 'draft' ? 'Borrador' : 'Archivado'}</TableCell>
                  <TableCell>{format(parseISO(policy.effective_date), "d MMM, yyyy", { locale: es })}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(policy)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(policy.id)}>
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? "Editar Política" : "Crear Nueva Política"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={currentPolicy.title} onChange={(e) => setCurrentPolicy({ ...currentPolicy, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={currentPolicy.category} onValueChange={(value) => setCurrentPolicy({ ...currentPolicy, category: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">Rectoría/RRHH</SelectItem>
                    <SelectItem value="safety">Seguridad</SelectItem>
                    <SelectItem value="conduct">Conducta</SelectItem>
                    <SelectItem value="procedures">Procedimientos</SelectItem>
                    <SelectItem value="benefits">Beneficios</SelectItem>
                    <SelectItem value="technology">Tecnología</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="space-y-2">
              <Label>Multimedia (Imagen o Video)</Label>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                {currentPolicy.media_url ? (
                  <div className="relative rounded-md overflow-hidden bg-black/5 aspect-video flex items-center justify-center group">
                    {currentPolicy.media_type === 'video' ? (
                      <video src={currentPolicy.media_url} controls className="max-h-64 h-full w-full object-contain" />
                    ) : (
                      <img src={currentPolicy.media_url} alt="Media Preview" className="max-h-64 h-full w-full object-contain" />
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentPolicy({ ...currentPolicy, media_url: "", media_type: "" })}
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

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={currentPolicy.description} onChange={(e) => setCurrentPolicy({ ...currentPolicy, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Contenido (Editor)</Label>
              <ReactQuill theme="snow" value={currentPolicy.content} onChange={(value) => setCurrentPolicy({ ...currentPolicy, content: value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file_url">URL del Archivo (PDF/Doc)</Label>
                <Input id="file_url" value={currentPolicy.file_url} onChange={(e) => setCurrentPolicy({ ...currentPolicy, file_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={currentPolicy.status} onValueChange={(value) => setCurrentPolicy({ ...currentPolicy, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effective_date">Fecha de Vigencia</Label>
                <Input id="effective_date" type="date" value={currentPolicy.effective_date} onChange={(e) => setCurrentPolicy({ ...currentPolicy, effective_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_reviewed">Fecha de Última Revisión</Label>
                <Input id="last_reviewed" type="date" value={currentPolicy.last_reviewed} onChange={(e) => setCurrentPolicy({ ...currentPolicy, last_reviewed: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={uploading}>{uploading ? "Subiendo..." : "Guardar Política"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}