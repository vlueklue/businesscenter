import React, { useState, useEffect } from "react";
import { Message, User, UserList } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Inbox, Plus, User as UserIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function Messaging() {
    const [currentUser, setCurrentUser] = useState(null);
    const [inboxMessages, setInboxMessages] = useState([]);
    const [sentMessages, setSentMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    // Compose State
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [newMessage, setNewMessage] = useState({ to: "", subject: "", body: "" });

    // View State
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
                if (user) {
                    await loadMessages(user.email);
                    await loadUsers();
                }
            } catch (error) {
                console.error("Error initializing messaging:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const loadMessages = async (userEmail) => {
        try {
            const allMessages = await Message.list();
            // Filter manually since our mock backend might not support complex OR queries easily yet
            // In a real app, API would handle this filter efficiently
            const received = allMessages.filter(m => m.to_email === userEmail).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const sent = allMessages.filter(m => m.from_email === userEmail).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setInboxMessages(received);
            setSentMessages(sent);
        } catch (error) {
            console.error("Error loading messages:", error);
            toast.error("Error al cargar mensajes");
        }
    };

    const loadUsers = async () => {
        try {
            const userList = await UserList.list();
            setUsers(userList);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.to || !newMessage.subject || !newMessage.body) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        try {
            const recipient = users.find(u => u.email === newMessage.to);

            await Message.create({
                from_email: currentUser.email,
                from_name: currentUser.full_name,
                to_email: newMessage.to,
                to_name: recipient ? recipient.full_name : newMessage.to,
                subject: newMessage.subject,
                body: newMessage.body,
                read: false,
                created_at: new Date().toISOString()
            });

            toast.success("Mensaje enviado correctamente");
            setIsComposeOpen(false);
            setNewMessage({ to: "", subject: "", body: "" });
            loadMessages(currentUser.email);
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Error al enviar el mensaje");
        }
    };

    const openMessage = async (message) => {
        setSelectedMessage(message);
        setIsViewOpen(true);

        // Mark as read if it's an inbox message and not already read
        if (message.to_email === currentUser.email && !message.read) {
            try {
                await Message.update(message.id, { read: true });
                // Update local state to reflect read status
                setInboxMessages(prev => prev.map(m => m.id === message.id ? { ...m, read: true } : m));
            } catch (error) {
                console.error("Error marking message as read", error);
            }
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mensajería Interna</h1>
                        <p className="text-slate-500 mt-1">Comunícate con otros miembros del equipo</p>
                    </div>
                    <Button onClick={() => setIsComposeOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 border-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Mensaje
                    </Button>
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <Tabs defaultValue="inbox" className="w-full">
                        <div className="p-4 border-b border-slate-100 bg-white rounded-t-lg">
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="inbox" className="flex items-center gap-2">
                                    <Inbox className="w-4 h-4" />
                                    Bandeja de Entrada
                                    {inboxMessages.some(m => !m.read) && (
                                        <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 h-5 px-1.5 min-w-[1.25rem]">
                                            {inboxMessages.filter(m => !m.read).length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="sent" className="flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Enviados
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <CardContent className="p-0">
                            <TabsContent value="inbox" className="m-0">
                                {inboxMessages.length === 0 ? (
                                    <div className="text-center py-16 text-slate-500">
                                        <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                        <p>No tienes mensajes recibidos</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                                <TableHead className="w-[250px]">De</TableHead>
                                                <TableHead>Asunto</TableHead>
                                                <TableHead className="w-[150px] text-right">Fecha</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inboxMessages.map((msg) => (
                                                <TableRow
                                                    key={msg.id}
                                                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${!msg.read ? 'bg-blue-50/30 font-medium' : ''}`}
                                                    onClick={() => openMessage(msg)}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${!msg.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                            {msg.from_name}
                                                            <span className="text-xs text-slate-400 font-normal block md:hidden">{msg.from_email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-slate-900">{msg.subject}</span>
                                                        <p className="text-xs text-slate-500 truncate max-w-[300px]">{msg.body}</p>
                                                    </TableCell>
                                                    <TableCell className="text-right text-slate-500 text-sm">
                                                        {format(new Date(msg.created_at || Date.now()), "d MMM, HH:mm", { locale: es })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>

                            <TabsContent value="sent" className="m-0">
                                {sentMessages.length === 0 ? (
                                    <div className="text-center py-16 text-slate-500">
                                        <Send className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                        <p>No has enviado mensajes aún</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                                <TableHead className="w-[250px]">Para</TableHead>
                                                <TableHead>Asunto</TableHead>
                                                <TableHead className="w-[150px] text-right">Fecha</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sentMessages.map((msg) => (
                                                <TableRow key={msg.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => openMessage(msg)}>
                                                    <TableCell>
                                                        {msg.to_name}
                                                        <span className="text-xs text-slate-400 block">{msg.to_email}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-slate-900">{msg.subject}</span>
                                                        <p className="text-xs text-slate-500 truncate max-w-[300px]">{msg.body}</p>
                                                    </TableCell>
                                                    <TableCell className="text-right text-slate-500 text-sm">
                                                        {format(new Date(msg.created_at || Date.now()), "d MMM, HH:mm", { locale: es })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>

            {/* Compose Dialog */}
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Nuevo Mensaje</DialogTitle>
                        <DialogDescription>Envía un mensaje privado a otro miembro del equipo.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSendMessage} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipient">Destinatario</Label>
                            <Select onValueChange={(val) => setNewMessage({ ...newMessage, to: val })} value={newMessage.to}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar usuario..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.filter(u => u.email !== currentUser?.email).map(user => (
                                        <SelectItem key={user.id} value={user.email}>
                                            {user.full_name} ({user.department})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Asunto</Label>
                            <Input
                                id="subject"
                                placeholder="Escribe el asunto..."
                                value={newMessage.subject}
                                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="body">Mensaje</Label>
                            <Textarea
                                id="body"
                                placeholder="Escribe tu mensaje aquí..."
                                rows={6}
                                value={newMessage.body}
                                onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>Cancelar</Button>
                            <Button type="submit">Enviar Mensaje</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Message Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    {selectedMessage && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedMessage.subject}</DialogTitle>
                                <div className="flex flex-col gap-1 text-sm text-slate-500 mt-2">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-900">De: {selectedMessage.from_name} &lt;{selectedMessage.from_email}&gt;</span>
                                        <span>{format(new Date(selectedMessage.created_at || Date.now()), "d MMM yyyy, HH:mm", { locale: es })}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-900">Para: {selectedMessage.to_name}</span>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="py-6 whitespace-pre-wrap text-slate-800 leading-relaxed border-t border-slate-100 mt-4">
                                {selectedMessage.body}
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setIsViewOpen(false)}>Cerrar</Button>
                                {selectedMessage.to_email === currentUser?.email && (
                                    <Button variant="secondary" onClick={() => {
                                        setIsViewOpen(false);
                                        setIsComposeOpen(true);
                                        setNewMessage({
                                            to: selectedMessage.from_email,
                                            subject: `Re: ${selectedMessage.subject}`,
                                            body: `\n\n--- El ${format(new Date(selectedMessage.created_at), "d MMM yyyy", { locale: es })} ${selectedMessage.from_name} escribió: ---\n${selectedMessage.body}`
                                        });
                                    }}>
                                        Responder
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
