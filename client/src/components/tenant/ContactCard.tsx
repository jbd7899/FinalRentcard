import { useState } from 'react';
import { useContactsStore, RecipientContact } from '@/stores/contactsStore';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  UserCheck, 
  Briefcase, 
  User,
  Heart,
  Mail,
  Phone,
  Edit,
  Trash2,
  ExternalLink,
  MessageCircle,
  MapPin,
  Calendar,
  MoreVertical
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ContactCardProps {
  contact: RecipientContact;
  onEdit: (contact: RecipientContact) => void;
}

const CONTACT_TYPES = {
  landlord: { label: 'Landlord', icon: Building, color: 'bg-blue-500' },
  property_manager: { label: 'Property Manager', icon: UserCheck, color: 'bg-green-500' },
  real_estate_agent: { label: 'Real Estate Agent', icon: Briefcase, color: 'bg-purple-500' },
  other: { label: 'Other', icon: User, color: 'bg-gray-500' },
};

export const ContactCard = ({ contact, onEdit }: ContactCardProps) => {
  const { deleteContact, updateContact } = useContactsStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  const contactType = CONTACT_TYPES[contact.contactType as keyof typeof CONTACT_TYPES] || CONTACT_TYPES.other;
  const IconComponent = contactType.icon;

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteContact(contact.id);
    setIsDeleting(false);
  };

  const handleToggleFavorite = async () => {
    setIsUpdatingFavorite(true);
    await updateContact(contact.id, { isFavorite: !contact.isFavorite });
    setIsUpdatingFavorite(false);
  };

  const handleEmailClick = () => {
    window.open(`mailto:${contact.email}`, '_blank');
  };

  const handlePhoneClick = () => {
    window.open(`tel:${contact.phone}`, '_blank');
  };

  const handleShareRentCard = () => {
    // This will be implemented when integrating with sharing functionality
    console.log('Share RentCard with:', contact.name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        contact.isFavorite && "ring-2 ring-yellow-200 bg-yellow-50/50"
      )}
      data-testid={`card-contact-${contact.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-full text-white", contactType.color)}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate" data-testid={`text-contact-name-${contact.id}`}>
                {contact.name}
                {contact.isFavorite && (
                  <Heart className="inline-block h-4 w-4 ml-2 text-yellow-500 fill-current" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {contactType.label}
                </Badge>
                {contact.contactCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {contact.contactCount} contact{contact.contactCount !== 1 ? 's' : ''}
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
                data-testid={`button-contact-menu-${contact.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onEdit(contact)}
                data-testid={`button-edit-contact-${contact.id}`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Contact
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleToggleFavorite}
                disabled={isUpdatingFavorite}
                data-testid={`button-toggle-favorite-${contact.id}`}
              >
                <Heart className={cn("h-4 w-4 mr-2", contact.isFavorite && "fill-current text-yellow-500")} />
                {contact.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleShareRentCard}
                data-testid={`button-share-rentcard-${contact.id}`}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Share RentCard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                    data-testid={`button-delete-contact-${contact.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Contact
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {contact.name}? This action cannot be undone.
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={handleEmailClick}
                className="text-blue-600 hover:text-blue-800 hover:underline truncate flex-1 text-left"
                data-testid={`button-email-${contact.id}`}
              >
                {contact.email}
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={handlePhoneClick}
                className="text-blue-600 hover:text-blue-800 hover:underline"
                data-testid={`button-phone-${contact.id}`}
              >
                {contact.phone}
              </button>
            </div>

            {contact.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="truncate" data-testid={`text-company-${contact.id}`}>
                  {contact.company}
                </span>
              </div>
            )}

            {contact.propertyAddress && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground break-words" data-testid={`text-property-address-${contact.id}`}>
                  {contact.propertyAddress}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground break-words" data-testid={`text-notes-${contact.id}`}>
                {contact.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Added {formatDate(contact.createdAt)}
            </div>
            {contact.lastContactedAt && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                Last contacted {formatDate(contact.lastContactedAt)}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEmailClick}
              className="flex-1"
              data-testid={`button-quick-email-${contact.id}`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShareRentCard}
              className="flex-1"
              data-testid={`button-quick-share-${contact.id}`}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};