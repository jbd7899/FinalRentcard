import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Eye, Heart, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high';
  category: string;
  metadata?: any;
  createdAt: string;
}

interface NotificationCenterProps {
  userId: number;
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/tenant/notifications'],
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
  });

  // Fetch notification count
  const { data: countData } = useQuery<{ count: number }, Error, number>({
    queryKey: ['/api/tenant/notifications/count'],
    select: (data) => data?.count || 0,
    refetchInterval: 30000,
  });

  const unreadCount = countData || 0;

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('POST', `/api/tenant/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications/count'] });
    },
  });

  // Mark notification as clicked mutation
  const markAsClickedMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('POST', `/api/tenant/notifications/${notificationId}/click`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/tenant/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications/count'] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.actionUrl) {
      markAsClickedMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rentcard_view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'interest_submission':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'landlord_response':
        return <Bell className="w-4 h-4 text-green-500" />;
      case 'personal_connection':
        return <Heart className="w-4 h-4 text-purple-500" />;
      case 'individual_landlord_message':
        return <Bell className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'normal':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-gray-300';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              data-testid="badge-notification-count"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-hidden">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="font-semibold text-sm" data-testid="text-notifications-title">
            Landlord Network Updates
          </DropdownMenuLabel>
          <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  data-testid="button-mark-all-read"
                  className="text-xs h-6"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
                data-testid="button-close-notifications"
              >
                <X className="w-3 h-3" />
              </Button>
          </div>
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground" data-testid="text-loading">
              Loading your individual landlord network updates...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground" data-testid="text-no-notifications">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No notifications yet
              <p className="text-xs mt-1">We'll notify you when individual landlords view your RentCard!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-3 border-l-2 cursor-pointer hover:bg-muted/50 transition-colors
                    ${getPriorityColor(notification.priority)}
                    ${!notification.isRead ? 'bg-blue-50/50' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate" data-testid={`text-title-${notification.id}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2" data-testid={`text-message-${notification.id}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground" data-testid={`text-time-${notification.id}`}>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        
                        {notification.actionUrl && (
                          <Link href={notification.actionUrl}>
                            <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                              View details
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {notifications.length > 10 && (
                <div className="p-3 text-center border-t">
                  <Link href="/tenant/dashboard?tab=notifications">
                    <Button variant="ghost" size="sm" className="text-xs" data-testid="button-view-all">
                      View all notifications
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}