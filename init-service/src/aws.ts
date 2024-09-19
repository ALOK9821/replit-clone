import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

// Initialize the S3 client with environment variables
const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
});

/**
 * Recursively copies all objects from a source S3 folder (prefix) to a destination folder.
 * It handles pagination if there are more than 1000 objects.
 *
 * @param {string} sourcePrefix - The prefix (folder path) to copy from.
 * @param {string} destinationPrefix - The prefix (folder path) to copy to.
 * @param {string} [continuationToken] - Token to continue listing in case of large datasets (pagination).
 */
export async function copyS3Folder(
    sourcePrefix: string,
    destinationPrefix: string,
    continuationToken?: string
): Promise<void> {
    try {
        const listParams = {
            Bucket: process.env.S3_BUCKET ?? "",
            Prefix: sourcePrefix,
            ContinuationToken: continuationToken,
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

        // Copy each object concurrently using Promise.all for better performance
        await Promise.all(
            listedObjects.Contents.map(async (object) => {
                if (!object.Key) return;

                const destinationKey = object.Key.replace(sourcePrefix, destinationPrefix);

                const copyParams = {
                    Bucket: process.env.S3_BUCKET ?? "",
                    CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
                    Key: destinationKey,
                };

                await s3.copyObject(copyParams).promise();
                console.log(`Copied ${object.Key} to ${destinationKey}`);
            })
        );

        // If the result set is truncated, fetch the next set of results and continue copying
        if (listedObjects.IsTruncated) {
            await copyS3Folder(sourcePrefix, destinationPrefix, listedObjects.NextContinuationToken);
        }
    } catch (error) {
        console.error("Error copying folder:", error);
        throw new Error(`Failed to copy S3 folder: ${error.message}`);
    }
}

/**
 * Uploads a file to S3 under a specific key and file path.
 *
 * @param {string} key - The S3 object key (prefix + file name).
 * @param {string} filePath - The local file path.
 * @param {string} content - The file content to be uploaded.
 */
export const saveToS3 = async (key: string, filePath: string, content: string): Promise<void> => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET ?? "",
            Key: `${key}${filePath}`,
            Body: content,
        };

        await s3.putObject(params).promise();
        console.log(`File saved to S3 at ${key}${filePath}`);
    } catch (error) {
        console.error("Error saving file to S3:", error);
        throw new Error(`Failed to save file to S3: ${error.message}`);
    }
};
