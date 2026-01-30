import React, { useState, useEffect } from "react";
import { Executive } from "@/api/entities";
// import { apiClient } from "@/api/apiClient"; // Removed - will use Google services
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Users, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function ExecutiveManagement({ onStatsUpdate }) {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialFormState = {
    full_name: "",
    position: "",
    department: "",
    bio: "",
    photo_url: "",
    email: "",
    phone: "",
    linkedin_url: "",
    office_location: "",
    years_with_company: 0,
    display_order: 0,
  };
  const [currentExecutive, setCurrentExecutive] = useState(initialFormState);

  useEffect(() => {
    loadExecutives();
  }, []);

  const loadExecutives = async () => {
    setLoading(true);
    try {
      const executiveData = await Executive.list('display_order');
      setExecutives(executiveData);
    } catch (error) {
      console.error("Error loading executives:", error);
    }
    setLoading(false);
  };

  const handleEdit = (executive) => {
    setEditingExecutive(executive);
    setCurrentExecutive(executive);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingExecutive(null);
    setCurrentExecutive(initialFormState);
    setShowForm(true);
  };

  const handleDelete = async (executiveId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este perfil ejecutivo?")) {
      try {
        await Executive.delete(executiveId);
        loadExecutives();
        onStatsUpdate();
        toast.success("Ejecutivo eliminado");
      } catch (error) {
        console.error("Error deleting executive:", error);
        toast.error("Error al eliminar ejecutivo");
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await apiClient.integrations.Core.UploadFile(file);
      setCurrentExecutive(prev => ({ ...prev, photo_url: result.url }));
      toast.success("Foto subida correctamente");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error al subir foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...currentExecutive,
        years_with_company: Number(currentExecutive.years_with_company) || 0,
        display_order: Number(currentExecutive.display_order) || 0,
      }
      if (editingExecutive) {
        await Executive.update(editingExecutive.id, dataToSave);
        toast.success("Ejecutivo actualizado");
      } else {
        await Executive.create(dataToSave);
        toast.success("Ejecutivo creado");
      }
      setShowForm(false);
      loadExecutives();
      onStatsUpdate();
    } catch (error) {
      console.error("Error saving executive:", error);
      toast.error("Error al guardar ejecutivo");
    }
  };

  if (loading) return <div>Cargando perfiles ejecutivos...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Gestión de Ejecutivos</CardTitle>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Ejecutivo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executives.map(exec => (
              <Card key={exec.id}>
                <CardHeader className="flex flex-row items-center gap-4">
                  {exec.photo_url ? (
                    <img src={exec.photo_url} alt={exec.full_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{exec.full_name}</CardTitle>
                    <p className="text-sm text-slate-600">{exec.position}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(exec)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(exec.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExecutive ? "Editar Ejecutivo" : "Crear Nuevo Ejecutivo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="w-32 h-32 rounded-full bg-slate-100 overflow-hidden relative group border border-slate-200">
                {currentExecutive.photo_url ? (
                  <>
                    <img src={currentExecutive.photo_url} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs text-center p-2">
                      Click para cambiar
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs">Subir foto</span>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
              {uploading && <span className="text-xs text-blue-500">Subiendo...</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nombre Completo</Label><Input value={currentExecutive.full_name} onChange={e => setCurrentExecutive({ ...currentExecutive, full_name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Cargo</Label><Input value={currentExecutive.position} onChange={e => setCurrentExecutive({ ...currentExecutive, position: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Departamento</Label><Input value={currentExecutive.department} onChange={e => setCurrentExecutive({ ...currentExecutive, department: e.target.value })} /></div>
              <div className="space-y-2"><Label>Correo Electrónico</Label><Input type="email" value={currentExecutive.email} onChange={e => setCurrentExecutive({ ...currentExecutive, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Teléfono</Label><Input value={currentExecutive.phone} onChange={e => setCurrentExecutive({ ...currentExecutive, phone: e.target.value })} /></div>

              <div className="space-y-2"><Label>URL de LinkedIn</Label><Input value={currentExecutive.linkedin_url} onChange={e => setCurrentExecutive({ ...currentExecutive, linkedin_url: e.target.value })} /></div>
              <div className="space-y-2"><Label>Ubicación de Oficina</Label><Input value={currentExecutive.office_location} onChange={e => setCurrentExecutive({ ...currentExecutive, office_location: e.target.value })} /></div>
              <div className="space-y-2"><Label>Años en la Empresa</Label><Input type="number" value={currentExecutive.years_with_company} onChange={e => setCurrentExecutive({ ...currentExecutive, years_with_company: e.target.value })} /></div>
              <div className="space-y-2"><Label>Orden de Visualización</Label><Input type="number" value={currentExecutive.display_order} onChange={e => setCurrentExecutive({ ...currentExecutive, display_order: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={currentExecutive.bio} onChange={e => setCurrentExecutive({ ...currentExecutive, bio: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={uploading}>Guardar Ejecutivo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}