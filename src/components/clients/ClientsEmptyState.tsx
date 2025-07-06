import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const ClientsEmptyState = () => {
  return (
    <Card className="shadow-card">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
        <p className="text-muted-foreground">
          Ajuste os filtros ou adicione um novo cliente.
        </p>
      </CardContent>
    </Card>
  );
};