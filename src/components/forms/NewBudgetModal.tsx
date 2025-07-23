import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";

const budgetSchema = z.object({
  type: z.enum(["inicial", "adicional"], {
    required_error: "Tipo é obrigatório",
  }),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  project_id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  total_value: z.string().min(1, "Valor total é obrigatório"),
  currency: z.string().min(1, "Moeda é obrigatória"),
  valid_until: z.date().optional(),
  payment_method: z.string().min(1, "Forma de pagamento é obrigatória"),
  observations: z.string().optional(),
  // Conditional fields
  installments: z.number().optional(),
  down_payment: z.string().optional(),
  hourly_rate: z.string().optional(),
  estimated_hours: z.number().optional(),
  monthly_duration: z.number().optional(),
  start_date: z.date().optional(),
}).refine((data) => {
  if (data.type === "adicional" && !data.project_id) {
    return false;
  }
  return true;
}, {
  message: "Projeto é obrigatório para orçamentos adicionais",
  path: ["project_id"],
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface NewBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewBudgetModal = ({ isOpen, onClose, onSuccess }: NewBudgetModalProps) => {
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      type: "inicial",
      client_id: "",
      project_id: "",
      title: "",
      description: "",
      total_value: "",
      currency: "BRL",
      payment_method: "",
      observations: "",
    },
  });

  const watchedPaymentMethod = form.watch("payment_method");
  const watchedBudgetType = form.watch("type");
  const watchedClientId = form.watch("client_id");

  useEffect(() => {
    if (isOpen && currentOrganization) {
      fetchClients();
    }
  }, [isOpen, currentOrganization]);

  useEffect(() => {
    if (watchedClientId) {
      fetchProjectsByClient(watchedClientId);
    } else {
      setProjects([]);
    }
  }, [watchedClientId, watchedBudgetType]);

  useEffect(() => {
    // Clear project selection when budget type changes
    if (watchedBudgetType === "inicial") {
      form.setValue("project_id", "");
    }
  }, [watchedBudgetType, form]);

  const fetchClients = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("organization_id", currentOrganization.id)
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive",
      });
    }
  };

  const fetchProjectsByClient = async (clientId: string) => {
    if (!currentOrganization) return;

    try {
      let query = supabase
        .from("projects")
        .select("id, name, status")
        .eq("organization_id", currentOrganization.id)
        .eq("client_id", clientId)
        .order("name");

      // For "adicional" type, only show "em_andamento" projects
      if (watchedBudgetType === "adicional") {
        query = query.eq("status", "em_andamento");
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: string) => {
    // Remove all non-numeric characters except comma and dot
    const numericValue = value.replace(/[^\d,.-]/g, "");
    const floatValue = parseFloat(numericValue.replace(",", "."));
    
    if (isNaN(floatValue)) return "";
    
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(floatValue);
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^\d,.-]/g, "").replace(",", "."));
  };

  const handleCurrencyChange = (field: any, value: string) => {
    const formatted = formatCurrency(value);
    field.onChange(formatted);
  };

  const onSubmit = async (data: BudgetFormData) => {
    if (!currentOrganization) {
      toast({
        title: "Erro",
        description: "Nenhuma organização selecionada",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const budgetData = {
        organization_id: currentOrganization.id,
        client_id: data.client_id,
        project_id: data.type === "inicial" ? null : data.project_id,
        type: data.type,
        status: "aguardando",
        description: data.title,
        total_value: parseCurrency(data.total_value),
        currency: data.currency,
        valid_until: data.valid_until ? data.valid_until.toISOString().split('T')[0] : null,
        payment_method: data.payment_method,
        observations: data.observations || null,
        installments: data.payment_method === "parcelado" ? data.installments : null,
        down_payment: data.down_payment ? parseCurrency(data.down_payment) : null,
        hourly_rate: data.hourly_rate ? parseCurrency(data.hourly_rate) : null,
        estimated_hours: data.payment_method === "por_hora" ? data.estimated_hours : null,
        monthly_duration: data.payment_method === "mensal" ? data.monthly_duration : null,
        start_date: data.payment_method === "mensal" && data.start_date ? data.start_date.toISOString().split('T')[0] : null,
      };

      const { error } = await supabase.from("budgets").insert([budgetData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Orçamento criado com sucesso!",
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating budget:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o orçamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: "a_vista_inicio", label: "À vista no início" },
    { value: "a_vista_final", label: "À vista no final" },
    { value: "parcelado", label: "Parcelado" },
    { value: "mensal", label: "Mensal" },
    { value: "por_hora", label: "Por hora" },
  ];

  const installmentOptions = Array.from({ length: 11 }, (_, i) => i + 2); // 2-12

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Orçamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inicial">Inicial</SelectItem>
                      <SelectItem value="adicional">Adicional</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground mt-1">
                    {watchedBudgetType === "inicial" ? 
                      "Orçamento para um novo projeto" : 
                      "Orçamento adicional para projeto existente"
                    }
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título do orçamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição opcional do orçamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0,00"
                        value={field.value}
                        onChange={(e) => handleCurrencyChange(field, e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a moeda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BRL">BRL - Real</SelectItem>
                        <SelectItem value="USD">USD - Dólar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchedBudgetType === "adicional" && (
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um projeto em andamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground mt-1">
                      Apenas projetos em andamento do cliente selecionado
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="valid_until"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Validade do Orçamento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Fields */}
            {watchedPaymentMethod === "parcelado" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Parcelas</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {installmentOptions.map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="down_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Entrada</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0,00"
                          value={field.value || ""}
                          onChange={(e) => handleCurrencyChange(field, e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchedPaymentMethod === "mensal" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthly_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração em Meses</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          placeholder="Ex: 6"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data Inicial</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchedPaymentMethod === "por_hora" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor por Hora</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0,00"
                          value={field.value || ""}
                          onChange={(e) => handleCurrencyChange(field, e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimativa de Horas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Ex: 40"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações adicionais..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Orçamento
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};