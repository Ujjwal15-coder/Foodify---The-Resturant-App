/**
 * Cloudinary Configuration — Mock-ready, uses local uploads when not configured
 */
const path = require('path');
const fs = require('fs');

let cloudinary = null;

// Initialize cloudinary if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  try {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('☁️  Cloudinary configured');
  } catch (err) {
    console.log('☁️  Cloudinary package not installed, using local uploads');
  }
}

// Upload image — uses Cloudinary if available, otherwise returns local path
const uploadImage = async (filePath, folder = 'foodify') => {
  if (cloudinary) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
      });
      // Delete local file after upload
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload failed:', error.message);
    }
  }

  // Fallback: use local file path
  const relativePath = '/uploads/' + path.basename(filePath);
  return {
    url: relativePath,
    publicId: path.basename(filePath, path.extname(filePath)),
  };
};

// Delete image
const deleteImage = async (publicId) => {
  if (cloudinary && publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete failed:', error.message);
    }
  }
};

module.exports = { uploadImage, deleteImage };
