const cloudinary = require('cloudinary').v2;
console.log('[CloudinaryConfig] Attempting to configure Cloudinary.');
console.log('[CloudinaryConfig] CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);


cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//test if the config workds
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('Cloudinary connection error:', error);
  } else {
    console.log('Cloudinary connection successful:', result.status);
  }
});
module.exports = cloudinary;