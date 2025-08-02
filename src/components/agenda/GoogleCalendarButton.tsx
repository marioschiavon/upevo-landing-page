import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Unlink } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleCalendarButtonProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export function GoogleCalendarButton({ 
  isConnected, 
  onConnectionChange 
}: GoogleCalendarButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    
    try {
      if (isConnected) {
        // Disconnect from Google Calendar
        onConnectionChange(false);
        toast.success('Desconectado do Google Calendar');
      } else {
        // Connect to Google Calendar
        // TODO: Implement Google OAuth flow
        toast.info('Integração com Google Calendar em desenvolvimento');
        // onConnectionChange(true);
      }
    } catch (error) {
      console.error('Error with Google Calendar:', error);
      toast.error('Erro ao conectar com Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isConnected ? "outline" : "secondary"}
      onClick={handleGoogleAuth}
      disabled={loading}
    >
      {isConnected ? (
        <>
          <Unlink className="h-4 w-4 mr-2" />
          Desconectar Google
        </>
      ) : (
        <>
          <ExternalLink className="h-4 w-4 mr-2" />
          Conectar Google Calendar
        </>
      )}
    </Button>
  );
}