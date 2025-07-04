import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Book, Instagram, Youtube } from "lucide-react";
import heroImage from "@/assets/hero-upevolution.jpg";
import groomerGeniusApp from "@/assets/groomer-genius-app.jpg";
import upevoApp from "@/assets/upevo-app.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-sm">U</span>
              </div>
              <span className="text-xl font-bold text-foreground">Upevolution</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-foreground hover:text-primary transition-colors">Início</a>
              <a href="#servicos" className="text-foreground hover:text-primary transition-colors">Serviços</a>
              <a href="#planos" className="text-foreground hover:text-primary transition-colors">Planos</a>
              <a href="#aplicativos" className="text-foreground hover:text-primary transition-colors">Aplicativos</a>
              <a href="#contato" className="text-foreground hover:text-primary transition-colors">Contato</a>
            </div>

            <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              Solicitar Orçamento
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative py-20 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Transformamos sua ideia em um{" "}
                  <span className="text-primary">app real</span> — sem complicação.
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Desenvolvemos aplicativos com Bubble e oferecemos suporte técnico white-label para agências.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  Solicitar Orçamento
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Conheça nossos planos
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src={heroImage} 
                alt="Desenvolvimento de apps no-code" 
                className="w-full h-auto rounded-2xl shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sobre a Upevolution */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Sobre a Upevolution</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Especialistas em desenvolvimento no-code desde 2021, transformando ideias em aplicativos funcionais com agilidade e qualidade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">100%</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">No-Code</h3>
                <p className="text-muted-foreground">Desenvolvimento 100% visual sem necessidade de programação tradicional</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">🎯</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Especialistas em Bubble</h3>
                <p className="text-muted-foreground">Domínio total da plataforma líder em desenvolvimento no-code</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2021</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Suporte desde 2021</h3>
                <p className="text-muted-foreground">Experiência consolidada em suporte técnico e desenvolvimento</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nossos Serviços</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Soluções completas para transformar sua ideia em realidade digital
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold">🚀</span>
                </div>
                <CardTitle className="text-foreground">Desenvolvimento de Aplicativos No-Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Do zero ao lançamento, para quem tem uma ideia e quer tirá-la do papel com agilidade.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold">🤝</span>
                </div>
                <CardTitle className="text-foreground">Suporte Técnico para Agências Bubble</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  White-label com foco em bugs, otimizações e atendimento direto aos clientes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold">📅</span>
                </div>
                <CardTitle className="text-foreground">Planos Mensais de Suporte Técnico</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Correções, melhorias contínuas e testes recorrentes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold">⚡</span>
                </div>
                <CardTitle className="text-foreground">Consultoria e Otimização</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ajustamos estrutura, banco de dados e lógica para máxima performance.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Como Funciona</h2>
            <p className="text-muted-foreground">Processo simples e transparente</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Solicite seu orçamento</h3>
              <p className="text-muted-foreground">Conte-nos sobre sua ideia e necessidades</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Desenvolvimento começa</h3>
              <p className="text-muted-foreground">Aprovação e início do projeto</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Entrega e onboarding</h3>
              <p className="text-muted-foreground">Treinamento técnico completo</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Suporte técnico</h3>
              <p className="text-muted-foreground">Acompanhamento contínuo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Aplicativos em Destaque */}
      <section id="aplicativos" className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Aplicativos em Destaque</h2>
            <p className="text-muted-foreground">Alguns dos projetos que desenvolvemos</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-all duration-300">
              <div className="p-6">
                <img 
                  src={groomerGeniusApp} 
                  alt="Groomer Genius App" 
                  className="w-full h-48 object-contain rounded-lg mb-4"
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">Groomer Genius</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">E-commerce</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    E-commerce pet inteligente que recomenda produtos personalizados para cada pet com ajuda de IA.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-all duration-300">
              <div className="p-6">
                <img 
                  src={upevoApp} 
                  alt="Upevo App" 
                  className="w-full h-48 object-contain rounded-lg mb-4"
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">Upevo</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">Sistema Interno</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Sistema interno completo com gestão de projetos, tarefas, suporte e finanças.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos de Suporte */}
      <section id="planos" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Planos de Suporte</h2>
            <p className="text-muted-foreground">Escolha o plano ideal para suas necessidades</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground">Plano Básico</CardTitle>
                <div className="text-2xl font-bold text-primary">R$ 199<span className="text-sm font-normal">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-muted-foreground">
                  <p>✓ 5 chamados por mês</p>
                  <p>✓ Correções de bugs</p>
                  <p>✓ Suporte por email</p>
                  <p>✓ Tempo de resposta: 24h</p>
                </div>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                  Escolher Plano
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary shadow-card bg-card hover:shadow-elegant transition-all duration-300 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-primary text-white">Mais Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-foreground">Plano Pro</CardTitle>
                <div className="text-2xl font-bold text-primary">R$ 399<span className="text-sm font-normal">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-muted-foreground">
                  <p>✓ 15 chamados por mês</p>
                  <p>✓ Correções e melhorias</p>
                  <p>✓ Suporte prioritário</p>
                  <p>✓ Tempo de resposta: 12h</p>
                  <p>✓ Consultoria mensal</p>
                </div>
                <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  Escolher Plano
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-card hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground">White-Label</CardTitle>
                <div className="text-2xl font-bold text-primary">R$ 799<span className="text-sm font-normal">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-muted-foreground">
                  <p>✓ Chamados ilimitados</p>
                  <p>✓ Suporte direto ao cliente</p>
                  <p>✓ Atendimento personalizado</p>
                  <p>✓ Tempo de resposta: 6h</p>
                  <p>✓ Relatórios detalhados</p>
                </div>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                  Escolher Plano
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-foreground text-background py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">U</span>
                </div>
                <span className="text-xl font-bold">Upevolution</span>
              </div>
              <p className="text-muted-foreground">
                Transformando ideias em aplicativos reais desde 2021.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Contato</h4>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  contato@upevolution.com.br
                </p>
                <p>WhatsApp: 44 9 8821-7535</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Links</h4>
              <div className="space-y-2">
                <p><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></p>
                <p><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Redes Sociais</h4>
              <div className="flex space-x-4">
                <Instagram className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
                <Youtube className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
                <Book className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          <div className="border-t border-muted-foreground/20 mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 Upevolution. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;