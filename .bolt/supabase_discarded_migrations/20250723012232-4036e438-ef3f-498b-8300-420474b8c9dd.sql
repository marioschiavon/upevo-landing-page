-- Criar tabela organizacoes em português conforme solicitado
CREATE TABLE IF NOT EXISTS public.organizacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.organizacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas suas próprias organizações
CREATE POLICY "Usuários podem ver suas próprias organizações" 
ON public.organizacoes 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Usuários podem criar suas próprias organizações" 
ON public.organizacoes 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar suas próprias organizações" 
ON public.organizacoes 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Usuários podem deletar suas próprias organizações" 
ON public.organizacoes 
FOR DELETE 
USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));