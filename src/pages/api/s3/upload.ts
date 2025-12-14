import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { auth } from "~/server/auth";
import { generatePresignedUrl, getCdnUrl } from "~/server/s3";

const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().regex(/^image\//), // Only allow images
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Authenticate user
    const session = await auth(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate request body
    const body = uploadRequestSchema.parse(req.body);

    // Generate presigned URL
    const { url, key } = await generatePresignedUrl(
      body.fileName,
      body.contentType,
    );

    // Return presigned URL and the final CDN URL
    return res.status(200).json({
      uploadUrl: url,
      fileUrl: getCdnUrl(key), // This is the URL that should be stored in the database
      key,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request", details: error.errors });
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Internal server error",
      message: errorMessage,
    });
  }
}
