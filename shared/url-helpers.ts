/**
 * URL helper functions for shortlinks and sharing
 * Provides consistent URL generation across frontend and backend
 */

export type ChannelType = 'copy' | 'mobile_share' | 'email' | 'sms' | 'qr' | 'pdf' | 'direct' | 'unknown';

export type ResourceType = 'rentcard' | 'property' | 'screening_page' | 'qr_code' | 'general';

export interface ShortlinkRequest {
  targetUrl: string;
  resourceType: ResourceType;
  resourceId?: string;
  title?: string;
  description?: string;
  channelAttributed?: ChannelType;
  shareTokenId?: number;
  propertyId?: number;
  expiresAt?: Date;
}

export interface ShortlinkResponse {
  id: number;
  slug: string;
  targetUrl: string;
  resourceType: ResourceType;
  channelAttributed?: ChannelType;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
}

/**
 * Generate a shortlink URL from a slug
 */
export function generateShortlinkUrl(slug: string, channel?: ChannelType): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  let url = `${baseUrl}/r/${slug}`;
  
  // Add channel tracking parameter if provided
  if (channel && channel !== 'direct') {
    url += `?ch=${channel}`;
  }
  
  return url;
}

/**
 * Generate target URL for different resource types
 */
export function generateTargetUrl(resourceType: ResourceType, resourceId: string, shareToken?: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  switch (resourceType) {
    case 'rentcard':
      return shareToken 
        ? `${baseUrl}/rentcard/shared/${shareToken}`
        : `${baseUrl}/tenant/rentcard`;
        
    case 'property':
      return `${baseUrl}/property/${resourceId}`;
      
    case 'screening_page':
      return `${baseUrl}/screening/${resourceId}`;
      
    case 'qr_code':
      // QR codes typically link to screening pages or properties
      return `${baseUrl}/screening/${resourceId}`;
      
    default:
      return `${baseUrl}`;
  }
}

/**
 * Create a shortlink request for a rentcard share token
 */
export function createRentcardShortlinkRequest(
  shareToken: string,
  channel: ChannelType = 'direct',
  options: {
    shareTokenId?: number;
    tenantName?: string;
    expiresAt?: Date;
  } = {}
): ShortlinkRequest {
  const targetUrl = generateTargetUrl('rentcard', '', shareToken);
  
  return {
    targetUrl,
    resourceType: 'rentcard',
    resourceId: shareToken,
    title: options.tenantName ? `${options.tenantName}'s RentCard` : 'RentCard Profile',
    description: 'Rental application profile with employment, credit, and reference information',
    channelAttributed: channel,
    shareTokenId: options.shareTokenId,
    expiresAt: options.expiresAt,
  };
}

/**
 * Create a shortlink request for a property listing
 */
export function createPropertyShortlinkRequest(
  propertyId: string,
  channel: ChannelType = 'direct',
  options: {
    propertyAddress?: string;
    landlordId?: number;
    expiresAt?: Date;
  } = {}
): ShortlinkRequest {
  const targetUrl = generateTargetUrl('property', propertyId);
  
  return {
    targetUrl,
    resourceType: 'property',
    resourceId: propertyId,
    title: options.propertyAddress ? `Property: ${options.propertyAddress}` : 'Property Listing',
    description: 'Rental property listing with photos, amenities, and application information',
    channelAttributed: channel,
    propertyId: parseInt(propertyId),
    expiresAt: options.expiresAt,
  };
}

/**
 * Create a shortlink request for a screening page
 */
export function createScreeningPageShortlinkRequest(
  screeningSlug: string,
  channel: ChannelType = 'direct',
  options: {
    businessName?: string;
    landlordId?: number;
    expiresAt?: Date;
  } = {}
): ShortlinkRequest {
  const targetUrl = generateTargetUrl('screening_page', screeningSlug);
  
  return {
    targetUrl,
    resourceType: 'screening_page',
    resourceId: screeningSlug,
    title: options.businessName ? `${options.businessName} - Rental Application` : 'Rental Application',
    description: 'Rental application and tenant screening information',
    channelAttributed: channel,
    expiresAt: options.expiresAt,
  };
}

/**
 * Create a shortlink request for QR code usage
 */
export function createQRCodeShortlinkRequest(
  targetResourceType: 'property' | 'screening_page',
  resourceId: string,
  channel: ChannelType = 'qr',
  options: {
    title?: string;
    description?: string;
    propertyId?: number;
    expiresAt?: Date;
  } = {}
): ShortlinkRequest {
  const targetUrl = generateTargetUrl(targetResourceType, resourceId);
  
  return {
    targetUrl,
    resourceType: 'qr_code',
    resourceId: `${targetResourceType}:${resourceId}`,
    title: options.title || 'QR Code Link',
    description: options.description || 'Access via QR code scan',
    channelAttributed: channel,
    propertyId: options.propertyId,
    expiresAt: options.expiresAt,
  };
}

/**
 * Determine appropriate channel based on sharing context
 */
export function determineChannel(context: {
  platform?: 'mobile' | 'desktop';
  method?: 'native_share' | 'clipboard' | 'email' | 'sms' | 'qr_scan' | 'pdf_download';
  userAgent?: string;
}): ChannelType {
  if (context.method) {
    switch (context.method) {
      case 'native_share':
        return 'mobile_share';
      case 'clipboard':
        return 'copy';
      case 'email':
        return 'email';
      case 'sms':
        return 'sms';
      case 'qr_scan':
        return 'qr';
      case 'pdf_download':
        return 'pdf';
      default:
        return 'direct';
    }
  }

  // Fallback logic based on platform
  if (context.platform === 'mobile') {
    return 'mobile_share';
  }

  return 'direct';
}

/**
 * Validate shortlink slug format
 */
export function isValidSlug(slug: string): boolean {
  // Must be 3-12 characters, alphanumeric with hyphens and underscores
  return /^[a-zA-Z0-9-_]{3,12}$/.test(slug);
}

/**
 * Extract channel from URL parameters
 */
export function extractChannelFromUrl(url: string): ChannelType {
  try {
    const urlObj = new URL(url);
    const channel = urlObj.searchParams.get('ch');
    
    if (channel && ['copy', 'mobile_share', 'email', 'sms', 'qr', 'pdf', 'direct'].includes(channel)) {
      return channel as ChannelType;
    }
  } catch (error) {
    // Invalid URL, continue with default
  }
  
  return 'direct';
}

/**
 * Create analytics-friendly URL with proper channel attribution
 */
export function createTrackableUrl(baseUrl: string, channel: ChannelType, additionalParams: Record<string, string> = {}): string {
  try {
    const url = new URL(baseUrl);
    
    // Add channel parameter
    if (channel !== 'direct') {
      url.searchParams.set('ch', channel);
    }
    
    // Add additional tracking parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.toString();
  } catch (error) {
    console.error('Failed to create trackable URL:', error);
    return baseUrl;
  }
}

/**
 * Get user-friendly channel name for display
 */
export function getChannelDisplayName(channel: ChannelType): string {
  const channelNames: Record<ChannelType, string> = {
    copy: 'Copy Link',
    mobile_share: 'Mobile Share',
    email: 'Email',
    sms: 'Text Message',
    qr: 'QR Code',
    pdf: 'PDF/Print',
    direct: 'Direct Link',
    unknown: 'Unknown'
  };
  
  return channelNames[channel] || 'Unknown';
}