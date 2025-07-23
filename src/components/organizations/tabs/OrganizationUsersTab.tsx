
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Crown, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrganizationUsersTabProps {
  organization: any;
}

export const OrganizationUsersTab = ({ organization }: OrganizationUsersTabProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [owner, setOwner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      
      // Buscar owner da organização
      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', organization.owner_id)
        .single();

      if (ownerError) throw ownerError;
      setOwner(ownerData);

      // Buscar membros da organização
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          invited_at,
          users (
            id,
            name,
            email
          )
        `)
        .eq('organization_id', organization.id);

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (error: any) {
      console.error('Erro ao carregar membros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [organization.id]);

  const handleInviteUser = () => {
    if (!inviteEmail) return;
    
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O convite de usuários será implementado em breve.",
    });
    
    setInviteEmail("");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Proprietário';
      case 'admin':
        return 'Administrador';
      case 'colaborador':
        return 'Colaborador';
      default:
        return role;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'colaborador':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Usuários da Organização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Owner */}
            {owner && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Proprietário</h3>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border-2 border-primary/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{owner.name}</p>
                    <p className="text-sm text-muted-foreground">{owner.email}</p>
                  </div>
                  <Badge variant="default">
                    Proprietário
                  </Badge>
                </div>
              </div>
            )}

            {/* Members */}
            {members.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Membros ({members.length})</h3>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{member.users.name}</p>
                        <p className="text-sm text-muted-foreground">{member.users.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getRoleVariant(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Desde {new Date(member.invited_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Convidar Usuário</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="invite-email">Email do usuário</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleInviteUser} disabled={!inviteEmail}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <Mail className="h-4 w-4 inline mr-1" />
                Funcionalidade em desenvolvimento - Em breve será possível convidar usuários por email.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
