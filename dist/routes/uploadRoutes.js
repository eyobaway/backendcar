"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const client_s3_1 = require("@aws-sdk/client-s3");
const sharp_1 = __importDefault(require("sharp"));
const router = (0, express_1.Router)();
const processAndUpload = async (file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const key = `uploads/optimized-${uniqueSuffix}.webp`;
    // Process with sharp: resize to 1920px width (keep aspect ratio), convert to webp with 80% quality
    const optimizedBuffer = await (0, sharp_1.default)(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME || '',
        Key: key,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
    };
    await uploadMiddleware_1.s3.send(new client_s3_1.PutObjectCommand(params));
    // Construct the public URL
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
router.post('/upload', uploadMiddleware_1.upload.single('image'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ message: 'No file uploaded' });
    try {
        const imageUrl = await processAndUpload(req.file);
        res.json({ imageUrl });
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: 'Error processing/uploading image' });
    }
});
router.post('/multiple', uploadMiddleware_1.upload.array('images', 10), async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0)
        return res.status(400).json({ message: 'No files uploaded' });
    try {
        const uploadPromises = files.map(file => processAndUpload(file));
        const imageUrls = await Promise.all(uploadPromises);
        res.json({ imageUrls });
    }
    catch (error) {
        console.error("Batch upload error:", error);
        res.status(500).json({ message: 'Error processing/uploading images' });
    }
});
exports.default = router;
