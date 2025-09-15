import { useState, useEffect } from 'react';
import { useContactsStore, RecipientContact } from '@/stores/contactsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Check, 
  ChevronsUpDown, 
  Building, 
  UserCheck, 
  Briefcase, 
  User,
  Star,
  Search,
  Mail,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContactForm } from '@/components/tenant/ContactForm';

interface ContactSelectorProps {
  value?: RecipientContact | null;
  onSelect: (contact: RecipientContact | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CONTACT_TYPE_ICONS = {
  landlord: Building,
  property_manager: UserCheck,
  real_estate_agent: Briefcase,
  other: User,
};

export const ContactSelector = ({
  value,
  onSelect,
  placeholder = "Select a contact...",
  disabled = false,
  className,
}: ContactSelectorProps) => {
  const { contacts, fetchContacts, isLoading } = useContactsStore();
  const [open, setOpen] = useState(false);
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (contacts.length === 0 && !isLoading) {
      fetchContacts();
    }
  }, [contacts.length, fetchContacts, isLoading]);

  const filteredContacts = contacts.filter(contact => {
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    return (
      contact.name.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search) ||
      contact.company?.toLowerCase().includes(search)
    );
  });

  const favoriteContacts = filteredContacts.filter(c => c.isFavorite);
  const regularContacts = filteredContacts.filter(c => !c.isFavorite);

  const handleSelect = (contact: RecipientContact) => {
    onSelect(contact);
    setOpen(false);
  };

  const handleAddContactSuccess = () => {
    setShowAddContactDialog(false);
    fetchContacts(); // Refresh contacts list
  };

  const getContactInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const ContactItem = ({ contact }: { contact: RecipientContact }) => {
    const IconComponent = CONTACT_TYPE_ICONS[contact.contactType as keyof typeof CONTACT_TYPE_ICONS] || User;
    const isSelected = value?.id === contact.id;
    
    return (
      <CommandItem
        key={contact.id}
        value={contact.id.toString()}
        onSelect={() => handleSelect(contact)}
        className="flex items-center gap-3 p-3 cursor-pointer"
        data-testid={`contact-option-${contact.id}`}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getContactInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate">{contact.name}</span>
            {contact.isFavorite && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <IconComponent className="h-3 w-3" />
            <span className="truncate">{contact.email}</span>
          </div>
          
          {contact.company && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {contact.company}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="text-xs">
            {contact.contactType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          
          {contact.contactCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {contact.contactCount} contact{contact.contactCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <Check
          className={cn(
            "ml-2 h-4 w-4",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
      </CommandItem>
    );
  };

  return (
    <>
      <div className={className}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between w-full text-left font-normal"
              disabled={disabled}
              data-testid="contact-selector-trigger"
            >
              {value ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {getContactInitials(value.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{value.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {value.contactType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder="Search contacts..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                  data-testid="contact-search-input"
                />
              </div>
              
              <CommandList className="max-h-[300px]">
                <CommandEmpty className="py-6 text-center text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p>No contacts found</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        setShowAddContactDialog(true);
                      }}
                      data-testid="add-contact-from-empty"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Contact
                    </Button>
                  </div>
                </CommandEmpty>

                {favoriteContacts.length > 0 && (
                  <CommandGroup heading="Favorites" data-testid="favorite-contacts-group">
                    {favoriteContacts.map((contact) => (
                      <ContactItem key={contact.id} contact={contact} />
                    ))}
                  </CommandGroup>
                )}

                {regularContacts.length > 0 && (
                  <CommandGroup 
                    heading={favoriteContacts.length > 0 ? "All Contacts" : "Contacts"}
                    data-testid="regular-contacts-group"
                  >
                    {regularContacts.map((contact) => (
                      <ContactItem key={contact.id} contact={contact} />
                    ))}
                  </CommandGroup>
                )}

                {filteredContacts.length > 0 && (
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setShowAddContactDialog(true);
                      }}
                      className="flex items-center gap-2 p-3 cursor-pointer border-t"
                      data-testid="add-new-contact-option"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add New Contact</span>
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {value && (
          <div className="mt-2 p-2 bg-muted rounded-md">
            <div className="flex items-start gap-2 text-sm">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-xs">{value.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-xs">{value.phone}</span>
                </div>
                {value.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{value.company}</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect(null)}
                className="h-6 px-2 text-xs"
                data-testid="clear-contact-selection"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Dialog */}
      {showAddContactDialog && (
        <ContactForm
          onClose={() => setShowAddContactDialog(false)}
          onSuccess={handleAddContactSuccess}
        />
      )}
    </>
  );
};