
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Se o usuário estiver logado, redirecionar para o dashboard
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <img 
            src="/lovable-uploads/e20659b7-17a3-4fba-a781-da7aeb501e68.png" 
            alt="Upevolution Logo" 
            className="h-12 mx-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Bem-vindo ao Upevolution
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Plataforma de gestão de projetos e clientes
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/login')}
              variant="default"
              size="lg"
            >
              Entrar
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              variant="outline"
              size="lg"
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
