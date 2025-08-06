import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface StopTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStop: (description: string, sendToGoogle: boolean) => void;
  loading: boolean;
  activeLog: TimeLog | null;
  isGoogleConnected?: boolean;
}

export function StopTimerModal({
  isOpen,
  onClose,
  onConfirmStop,
  loading,
  activeLog,
  isGoogleConnected = false
}: StopTimerModalProps) {
  const [description, setDescription] = useState('');
  const [sendToGoogle, setSendToGoogle] = useState(false);

  const handleConfirm = () => {
    onConfirmStop(description, sendToGoogle);
    // Reset form state
    setDescription('');
    setSendToGoogle(false);
  };

  const handleClose = () => {
    // Reset form state when closing
    setDescription('');
    setSendToGoogle(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Parar Cronômetro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {activeLog && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Sessão iniciada às {format(new Date(activeLog.start_time), 'HH:mm', { locale: ptBR })}
              </p>
            </div>
          )}
          
          <div>
            <Label htmlFor="description">Descrição da sessão (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o que foi realizado nesta sessão..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          
          {isGoogleConnected && activeLog?.google_calendar_event_id && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="google-calendar"
                checked={sendToGoogle}
                onCheckedChange={(checked) => setSendToGoogle(checked === true)}
              />
              <Label htmlFor="google-calendar" className="text-sm">
                Atualizar evento no Google Calendar
              </Label>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Parar e Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}