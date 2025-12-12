import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const editBudgetSchema = z.object({
  description: z.string().optional(),
  total_value: z.string().min(1, "Valor total é obrigatório"),
  status: z.enum(['aguardando', 'aprovado', 'recusado', 'cancelado']),
  payment_method: z.string().optional(),
  down_payment: z.string().optional(),
  delivery_days: z.string().optional(),
  start_date: z.date().optional(),
  valid_until: z.date().optional(),
  hourly_rate: z.string().optional(),
  estimated_hours: z.string().optional(),
  monthly_duration: z.string().optional(),
  observations: z.string().optional(),
});

type EditBudgetFormData = z.infer<typeof editBudgetSchema>;

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: any;
  onSuccess: () => void;
}

export function EditBudgetModal({ isOpen, onClose, budget, onSuccess }: EditBudgetModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditBudgetFormData>({
    resolver: zodResolver(editBudgetSchema),
    defaultValues: {
      description: "",
      total_value: "",
      status: "aguardando",
      payment_method: "",
      down_payment: "",
      delivery_days: "",
      hourly_rate: "",
      estimated_hours: "",
      monthly_duration: "",
      observations: "",
    },
  });

  useEffect(() => {
    if (budget && isOpen) {
      form.reset({
        description: budget.description || "",
        total_value: budget.total_value ? formatCurrencyDisplay(budget.total_value) : "",
        status: budget.status || "aguardando",
        payment_method: budget.payment_method || "a_vista_inicio", // Default to a valid method
        down_payment: budget.down_payment ? formatCurrencyDisplay(budget.down_payment) : "",
        delivery_days: budget.delivery_days?.toString() || "",
        hourly_rate: budget.hourly_rate ? formatCurrencyDisplay(budget.hourly_rate) : "",
        estimated_hours: budget.estimated_hours ? budget.estimated_hours.toString() : "",
        monthly_duration: budget.monthly_duration ? budget.monthly_duration.toString() : "",
        observations: budget.observations || "",
        start_date: budget.start_date ? new Date(budget.start_date) : undefined,
        valid_until: budget.valid_until ? new Date(budget.valid_until) : undefined,
      });
    }
  }, [budget, isOpen, form]);

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    // Remove thousand separators (dots) and replace decimal comma with dot
    const cleanedValue = value.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseCurrency = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
    return parseFloat(numbers) / 100;
  };

  const formatCurrencyDisplay = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleCurrencyInputChange = (field: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Remove all characters that are not digits, commas, or dots
    inputValue = inputValue.replace(/[^0-9,.]/g, '');

    // Handle multiple decimal separators (keep only the last one as comma)
    const parts = inputValue.split(',');
    if (parts.length > 2) {
      inputValue = parts[0] + ',' + parts.slice(1).join('');
    }
    // If there's a dot, convert it to a comma for pt-BR consistency
    inputValue = inputValue.replace('.', ',');

    // Update the form field with the cleaned string
    field.onChange(inputValue);
  };

  const onSubmit = async (data: EditBudgetFormData) => {
    setLoading(true);
    try {
      const updateData = {
        description: data.description,
        total_value: parseCurrency(data.total_value),
        status: data.status,
        payment_method: data.payment_method || null,
        down_payment: data.down_payment ? parseCurrency(data.down_payment) : null,
        delivery_days: data.delivery_days ? parseInt(data.delivery_days) : null,
        start_date: data.start_date ? data.start_date.toISOString().split('T')[0] : null,
        valid_until: data.valid_until ? data.valid_until.toISOString().split('T')[0] : null,
        hourly_rate: data.hourly_rate ? parseCurrency(data.hourly_rate) : null,
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
        monthly_duration: data.monthly_duration ? parseInt(data.monthly_duration) : null,
        observations: data.observations,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', budget.id);

      if (error) throw error;

      toast({
        title: "Orçamento atualizado",
        description: "O orçamento foi atualizado com sucesso.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating budget:', error);
      toast({
        title: "Erro ao atualizar orçamento",
        description: error.message || "Ocorreu um erro ao atualizar o orçamento.",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Orçamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição do orçamento"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="R$ 0,00"
                          value={field.value ? formatCurrencyDisplay(parseCurrency(field.value)) : ''}
                          onChange={handleCurrencyInputChange(field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="aguardando">Aguardando</SelectItem>
                          <SelectItem value="aprovado">Aprovado</SelectItem>
                          <SelectItem value="recusado">Recusado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
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
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                {form.watch('payment_method') === 'parcelado' && (
                  <FormField
                    control={form.control}
                    name="down_payment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Entrada</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="R$ 0,00"
                            value={field.value}
                            onChange={handleCurrencyChange(field)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="delivery_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo de Entrega (dias)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
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
                      <FormLabel>Data de Início</FormLabel>
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
                                format(field.value, "dd/MM/yyyy")
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
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Válido Até</FormLabel>
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
                                format(field.value, "dd/MM/yyyy")
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
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Hours-based fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor por Hora</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                          value={field.value ? formatCurrencyDisplay(parseCurrency(field.value)) : ''}
                          onChange={handleCurrencyInputChange(field)}
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
                    <FormLabel>Horas Estimadas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração Mensal (meses)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}