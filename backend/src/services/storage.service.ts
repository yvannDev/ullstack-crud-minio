import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { s3 } from '../config/s3';

const extensionByType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif'
};

export async function uploadProductImage(file: Express.Multer.File): Promise<string> {
  const extension = extensionByType[file.mimetype];
  if (!extension) throw new Error('Unsupported image type');
  const key = `products/${randomUUID()}.${extension}`;

  await s3.send(new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  }));

  return key;
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}

export async function getImageUrl(key: string | null): Promise<string | null> {
  if (!key) return null;
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    { expiresIn: env.PRESIGNED_URL_TTL_SECONDS }
  );
}
