-- Apenas criar políticas básicas para permitir acesso às organizações
-- As outras tabelas não são usadas na funcionalidade de organizações

-- Primeiro, vamos criar políticas para organizações (se não existirem)
DO $$ 
BEGIN
    -- Verificar se as políticas já existem antes de criar
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Organization members can view organizations') THEN
        CREATE POLICY "Organization members can view organizations" 
        ON public.organizations 
        FOR SELECT 
        USING ((id IN ( SELECT organization_members.organization_id
           FROM organization_members
          WHERE (organization_members.user_id IN ( SELECT users.id
                   FROM users
                  WHERE (users.auth_user_id = auth.uid()))))) OR (owner_id IN ( SELECT users.id
           FROM users
          WHERE (users.auth_user_id = auth.uid()))));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Authenticated users can create organizations') THEN
        CREATE POLICY "Authenticated users can create organizations" 
        ON public.organizations 
        FOR INSERT 
        WITH CHECK (owner_id IN ( SELECT users.id
           FROM users
          WHERE (users.auth_user_id = auth.uid())));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Organization owners can update organizations') THEN
        CREATE POLICY "Organization owners can update organizations" 
        ON public.organizations 
        FOR UPDATE 
        USING (owner_id IN ( SELECT users.id
           FROM users
          WHERE (users.auth_user_id = auth.uid())));
    END IF;
END $$;