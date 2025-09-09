```diff
--- /dev/null
+++ b/src/lib/demoData.ts
@@ -0,0 +1,269 @@
+import { supabase } from '@/integrations/supabase/client';
+import { toast } from '@/hooks/use-toast';
+
+export async function seedDemoData(authUserId: string) {
+  try {
+    // 1. Get or create user in public.users table
+    let { data: userProfile, error: userProfileError } = await supabase
+      .from('users')
+      .select('id')
+      .eq('auth_user_id', authUserId)
+      .single();
+
+    if (userProfileError && userProfileError.code !== 'PGRST116') { // PGRST116 means no rows found
+      throw userProfileError;
+    }
+
+    if (!userProfile) {
+      const { data: newUserProfile, error: newUserProfileError } = await supabase
+        .from('users')
+        .insert({
+          auth_user_id: authUserId,
+          name: 'Usuário Demo',
+          email: 'demo@example.com',
+        })
+        .select('id')
+        .single();
+      if (newUserProfileError) throw newUserProfileError;
+      userProfile = newUserProfile;
+    }
+
+    const userId = userProfile.id;
+
+    // 2. Get or create Demo Organization
+    let { data: demoOrg, error: orgError } = await supabase
+      .from('organizations')
+      .select('*')
+      .eq('owner_id', userId)
+      .eq('name', 'Organização Demo')
+      .single();
+
+    if (orgError && orgError.code !== 'PGRST116') { // PGRST116 means no rows found
+      throw orgError;
+    }
+
+    if (!demoOrg) {
+      const { data: newOrg, error: newOrgError } = await supabase
+        .from('organizations')
+        .insert({
+          name: 'Organização Demo',
+          description: 'Esta é uma organização de demonstração com dados fictícios.',
+          category: 'Software',
+          owner_id: userId,
+        })
+        .select()
+        .single();
+      if (newOrgError) throw newOrgError;
+      demoOrg = newOrg;
+
+      // Add owner as member
+      await supabase.from('organization_members').insert({
+        organization_id: demoOrg.id,
+        user_id: userId,
+        role: 'owner',
+      });
+    }
+
+    const organizationId = demoOrg.id;
+
+    // 3. Create Demo Clients (if not exist)
+    let { data: client1, error: client1Error } = await supabase
+      .from('clients')
+      .select('id')
+      .eq('organization_id', organizationId)
+      .eq('name', 'Cliente Fictício A')
+      .single();
+
+    if (client1Error && client1Error.code !== 'PGRST116') throw client1Error;
+    if (!client1) {
+      const { data: newClient, error: newClientError } = await supabase
+        .from('clients')
+        .insert({
+          organization_id: organizationId,
+          name: 'Cliente Fictício A',
+          email: 'cliente.a@example.com',
+          phone: '11987654321',
+          client_type: 'Pessoa Jurídica',
+          cnpj: '00.000.000/0001-00',
+        })
+        .select('id')
+        .single();
+      if (newClientError) throw newClientError;
+      client1 = newClient;
+    }
+
+    let { data: client2, error: client2Error } = await supabase
+      .from('clients')
+      .select('id')
+      .eq('organization_id', organizationId)
+      .eq('name', 'Cliente Fictício B')
+      .single();
+
+    if (client2Error && client2Error.code !== 'PGRST116') throw client2Error;
+    if (!client2) {
+      const { data: newClient, error: newClientError } = await supabase
+        .from('clients')
+        .insert({
+          organization_id: organizationId,
+          name: 'Cliente Fictício B',
+          email: 'cliente.b@example.com',
+          phone: '21912345678',
+          client_type: 'Pessoa Física',
+          cpf: '123.456.789-00',
+        })
+        .select('id')
+        .single();
+      if (newClientError) throw newClientError;
+      client2 = newClient;
+    }
+
+    // 4. Create Demo Projects (if not exist)
+    let { data: project1, error: project1Error } = await supabase
+      .from('projects')
+      .select('id')
+      .eq('organization_id', organizationId)
+      .eq('name', 'Website Institucional')
+      .single();
+
+    if (project1Error && project1Error.code !== 'PGRST116') throw project1Error;
+    if (!project1) {
+      const { data: newProject, error: newProjectError } = await supabase
+        .from('projects')
+        .insert({
+          organization_id: organizationId,
+          client_id: client1.id,
+          name: 'Website Institucional',
+          description: 'Desenvolvimento de um website completo para a empresa.',
+          status: 'em_andamento',
+          start_date: '2025-01-15',
+          currency: 'BRL',
+        })
+        .select('id')
+        .single();
+      if (newProjectError) throw newProjectError;
+      project1 = newProject;
+    }
+
+    let { data: project2, error: project2Error } = await supabase
+      .from('projects')
+      .select('id')
+      .eq('organization_id', organizationId)
+      .eq('name', 'Campanha de Marketing Digital')
+      .single();
+
+    if (project2Error && project2Error.code !== 'PGRST116') throw project2Error;
+    if (!project2) {
+      const { data: newProject, error: newProjectError } = await supabase
+        .from('projects')
+        .insert({
+          organization_id: organizationId,
+          client_id: client2.id,
+          name: 'Campanha de Marketing Digital',
+          description: 'Criação e execução de campanha de anúncios online.',
+          status: 'concluido',
+          start_date: '2024-10-01',
+          currency: 'BRL',
+        })
+        .select('id')
+        .single();
+      if (newProjectError) throw newProjectError;
+      project2 = newProject;
+    }
+
+    // 5. Create Demo Tasks (if not exist)
+    // For project1
+    let { data: task1, error: task1Error } = await supabase
+      .from('tasks')
+      .select('id')
+      .eq('project_id', project1.id)
+      .eq('title', 'Definir escopo do projeto')
+      .single();
+    if (task1Error && task1Error.code !== 'PGRST116') throw task1Error;
+    if (!task1) {
+      await supabase.from('tasks').insert({
+        project_id: project1.id,
+        title: 'Definir escopo do projeto',
+        description: 'Reunião com o cliente para detalhar requisitos.',
+        status: 'concluida',
+        priority: 'alta',
+        due_date: '2025-01-20',
+      });
+    }
+
+    let { data: task2, error: task2Error } = await supabase
+      .from('tasks')
+      .select('id')
+      .eq('project_id', project1.id)
+      .eq('title', 'Desenvolver layout da página inicial')
+      .single();
+    if (task2Error && task2Error.code !== 'PGRST116') throw task2Error;
+    if (!task2) {
+      await supabase.from('tasks').insert({
+        project_id: project1.id,
+        title: 'Desenvolver layout da página inicial',
+        description: 'Criação do design visual no Figma.',
+        status: 'em_andamento',
+        priority: 'media',
+        due_date: '2025-02-10',
+      });
+    }
+
+    let { data: task3, error: task3Error } = await supabase
+      .from('tasks')
+      .select('id')
+      .eq('project_id', project1.id)
+      .eq('title', 'Implementar formulário de contato')
+      .single();
+    if (task3Error && task3Error.code !== 'PGRST116') throw task3Error;
+    if (!task3) {
+      await supabase.from('tasks').insert({
+        project_id: project1.id,
+        title: 'Implementar formulário de contato',
+        description: 'Codificação do formulário e integração com backend.',
+        status: 'pendente',
+        priority: 'alta',
+        due_date: '2025-03-01',
+      });
+    }
+
+    // For project2
+    let { data: task4, error: task4Error } = await supabase
+      .from('tasks')
+      .select('id')
+      .eq('project_id', project2.id)
+      .eq('title', 'Criar personas de público')
+      .single();
+    if (task4Error && task4Error.code !== 'PGRST116') throw task4Error;
+    if (!task4) {
+      await supabase.from('tasks').insert({
+        project_id: project2.id,
+        title: 'Criar personas de público',
+        description: 'Pesquisa e definição de perfis de clientes ideais.',
+        status: 'concluida',
+        priority: 'media',
+        due_date: '2024-10-10',
+      });
+    }
+
+    // 6. Create Demo Budgets (if not exist)
+    let { data: budget1, error: budget1Error } = await supabase
+      .from('budgets')
+      .select('id')
+      .eq('project_id', project1.id)
+      .eq('type', 'inicial')
+      .single();
+    if (budget1Error && budget1Error.code !== 'PGRST116') throw budget1Error;
+    if (!budget1) {
+      const { data: newBudget, error: newBudgetError } = await supabase
+        .from('budgets')
+        .insert({
+          organization_id: organizationId,
+          client_id: client1.id,
+          project_id: project1.id,
+          type: 'inicial',
+          description: 'Orçamento inicial para desenvolvimento do website.',
+          total_value: 15000.00,
+          status: 'aprovado',
+          currency: 'BRL',
+          payment_method: 'parcelado',
+          down_payment: 5000.00,
+          valid_until: '2025-01-31',
+        })
+        .select('id')
+        .single();
+      if (newBudgetError) throw newBudgetError;
+      budget1 = newBudget;
+    }
+
+    let { data: budget2, error: budget2Error } = await supabase
+      .from('budgets')
+      .select('id')
+      .eq('project_id', project2.id)
+      .eq('type', 'inicial')
+      .single();
+    if (budget2Error && budget2Error.code !== 'PGRST116') throw budget2Error;
+    if (!budget2) {
+      const { data: newBudget, error: newBudgetError } = await supabase
+        .from('budgets')
+        .insert({
+          organization_id: organizationId,
+          client_id: client2.id,
+          project_id: project2.id,
+          type: 'inicial',
+          description: 'Orçamento para campanha de marketing digital.',
+          total_value: 8000.00,
+          status: 'aprovado',
+          currency: 'BRL',
+          payment_method: 'a_vista_final',
+          valid_until: '2024-10-15',
+        })
+        .select('id')
+        .single();
+      if (newBudgetError) throw newBudgetError;
+      budget2 = newBudget;
+    }
+
+    // 7. Create Demo Payments (if not exist)
+    // For budget1 (Website Institucional)
+    let { data: payment1, error: payment1Error } = await supabase
+      .from('payments')
+      .select('id')
+      .eq('budget_id', budget1.id)
+      .eq('description', 'Entrada Website')
+      .single();
+    if (payment1Error && payment1Error.code !== 'PGRST116') throw payment1Error;
+    if (!payment1) {
+      await supabase.from('payments').insert({
+        organization_id: organizationId,
+        project_id: project1.id,
+        budget_id: budget1.id,
+        description: 'Entrada Website',
+        value: 5000.00,
+        due_date: '2025-01-25',
+        paid_date: '2025-01-24',
+        status: 'pago',
+        payment_method: 'pix',
+      });
+    }
+
+    let { data: payment2, error: payment2Error } = await supabase
+      .from('payments')
+      .select('id')
+      .eq('budget_id', budget1.id)
+      .eq('description', 'Parcela Final Website')
+      .single();
+    if (payment2Error && payment2Error.code !== 'PGRST116') throw payment2Error;
+    if (!payment2) {
+      await supabase.from('payments').insert({
+        organization_id: organizationId,
+        project_id: project1.id,
+        budget_id: budget1.id,
+        description: 'Parcela Final Website',
+        value: 10000.00,
+        due_date: '2025-03-15',
+        status: 'pendente',
+        payment_method: 'transferencia',
+      });
+    }
+
+    // For budget2 (Campanha de Marketing Digital)
+    let { data: payment3, error: payment3Error } = await supabase
+      .from('payments')
+      .select('id')
+      .eq('budget_id', budget2.id)
+      .eq('description', 'Pagamento Campanha Marketing')
+      .single();
+    if (payment3Error && payment3Error.code !== 'PGRST116') throw payment3Error;
+    if (!payment3) {
+      await supabase.from('payments').insert({
+        organization_id: organizationId,
+        project_id: project2.id,
+        budget_id: budget2.id,
+        description: 'Pagamento Campanha Marketing',
+        value: 8000.00,
+        due_date: '2024-11-01',
+        paid_date: '2024-10-30',
+        status: 'pago',
+        payment_method: 'boleto',
+      });
+    }
+
+    // 8. Create Demo Events (if not exist)
+    let { data: event1, error: event1Error } = await supabase
+      .from('events')
+      .select('id')
+      .eq('organization_id', organizationId)
+      .eq('title', 'Reunião de Alinhamento - Website')
+      .single();
+    if (event1Error && event1Error.code !== 'PGRST116') throw event1Error;
+    if (!event1) {
+      await supabase.from('events').insert({
+        organization_id: organizationId,
+        title: 'Reunião de Alinhamento - Website',
+        description: 'Reunião semanal com o cliente A para alinhamento do projeto de website.',
+        start_time: '2025-09-10T10:00:00Z',
+        end_time: '2025-09-10T11:00:00Z',
+        origin: 'internal',
+        created_by: userId,
+      });
+    }
+
+    let { data: event2, error: event2Error } = await supabase
+      .from('events')
+      .select('id')
+      .eq('organization_id', organizationId)
+      .eq('title', 'Planejamento de Conteúdo - Marketing')
+      .single();
+    if (event2Error && event2Error.code !== 'PGRST116') throw event2Error;
+    if (!event2) {
+      await supabase.from('events').insert({
+        organization_id: organizationId,
+        title: 'Planejamento de Conteúdo - Marketing',
+        description: 'Sessão de brainstorming para novos conteúdos da campanha.',
+        start_time: '2025-09-12T14:00:00Z',
+        end_time: '2025-09-12T15:30:00Z',
+        origin: 'internal',
+        created_by: userId,
+      });
+    }
+
+    // 9. Create Demo Time Logs (if not exist)
+    let { data: timeLog1, error: timeLog1Error } = await supabase
+      .from('time_logs')
+      .select('id')
+      .eq('project_id', project1.id)
+      .eq('description', 'Trabalho no layout da home page')
+      .single();
+    if (timeLog1Error && timeLog1Error.code !== 'PGRST116') throw timeLog1Error;
+    if (!timeLog1) {
+      await supabase.from('time_logs').insert({
+        project_id: project1.id,
+        user_id: userId,
+        start_time: '2025-09-08T09:00:00Z',
+        end_time: '2025-09-08T11:30:00Z',
+        duration_minutes: 150,
+        description: 'Trabalho no layout da home page',
+        billable: true,
+      });
+    }
+
+    let { data: timeLog2, error: timeLog2Error } = await supabase
+      .from('time_logs')
+      .select('id')
+      .eq('project_id', project2.id)
+      .eq('description', 'Análise de métricas da campanha')
+      .single();
+    if (timeLog2Error && timeLog2Error.code !== 'PGRST116') throw timeLog2Error;
+    if (!timeLog2) {
+      await supabase.from('time_logs').insert({
+        project_id: project2.id,
+        user_id: userId,
+        start_time: '2025-09-09T13:00:00Z',
+        end_time: '2025-09-09T14:00:00Z',
+        duration_minutes: 60,
+        description: 'Análise de métricas da campanha',
+        billable: true,
+      });
+    }
+
+    toast.success('Dados de demonstração carregados com sucesso!');
+  } catch (error: any) {
+    console.error('Erro ao carregar dados de demonstração:', error);
+    toast.error(\`Erro ao carregar dados de demonstração: ${error.message}`);
+  }
+}
```