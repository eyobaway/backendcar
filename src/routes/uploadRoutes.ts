import { Router, Request, Response } from 'express';
import { upload, s3 } from '../middlewares/uploadMiddleware';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const router = Router();

const processAndUpload = async (file: Express.Multer.File): Promise<string> => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const key = `uploads/optimized-${uniqueSuffix}.webp`;
    
    // Process with sharp: resize to 1920px width (keep aspect ratio), convert to webp with 80% quality
    const optimizedBuffer = await sharp(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME || '',
        Key: key,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
    };

    await s3.send(new PutObjectCommand(params));
    
    // Construct the public URL
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        const imageUrl = await processAndUpload(req.file);
        res.json({ imageUrl });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: 'Error processing/uploading image' });
    }
});

router.post('/multiple', upload.array('images', 10), async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

    try {
        const uploadPromises = files.map(file => processAndUpload(file));
        const imageUrls = await Promise.all(uploadPromises);
        res.json({ imageUrls });
    } catch (error) {
        console.error("Batch upload error:", error);
        res.status(500).json({ message: 'Error processing/uploading images' });
    }
});

export default router;
