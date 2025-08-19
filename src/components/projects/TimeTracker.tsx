import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Clock, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StopTimerModal } from './StopTimerModal';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';

interface TimeLog {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  description: string | null;
  billable: boolean;
  created_at: string;
  google_calendar_event_id: string | null;
}

interface TimeTrackerProps {
  projectId: string;
  projectName: string;
}

export function TimeTracker({ projectId, projectName }: TimeTrackerProps) {
  const { user } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [activeLog, setActiveLog] = useState<TimeLog | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    fetchTimeLogs();
    checkGoogleConnection();
    
    // Update current time every second for the timer display
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [projectId]);

  const checkGoogleConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth/status');
      if (!error && data) {
        setIsGoogleConnected(data.isConnected);
      }
    } catch (error) {
      console.log('Error checking Google connection:', error);
    }
  };

  const fetchTimeLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTimeLogs(data || []);
      
      // Calculate total hours
      const total = data?.reduce((sum, log) => {
        return sum + (log.duration_minutes || 0);
      }, 0) || 0;
      setTotalHours(total / 60);

      // Check for active log
      const active = data?.find(log => !log.end_time);
      setActiveLog(active || null);
    } catch (error) {
      console.error('Error fetching time logs:', error);
      toast.error('Erro ao carregar logs de tempo');
    }
  };

  const startTimer = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user record from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        toast.error('Erro ao buscar dados do usuário');
        return;
      }

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

      // Try to create Google Calendar event first
      let googleEventId = null;
      try {
        const { data: googleData, error: googleError } = await supabase.functions.invoke('google-calendar-events', {
          body: {
            action: 'create',
            title: `Sessão de Trabalho - ${projectName}`,
            description: `Tempo de trabalho no projeto ${projectName}`,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          },
        });

        if (!googleError && googleData?.googleEventId) {
          googleEventId = googleData.googleEventId;
          toast.success('Evento criado no Google Calendar!');
        }
      } catch (googleError) {
        console.log('Google Calendar not connected or error creating event:', googleError);
      }

      const { data, error } = await supabase
        .from('time_logs')
        .insert({
          project_id: projectId,
          user_id: userData.id,
          start_time: startTime.toISOString(),
          google_calendar_event_id: googleEventId,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveLog(data);
      toast.success('Cronômetro iniciado');
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.error('Erro ao iniciar cronômetro');
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async (description: string, sendToGoogle: boolean) => {
    if (!activeLog) return;

    try {
      setLoading(true);

      const endTime = new Date().toISOString();
      
      // Calculate duration in minutes
      const startTime = new Date(activeLog.start_time);
      const endTimeDate = new Date(endTime);
      const durationMinutes = Math.round((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60));
      
      // Update Google Calendar event if it exists and user wants to sync
      if (activeLog.google_calendar_event_id && sendToGoogle) {
        try {
          await supabase.functions.invoke('google-calendar-events', {
            body: {
              action: 'update',
              googleEventId: activeLog.google_calendar_event_id,
              title: `Sessão de Trabalho - ${projectName}`,
              description: description || `Tempo de trabalho no projeto ${projectName}`,
              startTime: activeLog.start_time,
              endTime: endTime,
            },
          });
          toast.success('Evento atualizado no Google Calendar!');
        } catch (googleError) {
          console.error('Error updating Google Calendar event:', googleError);
          toast.error('Erro ao atualizar Google Calendar');
        }
      }

      const { error } = await supabase
        .from('time_logs')
        .update({ 
          end_time: endTime,
          duration_minutes: durationMinutes,
          description: description || null
        })
        .eq('id', activeLog.id);

      if (error) throw error;

      setActiveLog(null);
      setShowStopModal(false);
      fetchTimeLogs();
      toast.success('Cronômetro parado e log salvo');
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Erro ao parar cronômetro');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getCurrentTimerDuration = () => {
    if (!activeLog) return 0;
    const start = new Date(activeLog.start_time);
    const diff = currentTime.getTime() - start.getTime();
    return Math.floor(diff / 1000 / 60); // minutes
  };

  return (
    <div className="space-y-6">
      {/* Timer Controls */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeLog ? (
            <div className="text-center space-y-4">
              <div className="text-3xl font-mono font-bold text-primary animate-pulse">
                {formatDuration(getCurrentTimerDuration())}
              </div>
              <p className="text-muted-foreground">
                Iniciado às {format(new Date(activeLog.start_time), 'HH:mm', { locale: ptBR })}
              </p>
              <Button 
                onClick={() => setShowStopModal(true)}
                disabled={loading}
                variant="destructive"
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Square className="h-4 w-4 mr-2" />
                Parar Cronômetro
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Nenhum cronômetro ativo</p>
              <Button 
                onClick={startTimer}
                disabled={loading}
                variant="success"
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Cronômetro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Summary */}
      <Card className="bg-gradient-to-br from-brand-teal/5 to-info/5 border-brand-teal/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-brand-teal" />
            Resumo do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-teal">
                {formatDuration(totalHours * 60)}
              </div>
              <p className="text-sm text-muted-foreground">Total de Horas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-purple">
                {timeLogs.length}
              </div>
              <p className="text-sm text-muted-foreground">Sessões</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {timeLogs.filter(log => log.billable).length}
              </div>
              <p className="text-sm text-muted-foreground">Faturáveis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-orange" />
            Logs Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum log de tempo registrado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {timeLogs.slice(0, 10).map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={log.billable ? "success" : "orange"}>
                        {log.billable ? "Faturável" : "Não Faturável"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    {log.description && (
                      <p className="text-sm text-muted-foreground">{log.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-primary">
                      {log.duration_minutes ? formatDuration(log.duration_minutes) : 'Em andamento...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stop Timer Modal */}
      <StopTimerModal
        isOpen={showStopModal}
        onClose={() => setShowStopModal(false)}
        onConfirmStop={stopTimer}
        loading={loading}
        activeLog={activeLog}
        isGoogleConnected={isGoogleConnected}
      />
    </div>
  );
}