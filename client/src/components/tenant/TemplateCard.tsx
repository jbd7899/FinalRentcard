import { useState } from 'react';
import { useMessageTemplatesStore, TenantMessageTemplate } from '@/stores/messageTemplatesStore';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  MessageCircle, 
  Mail,
  Star,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  Sparkles,
  Calendar,
  TrendingUp
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TemplateCardProps {
  template: TenantMessageTemplate;
  onEdit: (template: TenantMessageTemplate) => void;
}

const TEMPLATE_CATEGORIES = {
  initial_inquiry: { label: 'Initial Inquiry', icon: MessageCircle, color: 'bg-blue-500' },
  follow_up: { label: 'Follow-up', icon: Mail, color: 'bg-green-500' },
  application: { label: 'Prequalification', icon: FileText, color: 'bg-purple-500' },
  custom: { label: 'Custom', icon: Star, color: 'bg-orange-500' },
};

export const TemplateCard = ({ template, onEdit }: TemplateCardProps) => {
  const { deleteTemplate, duplicateTemplate } = useMessageTemplatesStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicateName, setDuplicateName] = useState(`${template.templateName} (Copy)`);
  const [showPreview, setShowPreview] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const category = TEMPLATE_CATEGORIES[template.category as keyof typeof TEMPLATE_CATEGORIES] || TEMPLATE_CATEGORIES.custom;
  const IconComponent = category.icon;

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteTemplate(template.id);
    setIsDeleting(false);
  };

  const handleDuplicate = async () => {
    if (!duplicateName.trim()) return;
    
    setIsDuplicating(true);
    const result = await duplicateTemplate(template.id, duplicateName.trim());
    if (result) {
      setShowDuplicateDialog(false);
      setDuplicateName(`${template.templateName} (Copy)`);
    }
    setIsDuplicating(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const previewBody = template.body.length > 150 
    ? template.body.substring(0, 150) + '...' 
    : template.body;

  const highlightVariables = (text: string) => {
    return text.replace(/\{[^}]+\}/g, (match) => 
      `<span class="inline-block bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-mono">${match}</span>`
    );
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        template.isDefault && "ring-2 ring-blue-200 bg-blue-50/50"
      )}
      data-testid={`card-template-${template.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn("p-2 rounded-full text-white", category.color)}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate flex items-center gap-2" data-testid={`text-template-name-${template.id}`}>
                {template.templateName}
                {template.isDefault && (
                  <Sparkles className="h-4 w-4 text-blue-500" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {category.label}
                </Badge>
                {template.usageCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                data-testid={`button-template-menu-${template.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setShowPreview(true)}
                data-testid={`button-preview-template-${template.id}`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Template
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onEdit(template)}
                data-testid={`button-edit-template-${template.id}`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDuplicateDialog(true)}
                data-testid={`button-duplicate-template-${template.id}`}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Template
              </DropdownMenuItem>
              {!template.isDefault && (
                <>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                        data-testid={`button-delete-template-${template.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Template
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{template.templateName}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Subject */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Subject:</p>
            <p className="text-sm font-medium truncate" data-testid={`text-template-subject-${template.id}`}>
              {template.subject}
            </p>
          </div>

          {/* Body Preview */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Message:</p>
            <div 
              className="text-sm text-muted-foreground break-words leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightVariables(previewBody) }}
              data-testid={`text-template-body-${template.id}`}
            />
            {template.body.length > 150 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="p-0 h-auto text-xs"
              >
                Read more...
              </Button>
            )}
          </div>

          {/* Variables */}
          {template.variables && template.variables.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Variables:</p>
              <div className="flex flex-wrap gap-1">
                {template.variables.slice(0, 3).map((variable, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-mono">
                    {variable}
                  </Badge>
                ))}
                {template.variables.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.variables.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {formatDate(template.createdAt)}
            </div>
            {template.usageCount > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {template.usageCount} uses
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreview(true)}
              className="flex-1"
              data-testid={`button-quick-preview-${template.id}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(template)}
              className="flex-1"
              data-testid={`button-quick-edit-${template.id}`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              {template.templateName}
            </DialogTitle>
            <DialogDescription>Template Preview</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Subject:</Label>
              <div 
                className="mt-1 p-3 bg-muted rounded-md"
                dangerouslySetInnerHTML={{ __html: highlightVariables(template.subject) }}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Message:</Label>
              <div 
                className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightVariables(template.body) }}
              />
            </div>
            {template.variables && template.variables.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Variables:</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {template.variables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="font-mono">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Template</DialogTitle>
            <DialogDescription>
              Create a copy of "{template.templateName}" with a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="duplicate-name">New Template Name</Label>
              <Input
                id="duplicate-name"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDuplicateDialog(false)}
                disabled={isDuplicating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDuplicate}
                disabled={isDuplicating || !duplicateName.trim()}
              >
                {isDuplicating ? 'Creating...' : 'Duplicate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};