import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Plus,
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectDocumentsTabProps {
  project: any;
  onUpdate: () => void;
}

interface Document {
  id: string;
  name: string;
  type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export const ProjectDocumentsTab = ({ project, onUpdate }: ProjectDocumentsTabProps) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "contrato",
    file: null as File | null,
  });

  useEffect(() => {
    fetchDocuments();
  }, [project.id]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const documents: Document[] = data.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        file_path: doc.file_path,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        uploaded_at: doc.created_at,
      }));
      
      setDocuments(documents);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!newDocument.file || !newDocument.name) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo e forneça um nome",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Get current user
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Usuário não autenticado');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', currentUser.user.id)
        .single();

      if (!userData) throw new Error('Dados do usuário não encontrados');

      const fileExt = newDocument.file.name.split('.').pop();
      const fileName = `projects/${project.id}/documents/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('upevolution')
        .upload(fileName, newDocument.file);

      if (uploadError) throw uploadError;

      // Create document record in database
      const { data: newDoc, error: insertError } = await supabase
        .from('project_documents')
        .insert({
          project_id: project.id,
          organization_id: project.organization_id,
          name: newDocument.name,
          type: newDocument.type,
          file_path: fileName,
          file_size: newDocument.file.size,
          mime_type: newDocument.file.type,
          uploaded_by: userData.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const documentForState: Document = {
        id: newDoc.id,
        name: newDoc.name,
        type: newDoc.type,
        file_path: newDoc.file_path,
        file_size: newDoc.file_size,
        mime_type: newDoc.mime_type,
        uploaded_at: newDoc.created_at,
      };

      setDocuments(prev => [documentForState, ...prev]);
      
      toast({
        title: "Documento enviado",
        description: "O arquivo foi enviado com sucesso",
      });

      setIsDialogOpen(false);
      setNewDocument({
        name: "",
        type: "contrato",
        file: null,
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('upevolution')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer o download",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('upevolution')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Remove from database
      const { error: dbError } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== documentId));
      
      toast({
        title: "Documento excluído",
        description: "O arquivo foi removido com sucesso",
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o arquivo",
        variant: "destructive",
      });
    }
  };

  const handleView = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('upevolution')
        .createSignedUrl(document.file_path, 60 * 60); // 1 hour expiration

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível visualizar o arquivo",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contrato':
        return 'default';
      case 'orcamento':
        return 'secondary';
      case 'print':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'contrato': 'Contrato',
      'orcamento': 'Orçamento',
      'print': 'Print/Screenshot',
      'outros': 'Outros',
    };
    return labels[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documentos do Projeto</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Novo Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="docName">Nome do Documento</Label>
                  <Input
                    id="docName"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Contrato de Desenvolvimento"
                  />
                </div>
                
                <div>
                  <Label>Tipo do Documento</Label>
                  <Select value={newDocument.type} onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrato">Contrato</SelectItem>
                      <SelectItem value="orcamento">Orçamento</SelectItem>
                      <SelectItem value="print">Print/Screenshot</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="docFile">Arquivo</Label>
                  <Input
                    id="docFile"
                    type="file"
                    onChange={(e) => setNewDocument(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, GIF (máx. 10MB)
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleFileUpload} disabled={uploading || !newDocument.file || !newDocument.name}>
                    {uploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Documento
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      {/* Lista de Documentos */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="shadow-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    {getFileIcon(document.mime_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm truncate">{document.name}</h4>
                      <Badge variant={getTypeColor(document.type)} className="text-xs shrink-0">
                        {getTypeLabel(document.type)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{formatFileSize(document.file_size)}</p>
                      <p>
                        {format(new Date(document.uploaded_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-4 pt-3 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 flex-1"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    <span className="text-xs">Download</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => handleView(document)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(document.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Faça upload dos documentos relacionados ao projeto para organizá-los em um só lugar.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Documento
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};