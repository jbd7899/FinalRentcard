import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Notification {
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

export interface NotificationOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  type?: string;
}

export function useNotifications(options: NotificationOptions = {}) {
  const queryParams = new URLSearchParams();
  
  if (options.limit) queryParams.set('limit', options.limit.toString());
  if (options.offset) queryParams.set('offset', options.offset.toString());
  if (options.unreadOnly) queryParams.set('unreadOnly', 'true');
  if (options.type) queryParams.set('type', options.type);

  const queryString = queryParams.toString();
  const url = `/api/tenant/notifications${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['/api/tenant/notifications', options],
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

export function useNotificationCount(unreadOnly = true) {
  const queryParams = unreadOnly ? '?unreadOnly=true' : '';
  
  return useQuery({
    queryKey: ['/api/tenant/notifications/count', unreadOnly],
    select: (data: any) => data?.count || 0,
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('POST', `/api/tenant/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications/count'] });
    },
  });

  const markAsClicked = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('POST', `/api/tenant/notifications/${notificationId}/click`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/tenant/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notifications/count'] });
    },
  });

  return {
    markAsRead,
    markAsClicked,
    markAllAsRead,
  };
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/tenant/notification-preferences'],
  });

  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: any) => {
      return apiRequest('PUT', '/api/tenant/notification-preferences', newPreferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/notification-preferences'] });
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences,
  };
}

export function useNotificationStats(timeframe = '7d') {
  return useQuery({
    queryKey: ['/api/tenant/notification-stats', timeframe],
  });
}