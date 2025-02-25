import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Create storage engine for tenant documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'myrentcard/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
  } as any, // Type assertion to handle missing properties in type definition
});

// Create storage engine for property images with optimization
const propertyImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'myrentcard/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, crop: 'limit' }, // Resize to max width of 1200px
      { quality: 'auto:good' }, // Automatic quality optimization
      { fetch_format: 'auto' } // Automatic format selection based on browser
    ],
  } as any,
});

// Create multer upload instance for documents
export const documentUpload = multer({ 
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Create multer upload instance for property images
export const propertyImageUpload = multer({
  storage: propertyImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Function to delete a file from Cloudinary
export const deleteCloudinaryFile = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return false;
  }
};

// Helper function to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string => {
  const parts = url.split('/');
  const fileNameWithExtension = parts[parts.length - 1];
  const fileName = fileNameWithExtension.split('.')[0];
  const folder = parts[parts.length - 2];
  return `${folder}/${fileName}`;
};

export default cloudinary; 