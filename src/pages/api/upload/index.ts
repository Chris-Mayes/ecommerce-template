import { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const form = new IncomingForm({
        keepExtensions: true,
        allowEmptyFiles: true,
        multiples: true,
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Error parsing the files", err);
            return res.status(500).json({ message: "Error parsing the files" });
        }

        console.log("Files received:", files);

        const fileArray = Array.isArray(files.images)
            ? files.images
            : [files.images];
        const filteredFiles = fileArray.filter(
            (file): file is File => file !== undefined
        );

        try {
            const uploadedFiles = await Promise.all(
                filteredFiles.map(async (file) => {
                    const filePath = file.filepath as string;
                    const fileContent = fs.readFileSync(filePath);
                    const originalFilename = file.originalFilename || "unknown";
                    const fileName = `${uuidv4()}${path.extname(
                        originalFilename
                    )}`;

                    const params = {
                        Bucket: process.env.AWS_BUCKET_NAME!,
                        Key: fileName,
                        Body: fileContent,
                        ContentType:
                            file.mimetype || "application/octet-stream",
                    };

                    try {
                        const data = await s3.send(
                            new PutObjectCommand(params)
                        );
                        console.log("Uploaded file data:", data);
                        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
                    } catch (error) {
                        console.error("Error uploading to S3", error);
                        throw new Error("Error uploading to S3");
                    }
                })
            );

            console.log("Uploaded URLs:", uploadedFiles);
            return res.status(200).json({ urls: uploadedFiles });
        } catch (error) {
            console.error("Error uploading files", error);
            return res.status(500).json({ message: "Error uploading files" });
        }
    });
}
