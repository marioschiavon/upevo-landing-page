export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      apps: {
        Row: {
          created_at: string
          id: number
          Nome: string
        }
        Insert: {
          created_at?: string
          id?: number
          Nome: string
        }
        Update: {
          created_at?: string
          id?: number
          Nome?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          cor: string | null
          data_criacao: string | null
          id: string
          nome: string
          usuario_id: string
        }
        Insert: {
          cor?: string | null
          data_criacao?: string | null
          id?: string
          nome: string
          usuario_id: string
        }
        Update: {
          cor?: string | null
          data_criacao?: string | null
          id?: string
          nome?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "categorias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          cpf: string | null
          data_cadastro: string | null
          data_nascimento: string | null
          email: string
          endereco: string | null
          estado: string | null
          id_cliente: number
          id_organizacao: number | null
          inscricao_estadual: string | null
          nome: string
          nome_fantasia: string | null
          obs: string | null
          pais: string | null
          responsavel: string | null
          sexo: string | null
          telefone: string | null
          tipo_cliente: string
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          cpf?: string | null
          data_cadastro?: string | null
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          estado?: string | null
          id_cliente?: number
          id_organizacao?: number | null
          inscricao_estadual?: string | null
          nome: string
          nome_fantasia?: string | null
          obs?: string | null
          pais?: string | null
          responsavel?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo_cliente: string
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          cpf?: string | null
          data_cadastro?: string | null
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          estado?: string | null
          id_cliente?: number
          id_organizacao?: number | null
          inscricao_estadual?: string | null
          nome?: string
          nome_fantasia?: string | null
          obs?: string | null
          pais?: string | null
          responsavel?: string | null
          sexo?: string | null
          telefone?: string | null
          tipo_cliente?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organizacao"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id_organizacao"]
          },
        ]
      }
      organizacoes: {
        Row: {
          ativo: boolean | null
          data_criacao: string | null
          descricao: string | null
          email_contato: string | null
          endereco: string | null
          id_organizacao: number
          logo_url: string | null
          nome: string
          observacoes: string | null
          responsavel: string | null
          telefone_contato: string | null
          tipo_organizacao: string | null
          website: string | null
        }
        Insert: {
          ativo?: boolean | null
          data_criacao?: string | null
          descricao?: string | null
          email_contato?: string | null
          endereco?: string | null
          id_organizacao?: number
          logo_url?: string | null
          nome: string
          observacoes?: string | null
          responsavel?: string | null
          telefone_contato?: string | null
          tipo_organizacao?: string | null
          website?: string | null
        }
        Update: {
          ativo?: boolean | null
          data_criacao?: string | null
          descricao?: string | null
          email_contato?: string | null
          endereco?: string | null
          id_organizacao?: number
          logo_url?: string | null
          nome?: string
          observacoes?: string | null
          responsavel?: string | null
          telefone_contato?: string | null
          tipo_organizacao?: string | null
          website?: string | null
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          categoria_id: string | null
          data_conclusao: string | null
          data_criacao: string | null
          descricao: string | null
          id: string
          prioridade: string | null
          status: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          categoria_id?: string | null
          data_conclusao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          prioridade?: string | null
          status?: string | null
          titulo: string
          usuario_id: string
        }
        Update: {
          categoria_id?: string | null
          data_conclusao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          prioridade?: string | null
          status?: string | null
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "tarefas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          app: string | null
          data_criacao: string | null
          email: string
          foto: string | null
          id: string
          nome: string
          oraganizacao: number | null
          senha: string | null
          user_auth: string | null
        }
        Insert: {
          app?: string | null
          data_criacao?: string | null
          email: string
          foto?: string | null
          id?: string
          nome: string
          oraganizacao?: number | null
          senha?: string | null
          user_auth?: string | null
        }
        Update: {
          app?: string | null
          data_criacao?: string | null
          email?: string
          foto?: string | null
          id?: string
          nome?: string
          oraganizacao?: number | null
          senha?: string | null
          user_auth?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_oraganizacao_fkey"
            columns: ["oraganizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id_organizacao"]
          },
        ]
      }
    }
    Views: {
      estatisticas_usuario: {
        Row: {
          tarefas_concluidas: number | null
          tarefas_pendentes: number | null
          total_tarefas: number | null
          usuario_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
