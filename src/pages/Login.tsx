import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Digite um email válido").min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [loginError, setLoginError] = useState<string>("");
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError("");
      
      const { error } = await signIn(data.email, data.password);

      if (error) {
        setLoginError("Credenciais inválidas. Verifique e tente novamente.");
      } else {
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      setLoginError("Erro inesperado ao fazer login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Link>
        </div>

        <Card className="shadow-elegant border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/7700580a-cd6a-459a-ae9d-64022d619f96.png" 
                alt="Upevolution Logo" 
                className="w-16 h-16"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Login</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  {...register("password")}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {loginError && (
                <Alert className="border-destructive">
                  <AlertDescription className="text-destructive">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <Link 
                to="#" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Esqueceu a senha?
              </Link>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Não tem uma conta?
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate("/signup")}
                >
                  Cadastre-se
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Login;