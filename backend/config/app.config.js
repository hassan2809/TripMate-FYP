require("dotenv").config();

module.exports = {
  app: {
    env: process.env.NODE_ENV,
    port: process.env.PORT || 8000,
    jwtEncrypt: process.env.JWT_ENCRYPT,
  },
  database: {
    mongoUri: process.env.MONGO_URI,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  stripe: {
    stripe_secret: process.env.STRIPE_SECRET_KEY,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  url: {
    frontend_url: process.env.FRONTEND_URL,
  },
};
