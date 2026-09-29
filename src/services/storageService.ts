import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

export class StorageService {
  private static getS3Client(): S3Client | null {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey) {
      return null;
    }

    return new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Uploads a file (from multer) to AWS S3.
   * If S3 credentials are unavailable, returns null to allow fallback.
   */
  static async uploadToS3(file: Express.Multer.File): Promise<string | null> {
    const s3Client = this.getS3Client();
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!s3Client || !bucketName) {
      console.log('[StorageService] AWS S3 credentials or AWS_S3_BUCKET_NAME not fully configured.');
      return null;
    }

    try {
      const fileBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
      if (!fileBuffer) {
        throw new Error('File buffer is empty');
      }

      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `products/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueName,
        Body: fileBuffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);

      const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueName}`;
      console.log(`[StorageService] File uploaded to AWS S3 successfully: ${s3Url}`);
      return s3Url;
    } catch (err: any) {
      console.error('[StorageService Error] S3 upload failed:', err.message || err);
      return null;
    }
  }

  /**
   * Deletes a file from AWS S3 by Key or full S3 URL.
   */
  static async deleteFromS3(fileKeyOrUrl: string): Promise<boolean> {
    const s3Client = this.getS3Client();
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!s3Client || !bucketName || !fileKeyOrUrl) {
      return false;
    }

    try {
      let key = fileKeyOrUrl;
      if (fileKeyOrUrl.startsWith('http')) {
        const urlObj = new URL(fileKeyOrUrl);
        key = urlObj.pathname.replace(/^\//, '');
      }

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await s3Client.send(command);
      console.log(`[StorageService] Deleted object from S3: ${key}`);
      return true;
    } catch (err: any) {
      console.error('[StorageService Error] Failed to delete from S3:', err.message || err);
      return false;
    }
  }
}
