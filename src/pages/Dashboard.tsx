import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Em produção, limpar session do Supabase
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao site
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">U</span>
                </div>
                <span className="text-xl font-bold text-foreground">Upevolution</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo ao Dashboard
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e acompanhe o progresso dos seus aplicativos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <span className="text-white font-bold">📱</span>
              </div>
              <CardTitle>Meus Projetos</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os seus projetos em desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Ver Projetos
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <span className="text-white font-bold">🎯</span>
              </div>
              <CardTitle>Suporte Técnico</CardTitle>
              <CardDescription>
                Acesse o suporte técnico e abra chamados quando necessário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Abrir Chamado
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e preferências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Início Rápido</CardTitle>
              <CardDescription>
                Comece a usar a plataforma com essas ações essenciais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  Solicitar Novo Projeto
                </Button>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Agendar Consultoria
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;