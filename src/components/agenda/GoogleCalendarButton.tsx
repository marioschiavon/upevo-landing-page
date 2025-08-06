import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Unlink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GoogleCalendarButtonProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export function GoogleCalendarButton({ 
  isConnected, 
  onConnectionChange 
}: GoogleCalendarButtonProps) {
  const [loading, setLoading] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth/status');
      
      if (error) throw error;
      
      onConnectionChange(data.isConnected);
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    
    try {
      if (isConnected) {
        // Disconnect from Google Calendar
        const { error } = await supabase.functions.invoke('google-calendar-auth/disconnect');
        
        if (error) throw error;
        
        onConnectionChange(false);
        toast.success('Desconectado do Google Calendar');
      } else {
        // Connect to Google Calendar
        const { data, error } = await supabase.functions.invoke('google-calendar-auth/authorize');
        
        if (error) throw error;
        
        // Open OAuth popup
        const popup = window.open(
          data.authUrl,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for success message from popup
        const messageListener = (event: MessageEvent) => {
          if (event.data.type === 'google_auth_success') {
            popup?.close();
            onConnectionChange(true);
            toast.success('Conectado ao Google Calendar com sucesso!');
            window.removeEventListener('message', messageListener);
          }
        };

        window.addEventListener('message', messageListener);

        // Check if popup was closed without success
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
          }
        }, 1000);
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