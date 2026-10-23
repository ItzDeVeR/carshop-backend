const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createStorage = (folderName) => {
  const uploadPath = path.join("uploads", folderName);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Можно загружать только изображения!"), false);
      }
    },
  });
};

module.exports = {
  uploadCars: createStorage("cars"),
  uploadAvatars: createStorage("avatars"),
  uploadReviews: createStorage("reviews"),
};
