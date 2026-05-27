import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        // đường dẫn lưu avatar
        const uploadPath = path.join(
            process.cwd(),
            'src/public/images/avatar'
        );

        // tự tạo folder nếu chưa có
        fs.mkdirSync(uploadPath, {
            recursive: true
        });

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {

        // tạo tên file unique tránh trùng
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );
    }
});

const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                'Chỉ cho phép upload file ảnh (jpg, png, webp)'
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});

export default upload;