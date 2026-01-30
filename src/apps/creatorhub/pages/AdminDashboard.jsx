import React, { useState, useEffect } from "react";
import { Event, Policy, Executive, Announcement, Ticket, TimeOffRequest, User, UserList, Attendance, Expense } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Calendar,
  FileText,
  Users,
  Megaphone,
  Ticket as TicketIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Zap,
  MapPin,
  Receipt,
  UserPlus
} from "lucide-react";
import { format, parseISO } from "date-fns";

import EventManagement from "../components/admin/EventManagement";
import PolicyManagement from "../components/admin/PolicyManagement";
import ExecutiveManagement from "../components/admin/ExecutiveManagement";
import AnnouncementManagement from "../components/admin/AnnouncementManagement";
import TicketManagement from "../components/admin/TicketManagement";
import TimeOffManagement from "../components/admin/TimeOffManagement";
import AttendanceManagement from "../components/admin/AttendanceManagement";
import ExpenseManagement from "../components/admin/ExpenseManagement";
import UserManagement from "../components/admin/UserManagement";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    events: 0,
    policies: 0,
    executives: 0,
    announcements: 0,
    openTickets: 0,
    pendingTimeOff: 0,
    attendanceToday: 0,
    pendingExpenses: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await User.me();
      if (userData.role !== 'admin') {
        // Redirect non-admin users
        window.location.href = '/';
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error("Error checking admin access:", error);
      // Redirect if not authenticated
      window.location.href = '/';
    }
  };

  const loadStats = async () => {
    try {
      const [events, policies, executives, announcements, tickets, timeOffRequests, attendance, expenses] = await Promise.all([
        Event.list(),
        Policy.list(),
        Executive.list(),
        Announcement.list(),
        Ticket.list(),
        TimeOffRequest.list(),
        Attendance.list(),
        Expense.list(),
        UserList.list()
      ]);

      setStats({
        events: Array.isArray(events) ? events.length : 0,
        policies: Array.isArray(policies) ? policies.length : 0,
        executives: Array.isArray(executives) ? executives.length : 0,
        announcements: Array.isArray(announcements) ? announcements.length : 0,
        openTickets: Array.isArray(tickets) ? tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length : 0,
        pendingTimeOff: Array.isArray(timeOffRequests) ? timeOffRequests.filter(t => t.status === 'pending').length : 0,
        attendanceToday: Array.isArray(attendance) ? attendance.filter(a => {
          const today = new Date().toISOString().split('T')[0];
          return a.timestamp.startsWith(today) && a.type === 'check-in';
        }).length : 0,
        pendingExpenses: Array.isArray(expenses) ? expenses.filter(e => e.status === 'pending').length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Panel de Administración</h1>
                <p className="text-slate-600 text-lg">Gestiona el portal de tu empresa y los servicios para empleados</p>
              </div>
              <Badge className="bg-red-100 text-red-800 border-red-200 px-4 py-2">
                <Settings className="w-4 h-4 mr-2" />
                Acceso de Administrador
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10 bg-white/80 backdrop-blur-sm border border-slate-200 p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Vista General
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Altas
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Eventos
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Políticas
              </TabsTrigger>
              <TabsTrigger value="executives" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Ejecutivos
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Anuncios
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Asistencia
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Viáticos
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <TicketIcon className="w-4 h-4" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="timeoff" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tiempo Libre
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Eventos</p>
                        <p className="text-3xl font-bold">{stats.events}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Asistencias Hoy</p>
                        <p className="text-3xl font-bold">{stats.attendanceToday}</p>
                      </div>
                      <MapPin className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-100 text-sm font-medium">Viáticos Pendientes</p>
                        <p className="text-3xl font-bold">{stats.pendingExpenses}</p>
                      </div>
                      <Receipt className="w-8 h-8 text-teal-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Ejecutivos</p>
                        <p className="text-3xl font-bold">{stats.executives}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100 text-sm font-medium">Anuncios</p>
                        <p className="text-3xl font-bold">{stats.announcements}</p>
                      </div>
                      <Megaphone className="w-8 h-8 text-amber-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Tickets Abiertos</p>
                        <p className="text-3xl font-bold">{stats.openTickets}</p>
                      </div>
                      <TicketIcon className="w-8 h-8 text-red-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm font-medium">Tiempo Libre Pend.</p>
                        <p className="text-3xl font-bold">{stats.pendingTimeOff}</p>
                      </div>
                      <Clock className="w-8 h-8 text-indigo-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Colaboradores</p>
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <UserPlus className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Daily Management Section */}
                <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      Acciones Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 group" onClick={() => setActiveTab('events')}>
                        <Calendar className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                        <span>Nuevo Evento</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-200 group" onClick={() => setActiveTab('announcements')}>
                        <Megaphone className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                        <span>Enviar Anuncio</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-green-50 hover:border-green-200 group" onClick={() => setActiveTab('expenses')}>
                        <Receipt className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                        <span>Revisar Viáticos</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 group" onClick={() => setActiveTab('users')}>
                        <UserPlus className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                        <span>Colaboradores</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-red-50 hover:border-red-200 group" onClick={() => setActiveTab('attendance')}>
                        <MapPin className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                        <span>Ver Asistencia</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Status Card */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Settings className="w-5 h-5 text-slate-500" />
                      Estado del Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Base de Datos</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">En Línea</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Servicio de Correo</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Operativo</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Almacenamiento</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">92% Libre</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events">
              <EventManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="policies">
              <PolicyManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="executives">
              <ExecutiveManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="announcements">
              <AnnouncementManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="expenses">
              <ExpenseManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="tickets">
              <TicketManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="timeoff">
              <TimeOffManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement onStatsUpdate={loadStats} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}