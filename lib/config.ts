const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
  appName: 'MicroCourses',
  version: '1.0.0',
  // Non-secret public Cloudinary cloud name (optional)
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
};

export default config;
