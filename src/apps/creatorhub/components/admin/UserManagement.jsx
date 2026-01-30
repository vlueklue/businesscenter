import { useState, useEffect } from "react";
import { UserList } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Trash2, Key, ShieldCheck, Mail, Building, UserCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
// import { apiClient } from "@/api/apiClient"; // Removed - will use Google services

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "employee",
        department: "",
        position: "",
        photo_url: ""
    });
    const [newPassword, setNewPassword] = useState("");
    const [userToChangePassword, setUserToChangePassword] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await UserList.list();
            setUsers(data);
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            if (!currentUser.email || !currentUser.password || !currentUser.full_name) {
                toast.error("Por favor completa los campos obligatorios");
                return;
            }
            await UserList.create(currentUser);
            toast.success("Usuario creado exitosamente");
            setIsDialogOpen(false);
            resetForm();
            loadUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            toast.error("Error al crear usuario");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
        try {
            await UserList.delete(id);
            toast.success("Usuario eliminado");
            loadUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Error al eliminar usuario");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // TODO: Implement Google Cloud Storage upload
            const placeholderUrl = URL.createObjectURL(file);
            setCurrentUser(prev => ({ ...prev, photo_url: placeholderUrl }));
            toast.success("Foto cargada (demo mode)");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error al subir foto");
        } finally {
            setUploading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        try {
            await UserList.update(userToChangePassword.id, { password: newPassword });
            toast.success("Contraseña actualizada correctamente");
            setIsPasswordModalOpen(false);
            setNewPassword("");
            setUserToChangePassword(null);
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error("Error al actualizar contraseña");
        }
    };

    const resetForm = () => {
        setCurrentUser({
            full_name: "",
            email: "",
            password: "",
            role: "employee",
            department: "",
            position: "",
            photo_url: ""
        });
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar empleados..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Colaborador
                </Button>
            </div>

            <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Departamento</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-10">Cargando usuarios...</TableCell></TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500">No se encontraron empleados</TableCell></TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {user.photo_url ? (
                                                <img src={user.photo_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <UserCircle className="w-8 h-8 text-slate-300" />
                                            )}
                                            <div>
                                                <p className="font-semibold">{user.full_name}</p>
                                                <p className="text-xs text-slate-500">{user.position || 'Empleado'}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.department || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-50' : ''}>
                                            {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-slate-500 hover:text-blue-600 border-slate-200"
                                                title="Cambiar Contraseña"
                                                onClick={() => { setUserToChangePassword(user); setIsPasswordModalOpen(true); }}
                                            >
                                                <Key className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-slate-500 hover:text-red-600 border-slate-200"
                                                title="Eliminar"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create User Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Alta de Nuevo Colaborador</DialogTitle>
                        <DialogDescription>Completa la información para registrar un nuevo usuario en el sistema.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                        <div className="flex flex-col items-center gap-4 mb-4">
                            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden relative group border border-slate-200">
                                {currentUser.photo_url ? (
                                    <>
                                        <img src={currentUser.photo_url} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs text-center p-2">
                                            Cambiar
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center flex-col text-slate-400">
                                        <ImageIcon className="w-8 h-8 mb-1" />
                                        <span className="text-[10px]">Foto</span>
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
                            {uploading && <span className="text-xs text-blue-500 animate-pulse">Subiendo...</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo</Label>
                                <div className="relative">
                                    <UserCircle className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <Input id="name" placeholder="Ej. Juan Pérez" className="pl-10" value={currentUser.full_name} onChange={(e) => setCurrentUser({ ...currentUser, full_name: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <Input id="email" type="email" placeholder="email@empresa.com" className="pl-10" value={currentUser.email} onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña Inicial</Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <Input id="password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10" value={currentUser.password} onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Departamento</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <Input id="department" placeholder="Ej. IT" className="pl-10" value={currentUser.department} onChange={(e) => setCurrentUser({ ...currentUser, department: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol</Label>
                                    <Select onValueChange={(val) => setCurrentUser({ ...currentUser, role: val })} value={currentUser.role}>
                                        <SelectTrigger className="pl-10 relative">
                                            <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="employee">Empleado</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Registrar Empleado</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Change Password Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                            Estás actualizando la contraseña de <strong>{userToChangePassword?.full_name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Ingresa la nueva contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700">Actualizar Contraseña</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
