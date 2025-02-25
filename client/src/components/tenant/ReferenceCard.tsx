import { useState } from 'react';
import { TenantReference, useReferencesStore } from '@/stores/referencesStore';
import { formatDistanceToNow } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Phone,
  User,
  Building,
  Briefcase,
  Users,
  Heart
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
} from '@/components/ui/alert-dialog';
import { ReferenceForm } from './ReferenceForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReferenceCardProps {
  reference: TenantReference;
  tenantId: number;
}

export function ReferenceCard({ reference, tenantId }: ReferenceCardProps) {
  const { deleteReference, sendVerificationEmail } = useReferencesStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const handleDelete = async () => {
    await deleteReference(reference.id);
    setIsDeleteDialogOpen(false);
  };
  
  const handleSendVerification = async () => {
    setIsSendingEmail(true);
    try {
      await sendVerificationEmail(reference.id);
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  const getRelationshipIcon = () => {
    switch (reference.relationship) {
      case 'previous_landlord':
      case 'current_landlord':
        return <Building className="h-4 w-4" />;
      case 'employer':
        return <Briefcase className="h-4 w-4" />;
      case 'personal':
        return <User className="h-4 w-4" />;
      case 'professional':
        return <User className="h-4 w-4" />;
      case 'roommate':
        return <Users className="h-4 w-4" />;
      case 'family':
        return <Heart className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };
  
  const getRelationshipLabel = () => {
    switch (reference.relationship) {
      case 'previous_landlord':
        return 'Previous Landlord';
      case 'current_landlord':
        return 'Current Landlord';
      case 'employer':
        return 'Employer';
      case 'personal':
        return 'Personal Reference';
      case 'professional':
        return 'Professional Reference';
      case 'roommate':
        return 'Roommate';
      case 'family':
        return 'Family Member';
      default:
        return reference.relationship;
    }
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{reference.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                {getRelationshipIcon()}
                <span className="ml-1">{getRelationshipLabel()}</span>
              </CardDescription>
            </div>
            <div className="flex items-center">
              {reference.isVerified ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {reference.verificationDate && (
                        <p>Verified {formatDistanceToNow(new Date(reference.verificationDate))} ago</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Pending
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSendVerification} disabled={isSendingEmail || reference.isVerified}>
                    <Mail className="h-4 w-4 mr-2" />
                    {isSendingEmail ? 'Sending...' : 'Send Verification Email'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-500 mr-2" />
              <a href={`mailto:${reference.email}`} className="text-blue-600 hover:underline">
                {reference.email}
              </a>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-500 mr-2" />
              <a href={`tel:${reference.phone}`} className="text-blue-600 hover:underline">
                {reference.phone}
              </a>
            </div>
          </div>
          
          {reference.notes && (
            <div className="mt-3 text-sm text-gray-600 border-t pt-2">
              <p>{reference.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          <div className="w-full flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {reference.isVerified ? (
                <span className="text-green-600">Verified</span>
              ) : (
                <span>Verification pending</span>
              )}
            </div>
            {!reference.isVerified && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleSendVerification}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Mail className="h-3 w-3 mr-1" />
                    Send Verification
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the reference for {reference.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {isEditDialogOpen && (
        <ReferenceForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          reference={reference}
          tenantId={tenantId}
        />
      )}
    </>
  );
} 