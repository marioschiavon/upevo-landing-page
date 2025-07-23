-- Criar políticas RLS para tabelas que estão sem políticas

-- Políticas para a tabela categorias
CREATE POLICY "Usuários podem ver suas próprias categorias" 
ON public.categorias 
FOR SELECT 
USING (usuario_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Usuários podem criar suas próprias categorias" 
ON public.categorias 
FOR INSERT 
WITH CHECK (usuario_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar suas próprias categorias" 
ON public.categorias 
FOR UPDATE 
USING (usuario_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Usuários podem deletar suas próprias categorias" 
ON public.categorias 
FOR DELETE 
USING (usuario_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Políticas para a tabela tarefas
CREATE POLICY "Usuários podem ver suas próprias tarefas" 
ON public.tarefas 
FOR SELECT 
USING (usuario_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Usuários podem criar suas próprias tarefas" 
ON public.tarefas 
FOR INSERT 
WITH CHECK (usuario_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar suas próprias tarefas" 
ON public.tarefas 
FOR UPDATE 
USING (usuario_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Usuários podem deletar suas próprias tarefas" 
ON public.tarefas 
FOR DELETE 
USING (usuario_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Políticas para a tabela usuarios
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.usuarios 
FOR SELECT 
USING (user_auth = auth.uid());

CREATE POLICY "Usuários podem criar seu próprio perfil" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (user_auth = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON public.usuarios 
FOR UPDATE 
USING (user_auth = auth.uid());

-- Políticas para a tabela apps (pública para visualização)
CREATE POLICY "Apps são visíveis para todos" 
ON public.apps 
FOR SELECT 
USING (true);

-- Políticas para a tabela cliente (apenas donos da organização)
CREATE POLICY "Membros da organização podem ver clientes" 
ON public.cliente 
FOR SELECT 
USING (id_organizacao IN (
  SELECT om.organization_id 
  FROM public.organization_members om 
  JOIN public.users u ON om.user_id = u.id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Membros da organização podem criar clientes" 
ON public.cliente 
FOR INSERT 
WITH CHECK (id_organizacao IN (
  SELECT om.organization_id 
  FROM public.organization_members om 
  JOIN public.users u ON om.user_id = u.id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Membros da organização podem atualizar clientes" 
ON public.cliente 
FOR UPDATE 
USING (id_organizacao IN (
  SELECT om.organization_id 
  FROM public.organization_members om 
  JOIN public.users u ON om.user_id = u.id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Membros da organização podem deletar clientes" 
ON public.cliente 
FOR DELETE 
USING (id_organizacao IN (
  SELECT om.organization_id 
  FROM public.organization_members om 
  JOIN public.users u ON om.user_id = u.id 
  WHERE u.auth_user_id = auth.uid()
));