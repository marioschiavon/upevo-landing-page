import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventModal } from '@/components/agenda/EventModal';
import { GoogleCalendarButton } from '@/components/agenda/GoogleCalendarButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Sidebar } from '@/components/shared/Sidebar';
import { OrganizationDropdown } from '@/components/OrganizationDropdown';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    description?: string;
    origin: 'internal' | 'google';
    googleEventId?: string;
  };
}

export default function Agenda() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch events from Supabase
  const fetchEvents = async () => {
    if (!currentOrganization?.id) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      const formattedEvents: CalendarEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        backgroundColor: event.origin === 'google' ? 'hsl(var(--chart-1))' : 'hsl(var(--primary))',
        borderColor: event.origin === 'google' ? 'hsl(var(--chart-1))' : 'hsl(var(--primary))',
        extendedProps: {
          description: event.description,
          origin: event.origin as 'internal' | 'google',
          googleEventId: event.google_event_id,
        },
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erro ao carregar eventos');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentOrganization?.id]);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    const event = events.find(e => e.id === arg.event.id);
    if (event) {
      setSelectedEvent(event);
      setSelectedDate(null);
      setIsModalOpen(true);
    }
  };

  const handleEventSave = async (eventData: any) => {
    if (!currentOrganization?.id || !user) return;

    try {
      setLoading(true);
      
      // Get the user record from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        toast.error('Erro ao buscar dados do usuário');
        return;
      }
      
      const eventPayload = {
        organization_id: currentOrganization.id,
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        origin: 'internal' as const,
        created_by: userData.id,
      };

      if (selectedEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', selectedEvent.id);

        if (error) throw error;
        toast.success('Evento atualizado com sucesso');
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert(eventPayload);

        if (error) throw error;
        toast.success('Evento criado com sucesso');
      }

      fetchEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleEventDelete = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) throw error;

      toast.success('Evento excluído com sucesso');
      fetchEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao excluir evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeItem="agenda" />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-background">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold">Agenda</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <OrganizationDropdown />
            </div>
          </div>
        </div>

        {/* Content */}
        {!currentOrganization ? (
          <div className="p-6">
            <Card className="p-8 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecione uma organização</h3>
              <p className="text-muted-foreground">
                Para acessar a agenda, você precisa selecionar uma organização primeiro.
              </p>
            </Card>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Agenda de {currentOrganization.name}</h2>
                <p className="text-muted-foreground">
                  Gerencie seus eventos e compromissos
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <GoogleCalendarButton
                  isConnected={isGoogleConnected}
                  onConnectionChange={setIsGoogleConnected}
                />
                
                <Button
                  onClick={() => {
                    setSelectedEvent(null);
                    setSelectedDate(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              </div>
            </div>

            {/* Calendar */}
            <Card className="p-6">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                height="auto"
                locale="pt-br"
                buttonText={{
                  today: 'Hoje',
                  month: 'Mês',
                  week: 'Semana',
                  day: 'Dia'
                }}
                eventDisplay="block"
                eventBackgroundColor="hsl(var(--primary))"
                eventBorderColor="hsl(var(--primary))"
                eventTextColor="hsl(var(--primary-foreground))"
              />
            </Card>

            {/* Event Modal */}
            <EventModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              event={selectedEvent}
              selectedDate={selectedDate}
              onSave={handleEventSave}
              onDelete={handleEventDelete}
              loading={loading}
              isGoogleConnected={isGoogleConnected}
            />
          </div>
        )}
      </main>
    </div>
  );
}