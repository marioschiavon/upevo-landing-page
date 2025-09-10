// Mock data for demonstration mode
export const mockUser = {
  id: 'demo-user-123',
  name: 'Usuário Demonstração',
  email: 'demo@upevolution.com',
  auth_user_id: 'demo-auth-123',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};

export const mockOrganizations = [
  {
    id: 'demo-org-1',
    name: 'Upevolution Demo',
    description: 'Organização de demonstração para testes do sistema',
    category: 'Desenvolvimento',
    owner_id: mockUser.id,
    logo_url: '/lovable-uploads/7700580a-cd6a-459a-ae9d-64022d619f96.png',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

export const mockClients = [
  {
    id: 'demo-client-1',
    organization_id: 'demo-org-1',
    name: 'TechCorp Ltda',
    email: 'contato@techcorp.com',
    phone: '(11) 99999-8888',
    client_type: 'Pessoa Jurídica',
    cnpj: '12.345.678/0001-90',
    trade_name: 'TechCorp',
    responsible_person: 'João Silva',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01310-100',
    country: 'Brasil',
    is_active: true,
    notes: 'Cliente estratégico com foco em soluções digitais',
    internal_notes: 'Sempre paga em dia, excelente relacionamento',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'demo-client-2',
    organization_id: 'demo-org-1',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 98765-4321',
    client_type: 'Pessoa Física',
    cpf: '123.456.789-00',
    birth_date: '1985-03-15',
    gender: 'Feminino',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '04567-890',
    country: 'Brasil',
    is_active: true,
    notes: 'Empreendedora individual, foco em e-commerce',
    internal_notes: 'Muito detalhista, gosta de acompanhar o progresso',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01T09:15:00Z'
  },
  {
    id: 'demo-client-3',
    organization_id: 'demo-org-1',
    name: 'StartupXYZ',
    email: 'hello@startupxyz.com',
    phone: '(11) 91234-5678',
    client_type: 'Pessoa Jurídica',
    cnpj: '98.765.432/0001-10',
    trade_name: 'StartupXYZ',
    responsible_person: 'Carlos Oliveira',
    address: 'Rua da Inovação, 456',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01234-567',
    country: 'Brasil',
    is_active: true,
    notes: 'Startup em crescimento, área de fintech',
    internal_notes: 'Pagamentos sempre pontuais, ótima comunicação',
    created_at: '2024-02-10T16:45:00Z',
    updated_at: '2024-02-10T16:45:00Z'
  }
];

export const mockProjects = [
  {
    id: 'demo-project-1',
    client_id: 'demo-client-1',
    organization_id: 'demo-org-1',
    name: 'Sistema de Gestão Empresarial',
    description: 'Desenvolvimento de um sistema completo de gestão empresarial com módulos de vendas, estoque e financeiro.',
    status: 'em_andamento',
    start_date: '2024-02-15',
    currency: 'BRL',
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2024-02-15T08:00:00Z',
    clients: mockClients[0],
    organizations: mockOrganizations[0]
  },
  {
    id: 'demo-project-2',
    client_id: 'demo-client-2',
    organization_id: 'demo-org-1',
    name: 'E-commerce Personalizado',
    description: 'Criação de loja virtual com integração de pagamentos e sistema de gestão de produtos.',
    status: 'concluido',
    start_date: '2024-01-10',
    currency: 'BRL',
    created_at: '2024-01-10T10:30:00Z',
    updated_at: '2024-03-01T18:00:00Z',
    clients: mockClients[1],
    organizations: mockOrganizations[0]
  },
  {
    id: 'demo-project-3',
    client_id: 'demo-client-3',
    organization_id: 'demo-org-1',
    name: 'App Mobile Fintech',
    description: 'Desenvolvimento de aplicativo mobile para gestão financeira pessoal com IA.',
    status: 'em_andamento',
    start_date: '2024-03-01',
    currency: 'BRL',
    created_at: '2024-03-01T14:20:00Z',
    updated_at: '2024-03-01T14:20:00Z',
    clients: mockClients[2],
    organizations: mockOrganizations[0]
  }
];

export const mockTasks = [
  // Tasks for Sistema de Gestão Empresarial
  {
    id: 'demo-task-1',
    project_id: 'demo-project-1',
    title: 'Análise de Requisitos',
    description: 'Levantamento completo dos requisitos funcionais e não funcionais do sistema.',
    status: 'concluida',
    priority: 'alta',
    assigned_to: mockUser.id,
    due_date: '2024-02-20',
    created_at: '2024-02-15T08:30:00Z',
    updated_at: '2024-02-18T16:45:00Z'
  },
  {
    id: 'demo-task-2',
    project_id: 'demo-project-1',
    title: 'Design da Interface',
    description: 'Criação dos wireframes e protótipos das telas principais do sistema.',
    status: 'em_andamento',
    priority: 'alta',
    assigned_to: mockUser.id,
    due_date: '2024-03-15',
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-02-25T11:30:00Z'
  },
  {
    id: 'demo-task-3',
    project_id: 'demo-project-1',
    title: 'Desenvolvimento Backend',
    description: 'Implementação da API REST e estrutura do banco de dados.',
    status: 'pendente',
    priority: 'media',
    assigned_to: mockUser.id,
    due_date: '2024-04-01',
    created_at: '2024-02-25T14:15:00Z',
    updated_at: '2024-02-25T14:15:00Z'
  },
  // Tasks for E-commerce Personalizado
  {
    id: 'demo-task-4',
    project_id: 'demo-project-2',
    title: 'Configuração da Loja',
    description: 'Setup inicial da plataforma de e-commerce e configurações básicas.',
    status: 'concluida',
    priority: 'alta',
    assigned_to: mockUser.id,
    due_date: '2024-01-25',
    created_at: '2024-01-10T11:00:00Z',
    updated_at: '2024-01-22T17:30:00Z'
  },
  {
    id: 'demo-task-5',
    project_id: 'demo-project-2',
    title: 'Integração de Pagamentos',
    description: 'Implementação dos gateways de pagamento PIX, cartão e boleto.',
    status: 'concluida',
    priority: 'alta',
    assigned_to: mockUser.id,
    due_date: '2024-02-10',
    created_at: '2024-01-25T13:45:00Z',
    updated_at: '2024-02-08T19:20:00Z'
  },
  // Tasks for App Mobile Fintech
  {
    id: 'demo-task-6',
    project_id: 'demo-project-3',
    title: 'Prototipação UX/UI',
    description: 'Criação dos protótipos de alta fidelidade para o aplicativo mobile.',
    status: 'em_andamento',
    priority: 'alta',
    assigned_to: mockUser.id,
    due_date: '2024-03-20',
    created_at: '2024-03-01T15:00:00Z',
    updated_at: '2024-03-10T12:15:00Z'
  },
  {
    id: 'demo-task-7',
    project_id: 'demo-project-3',
    title: 'Desenvolvimento da IA',
    description: 'Implementação dos algoritmos de inteligência artificial para análise financeira.',
    status: 'pendente',
    priority: 'media',
    assigned_to: mockUser.id,
    due_date: '2024-04-15',
    created_at: '2024-03-05T10:30:00Z',
    updated_at: '2024-03-05T10:30:00Z'
  }
];

export const mockBudgets = [
  {
    id: 'demo-budget-1',
    organization_id: 'demo-org-1',
    client_id: 'demo-client-1',
    project_id: 'demo-project-1',
    type: 'inicial',
    description: 'Orçamento para desenvolvimento do Sistema de Gestão Empresarial',
    total_value: 45000.00,
    status: 'aprovado',
    currency: 'BRL',
    payment_method: 'parcelado',
    installments: 2,
    down_payment: 15000.00,
    delivery_days: 90,
    valid_until: '2024-03-15',
    observations: 'Inclui treinamento da equipe e suporte por 3 meses',
    created_at: '2024-02-10T14:00:00Z',
    updated_at: '2024-02-12T16:30:00Z',
    projects: mockProjects[0],
    clients: mockClients[0]
  },
  {
    id: 'demo-budget-2',
    organization_id: 'demo-org-1',
    client_id: 'demo-client-2',
    project_id: 'demo-project-2',
    type: 'inicial',
    description: 'Orçamento para desenvolvimento do E-commerce Personalizado',
    total_value: 18000.00,
    status: 'aprovado',
    currency: 'BRL',
    payment_method: 'a_vista_final',
    delivery_days: 45,
    valid_until: '2024-01-25',
    observations: 'Inclui configuração de produtos e treinamento',
    created_at: '2024-01-05T09:15:00Z',
    updated_at: '2024-01-08T11:45:00Z',
    projects: mockProjects[1],
    clients: mockClients[1]
  },
  {
    id: 'demo-budget-3',
    organization_id: 'demo-org-1',
    client_id: 'demo-client-3',
    project_id: 'demo-project-3',
    type: 'inicial',
    description: 'Orçamento para desenvolvimento do App Mobile Fintech',
    total_value: 75000.00,
    status: 'aguardando',
    currency: 'BRL',
    payment_method: 'mensal',
    monthly_duration: 6,
    start_date: '2024-03-01',
    delivery_days: 120,
    valid_until: '2024-03-25',
    observations: 'Desenvolvimento em fases com entregas mensais',
    created_at: '2024-02-25T13:20:00Z',
    updated_at: '2024-02-25T13:20:00Z',
    projects: mockProjects[2],
    clients: mockClients[2]
  }
];

export const mockPayments = [
  // Payments for Sistema de Gestão Empresarial
  {
    id: 'demo-payment-1',
    organization_id: 'demo-org-1',
    project_id: 'demo-project-1',
    budget_id: 'demo-budget-1',
    description: 'Entrada - Sistema de Gestão',
    value: 15000.00,
    due_date: '2024-02-20',
    paid_date: '2024-02-18',
    status: 'pago',
    payment_method: 'pix',
    notes: 'Pagamento realizado via PIX',
    created_at: '2024-02-12T16:30:00Z',
    updated_at: '2024-02-18T10:15:00Z',
    projects: { name: mockProjects[0].name, clients: { name: mockClients[0].name } }
  },
  {
    id: 'demo-payment-2',
    organization_id: 'demo-org-1',
    project_id: 'demo-project-1',
    budget_id: 'demo-budget-1',
    description: 'Parcela Final - Sistema de Gestão',
    value: 30000.00,
    due_date: '2024-04-15',
    paid_date: null,
    status: 'pendente',
    payment_method: 'transferencia',
    notes: 'Pagamento na entrega do projeto',
    created_at: '2024-02-12T16:30:00Z',
    updated_at: '2024-02-12T16:30:00Z',
    projects: { name: mockProjects[0].name, clients: { name: mockClients[0].name } }
  },
  // Payments for E-commerce Personalizado
  {
    id: 'demo-payment-3',
    organization_id: 'demo-org-1',
    project_id: 'demo-project-2',
    budget_id: 'demo-budget-2',
    description: 'Pagamento E-commerce Completo',
    value: 18000.00,
    due_date: '2024-02-25',
    paid_date: '2024-02-24',
    status: 'pago',
    payment_method: 'boleto',
    notes: 'Projeto finalizado com sucesso',
    created_at: '2024-01-08T11:45:00Z',
    updated_at: '2024-02-24T14:20:00Z',
    projects: { name: mockProjects[1].name, clients: { name: mockClients[1].name } }
  },
  // Payments for App Mobile Fintech
  {
    id: 'demo-payment-4',
    organization_id: 'demo-org-1',
    project_id: 'demo-project-3',
    budget_id: 'demo-budget-3',
    description: '1ª Parcela - App Fintech',
    value: 12500.00,
    due_date: '2024-03-15',
    paid_date: '2024-03-14',
    status: 'pago',
    payment_method: 'pix',
    notes: 'Primeira entrega realizada',
    created_at: '2024-02-25T13:20:00Z',
    updated_at: '2024-03-14T09:30:00Z',
    projects: { name: mockProjects[2].name, clients: { name: mockClients[2].name } }
  },
  {
    id: 'demo-payment-5',
    organization_id: 'demo-org-1',
    project_id: 'demo-project-3',
    budget_id: 'demo-budget-3',
    description: '2ª Parcela - App Fintech',
    value: 12500.00,
    due_date: '2024-04-15',
    paid_date: null,
    status: 'pendente',
    payment_method: 'transferencia',
    notes: 'Aguardando segunda entrega',
    created_at: '2024-02-25T13:20:00Z',
    updated_at: '2024-02-25T13:20:00Z',
    projects: { name: mockProjects[2].name, clients: { name: mockClients[2].name } }
  }
];

export const mockTimeLogs = [
  {
    id: 'demo-timelog-1',
    project_id: 'demo-project-1',
    user_id: mockUser.id,
    start_time: '2024-03-01T09:00:00Z',
    end_time: '2024-03-01T12:30:00Z',
    duration_minutes: 210,
    description: 'Desenvolvimento da tela de dashboard',
    billable: true,
    google_calendar_event_id: null,
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T12:30:00Z'
  },
  {
    id: 'demo-timelog-2',
    project_id: 'demo-project-1',
    user_id: mockUser.id,
    start_time: '2024-03-02T14:00:00Z',
    end_time: '2024-03-02T17:45:00Z',
    duration_minutes: 225,
    description: 'Implementação da API de usuários',
    billable: true,
    google_calendar_event_id: null,
    created_at: '2024-03-02T14:00:00Z',
    updated_at: '2024-03-02T17:45:00Z'
  },
  {
    id: 'demo-timelog-3',
    project_id: 'demo-project-2',
    user_id: mockUser.id,
    start_time: '2024-02-20T10:30:00Z',
    end_time: '2024-02-20T15:00:00Z',
    duration_minutes: 270,
    description: 'Configuração do gateway de pagamento',
    billable: true,
    google_calendar_event_id: null,
    created_at: '2024-02-20T10:30:00Z',
    updated_at: '2024-02-20T15:00:00Z'
  },
  {
    id: 'demo-timelog-4',
    project_id: 'demo-project-3',
    user_id: mockUser.id,
    start_time: '2024-03-05T08:00:00Z',
    end_time: '2024-03-05T11:30:00Z',
    duration_minutes: 210,
    description: 'Prototipação das telas principais',
    billable: true,
    google_calendar_event_id: null,
    created_at: '2024-03-05T08:00:00Z',
    updated_at: '2024-03-05T11:30:00Z'
  },
  {
    id: 'demo-timelog-5',
    project_id: 'demo-project-3',
    user_id: mockUser.id,
    start_time: '2024-03-08T13:15:00Z',
    end_time: '2024-03-08T18:00:00Z',
    duration_minutes: 285,
    description: 'Pesquisa e planejamento da arquitetura de IA',
    billable: true,
    google_calendar_event_id: null,
    created_at: '2024-03-08T13:15:00Z',
    updated_at: '2024-03-08T18:00:00Z'
  }
];

export const mockEvents = [
  {
    id: 'demo-event-1',
    organization_id: 'demo-org-1',
    title: 'Reunião de Alinhamento - TechCorp',
    description: 'Reunião semanal para alinhamento do projeto Sistema de Gestão Empresarial',
    start_time: '2024-03-15T10:00:00Z',
    end_time: '2024-03-15T11:00:00Z',
    origin: 'internal',
    google_event_id: null,
    created_by: mockUser.id,
    sync_with_google: false,
    created_at: '2024-03-10T16:20:00Z',
    updated_at: '2024-03-10T16:20:00Z'
  },
  {
    id: 'demo-event-2',
    organization_id: 'demo-org-1',
    title: 'Apresentação do Protótipo - StartupXYZ',
    description: 'Apresentação dos protótipos do App Mobile Fintech para validação',
    start_time: '2024-03-18T14:30:00Z',
    end_time: '2024-03-18T16:00:00Z',
    origin: 'internal',
    google_event_id: null,
    created_by: mockUser.id,
    sync_with_google: false,
    created_at: '2024-03-12T11:10:00Z',
    updated_at: '2024-03-12T11:10:00Z'
  },
  {
    id: 'demo-event-3',
    organization_id: 'demo-org-1',
    title: 'Entrega Final - E-commerce Maria',
    description: 'Entrega e treinamento final do e-commerce personalizado',
    start_time: '2024-02-28T09:00:00Z',
    end_time: '2024-02-28T12:00:00Z',
    origin: 'internal',
    google_event_id: null,
    created_by: mockUser.id,
    sync_with_google: false,
    created_at: '2024-02-25T17:45:00Z',
    updated_at: '2024-02-25T17:45:00Z'
  }
];

// Helper function to check if we're in demo mode
export const isDemoMode = (): boolean => {
  return localStorage.getItem('demoMode') === 'true';
};

// Helper function to enter demo mode
export const enterDemoMode = () => {
  localStorage.setItem('demoMode', 'true');
  localStorage.setItem('demoUser', JSON.stringify(mockUser));
  localStorage.setItem('currentOrganization', JSON.stringify(mockOrganizations[0]));
};

// Helper function to exit demo mode
export const exitDemoMode = () => {
  localStorage.removeItem('demoMode');
  localStorage.removeItem('demoUser');
  localStorage.removeItem('currentOrganization');
};

// Get mock data based on current organization
export const getMockData = () => {
  if (!isDemoMode()) return null;

  return {
    user: mockUser,
    organizations: mockOrganizations,
    clients: mockClients,
    projects: mockProjects,
    tasks: mockTasks,
    budgets: mockBudgets,
    payments: mockPayments,
    timeLogs: mockTimeLogs,
    events: mockEvents
  };
};