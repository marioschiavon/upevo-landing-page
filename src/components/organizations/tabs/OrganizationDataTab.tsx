
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrganizationDataTabProps {
  organization: any;
  onUpdate: () => void;
}

export const OrganizationDataTab = ({ organization, onUpdate }: OrganizationDataTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name || "",
    category: organization.category || "",
    description: organization.description || ""
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          category: formData.category,
          description: formData.description
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Organização atualizada com sucesso!",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao atualizar organização:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a organização.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: organization.name || "",
      category: organization.category || "",
      description: organization.description || ""
    });
    setIsEditing(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Dados da Organização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome da Organização</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da organização"
              />
            ) : (
              <p className="text-foreground font-medium py-2">{organization.name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="category">Área de Atuação</Label>
            {isEditing ? (
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Consultoria">Consultoria</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground font-medium py-2">{organization.category || "Não definido"}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          {isEditing ? (
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva sua organização..."
              rows={4}
            />
          ) : (
            <p className="text-foreground py-2">{organization.description || "Sem descrição disponível"}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
