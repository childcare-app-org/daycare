import type { NextApiRequest, NextApiResponse } from "next";
import { createUploadthing } from "uploadthing/next-legacy";
import { UploadThingError } from "uploadthing/server";
import { auth } from "~/server/auth";

import type { FileRouter } from "uploadthing/next-legacy";

const f = createUploadthing();

const getAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await auth(req, res);
  return session;
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Image uploader for profiles (children, nurses, parents)
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      const session = await getAuth(req, res);

      // If you throw, the user will not be able to upload
      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id, userRole: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
