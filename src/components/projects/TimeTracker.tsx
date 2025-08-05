import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Square, Clock, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeLog {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  description: string | null;
  billable: boolean;
  created_at: string;
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
  const [description, setDescription] = useState('');
  const [sendToGoogle, setSendToGoogle] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    fetchTimeLogs();
    
    // Update current time every second for the timer display
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [projectId]);

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

      const { data, error } = await supabase
        .from('time_logs')
        .insert({
          project_id: projectId,
          user_id: userData.id,
          start_time: new Date().toISOString(),
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

  const stopTimer = async () => {
    if (!activeLog) return;

    try {
      setLoading(true);

      const endTime = new Date().toISOString();
      const { error } = await supabase
        .from('time_logs')
        .update({ 
          end_time: endTime,
          description: description || null
        })
        .eq('id', activeLog.id);

      if (error) throw error;

      // TODO: Implement Google Calendar integration if sendToGoogle is true
      if (sendToGoogle) {
        toast.info('Integração com Google Calendar em desenvolvimento');
      }

      setActiveLog(null);
      setDescription('');
      setSendToGoogle(false);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeLog ? (
            <div className="text-center space-y-4">
              <div className="text-3xl font-mono font-bold text-primary">
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
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Cronômetro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatDuration(totalHours * 60)}
              </div>
              <p className="text-sm text-muted-foreground">Total de Horas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {timeLogs.length}
              </div>
              <p className="text-sm text-muted-foreground">Sessões</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {timeLogs.filter(log => log.billable).length}
              </div>
              <p className="text-sm text-muted-foreground">Faturáveis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
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
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={log.billable ? "default" : "secondary"}>
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
                  <div className="text-right">
                    <div className="font-semibold">
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
      <Dialog open={showStopModal} onOpenChange={setShowStopModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Parar Cronômetro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descrição da sessão (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva o que foi realizado nesta sessão..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="google-calendar"
                checked={sendToGoogle}
                onCheckedChange={(checked) => setSendToGoogle(checked === true)}
              />
              <Label htmlFor="google-calendar">
                Enviar para Google Calendar
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStopModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={stopTimer}
              disabled={loading}
            >
              Parar e Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}