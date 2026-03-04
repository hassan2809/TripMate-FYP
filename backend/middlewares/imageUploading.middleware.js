const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const appConfig = require("../config/app.config");

cloudinary.config({
  cloud_name: appConfig.cloudinary.cloud_name,
  api_key: appConfig.cloudinary.api_key,
  api_secret: appConfig.cloudinary.api_secret,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: "tripmate",
      format: file.mimetype.split("/")[1],
      public_id: `image-${Date.now()}-${file.originalname}`,
      resource_type: "image",
      access_mode: "public",
    };
  },
});

const uploadImage = multer({ storage: imageStorage });

module.exports = uploadImage;
