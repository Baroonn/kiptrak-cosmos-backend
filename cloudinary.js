const dotenv = require("dotenv");
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.C_CLOUD_NAME,
  api_key: process.env.C_API_KEY,
  api_secret: process.env.C_API_SECRET
});

module.exports = cloudinary;