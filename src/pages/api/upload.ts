import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable, { File } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadFile = async (file: File): Promise<string> => {
    const fileStream = fs.createReadStream(file.filepath);

    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `products/${path.basename(file.filepath)}`,
        Body: fileStream,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${
        process.env.AWS_REGION
    }.amazonaws.com/products/${path.basename(file.filepath)}`;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: "Error parsing the files" });
            return;
        }

        const uploadedFiles = Array.isArray(files.file)
            ? files.file
            : [files.file];

        try {
            const uploadedUrls = await Promise.all(
                uploadedFiles.map((file) => {
                    if (file) {
                        return uploadFile(file as File);
                    }
                    throw new Error("File is undefined");
                })
            );
            res.status(200).json({ urls: uploadedUrls });
        } catch (error) {
            console.error("Error uploading images:", error);
            res.status(500).json({ error: "Error uploading images" });
        }
    });
}
