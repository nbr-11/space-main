import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";



const f = createUploadthing();

const handleAuth = () => {
    const userId = auth().userId;
    if (!userId) throw new Error("UnAuthorized");
    return { userId: userId }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);
            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { value: file.url }
        }),
    messageFile: f(["image", "pdf"],)
        .middleware(() => handleAuth())
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);
            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { value: file.url }
        })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
