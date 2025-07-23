import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Book, Instagram, Youtube, Code, Zap, Shield, Rocket, Check, Star } from "lucide-react";
import heroImage from "@/assets/hero-upevolution.jpg";
import groomerGeniusApp from "@/assets/groomer-genius-app.jpg";
import upevoApp from "@/assets/upevo-app.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-inter overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-fade-in">
              <img 
                src="/lovable-uploads/e20659b7-17a3-4fba-a781-da7aeb501e68.png" 
                alt="Upevolution Logo" 
                className="h-8 hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            <div className="hidden md:flex items-center space-x-8 animate-slide-in-right">
              <a href="#inicio" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105">Início</a>
              <a href="#servicos" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105">Serviços</a>
              <a href="#planos" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105">Planos</a>
              <a href="#aplicativos" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105">Aplicativos</a>
              <a href="#contato" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105">Contato</a>
            </div>

            <div className="flex items-center gap-3 animate-fade-in">
              <Button 
                variant="outline" 
                className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow transition-all duration-300"
                onClick={() => window.location.href = '/login'}
              >
                Login
              </Button>
              <Button className="bg-gradient-primary hover:shadow-neon hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                <span className="relative z-10">Solicitar Orçamento</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-glow/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative py-24 bg-gradient-cyber overflow-hidden">
        {/* Floating elements background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-pulse-glow"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6 animate-fade-in">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 animate-pulse-glow">
                  🚀 Tecnologia No-Code
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
                  Transformamos sua ideia em um{" "}
                  <span className="text-primary relative">
                    app real
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent blur-xl"></div>
                  </span>
                  <br />
                  <span className="text-3xl md:text-4xl text-muted-foreground">sem complicação.</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Desenvolvemos aplicativos com <strong className="text-primary">Bubble</strong> e oferecemos suporte técnico 
                  white-label para agências. Do conceito ao lançamento em tempo recorde.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-right">
                <Button size="lg" className="bg-gradient-primary hover:shadow-neon hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-glow/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Button>
                <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow transition-all duration-300">
                  Ver Nossos Planos
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 animate-scale-in">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-muted-foreground">Apps Criados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">3+</div>
                  <div className="text-sm text-muted-foreground">Anos de Experiência</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">24h</div>
                  <div className="text-sm text-muted-foreground">Suporte Médio</div>
                </div>
              </div>
            </div>

            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-20 rounded-3xl"></div>
              <img 
                src={heroImage} 
                alt="Desenvolvimento de apps no-code" 
                className="w-full h-auto rounded-3xl shadow-neon relative z-10 hover:scale-105 transition-transform duration-500"
              />
              {/* Tech badges floating around image */}
              <div className="absolute -top-4 -left-4 animate-float bg-card rounded-2xl p-3 shadow-elegant border">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -top-4 -right-4 animate-float bg-card rounded-2xl p-3 shadow-elegant border" style={{animationDelay: '0.5s'}}>
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -bottom-4 -left-4 animate-float bg-card rounded-2xl p-3 shadow-elegant border" style={{animationDelay: '1s'}}>
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -bottom-4 -right-4 animate-float bg-card rounded-2xl p-3 shadow-elegant border" style={{animationDelay: '1.5s'}}>
                <Rocket className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Features */}
      <section className="py-20 bg-secondary/30 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="secondary" className="bg-primary/10 text-primary mb-4">
              ⚡ Tecnologia Avançada
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Por que escolher a <span className="text-primary">Upevolution</span>?
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              Combinamos expertise técnica com inovação para entregar soluções que realmente funcionam
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🎯",
                title: "100% No-Code",
                description: "Desenvolvimento visual sem necessidade de programação tradicional",
                delay: "0s"
              },
              {
                icon: "⚡",
                title: "Entrega Rápida",
                description: "Do conceito ao lançamento em semanas, não meses",
                delay: "0.2s"
              },
              {
                icon: "🛡️",
                title: "Suporte 24/7",
                description: "Equipe especializada sempre disponível para você",
                delay: "0.4s"
              },
              {
                icon: "🚀",
                title: "Escalabilidade",
                description: "Apps que crescem junto com o seu negócio",
                delay: "0.6s"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-card bg-card hover:shadow-neon transition-all duration-500 hover:-translate-y-2 group animate-scale-in relative overflow-hidden"
                style={{animationDelay: feature.delay}}
              >
                <CardContent className="p-8 text-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-6">Nossos Serviços</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Soluções completas para transformar sua ideia em realidade digital
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: "🚀",
                title: "Desenvolvimento de Apps No-Code",
                description: "Do zero ao lançamento, para quem tem uma ideia e quer tirá-la do papel com agilidade e qualidade profissional.",
                features: ["Prototipagem rápida", "Design responsivo", "Integração com APIs", "Deploy automático"]
              },
              {
                icon: "🤝",
                title: "Suporte White-Label para Agências",
                description: "Parceria estratégica com foco em bugs, otimizações e atendimento direto aos seus clientes.",
                features: ["Atendimento personalizado", "Relatórios detalhados", "Comunicação direta", "SLA garantido"]
              },
              {
                icon: "⚡",
                title: "Consultoria e Otimização",
                description: "Ajustamos estrutura, banco de dados e lógica para máxima performance e eficiência.",
                features: ["Análise de performance", "Otimização de banco", "Code review", "Melhorias contínuas"]
              },
              {
                icon: "📅",
                title: "Planos Mensais de Suporte",
                description: "Correções, melhorias contínuas e testes recorrentes para manter seu app sempre atualizado.",
                features: ["Suporte dedicado", "Atualizações regulares", "Monitoramento 24/7", "Backup automático"]
              }
            ].map((service, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-card bg-card hover:shadow-neon transition-all duration-500 group relative overflow-hidden animate-scale-in"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                  <CardTitle className="text-xl text-foreground mb-4">{service.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Apps Showcase */}
      <section id="aplicativos" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-6">Apps que Criamos</h2>
            <p className="text-muted-foreground text-lg">Alguns dos projetos que transformaram negócios</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="border-0 shadow-neon bg-card group overflow-hidden animate-slide-in-right">
              <div className="p-8">
                <div className="relative mb-8 overflow-hidden rounded-2xl">
                  <img 
                    src={groomerGeniusApp} 
                    alt="Groomer Genius App" 
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-foreground">Groomer Genius</h3>
                    <Badge className="bg-gradient-primary text-primary-foreground">E-commerce + IA</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    E-commerce pet inteligente que recomenda produtos personalizados para cada pet com 
                    ajuda de inteligência artificial, revolucionando a experiência de compra.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {["Bubble", "OpenAI API", "Stripe", "AWS"].map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-neon bg-card group overflow-hidden animate-slide-in-right" style={{animationDelay: '0.3s'}}>
              <div className="p-8">
                <div className="relative mb-8 overflow-hidden rounded-2xl">
                  <img 
                    src={upevoApp} 
                    alt="Upevo App" 
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-foreground">Upevo System</h3>
                    <Badge className="bg-gradient-primary text-primary-foreground">Sistema Interno</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Sistema interno completo com gestão de projetos, tarefas, suporte técnico e 
                    controle financeiro, otimizando toda a operação da empresa.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {["Bubble", "PostgreSQL", "Webhooks", "Charts"].map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-6">Planos de Suporte</h2>
            <p className="text-muted-foreground text-lg">Escolha o plano ideal para suas necessidades</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Básico",
                price: "199",
                features: [
                  "5 chamados por mês",
                  "Correções de bugs",
                  "Suporte por email",
                  "Tempo de resposta: 24h"
                ],
                popular: false
              },
              {
                name: "Pro",
                price: "399",
                features: [
                  "15 chamados por mês",
                  "Correções e melhorias",
                  "Suporte prioritário",
                  "Tempo de resposta: 12h",
                  "Consultoria mensal"
                ],
                popular: true
              },
              {
                name: "White-Label",
                price: "799",
                features: [
                  "Chamados ilimitados",
                  "Suporte direto ao cliente",
                  "Atendimento personalizado",
                  "Tempo de resposta: 6h",
                  "Relatórios detalhados"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <Card 
                key={index} 
                className={`border-0 shadow-card bg-card hover:shadow-neon transition-all duration-500 hover:scale-105 relative overflow-hidden animate-scale-in ${
                  plan.popular ? 'border-2 border-primary' : ''
                }`}
                style={{animationDelay: `${index * 0.2}s`}}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-primary-foreground animate-pulse-glow">
                      <Star className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center relative z-10">
                  <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary mt-4">
                    R$ {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-primary hover:shadow-neon hover:scale-105' 
                        : 'variant-outline border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    Escolher Plano
                  </Button>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-gradient-tech text-background py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/e20659b7-17a3-4fba-a781-da7aeb501e68.png" 
                  alt="Upevolution Logo" 
                  className="h-8 brightness-0 invert"
                />
              </div>
              <p className="text-muted-foreground">
                Transformando ideias em aplicativos reais desde 2021.
                Especialistas em tecnologia no-code.
              </p>
            </div>

            <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h4 className="font-semibold text-lg">Contato</h4>
              <div className="space-y-3">
                <p className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer">
                  <Mail className="h-4 w-4" />
                  contato@upevolution.com.br
                </p>
                <p className="hover:text-primary transition-colors cursor-pointer">
                  📱 WhatsApp: 44 9 8821-7535
                </p>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h4 className="font-semibold text-lg">Links</h4>
              <div className="space-y-3">
                <p><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></p>
                <p><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></p>
                <p><a href="#" className="hover:text-primary transition-colors">Documentação</a></p>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <h4 className="font-semibold text-lg">Redes Sociais</h4>
              <div className="flex space-x-4">
                <Instagram className="h-6 w-6 hover:text-primary cursor-pointer transition-all duration-300 hover:scale-125" />
                <Youtube className="h-6 w-6 hover:text-primary cursor-pointer transition-all duration-300 hover:scale-125" />
                <Book className="h-6 w-6 hover:text-primary cursor-pointer transition-all duration-300 hover:scale-125" />
              </div>
            </div>
          </div>

          <div className="border-t border-muted-foreground/20 mt-12 pt-8 text-center animate-fade-in">
            <p className="text-muted-foreground">
              © 2024 Upevolution. Todos os direitos reservados. Feito com ❤️ e muito código.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;