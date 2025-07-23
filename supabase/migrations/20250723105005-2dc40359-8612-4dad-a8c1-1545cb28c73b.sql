
-- Expandir a tabela clients com os campos necessários
ALTER TABLE public.clients 
ADD COLUMN client_type TEXT DEFAULT 'Pessoa Física',
ADD COLUMN cpf VARCHAR(14),
ADD COLUMN cnpj VARCHAR(18),
ADD COLUMN birth_date DATE,
ADD COLUMN gender TEXT,
ADD COLUMN state_registration VARCHAR(20),
ADD COLUMN trade_name VARCHAR(255),
ADD COLUMN responsible_person VARCHAR(255),
ADD COLUMN address TEXT,
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(2),
ADD COLUMN zip_code VARCHAR(10),
ADD COLUMN country VARCHAR(100) DEFAULT 'Brasil',
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN internal_notes TEXT;

-- Criar índices para campos frequentemente consultados
CREATE INDEX idx_clients_cpf ON public.clients(cpf);
CREATE INDEX idx_clients_cnpj ON public.clients(cnpj);
CREATE INDEX idx_clients_client_type ON public.clients(client_type);
CREATE INDEX idx_clients_is_active ON public.clients(is_active);
