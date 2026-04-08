import multer from "multer";
import path from "path";

export function createImageUpload(prefix = "post") {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname);
      cb(null, `${prefix}-${uniqueSuffix}${extension}`);
    },
  });

  const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."), false);
    }
  };

  return multer({
    storage,
    fileFilter,
  });
}

const upload = createImageUpload("post");

export default upload;
