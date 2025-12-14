import { env } from "~/env";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
// If credentials are not provided, AWS SDK will use default credential chain
// (IAM roles, environment variables, ~/.aws/credentials, etc.)
export const s3Client = new S3Client({
  region: env.AWS_REGION,
  ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

/**
 * Generate a presigned URL for uploading an image to S3
 * @param fileName - The file name (will be prefixed with timestamp and UUID)
 * @param contentType - The MIME type of the file (e.g., 'image/jpeg')
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL and the S3 key
 */
export async function generatePresignedUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600,
): Promise<{ url: string; key: string }> {
  if (!env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured");
  }

  // Check if credentials are available (either explicit or via default chain)
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    console.warn(
      "AWS credentials not found in environment variables. Using default credential chain.",
    );
  }

  // Generate unique file key with timestamp and random UUID
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const extension = fileName.split(".").pop() || "jpg";
  const key = `images/${timestamp}-${uuid}.${extension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      // Optional: Add metadata or ACL settings here
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return { url, key };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating presigned URL:", {
      error: errorMessage,
      bucket: env.AWS_S3_BUCKET_NAME,
      region: env.AWS_REGION,
      hasCredentials: !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY),
    });
    throw new Error(`Failed to generate presigned URL: ${errorMessage}`);
  }
}

/**
 * Get the public CDN URL for an S3 key
 * @param key - The S3 object key
 * @returns The full CDN URL
 */
export function getCdnUrl(key: string): string {
  // If key is already a full URL (from old UploadThing URLs or existing S3 URLs), return as-is
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }

  // Remove leading slash if present
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;

  // If CloudFront URL is configured, use it; otherwise fall back to S3 URL
  if (env.AWS_CLOUDFRONT_URL) {
    return `${env.AWS_CLOUDFRONT_URL}/${cleanKey}`;
  }

  // Fallback to S3 URL if CloudFront is not configured
  // Format: https://{bucket}.s3.{region}.amazonaws.com/{key}
  return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${cleanKey}`;
}
