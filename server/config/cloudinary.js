const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dolchpri6",       // thay bằng cloud_name của bạn
  api_key: "379837753954413",            // thay bằng api_key
  api_secret: "XrdNv22RXY0y7uuBVsTrp-bZE3I",      // thay bằng api_secret
});

module.exports = cloudinary;
