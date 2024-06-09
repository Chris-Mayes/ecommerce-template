// src/pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), "public/products");
fs.mkdirSync(uploadDir, { recursive: true });

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const form = new formidable.IncomingForm({
        uploadDir,
        keepExtensions: true,
        filename: (name, ext, part, form) => {
            return `${part.originalFilename}-${Date.now()}${ext}`;
        },
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: "Error parsing files" });
            return;
        }

        const filePaths = Object.values(files).map((file: any) => {
            const fileName = file.newFilename;
            const filePath = `/products/${fileName}`;
            return filePath;
        });

        res.status(200).json({ filePaths });
    });
};

export default handler;
