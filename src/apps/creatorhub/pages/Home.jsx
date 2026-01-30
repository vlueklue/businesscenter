import { useState, useEffect } from "react";
import { Event, Announcement, Ticket, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Calendar,
  Megaphone,
  Ticket as TicketIcon,
  Clock,
  Plus
} from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function Home() {
  const [user, setUser] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const events = await Event.list('-start_date', 5);
      const announcements = await Announcement.list('-created_date', 3);
      const tickets = userData ? await Ticket.list({ where: { requester_email: userData.email } }) : [];

      setUpcomingEvents(events);
      setRecentAnnouncements(announcements);
      setUserTickets(tickets);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  const getEventDateLabel = (startDate) => {
    const date = parseISO(startDate);
    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    return format(date, "d MMM", { locale: es });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 border-blue-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      waiting_response: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return colors[status] || colors.open;
  };

  const translateStatus = (status) => {
    const map = {
      open: "Abierto",
      in_progress: "En progreso",
      waiting_response: "Esperando respuesta",
      resolved: "Resuelto",
      closed: "Cerrado"
    };
    return map[status] || status;
  };

  const translatePriority = (priority) => {
    const map = {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      urgent: "Urgente"
    };
    return map[priority] || priority;
  };

  const translateType = (type) => {
    const map = {
      training: "Capacitación",
      meeting: "Reunión",
      event: "Evento"
    };
    return map[type] || type;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                    Bienvenido de nuevo, <span className="text-blue-600">{user?.full_name?.split(' ')[0] || 'Empleado'}</span>
                  </h1>
                  <p className="text-slate-600 text-lg">
                    {user?.department && (
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-xs mr-3 font-semibold text-slate-600 border border-slate-200">
                        {user.department}
                      </span>
                    )}
                    {format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                    {user?.photo_url ? (
                      <img src={user.photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Próximos Eventos</p>
                    <p className="text-3xl font-bold">{upcomingEvents.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Nuevos Anuncios</p>
                    <p className="text-3xl font-bold">{recentAnnouncements.length}</p>
                  </div>
                  <Megaphone className="w-8 h-8 text-amber-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Mis Tickets</p>
                    <p className="text-3xl font-bold">{userTickets.length}</p>
                  </div>
                  <TicketIcon className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Próximos Eventos
                  </CardTitle>
                  <Link to={createPageUrl("Calendar")}>
                    <Button variant="outline" size="sm" className="hover:bg-blue-50">
                      Ver Todo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No hay eventos programados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">{event.title}</h4>
                          <p className="text-sm text-slate-600">
                            {getEventDateLabel(event.start_date)} • {format(parseISO(event.start_date), "h:mm a")}
                          </p>
                          {event.location && (
                            <p className="text-xs text-slate-500">{event.location}</p>
                          )}
                        </div>
                        <Badge variant="outline" className={`${event.type === 'training' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {translateType(event.type)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Announcements */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Megaphone className="w-5 h-5 text-amber-600" />
                    Anuncios Recientes
                  </CardTitle>
                  <Link to={createPageUrl("Announcements")}>
                    <Button variant="outline" size="sm" className="hover:bg-amber-50">
                      Ver Todo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentAnnouncements.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No hay anuncios recientes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900 line-clamp-1">{announcement.title}</h4>
                          <div className="flex items-center gap-2">
                            {announcement.media_url && (
                              <Badge variant="secondary" className="bg-slate-200 text-slate-700 px-1 py-0 h-5">
                                {announcement.media_type === 'video' ? 'Video' : 'Imagen'}
                              </Badge>
                            )}
                            <Badge className={getPriorityColor(announcement.priority)}>
                              {translatePriority(announcement.priority)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{announcement.content}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {format(parseISO(announcement.created_date), "d MMM, h:mm a", { locale: es })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Support Tickets */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl lg:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <TicketIcon className="w-5 h-5 text-purple-600" />
                    Mis Tickets de Soporte
                  </CardTitle>
                  <div className="flex gap-2">
                    <Link to={createPageUrl("Tickets")}>
                      <Button variant="outline" size="sm" className="hover:bg-purple-50">
                        Ver Todo
                      </Button>
                    </Link>
                    <Link to={createPageUrl("Tickets")}>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-1" />
                        Nuevo Ticket
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {userTickets.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <TicketIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No se encontraron tickets</p>
                    <Link to={createPageUrl("Tickets")}>
                      <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Crea tu primer ticket
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900 line-clamp-1">{ticket.subject}</h4>
                          <Badge className={getStatusColor(ticket.status)}>
                            {translateStatus(ticket.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {translatePriority(ticket.priority)}
                          </Badge>
                          <p className="text-xs text-slate-500">
                            {format(parseISO(ticket.created_date), "d MMM", { locale: es })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}