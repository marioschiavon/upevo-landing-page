export interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  projectCount: number;
  type: "fisica" | "juridica";
}

export const mockClientsData: Client[] = [
  {
    id: "CLI-001",
    name: "TechCorp Ltda",
    document: "12.345.678/0001-90",
    phone: "(11) 3456-7890",
    email: "contato@techcorp.com.br",
    projectCount: 3,
    type: "juridica"
  },
  {
    id: "CLI-002", 
    name: "João Silva Santos",
    document: "123.456.789-00",
    phone: "(11) 98765-4321",
    email: "joao.silva@email.com",
    projectCount: 1,
    type: "fisica"
  },
  {
    id: "CLI-003",
    name: "IndustrialMax S/A",
    document: "98.765.432/0001-10",
    phone: "(11) 2345-6789", 
    email: "comercial@industrialmax.com.br",
    projectCount: 2,
    type: "juridica"
  },
  {
    id: "CLI-004",
    name: "Maria Oliveira Costa",
    document: "987.654.321-00",
    phone: "(11) 91234-5678",
    email: "maria.costa@email.com",
    projectCount: 1,
    type: "fisica"
  },
  {
    id: "CLI-005",
    name: "GlobalTech Solutions",
    document: "11.222.333/0001-44",
    phone: "(11) 3333-4444",
    email: "info@globaltech.com",
    projectCount: 4,
    type: "juridica"
  }
];